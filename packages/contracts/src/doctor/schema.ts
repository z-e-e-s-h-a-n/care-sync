import z from "zod";
import {
  DoctorVerificationStatusEnum,
  DoctorSearchByEnum,
  DoctorSortByEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  numberSchema,
  nullableStringSchema,
  slugSchema,
} from "../lib/schema";

export const doctorProfileSchema = z.object({
  userId: idSchema,
  branchId: idSchema,
  createdById: idSchema.optional(),
  licenseDocumentId: idSchema.optional(),

  slug: slugSchema,
  title: z.string().min(2),
  specialty: z.string().min(2),
  bio: nullableStringSchema,

  licenseNumber: z.string().min(2),
  yearsExperience: numberSchema.optional(),
  education: nullableStringSchema,
  qualifications: nullableStringSchema,
  languages: z.array(z.string().min(2)).default([]),

  consultationFee: numberSchema,
  commissionPercent: numberSchema.optional(),
  isAvailable: z.boolean().default(true),
});

export const reviewDoctorSchema = z.object({
  verificationStatus: DoctorVerificationStatusEnum,
  rejectionReason: nullableStringSchema,
});

export const doctorQuerySchema = baseQuerySchema(
  DoctorSortByEnum,
  DoctorSearchByEnum,
).extend({
  specialty: z.string().optional(),
  branchId: idSchema.optional(),
  verificationStatus: DoctorVerificationStatusEnum.optional(),
  isAvailable: z.coerce.boolean().optional(),
});
