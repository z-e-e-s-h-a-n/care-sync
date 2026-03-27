import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { SendMessageDto, UpdateConversationDto } from "@workspace/contracts/chat";

import { ChatService } from "./chat.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Roles("admin", "doctor", "patient")
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("appointments/:appointmentId")
  getConversationByAppointment(
    @Param("appointmentId") appointmentId: string,
    @User() user: Express.User,
  ) {
    return this.chatService.getConversationByAppointment(appointmentId, user);
  }

  @Get("conversations/:conversationId/messages")
  listMessages(
    @Param("conversationId") conversationId: string,
    @User() user: Express.User,
  ) {
    return this.chatService.listMessages(conversationId, user);
  }

  @Post("messages")
  sendMessage(@Body() dto: SendMessageDto, @User() user: Express.User) {
    return this.chatService.sendMessage(dto, user);
  }

  @Patch("conversations/:conversationId")
  updateConversation(
    @Param("conversationId") conversationId: string,
    @Body() dto: UpdateConversationDto,
    @User() user: Express.User,
  ) {
    return this.chatService.updateConversation(conversationId, dto, user);
  }

  @Patch("messages/:messageId/read")
  markMessageRead(
    @Param("messageId") messageId: string,
    @User() user: Express.User,
  ) {
    return this.chatService.markMessageRead(messageId, user);
  }
}
