import { ForbiddenException, Injectable } from "@nestjs/common";
import type {
  SendMessageDto,
  UpdateConversationDto,
} from "@workspace/contracts/chat";
import type { Prisma } from "@workspace/db/client";

import { DoctorService } from "@/modules/doctor/doctor.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorService: DoctorService,
  ) {}

  async getConversationByAppointment(
    appointmentId: string,
    currentUser: Express.User,
  ) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { appointmentId },
      include: this.conversationInclude,
    });

    await this.assertConversationAccess(conversation, currentUser);
    return {
      message: "Conversation fetched successfully.",
      data: conversation,
    };
  }

  async listMessages(conversationId: string, currentUser: Express.User) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: this.conversationInclude,
    });

    await this.assertConversationAccess(conversation, currentUser);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: this.messageInclude,
    });

    return { message: "Messages fetched successfully.", data: messages };
  }

  async sendMessage(dto: SendMessageDto, currentUser: Express.User) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: dto.conversationId },
      include: this.conversationInclude,
    });

    await this.assertConversationAccess(conversation, currentUser);

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: currentUser.id,
        body: dto.body,
        attachments: dto.attachmentIds.length
          ? {
              createMany: {
                data: dto.attachmentIds.map((mediaId) => ({
                  mediaId,
                })),
              },
            }
          : undefined,
      },
      include: this.messageInclude,
    });

    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { lastMessageAt: new Date(), status: "open" },
    });

    return { message: "Message sent successfully.", data: message };
  }

  async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto,
    currentUser: Express.User,
  ) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: this.conversationInclude,
    });

    await this.assertConversationAccess(conversation, currentUser);

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: dto.status,
        subject: dto.subject ?? conversation.subject,
      },
      include: this.conversationInclude,
    });

    return {
      message: "Conversation updated successfully.",
      data: updated,
    };
  }

  async markMessageRead(messageId: string, currentUser: Express.User) {
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: true,
              },
            },
            patient: true,
          },
        },
      },
    });

    await this.assertConversationAccess(message.conversation, currentUser);

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
      include: this.messageInclude,
    });

    return { message: "Message marked as read.", data: updated };
  }

  private async assertConversationAccess(
    conversation: any,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.doctorService.findByUserIdOrThrow(
        currentUser.id,
      );
      if (
        conversation.assignedToId !== currentUser.id &&
        conversation.appointment?.doctorId !== doctor.id
      ) {
        throw new ForbiddenException(
          "You can only access your own conversations.",
        );
      }
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });

    if (conversation.patientId !== patient.id) {
      throw new ForbiddenException(
        "You can only access your own conversations.",
      );
    }
  }

  private conversationInclude = {
    branch: true,
    patient: {
      include: {
        user: { omit: { password: true }, include: { avatar: true } },
      },
    },
    assignedTo: {
      omit: { password: true },
      include: { avatar: true },
    },
    appointment: {
      include: {
        doctor: {
          include: {
            user: { omit: { password: true }, include: { avatar: true } },
          },
        },
        patient: {
          include: {
            user: { omit: { password: true }, include: { avatar: true } },
          },
        },
      },
    },
  } satisfies Prisma.ConversationInclude;

  private messageInclude = {
    sender: {
      omit: { password: true },
      include: { avatar: true },
    },
    attachments: {
      include: { media: true },
    },
  } satisfies Prisma.MessageInclude;
}
