import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  CampaignQueryDto,
  NotificationCampaignDto,
  UpdateCampaignStatusDto,
} from "@workspace/contracts/campaign";

import { CampaignService } from "./campaign.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Roles("admin")
@Controller("campaigns")
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  createCampaign(
    @Body() dto: NotificationCampaignDto,
    @User("id") currentUserId: string,
  ) {
    return this.campaignService.createCampaign(dto, currentUserId);
  }

  @Get()
  listCampaigns(@Query() query: CampaignQueryDto) {
    return this.campaignService.listCampaigns(query);
  }

  @Get(":campaignId")
  findCampaign(@Param("campaignId") campaignId: string) {
    return this.campaignService.findCampaign(campaignId);
  }

  @Patch(":campaignId/status")
  updateCampaignStatus(
    @Param("campaignId") campaignId: string,
    @Body() dto: UpdateCampaignStatusDto,
  ) {
    return this.campaignService.updateCampaignStatus(campaignId, dto);
  }

  @Post(":campaignId/send")
  sendCampaign(@Param("campaignId") campaignId: string) {
    return this.campaignService.sendCampaign(campaignId);
  }
}
