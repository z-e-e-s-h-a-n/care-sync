import { Module } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { NewsletterService } from "./newsletter.service";
import { NewsletterController } from "./newsletter.controller";

@Module({
  providers: [ContactService, NewsletterService],
  controllers: [ContactController, NewsletterController],
})
export class LeadModule {}
