import { Controller, Put, Post, Param, Body, Get } from "@nestjs/common";
import { ConfigurePushNotificationsDto } from "@workspace/contracts/notification";

import { User } from "@/decorators/user.decorator";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllNotification(@User("id") userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: [
        {
          readAt: {
            sort: "asc",
            nulls: "first",
          },
        },
        { createdAt: "desc" },
      ],
    });

    return {
      message: "Notifications Fetched Successfully.",
      data: notifications,
    };
  }

  @Put("/:id")
  async markAsRead(@Param("id") id: string, @User("id") userId: string) {
    await this.prisma.notification.findFirstOrThrow({
      where: { id, userId },
    });

    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return { message: "Notification read successfully." };
  }

  @Post("push/configure")
  async configurePushNotifications(
    @Body() dto: ConfigurePushNotificationsDto,
    @User() user: Express.User,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: user.sessionId },
        data: dto.enabled
          ? { pushToken: dto.token, pushProvider: dto.provider }
          : { pushToken: null, pushProvider: null },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          pushNotifications: dto.enabled,
        },
      });

      return {
        message: dto.enabled
          ? "Push notifications enabled."
          : "Push notifications disabled.",
      };
    });
  }
}
