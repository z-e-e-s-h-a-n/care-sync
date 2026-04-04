import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TokenModule } from "@/modules/token/token.module";
import { OtpService } from "../auth/otp.service";
import { PaymentModule } from "@/modules/payment/payment.module";

@Module({
  imports: [TokenModule, PaymentModule],
  controllers: [OrderController],
  providers: [OrderService, OtpService],
  exports: [OrderService],
})
export class OrderModule {}
