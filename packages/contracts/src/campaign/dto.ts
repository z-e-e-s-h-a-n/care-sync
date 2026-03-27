import { createZodDto } from "nestjs-zod";
import {
  campaignQuerySchema,
  notificationCampaignSchema,
  updateCampaignStatusSchema,
} from "./schema";

export class NotificationCampaignDto extends createZodDto(
  notificationCampaignSchema,
) {}

export class CampaignQueryDto extends createZodDto(campaignQuerySchema) {}

export class UpdateCampaignStatusDto extends createZodDto(
  updateCampaignStatusSchema,
) {}
