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
  optionalStringSchema,
  positiveNumberSchema,
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
  bio: optionalStringSchema,

  licenseNumber: z.string().min(2),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  education: optionalStringSchema,
  qualifications: optionalStringSchema,
  languages: z.array(z.string().min(2)).default([]),

  consultationFee: positiveNumberSchema,
  commissionPercent: numberSchema.min(0).max(100).optional(),
  isAvailable: z.boolean().default(true),
});

export const reviewDoctorSchema = z.object({
  verificationStatus: DoctorVerificationStatusEnum,
  rejectionReason: optionalStringSchema,
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
