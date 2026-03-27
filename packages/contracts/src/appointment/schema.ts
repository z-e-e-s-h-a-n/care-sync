import z from "zod";
import {
  AppointmentCancellationSourceEnum,
  AppointmentChannelEnum,
  AppointmentSearchByEnum,
  AppointmentSortByEnum,
  AppointmentStatusEnum,
  BookingSourceEnum,
  PaymentStatusEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  isoDateSchema,
  nullableStringSchema,
  timezoneSchema,
} from "../lib/schema";

export const createAppointmentSchema = z
  .object({
    branchId: idSchema,
    patientId: idSchema,
    doctorId: idSchema,
    createdById: idSchema.optional(),
    channel: AppointmentChannelEnum,
    scheduledStartAt: isoDateSchema,
    scheduledEndAt: isoDateSchema,
    timezone: timezoneSchema,
    patientNotes: nullableStringSchema,
    bookingSource: BookingSourceEnum.default("app"),
  })
  .refine((v) => v.scheduledStartAt <= v.scheduledEndAt, {
    error: "Appointment end time must be after start time.",
  });

export const updateAppointmentStatusSchema = z.object({
  status: AppointmentStatusEnum,
  paymentStatus: PaymentStatusEnum.optional(),
  cancellationSource: AppointmentCancellationSourceEnum.optional(),
  cancellationReason: nullableStringSchema,
  doctorNotes: nullableStringSchema,
  adminNotes: nullableStringSchema,
});

export const appointmentQuerySchema = baseQuerySchema(
  AppointmentSortByEnum,
  AppointmentSearchByEnum,
).extend({
  branchId: idSchema.optional(),
  doctorId: idSchema.optional(),
  patientId: idSchema.optional(),
  status: AppointmentStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  startsFrom: isoDateSchema.optional(),
  startsTo: isoDateSchema.optional(),
});
