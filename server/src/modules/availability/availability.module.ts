import { Module } from "@nestjs/common";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityService } from "./availability.service";

@Module({
  imports: [DoctorModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
