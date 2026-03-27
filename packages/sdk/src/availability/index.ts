import apiClient, { executeApi } from "../lib/api-client";
import type {
  AvailabilityScheduleType,
  AvailabilitySlotsQueryType,
  AvailabilityRuleResponse,
  BlockedTimeResponse,
} from "@workspace/contracts/availability";

export interface AvailabilityScheduleResponse {
  rules: AvailabilityRuleResponse[];
  blockedTimes: BlockedTimeResponse[];
}

export interface AvailabilitySlotResponse {
  startAt: string;
  endAt: string;
}

export const getDoctorAvailability = (doctorId: string) =>
  executeApi<AvailabilityScheduleResponse>(() =>
    apiClient.get(`/doctors/${doctorId}/availability`),
  );

export const getDoctorAvailableSlots = (
  doctorId: string,
  params: AvailabilitySlotsQueryType,
) =>
  executeApi<AvailabilitySlotResponse[]>(() =>
    apiClient.get(`/doctors/${doctorId}/availability/slots`, { params }),
  );

export const replaceDoctorAvailability = (
  doctorId: string,
  data: AvailabilityScheduleType,
) =>
  executeApi<AvailabilityScheduleResponse>(() =>
    apiClient.put(`/doctors/${doctorId}/availability`, data),
  );
