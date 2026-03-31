import z from "zod";
import {
  baseQuerySchema,
  emailSchema,
  nameSchema,
  phoneSchema,
} from "../lib/schema";
import {
  ContactMessageSearchByEnum,
  ContactMessageSortByEnum,
  ContactMessageStatusEnum,
} from "../lib/enums";

export const createContactMessageSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().optional(),
  message: z.string(),
});

export const updateContactMessageSchema = z.object({
  status: ContactMessageStatusEnum,
});

export const contactMessageQuerySchema = baseQuerySchema(
  ContactMessageSortByEnum,
  ContactMessageSearchByEnum,
).extend({
  status: ContactMessageStatusEnum.optional(),
});
