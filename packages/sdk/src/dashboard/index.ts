import { apiClient, executeApi } from "../lib";
import type {
  AdminDashboardOverview,
  DoctorDashboardOverview,
} from "@workspace/contracts/dashboard";

export const getAdminDashboard = () =>
  executeApi<AdminDashboardOverview>(() => apiClient.get("/dashboard/admin"));

export const getDoctorDashboard = () =>
  executeApi<DoctorDashboardOverview>(() => apiClient.get("/dashboard/doctor"));
