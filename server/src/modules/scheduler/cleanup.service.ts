import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { InjectLogger } from "@/decorators/logger.decorator";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { LoggerService } from "@/modules/logger/logger.service";

@Injectable()
export class CleanupService {
  @InjectLogger()
  private readonly logger!: LoggerService;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleOtpCleanup() {
    this.logger.log("🧹 Running OTP cleanup job...");
    const result = await this.prisma.otp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`✅ Deleted ${result.count} expired OTPs`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRefreshTokenCleanup() {
    this.logger.log("🧹 Running Session Revokes job...");
    const updated = await this.prisma.session.updateMany({
      where: { expiresAt: { lt: new Date() } },
      data: { status: "expired" },
    });
    this.logger.log(`✅ Updated ${updated.count} expired sessions`);

    const deleted = await this.prisma.session.deleteMany({
      where: {
        pushToken: null,
        OR: [{ expiresAt: { lt: new Date() } }, { status: "revoked" }],
      },
    });
    this.logger.log(`✅ Deleted ${deleted.count} expired sessions`);
  }
}
