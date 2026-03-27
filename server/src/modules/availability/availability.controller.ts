import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
import {
  AvailabilityScheduleDto,
  AvailabilitySlotsQueryDto,
} from "@workspace/contracts/availability";

import { AvailabilityService } from "./availability.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("doctors/:doctorId/availability")
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get()
  getSchedule(@Param("doctorId") doctorId: string) {
    return this.availabilityService.getSchedule(doctorId);
  }

  @Public()
  @Get("slots")
  getAvailableSlots(
    @Param("doctorId") doctorId: string,
    @Query() query: AvailabilitySlotsQueryDto,
  ) {
    return this.availabilityService.getAvailableSlots(doctorId, query);
  }

  @Roles("admin", "doctor")
  @Put()
  replaceSchedule(
    @Param("doctorId") doctorId: string,
    @Body() dto: AvailabilityScheduleDto,
    @User() user: Express.User,
  ) {
    return this.availabilityService.replaceSchedule(doctorId, dto, user);
  }
}
