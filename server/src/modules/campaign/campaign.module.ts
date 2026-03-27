import { Module } from "@nestjs/common";
import { NotificationModule } from "@/modules/notification/notification.module";
import { CampaignController } from "./campaign.controller";
import { CampaignService } from "./campaign.service";

@Module({
  imports: [NotificationModule],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
