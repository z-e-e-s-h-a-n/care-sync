import { Injectable } from "@nestjs/common";
import type {
  NewsletterSubscriberDto,
  NewsletterSubscriberQueryDto,
  NewsletterUnSubscriberDto,
} from "@workspace/contracts/lead";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { resolveEmailTemplate } from "@workspace/templates";
import { NotificationService } from "@/modules/notification/notification.service";
import type { NewsletterSubscriber, Prisma } from "@workspace/db/client";

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotificationService,
  ) {}

  async subscribe(dto: NewsletterSubscriberDto) {
    const user = await this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: dto,
      update: dto,
    });

    await this.notifyUser(user);

    return { message: "Subscribed successfully.", data: user };
  }

  async unsubscribe({ email }: NewsletterUnSubscriberDto) {
    const user = await this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    await this.notifyUser(user);

    return { message: "Unsubscribed successfully.", data: user };
  }

  async list(query: NewsletterSubscriberQueryDto) {
    const { page, limit, searchBy, search, sortBy, sortOrder } = query;

    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.NewsletterSubscriberWhereInput
      > = {
        email: {
          email: { contains: search, mode: "insensitive" },
        },
        name: {
          name: { contains: search, mode: "insensitive" },
        },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [subscribers, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return {
      message: "Subscribers fetched successfully.",
      data: {
        subscribers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriber(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUniqueOrThrow(
      {
        where: { id },
      },
    );

    return {
      message: "Subscriber fetched successfully.",
      data: subscriber,
    };
  }

  private async notifyUser(newsletterSubscriber: NewsletterSubscriber) {
    const { subject, html } = await resolveEmailTemplate({
      purpose: "newsletter",
      newsletterSubscriber,
    });

    await this.notify.sendEmail(newsletterSubscriber.email, subject, html);
  }
}
