import { createZodDto } from "nestjs-zod";
import {
  createConversationSchema,
  sendMessageSchema,
  updateConversationSchema,
} from "./schema";

export class CreateConversationDto extends createZodDto(
  createConversationSchema,
) {}

export class SendMessageDto extends createZodDto(sendMessageSchema) {}

export class UpdateConversationDto extends createZodDto(
  updateConversationSchema,
) {}
