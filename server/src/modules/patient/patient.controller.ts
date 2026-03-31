import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  PatientProfileDto,
  PatientQueryDto,
} from "@workspace/contracts/patient";

import { PatientService } from "./patient.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("patients")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Roles("patient")
  @Get("me")
  getMyProfile(@User() user: Express.User) {
    return this.patientService.getMyProfile(user);
  }

  @Roles("patient")
  @Put("me")
  upsertMyProfile(@Body() dto: PatientProfileDto, @User() user: Express.User) {
    return this.patientService.upsertMyProfile(dto, user);
  }

  @Roles("admin", "doctor")
  @Post()
  create(@Body() dto: PatientProfileDto) {
    return this.patientService.create(dto);
  }

  @Roles("admin", "doctor")
  @Get()
  list(@Query() query: PatientQueryDto, @User() user: Express.User) {
    return this.patientService.list(query, user);
  }

  @Roles("admin", "doctor", "patient")
  @Get(":patientId")
  findOne(@Param("patientId") patientId: string, @User() user: Express.User) {
    return this.patientService.findOne(patientId, user);
  }
}
