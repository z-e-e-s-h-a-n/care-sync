import type z from "zod";
import type {
  newsletterSubscriberSchema,
  newsletterUnSubscriberSchema,
  newsletterSubscriberQuerySchema,
} from "./schema";
import type { NewsletterSubscriber } from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";

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
