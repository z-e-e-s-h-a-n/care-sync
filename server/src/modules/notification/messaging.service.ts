import twilio from "twilio";
import { Injectable } from "@nestjs/common";

import { EnvService } from "@/modules/env/env.service";
import { LoggerService } from "@/modules/logger/logger.service";

@Injectable()
export class MessagingService {
  private twilioClient: twilio.Twilio;
  private readonly twilioPhone: string;
  private readonly twilioWhatsapp: string;

  constructor(
    private readonly env: EnvService,
    private readonly logger: LoggerService,
  ) {
    const accountSid = this.env.get("TWILIO_ACCOUNT_SID");
    const authToken = this.env.get("TWILIO_AUTH_TOKEN");
    this.twilioPhone = this.env.get("TWILIO_PHONE_NUMBER");
    this.twilioWhatsapp = this.env.get("TWILIO_WHATSAPP_NUMBER");

    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body,
        from: this.twilioPhone,
        to,
      });
    } catch (error) {
      this.logger.error("Error sending SMS", { error });
      throw new Error("Failed to send SMS");
    }
  }

  async sendWhatsapp(to: string, body: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body,
        from: this.twilioWhatsapp,
        to: `whatsapp:${to}`,
      });
    } catch (error) {
      this.logger.error("Error sending WhatsApp message", { error });
      throw new Error("Failed to send WhatsApp message");
    }
  }
}
