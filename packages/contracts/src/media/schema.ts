import z from "zod";
import { baseQuerySchema } from "../lib/schema";
import {
  MediaSearchByEnum,
  MediaSortByEnum,
  MediaTypeEnum,
  MediaVisibilityEnum,
} from "../lib/enums";

export const mediaUpdateSchema = z.object({
  name: z.string().trim().min(1, "Filename is required"),
  altText: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const mediaCreateSchema = mediaUpdateSchema.partial().extend({
  type: MediaTypeEnum,
  visibility: MediaVisibilityEnum.default("private"),
});

export const mediaQuerySchema = baseQuerySchema(
  MediaSortByEnum,
  MediaSearchByEnum,
).extend({
  type: MediaTypeEnum.optional(),
  mimeType: z.string().optional(),
});
