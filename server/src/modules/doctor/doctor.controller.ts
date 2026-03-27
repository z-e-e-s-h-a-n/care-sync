import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  DoctorProfileDto,
  DoctorQueryDto,
  ReviewDoctorDto,
} from "@workspace/contracts/doctor";

import { DoctorService } from "./doctor.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("doctors")
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Roles("doctor")
  @Get("me")
  me(@User("id") userId: string) {
    return this.doctorService.findByUserId(userId);
  }

  @Public()
  @Get()
  list(@Query() query: DoctorQueryDto) {
    return this.doctorService.list(query);
  }

  @Public()
  @Get(":identifier")
  findOne(@Param("identifier") identifier: string) {
    return this.doctorService.findOne(identifier);
  }

  @Roles("admin")
  @Post()
  create(@Body() dto: DoctorProfileDto, @User("id") userId: string) {
    return this.doctorService.create(dto, userId);
  }

  @Roles("admin", "doctor")
  @Put(":doctorId")
  async update(
    @Param("doctorId") doctorId: string,
    @Body() dto: DoctorProfileDto,
    @User() user: Express.User,
  ) {
    await this.doctorService.assertDoctorAccess(user, doctorId);
    return this.doctorService.update(doctorId, dto);
  }

  @Roles("admin")
  @Post(":doctorId/verify")
  verify(
    @Param("doctorId") doctorId: string,
    @Body() dto: ReviewDoctorDto,
    @User("id") userId: string,
  ) {
    return this.doctorService.verify(doctorId, dto, userId);
  }
}
