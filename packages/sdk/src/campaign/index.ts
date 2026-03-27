import apiClient, { executeApi } from "../lib/api-client";
import type {
  CampaignQueryResponse,
  CampaignQueryType,
  NotificationCampaignResponse,
  NotificationCampaignType,
  UpdateCampaignStatusType,
} from "@workspace/contracts/campaign";

export const createCampaign = (data: NotificationCampaignType) =>
  executeApi<NotificationCampaignResponse>(() =>
    apiClient.post("/campaigns", data),
  );

export const listCampaigns = (params?: CampaignQueryType) =>
  executeApi<CampaignQueryResponse>(() =>
    apiClient.get("/campaigns", { params }),
  );

export const getCampaign = (id: string) =>
  executeApi<NotificationCampaignResponse>(() =>
    apiClient.get(`/campaigns/${id}`),
  );

export const updateCampaignStatus = (
  id: string,
  data: UpdateCampaignStatusType,
) =>
  executeApi<NotificationCampaignResponse>(() =>
    apiClient.patch(`/campaigns/${id}/status`, data),
  );

export const sendCampaign = (id: string) =>
  executeApi<NotificationCampaignResponse>(() =>
    apiClient.post(`/campaigns/${id}/send`),
  );
