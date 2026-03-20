import { createZodDto } from "nestjs-zod";
import { businessProfileSchema } from "./schema";

export class BusinessProfileDto extends createZodDto(businessProfileSchema) {}
