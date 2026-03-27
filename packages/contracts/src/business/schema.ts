import z from "zod";
import { emailSchema, idSchema, moneySchema, phoneSchema } from "../lib/schema";

export const businessProfileSchema = z.object({
  name: z.string().min(1),
  legalName: z.string(),
  description: z.string(),

  faviconId: idSchema,
  logoId: idSchema,
  coverId: idSchema.optional(),

  email: emailSchema,
  whatsapp: phoneSchema,
  website: z.url(),

  defaultDoctorCommissionPercent: moneySchema.optional(),
});
