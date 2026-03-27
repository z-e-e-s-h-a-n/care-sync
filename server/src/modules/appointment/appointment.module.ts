import { Module } from "@nestjs/common";
import { AvailabilityModule } from "@/modules/availability/availability.module";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";

@Module({
  imports: [AvailabilityModule, DoctorModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
