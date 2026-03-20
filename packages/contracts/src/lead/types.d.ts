import type z from "zod";
import type { ContactMessage } from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { BaseUserResponse } from "../user/types";
import type { NewsletterSubscriber } from "@workspace/db/browser";
import type {
  newsletterSubscriberSchema,
  newsletterUnSubscriberSchema,
  newsletterSubscriberQuerySchema,
} from "./schema";
import type {
  createContactMessageSchema,
  updateContactMessageSchema,
  contactMessageQuerySchema,
} from "./schema";

export type NewsletterSubscriberType = z.input<
  typeof newsletterSubscriberSchema
>;

export type NewsletterUnSubscriberType = z.input<
  typeof newsletterUnSubscriberSchema
>;

export type NewsletterSubscriberQueryType = z.input<
  typeof newsletterSubscriberQuerySchema
>;

export type NewsletterSubscriberResponse = Sanitize<NewsletterSubscriber>;

export interface NewsletterSubscriberQueryResponse extends BaseQueryResponse {
  subscribers: NewsletterSubscriberResponse[];
}

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
