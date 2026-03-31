import z from "zod";
import {
  BranchSearchByEnum,
  BranchSortByEnum,
  WeekdayEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  emailSchema,
  idSchema,
  nullableStringSchema,
  numberSchema,
  phoneSchema,
  slugSchema,
} from "../lib/schema";

export const branchTimingSchema = z.object({
  weekday: WeekdayEnum,
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean().default(false),
});

export const CUBranchSchema = z.object({
  name: z.string().min(2),
  slug: slugSchema,
  email: emailSchema,
  phone: phoneSchema,
  whatsapp: phoneSchema.optional(),

  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),

  latitude: numberSchema.optional(),
  longitude: numberSchema.optional(),

  timezone: nullableStringSchema,
  isActive: z.boolean().default(true),

  branchTimings: z.array(branchTimingSchema).min(5),
});

export const branchQuerySchema = baseQuerySchema(
  BranchSortByEnum,
  BranchSearchByEnum,
).extend({
  isActive: z.coerce.boolean().optional(),
});

export const businessProfileSchema = z.object({
  name: z.string(),
  legalName: z.string(),
  description: z.string(),

  faviconId: idSchema,
  logoId: idSchema,
  coverId: idSchema.optional(),

  email: emailSchema,
  phone: phoneSchema,
  whatsapp: phoneSchema.optional(),
  website: z.url().optional(),

  facebook: z.url().optional(),
  instagram: z.url().optional(),
  tiktok: z.url().optional(),
  twitter: z.url().optional(),
  linkedin: z.url().optional(),

  metaTitle: z.string(),
  metaDescription: z.string(),
});
