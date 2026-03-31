import z from "zod";
import {
  NewsletterSubscriberSearchByEnum,
  NewsletterSubscriberSortByEnum,
} from "../lib/enums";
import {
  nameSchema,
  emailSchema,
  baseQuerySchema,
} from "../lib/schema";

export const newsletterSubscriberSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export const newsletterUnSubscriberSchema = z.object({
  email: emailSchema,
});

export const newsletterSubscriberQuerySchema = baseQuerySchema(
  NewsletterSubscriberSortByEnum,
  NewsletterSubscriberSearchByEnum,
).extend({
  isActive: z.boolean().optional(),
});
