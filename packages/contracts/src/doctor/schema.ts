import z from "zod";
import {
  DoctorVerificationStatusEnum,
  DoctorSearchByEnum,
  DoctorSortByEnum,
  IdentificationTypeEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  moneySchema,
  nullableStringSchema,
  slugSchema,
} from "../lib/schema";

export const doctorProfileSchema = z.object({
  userId: idSchema,
  branchId: idSchema,
  createdById: idSchema.optional(),
  slug: slugSchema.optional(),
  title: nullableStringSchema,
  specialty: z.string().min(2).optional(),
  bio: nullableStringSchema,
  licenseNumber: nullableStringSchema,
  yearsExperience: z.coerce.number().int().min(0).optional(),
  education: nullableStringSchema,
  qualifications: nullableStringSchema,
  languages: z.array(z.string().min(2)).default([]),
  identificationType: IdentificationTypeEnum.optional(),
  identificationNumber: nullableStringSchema,
  identificationDocumentId: idSchema.optional(),
  licenseDocumentId: idSchema.optional(),
  consultationFee: moneySchema.optional(),
  commissionPercent: moneySchema.optional(),
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
