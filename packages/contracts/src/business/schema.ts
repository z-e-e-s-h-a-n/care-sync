import z from "zod";
import { emailSchema, phoneSchema, idSchema } from "../lib/schema";

export const businessPhoneSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  value: phoneSchema,
});

export const businessAddressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export const businessProfileSchema = z.object({
  name: z.string().min(1),
  legalName: z.string(),
  description: z.string(),

  faviconId: idSchema,
  logoId: idSchema,
  coverId: idSchema.optional(),

  email: emailSchema,
  whatsapp: businessPhoneSchema,
  website: z.url(),

  fax: z.array(businessPhoneSchema).default([]),
  phones: z.array(businessPhoneSchema).default([]),

  officeHoursDays: z.string().optional(),
  officeHoursTime: z.string().optional(),

  addresses: z.array(businessAddressSchema).default([]),

  facebook: z.url(),
  instagram: z.url(),
  twitter: z.url(),
  linkedin: z.url(),

  metaTitle: z.string(),
  metaDescription: z.string(),
});
