import type z from "zod";
import type { Conversation, Message } from "@workspace/db/browser";
import type {
  createConversationSchema,
  sendMessageSchema,
  updateConversationSchema,
} from "./schema";
import type { Sanitize } from "../lib/types";
import type { AppointmentResponse } from "../appointment/types";
import type { BranchResponse } from "../branch/types";
import type { PatientProfileResponse } from "../patient/types";
import type { UserResponse } from "../user/types";
import type { MediaResponse } from "../media/types";

export type CreateConversationType = z.input<typeof createConversationSchema>;
export type SendMessageType = z.input<typeof sendMessageSchema>;

export type UpdateConversationType = z.input<typeof updateConversationSchema>;

export type ConversationResponse = Sanitize<Conversation> & {
  branch?: BranchResponse;
  patient?: PatientProfileResponse;
  assignedTo?: UserResponse;
  appointment?: AppointmentResponse;
};

export type MessageResponse = Sanitize<Message> & {
  sender?: UserResponse;
  attachments?: Array<{
    id: string;
    mediaId: string;
    media?: MediaResponse;
  }>;
};
