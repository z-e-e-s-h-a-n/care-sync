import type { Request } from "express";
import { Controller, Post, Body, Get, Query, Param, Req } from "@nestjs/common";
import { NewsletterService } from "./newsletter.service";
import {
  NewsletterSubscriberDto,
  NewsletterUnSubscriberDto,
  NewsletterSubscriberQueryDto,
} from "@workspace/contracts/newsletter";
import { Public } from "@/lib/decorators/public.decorator";
import { Roles } from "@/lib/decorators/roles.decorator";

@Controller("newsletter")
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Public()
  @Post("subscribe")
  async subscribe(@Body() dto: NewsletterSubscriberDto, @Req() req: Request) {
    return this.service.subscribe(dto, req);
  }

  @Public()
  @Post("unsubscribe")
  async unsubscribe(@Body() dto: NewsletterUnSubscriberDto) {
    return this.service.unsubscribe(dto);
  }

  @Roles("admin")
  @Get()
  async list(@Query() query: NewsletterSubscriberQueryDto) {
    return this.service.list(query);
  }

  @Roles("admin")
  @Get(":id")
  async getSubscriber(@Param("id") id: string) {
    return this.service.getSubscriber(id);
  }
}
