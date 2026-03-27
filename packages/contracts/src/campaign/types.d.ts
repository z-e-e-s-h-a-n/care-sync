import type z from "zod";
import type { NotificationCampaign } from "@workspace/db/browser";
import type {
  campaignQuerySchema,
  notificationCampaignSchema,
  updateCampaignStatusSchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { UserResponse } from "../user/types";

export type NotificationCampaignType = z.input<
  typeof notificationCampaignSchema
>;
export type CampaignQueryType = z.input<typeof campaignQuerySchema>;
export type UpdateCampaignStatusType = z.input<
  typeof updateCampaignStatusSchema
>;
export type NotificationCampaignResponse = Sanitize<NotificationCampaign> & {
  createdBy?: UserResponse;
  recipients?: Array<{
    userId: string;
    sentAt?: string;
    user?: UserResponse;
  }>;
};

export interface CampaignQueryResponse extends BaseQueryResponse {
  campaigns: NotificationCampaignResponse[];
}
