import { createZodDto } from "nestjs-zod";
import {
  createPaymentIntentSchema,
  createRefundSchema,
  paymentQuerySchema,
  updatePaymentStatusSchema,
  updateRefundStatusSchema,
} from "./schema";

export class CreatePaymentIntentDto extends createZodDto(
  createPaymentIntentSchema,
) {}

export class UpdatePaymentStatusDto extends createZodDto(
  updatePaymentStatusSchema,
) {}

export class CreateRefundDto extends createZodDto(createRefundSchema) {}

export class UpdateRefundStatusDto extends createZodDto(
  updateRefundStatusSchema,
) {}

export class PaymentQueryDto extends createZodDto(paymentQuerySchema) {}
