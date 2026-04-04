import { Module } from "@nestjs/common";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { EnvModule } from "@/modules/env/env.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  imports: [DoctorModule, EnvModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
