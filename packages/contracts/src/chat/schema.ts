import z from "zod";
import { ConversationStatusEnum, ConversationTypeEnum } from "../lib/enums";
import { idSchema, optionalStringSchema } from "../lib/schema";

export const createConversationSchema = z.object({
  branchId: idSchema.optional(),
  patientId: idSchema,
  appointmentId: idSchema.optional(),
  assignedToId: idSchema.optional(),
  type: ConversationTypeEnum,
  subject: optionalStringSchema,
});

export const sendMessageSchema = z.object({
  conversationId: idSchema,
  body: z.string().trim().min(1).max(4000),
  attachmentIds: z.array(idSchema).default([]),
});

export const updateConversationSchema = z.object({
  status: ConversationStatusEnum,
  subject: optionalStringSchema,
});
