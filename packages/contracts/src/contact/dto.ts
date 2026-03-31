import { createZodDto } from "nestjs-zod";
import {
  createContactMessageSchema,
  updateContactMessageSchema,
  contactMessageQuerySchema,
} from "./schema";

export class CreateContactMessageDto extends createZodDto(
  createContactMessageSchema,
) {}

export class UpdateContactMessageDto extends createZodDto(
  updateContactMessageSchema,
) {}

export class ContactMessageQueryDto extends createZodDto(
  contactMessageQuerySchema,
) {}
