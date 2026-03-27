import { Module } from "@nestjs/common";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  imports: [DoctorModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
