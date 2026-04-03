import { apiClient, executeApi } from "../lib";
import type {
  AdminDashboardOverview,
  DoctorDashboardOverview,
  PatientDashboardOverview,
  StaffDashboardOverview,
} from "@workspace/contracts/dashboard";

export const getAdminDashboard = () =>
  executeApi<AdminDashboardOverview>(() => apiClient.get("/dashboard/admin"));

export const getDoctorDashboard = () =>
  executeApi<DoctorDashboardOverview>(() => apiClient.get("/dashboard/doctor"));

export const getStaffDashboard = () =>
  executeApi<StaffDashboardOverview>(() => apiClient.get("/dashboard/staff"));

export const getPatientDashboard = () =>
  executeApi<PatientDashboardOverview>(() => apiClient.get("/dashboard/patient"));
