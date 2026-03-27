import { Injectable } from "@nestjs/common";
import { resolveEmailTemplate } from "@workspace/templates";
import { appName } from "@workspace/shared/constants";

import { PushService } from "./push.service";
import { EmailService } from "./email.service";
import { MessagingService } from "./messaging.service";
import { InjectLogger } from "@/decorators/logger.decorator";
import { EnvService } from "@/modules/env/env.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { LoggerService } from "@/modules/logger/logger.service";
import type {
  NotificationChannel,
  NotificationPurpose,
  NotificationStatus,
} from "@workspace/contracts";
import type { SafeUser } from "@workspace/contracts/user";
import type { Otp } from "@workspace/db/client";

export type SendNotificationProps = {
  purpose: NotificationPurpose;
  identifier: string;
  user: SafeUser;
  otp?: Otp;
} & Record<string, unknown>;

@Injectable()
export class NotificationService {
  @InjectLogger()
  private readonly logger!: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
    private readonly emailService: EmailService,
    private readonly messagingService: MessagingService,
    private readonly pushService: PushService,
  ) {}

  async sendNotification(props: SendNotificationProps) {
    const { html, subject, message } = await resolveEmailTemplate(props);

    const channels = this.determineChannels(
      props.identifier,
      props.user,
      !!props.otp,
    );

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: props.user.id,
          recipient: props.identifier,
          purpose: props.purpose,
          channels,
          title: subject,
          message,
          meta: props as any,
        },
      });

      let allSuccess = true;
      let anySuccess = false;

      for (const channel of channels) {
        try {
          switch (channel) {
            case "email":
              await this.sendEmail(props.identifier, subject, html);
              break;
            case "sms":
              await this.sendMessage("sms", props.identifier, message);
              break;
            case "whatsapp":
              await this.sendMessage("whatsapp", props.identifier, message);
              break;
            case "push":
              await this.sendPush(props.user, subject, message);
              break;
          }
          anySuccess = true;
        } catch (error) {
          allSuccess = false;
          this.logger.error("Notification send Failed", {
            identifier: props.identifier,
            channel,
            error,
          });
        }
      }

      const status: NotificationStatus = allSuccess
        ? "sent"
        : anySuccess
          ? "partial"
          : "failed";

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status },
      });
    } catch (error) {
      this.logger.error(`❌ Notification send Failed`, {
        identifier: props.identifier,
        channels,
        error,
      });
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const from = `${appName.default} <${this.env.get("SMTP_USER")}>`;
    await this.emailService.sendMail({ from, to, subject, html });
  }

  async sendMessage(type: "sms" | "whatsapp", to: string, text: string) {
    if (type === "sms") {
      await this.messagingService.sendSms(to, text);
    } else {
      await this.messagingService.sendWhatsapp(to, text);
    }
  }

  async sendPush(user: SafeUser, subject: string, message: string) {
    await this.pushService.sendPush(user, subject, message);
  }

  private determineChannels(
    identifier: string,
    user: SafeUser,
    isOtp: boolean,
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];
    const isEmail = identifier.includes("@");
    channels.push(isEmail ? "email" : "sms");

    if (isOtp) return channels;

    if (user.pushNotifications) {
      channels.push("push");
    }

    return channels;
  }
}
