import z from "zod";
import {
  GenderEnum,
  IdentificationTypeEnum,
  PatientSearchByEnum,
  PatientSortByEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  isoDateSchema,
  nullableStringSchema,
  phoneSchema,
} from "../lib/schema";

export const patientProfileSchema = z.object({
  userId: idSchema,
  preferredBranchId: idSchema.optional(),
  identificationDocumentId: idSchema.optional(),
  birthDate: isoDateSchema.optional(),
  gender: GenderEnum.optional(),
  address: nullableStringSchema,
  occupation: nullableStringSchema,
  emergencyContactName: nullableStringSchema,
  emergencyContactNumber: phoneSchema.optional(),
  insuranceProvider: nullableStringSchema,
  insurancePolicyNumber: nullableStringSchema,
  allergies: nullableStringSchema,
  currentMedication: nullableStringSchema,
  familyMedicalHistory: nullableStringSchema,
  pastMedicalHistory: nullableStringSchema,
  identificationType: IdentificationTypeEnum.optional(),
  identificationNumber: nullableStringSchema,
});

export const patientQuerySchema = baseQuerySchema(
  PatientSortByEnum,
  PatientSearchByEnum,
);
