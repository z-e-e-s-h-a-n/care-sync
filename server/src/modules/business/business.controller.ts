import { Body, Controller, Get, Put } from "@nestjs/common";
import { BusinessProfileDto } from "@workspace/contracts/business";

import { BusinessService } from "./business.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";

@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Public()
  @Get()
  async getProfile() {
    return this.businessService.getProfile();
  }

  @Roles("admin")
  @Put()
  async upsertProfile(@Body() dto: BusinessProfileDto) {
    return this.businessService.upsertProfile(dto);
  }
}
