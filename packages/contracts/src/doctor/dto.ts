import { createZodDto } from "nestjs-zod";
import {
  doctorProfileSchema,
  doctorQuerySchema,
  reviewDoctorSchema,
} from "./schema";

export class DoctorProfileDto extends createZodDto(doctorProfileSchema) {}

export class DoctorQueryDto extends createZodDto(doctorQuerySchema) {}

export class ReviewDoctorDto extends createZodDto(reviewDoctorSchema) {}
