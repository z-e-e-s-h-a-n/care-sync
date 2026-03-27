import apiClient, { executeApi } from "../lib/api-client";
import type {
  DoctorProfileResponse,
  DoctorProfileType,
  DoctorQueryResponse,
  DoctorQueryType,
  ReviewDoctorType,
} from "@workspace/contracts/doctor";

export const createDoctor = (data: DoctorProfileType) =>
  executeApi<DoctorProfileResponse>(() => apiClient.post("/doctors", data));

export const getMyDoctorProfile = () =>
  executeApi<DoctorProfileResponse>(() => apiClient.get("/doctors/me"));

export const listDoctors = (params?: DoctorQueryType) =>
  executeApi<DoctorQueryResponse>(() => apiClient.get("/doctors", { params }));

export const getDoctor = (identifier: string) =>
  executeApi<DoctorProfileResponse>(() =>
    apiClient.get(`/doctors/${identifier}`),
  );

export const updateDoctor = (id: string, data: DoctorProfileType) =>
  executeApi<DoctorProfileResponse>(() =>
    apiClient.put(`/doctors/${id}`, data),
  );

export const verifyDoctor = (id: string, data: ReviewDoctorType) =>
  executeApi<DoctorProfileResponse>(() =>
    apiClient.post(`/doctors/${id}/verify`, data),
  );
