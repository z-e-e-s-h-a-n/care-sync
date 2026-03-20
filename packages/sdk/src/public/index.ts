import apiClient, { executeApi } from "../lib/api-client";
import type { HealthCheckResponse } from "@workspace/contracts";

export const welcome = () => executeApi(() => apiClient.get("/"));

export const healthCheck = () =>
  executeApi<HealthCheckResponse>(() => apiClient.get("/health"));
