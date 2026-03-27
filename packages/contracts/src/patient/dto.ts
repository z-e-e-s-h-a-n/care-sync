import { createZodDto } from "nestjs-zod";
import { patientProfileSchema, patientQuerySchema } from "./schema";

export class PatientProfileDto extends createZodDto(patientProfileSchema) {}

export class PatientQueryDto extends createZodDto(patientQuerySchema) {}
