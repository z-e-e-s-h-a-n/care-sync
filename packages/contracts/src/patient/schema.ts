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
  optionalStringSchema,
  phoneSchema,
} from "../lib/schema";

export const patientProfileSchema = z.object({
  userId: idSchema,
  identificationDocumentId: idSchema.optional(),

  birthDate: isoDateSchema,
  gender: GenderEnum,

  address: optionalStringSchema,
  occupation: optionalStringSchema,

  emergencyContactName: optionalStringSchema,
  emergencyContactNumber: phoneSchema.optional(),

  insuranceProvider: optionalStringSchema,
  insurancePolicyNumber: optionalStringSchema,

  allergies: optionalStringSchema,
  currentMedication: optionalStringSchema,
  familyMedicalHistory: optionalStringSchema,
  pastMedicalHistory: optionalStringSchema,

  identificationType: IdentificationTypeEnum.optional(),
  identificationNumber: optionalStringSchema,
});

export const patientQuerySchema = baseQuerySchema(
  PatientSortByEnum,
  PatientSearchByEnum,
);
