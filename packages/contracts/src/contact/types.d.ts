import type z from "zod";
import type {
  createContactMessageSchema,
  updateContactMessageSchema,
  contactMessageQuerySchema,
} from "./schema";
import type { ContactMessage } from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { BaseUserResponse } from "../user/types";

export type CreateContactMessageType = z.input<
  typeof createContactMessageSchema
>;
export type UpdateContactMessageType = z.input<
  typeof updateContactMessageSchema
>;
export type ContactMessageQueryType = z.input<typeof contactMessageQuerySchema>;

export interface ContactMessageResponse extends Sanitize<ContactMessage> {
  repliedBy?: BaseUserResponse;
}

export interface ContactMessageQueryResponse extends BaseQueryResponse {
  messages: ContactMessageResponse[];
}
