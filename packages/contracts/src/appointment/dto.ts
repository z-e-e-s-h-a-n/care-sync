import { createZodDto } from "nestjs-zod";
import {
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./schema";

export class CreateAppointmentDto extends createZodDto(createAppointmentSchema) {}

export class UpdateAppointmentStatusDto extends createZodDto(
  updateAppointmentStatusSchema,
) {}

export class AppointmentQueryDto extends createZodDto(appointmentQuerySchema) {}
