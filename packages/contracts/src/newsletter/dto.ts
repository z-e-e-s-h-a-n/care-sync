import { createZodDto } from "nestjs-zod";
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
