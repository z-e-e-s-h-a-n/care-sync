import { Injectable } from "@nestjs/common";
import type {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  UpdateContactMessageDto,
} from "@workspace/contracts/lead";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationService } from "@/modules/notification/notification.service";
import { resolveEmailTemplate } from "@workspace/templates";
import type { ContactMessage, Prisma } from "@workspace/db/client";

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotificationService,
  ) {}

  async createMessage(dto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({
      data: {
        ...dto,
      },
    });

    await this.notifyUser(message);

    return {
      message: "Contact message created successfully.",
      data: message,
    };
  }

  async updateMessage(id: string, dto: UpdateContactMessageDto) {
    const message = await this.prisma.contactMessage.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === "replied" ? { repliedAt: new Date() } : {}),
      },
    });

    if (dto.status === "replied") await this.notifyUser(message);

    return {
      message: "Contact message updated successfully.",
      data: message,
    };
  }

  async getMessage(id: string) {
    const message = await this.prisma.contactMessage.findUniqueOrThrow({
      where: { id },
    });

    return {
      message: "Contact message fetched successfully.",
      data: message,
    };
  }

  async queryMessages(query: ContactMessageQueryDto) {
    const { page, limit, status, search, searchBy, sortBy, sortOrder } = query;

    const where: Prisma.ContactMessageWhereInput = {};
    if (status) where.status = status;

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.ContactMessageWhereInput
      > = {
        email: {
          email: { contains: search, mode: "insensitive" },
        },
        phone: {
          phone: { contains: search, mode: "insensitive" },
        },
        name: {
          fullName: { contains: search, mode: "insensitive" },
        },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [messages, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      message: "Messages fetched successfully.",
      data: {
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async notifyUser(contactMessage: ContactMessage) {
    const { subject, html } = await resolveEmailTemplate({
      purpose: "contactMessage",
      contactMessage,
    });

    await this.notify.sendEmail(contactMessage.email, subject, html);
  }
}
