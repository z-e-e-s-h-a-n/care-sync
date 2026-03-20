import { createZodDto } from "nestjs-zod";
import {
  mediaCreateSchema,
  mediaQuerySchema,
  mediaUpdateSchema,
} from "./schema";

export class MediaCreateDto extends createZodDto(mediaCreateSchema) {}

export class MediaUpdateDto extends createZodDto(mediaUpdateSchema) {}

export class MediaQueryDto extends createZodDto(mediaQuerySchema) {}
