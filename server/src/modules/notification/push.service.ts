import * as admin from "firebase-admin";
import { Injectable } from "@nestjs/common";

import { InjectLogger } from "@/decorators/logger.decorator";
import { LoggerService } from "@/modules/logger/logger.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { SafeUser } from "@workspace/contracts/user";

@Injectable()
export class PushService {
  @InjectLogger()
  private readonly logger!: LoggerService;

  constructor(private readonly prisma: PrismaService) {}

  async sendPush(user: SafeUser, title: string, body: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id, status: "active", pushToken: { not: null } },
      select: { pushToken: true, pushProvider: true },
    });

    for (const s of sessions) {
      if (!s.pushToken || !s.pushProvider) continue;

      switch (s.pushProvider) {
        case "fcm":
          await this.sendWithFCM(s.pushToken, title, body, user.id);
          break;
        case "expo":
          await this.sendWithExpo(s.pushToken, title, body);
          break;
        default:
          this.logger.warn("Unknown push provider", {
            provider: s.pushProvider,
          });
      }
    }
  }

  private async sendWithFCM(
    token: string,
    title: string,
    body: string,
    userId: string,
  ) {
    try {
      this.ensureFirebase();

      const message: admin.messaging.Message = {
        token,
        notification: { title, body },
      };

      await admin.messaging().send(message);
      this.logger.log("FCM push sent", { userId, token });
    } catch (err: any) {
      this.logger.error("FCM push failed", {
        token,
        error: err?.message,
        code: err?.code,
      });

      if (
        err?.code === "messaging/registration-token-not-registered" ||
        err?.code === "messaging/invalid-registration-token"
      ) {
        await this.prisma.session.updateMany({
          where: { userId, pushToken: token },
          data: { pushToken: null },
        });

        this.logger.warn("Removed invalid FCM token", { token });
      }
    }
  }

  private async sendWithExpo(token: string, title: string, body: string) {
    this.logger.log("Expo push placeholder", { token, title, body });
  }

  private ensureFirebase() {
    if (admin.apps.length) return;
    admin.initializeApp();
    this.logger.log("Firebase Admin initialized with ADC");
  }
}
