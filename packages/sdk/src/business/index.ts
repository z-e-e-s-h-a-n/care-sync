import { apiClient, executeApi } from "../lib";
import type {
  BusinessProfileResponse,
  BusinessProfileType,
} from "@workspace/contracts/business";

export const getBusinessProfile = () =>
  executeApi<BusinessProfileResponse>(() => apiClient.get("/business"));

export const upsertBusinessProfile = (data: BusinessProfileType) =>
  executeApi<BusinessProfileResponse>(() => apiClient.put("/business", data));
