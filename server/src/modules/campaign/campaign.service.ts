import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CampaignQueryDto,
  NotificationCampaignDto,
  UpdateCampaignStatusDto,
} from "@workspace/contracts/campaign";
import type {
  CampaignAudience,
  CampaignStatus,
  Prisma,
} from "@workspace/db/client";

import { NotificationService } from "@/modules/notification/notification.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createCampaign(dto: NotificationCampaignDto, currentUserId: string) {
    const recipients = await this.resolveAudienceUsers(dto.audience);

    if (!recipients.length) {
      throw new BadRequestException(
        "No users found for the selected audience.",
      );
    }

    const campaign = await this.prisma.notificationCampaign.create({
      data: {
        createdById: currentUserId,
        audience: dto.audience,
        title: dto.title,
        subject: dto.subject,
        message: dto.message,
        channel: dto.channel,
        status: dto.scheduledAt ? "scheduled" : "draft",
        scheduledAt: dto.scheduledAt,
        recipients: {
          create: recipients.map((user) => ({
            userId: user.id,
          })),
        },
      },
    });

    return { message: "Campaign created successfully.", data: campaign };
  }

  async listCampaigns(query: CampaignQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      status,
      audience,
    } = query;

    const where: Prisma.NotificationCampaignWhereInput = {};
    if (status) where.status = status;
    if (audience) where.audience = audience;

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.NotificationCampaignWhereInput
      > = {
        title: { title: { contains: search, mode: "insensitive" } },
        status: { status: search as CampaignStatus },
        audience: { audience: search as CampaignAudience },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [campaigns, total] = await Promise.all([
      this.prisma.notificationCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.campaignInclude,
      }),
      this.prisma.notificationCampaign.count({ where }),
    ]);

    return {
      message: "Campaigns fetched successfully.",
      data: {
        campaigns,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCampaign(campaignId: string) {
    const campaign = await this.prisma.notificationCampaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: this.campaignInclude,
    });

    return { message: "Campaign fetched successfully.", data: campaign };
  }

  async updateCampaignStatus(campaignId: string, dto: UpdateCampaignStatusDto) {
    const campaign = await this.prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: {
        status: dto.status,
        ...(dto.status === "sent" ? { sentAt: new Date() } : {}),
      },
    });

    return { message: "Campaign status updated successfully.", data: campaign };
  }

  async sendCampaign(campaignId: string) {
    const campaign = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: { include: { user: { omit: { password: true } } } },
      },
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found.");
    }

    await this.prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: {
        status: "scheduled",
      },
    });

    for (const recipient of campaign.recipients) {
      try {
        await this.notificationService.sendNotification({
          purpose: "campaign",
          user: recipient.user,
          identifier: recipient.user.email ?? recipient.user.phone ?? "",
          message: campaign.message,
        });

        await this.prisma.campaignRecipient.update({
          where: {
            campaignId_userId: {
              campaignId,
              userId: recipient.userId,
            },
          },
          data: {
            sentAt: new Date(),
          },
        });
      } catch {
        // Keep campaign recipient record untouched on individual failures.
      }
    }

    const updated = await this.prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    return { message: "Campaign sent successfully.", data: updated };
  }

  private async resolveAudienceUsers(audience: CampaignAudience) {
    const where: Prisma.UserWhereInput =
      audience === "allUsers"
        ? { status: "active" }
        : audience === "patients"
          ? { role: "patient", status: "active" }
          : audience === "doctors"
            ? { role: "doctor", status: "active" }
            : {};

    return this.prisma.user.findMany({
      where,
      omit: { password: true },
    });
  }

  private campaignInclude = {
    createdBy: {
      omit: { password: true },
    },
    recipients: {
      include: {
        user: {
          omit: { password: true },
          include: { avatar: true },
        },
      },
    },
  } satisfies Prisma.NotificationCampaignInclude;
}
