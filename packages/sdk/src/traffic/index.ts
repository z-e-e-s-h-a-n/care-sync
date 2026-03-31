import { apiClient, executeApi } from "../lib";
import type {
  CreateTrafficSourceType,
  TrafficSourceQueryResponse,
  TrafficSourceQueryType,
  TrafficSourceResponse,
} from "@workspace/contracts/traffic";

export const createTrafficSource = (data: CreateTrafficSourceType) =>
  executeApi(() => apiClient.post("/traffic-sources", data));

export const trackTrafficSource = (data: CreateTrafficSourceType) =>
  executeApi<TrafficSourceResponse>(() =>
    apiClient.post("/traffic-sources/track", data),
  );

export const getTrafficSources = (params?: TrafficSourceQueryType) =>
  executeApi<TrafficSourceQueryResponse>(() =>
    apiClient.get("/admin/traffic-sources", { params }),
  );

export const getTrafficSource = (id: string) =>
  executeApi<TrafficSourceResponse>(() =>
    apiClient.get(`/admin/traffic-sources/${id}`),
  );
