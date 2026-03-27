import type z from "zod";
import type { Appointment } from "@workspace/db/browser";
import type {
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { BranchResponse } from "../branch/types";
import type { DoctorProfileResponse } from "../doctor/types";
import type { PatientProfileResponse } from "../patient/types";
import type { PaymentResponse } from "../payment/types";
import type { ConversationResponse } from "../chat/types";

export type CreateAppointmentType = z.input<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusType = z.input<
  typeof updateAppointmentStatusSchema
>;

export type AppointmentResponse = Sanitize<Appointment> & {
  branch?: BranchResponse;
  doctor?: DoctorProfileResponse;
  patient?: PatientProfileResponse;
  conversation?: ConversationResponse;
  payments?: PaymentResponse[];
};

export type AppointmentQueryType = z.input<typeof appointmentQuerySchema>;

export interface AppointmentQueryResponse extends BaseQueryResponse {
  appointments: AppointmentResponse[];
}
