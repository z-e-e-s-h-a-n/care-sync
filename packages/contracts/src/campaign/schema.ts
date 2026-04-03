import z from "zod";
import {
  CampaignAudienceEnum,
  CampaignSearchByEnum,
  CampaignSortByEnum,
  CampaignStatusEnum,
  NotificationChannelEnum,
} from "../lib/enums";
import { baseQuerySchema, isoDateSchema, optionalStringSchema } from "../lib/schema";

export const notificationCampaignSchema = z.object({
  audience: CampaignAudienceEnum,
  title: z.string().min(2),
  subject: optionalStringSchema,
  message: z.string().min(2),
  channel: NotificationChannelEnum,
  scheduledAt: isoDateSchema.optional(),
});

export const campaignQuerySchema = baseQuerySchema(
  CampaignSortByEnum,
  CampaignSearchByEnum,
).extend({
  status: CampaignStatusEnum.optional(),
  audience: CampaignAudienceEnum.optional(),
});

export const updateCampaignStatusSchema = z.object({
  campaignId: z.ulid(),
  status: CampaignStatusEnum,
});
