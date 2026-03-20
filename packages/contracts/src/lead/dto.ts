import { createZodDto } from "nestjs-zod";
import {
  createContactMessageSchema,
  updateContactMessageSchema,
  contactMessageQuerySchema,
} from "./schema";

import {
  newsletterSubscriberSchema,
  newsletterUnSubscriberSchema,
  newsletterSubscriberQuerySchema,
} from "./schema";

export class NewsletterSubscriberDto extends createZodDto(
  newsletterSubscriberSchema,
) {}

export class NewsletterUnSubscriberDto extends createZodDto(
  newsletterUnSubscriberSchema,
) {}

export class NewsletterSubscriberQueryDto extends createZodDto(
  newsletterSubscriberQuerySchema,
) {}

export class CreateContactMessageDto extends createZodDto(
  createContactMessageSchema,
) {}

export class UpdateContactMessageDto extends createZodDto(
  updateContactMessageSchema,
) {}

export class ContactMessageQueryDto extends createZodDto(
  contactMessageQuerySchema,
) {}
