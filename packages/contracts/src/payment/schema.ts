import z from "zod";
import {
  PaymentSearchByEnum,
  PaymentSortByEnum,
  PaymentMethodTypeEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
  RefundStatusEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  numberSchema,
  nullableStringSchema,
} from "../lib/schema";

export const createPaymentIntentSchema = z.object({
  appointmentId: idSchema.optional(),
  orderId: idSchema.optional(),
  amount: numberSchema,
  provider: PaymentProviderEnum.default("stripe"),
  methodType: PaymentMethodTypeEnum.default("card"),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: idSchema,
  status: PaymentStatusEnum,
  transactionId: z.string().optional(),
  failureMessage: nullableStringSchema,
});

export const createRefundSchema = z.object({
  paymentId: idSchema,
  amount: numberSchema,
  reason: nullableStringSchema,
});

export const updateRefundStatusSchema = z.object({
  refundId: idSchema,
  status: RefundStatusEnum,
  reason: nullableStringSchema,
});

export const paymentQuerySchema = baseQuerySchema(
  PaymentSortByEnum,
  PaymentSearchByEnum,
).extend({
  appointmentId: idSchema.optional(),
  orderId: idSchema.optional(),
  status: PaymentStatusEnum.optional(),
});
