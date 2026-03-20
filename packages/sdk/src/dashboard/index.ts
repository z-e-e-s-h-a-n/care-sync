import { apiClient, executeApi } from "../lib";
import type { DashboardResponse } from "@workspace/contracts/dashboard";

export const getDashboard = () =>
  executeApi<DashboardResponse>(() => apiClient.get("/dashboard"));
