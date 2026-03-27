import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  AppointmentQueryDto,
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from "@workspace/contracts/appointment";

import { AppointmentService } from "./appointment.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Roles("admin", "doctor", "patient")
@Controller("appointments")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto, @User() user: Express.User) {
    return this.appointmentService.create(dto, user);
  }

  @Get()
  list(@Query() query: AppointmentQueryDto, @User() user: Express.User) {
    return this.appointmentService.list(query, user);
  }

  @Get(":appointmentId")
  findOne(
    @Param("appointmentId") appointmentId: string,
    @User() user: Express.User,
  ) {
    return this.appointmentService.findOne(appointmentId, user);
  }

  @Patch(":appointmentId/status")
  updateStatus(
    @Param("appointmentId") appointmentId: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @User() user: Express.User,
  ) {
    return this.appointmentService.updateStatus(appointmentId, dto, user);
  }
}
