import apiClient, { executeApi } from "../lib/api-client";
import type {
  StaffProfileResponse,
  StaffProfileType,
  StaffQueryResponse,
  StaffQueryType,
} from "@workspace/contracts/staff";

export const createStaff = (data: StaffProfileType) =>
  executeApi<StaffProfileResponse>(() => apiClient.post("/staff", data));

export const getMyStaffProfile = () =>
  executeApi<StaffProfileResponse>(() => apiClient.get("/staff/me"));

export const listStaff = (params?: StaffQueryType) =>
  executeApi<StaffQueryResponse>(() => apiClient.get("/staff", { params }));

export const getStaff = (id: string) =>
  executeApi<StaffProfileResponse>(() => apiClient.get(`/staff/${id}`));

export const updateStaff = (id: string, data: StaffProfileType) =>
  executeApi<StaffProfileResponse>(() => apiClient.put(`/staff/${id}`, data));
