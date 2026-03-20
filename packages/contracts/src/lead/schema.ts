import z from "zod";
import {
  baseQuerySchema,
  emailSchema,
  idSchema,
  nameSchema,
  phoneSchema,
} from "../lib/schema";

import {
  NewsletterSubscriberSearchByEnum,
  NewsletterSubscriberSortByEnum,
} from "../lib/enums";

import {
  ContactMessageSearchByEnum,
  ContactMessageSortByEnum,
  ContactMessageStatusEnum,
} from "../lib/enums";

export const newsletterSubscriberSchema = z.object({
  trafficSourceId: idSchema.optional(),
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

export const createContactMessageSchema = z.object({
  trafficSourceId: idSchema.optional(),
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().min(10, "Tell us a bit more about your request"),
});

export const updateContactMessageSchema = z.object({
  notes: z.string().optional(),
  status: ContactMessageStatusEnum,
});

export const contactMessageQuerySchema = baseQuerySchema(
  ContactMessageSortByEnum,
  ContactMessageSearchByEnum,
).extend({
  status: ContactMessageStatusEnum.optional(),
});
