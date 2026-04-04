import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreatePaymentIntentDto,
  CreateRefundDto,
  PaymentQueryDto,
  UpdatePaymentStatusDto,
  UpdateRefundStatusDto,
} from "@workspace/contracts/payment";

import { PaymentService } from "./payment.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles("admin", "patient")
  @Post()
  createPayment(
    @Body() dto: CreatePaymentIntentDto,
    @User() user: Express.User,
  ) {
    return this.paymentService.createPayment(dto, user);
  }

  @Roles("admin", "doctor", "patient")
  @Get()
  listPayments(@Query() query: PaymentQueryDto, @User() user: Express.User) {
    return this.paymentService.listPayments(query, user);
  }

  @Roles("admin", "doctor", "patient")
  @Get(":paymentId")
  findPayment(@Param("paymentId") paymentId: string, @User() user: Express.User) {
    return this.paymentService.findPayment(paymentId, user);
  }

  @Roles("admin")
  @Patch(":paymentId/status")
  updatePaymentStatus(
    @Param("paymentId") paymentId: string,
    @Body() dto: UpdatePaymentStatusDto,
    @User() user: Express.User,
  ) {
    return this.paymentService.updatePaymentStatus(paymentId, dto, user);
  }

  @Roles("admin", "patient")
  @Post("refunds")
  createRefund(@Body() dto: CreateRefundDto, @User() user: Express.User) {
    return this.paymentService.createRefund(dto, user);
  }

  @Roles("admin")
  @Patch("refunds/:refundId/status")
  updateRefundStatus(
    @Param("refundId") refundId: string,
    @Body() dto: UpdateRefundStatusDto,
    @User() user: Express.User,
  ) {
    return this.paymentService.updateRefundStatus(refundId, dto, user);
  }

  @Public()
  @Post("webhooks/stripe")
  handleStripeWebhook(
    @Headers("stripe-signature") signature: string | undefined,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    return this.paymentService.handleStripeWebhook(signature, req.rawBody);
  }
}
