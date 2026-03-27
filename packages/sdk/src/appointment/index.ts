import apiClient, { executeApi } from "../lib/api-client";
import type {
  AppointmentQueryResponse,
  AppointmentQueryType,
  AppointmentResponse,
  CreateAppointmentType,
  UpdateAppointmentStatusType,
} from "@workspace/contracts/appointment";

export const createAppointment = (data: CreateAppointmentType) =>
  executeApi<AppointmentResponse>(() => apiClient.post("/appointments", data));

export const listAppointments = (params?: AppointmentQueryType) =>
  executeApi<AppointmentQueryResponse>(() =>
    apiClient.get("/appointments", { params }),
  );

export const getAppointment = (id: string) =>
  executeApi<AppointmentResponse>(() => apiClient.get(`/appointments/${id}`));

export const updateAppointmentStatus = (
  id: string,
  data: UpdateAppointmentStatusType,
) =>
  executeApi<AppointmentResponse>(() =>
    apiClient.patch(`/appointments/${id}/status`, data),
  );
