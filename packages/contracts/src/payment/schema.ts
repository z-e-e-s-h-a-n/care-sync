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
  optionalStringSchema,
  positiveNumberSchema,
} from "../lib/schema";

export const createPaymentIntentSchema = z.object({
  appointmentId: idSchema.optional(),
  amount: positiveNumberSchema,
  provider: PaymentProviderEnum.default("stripe"),
  methodType: PaymentMethodTypeEnum.default("card"),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: idSchema,
  status: PaymentStatusEnum,
  transactionId: z.string().optional(),
  failureMessage: optionalStringSchema,
});

export const createRefundSchema = z.object({
  paymentId: idSchema,
  amount: positiveNumberSchema,
  reason: optionalStringSchema,
});

export const updateRefundStatusSchema = z.object({
  refundId: idSchema,
  status: RefundStatusEnum,
  reason: optionalStringSchema,
});

export const paymentQuerySchema = baseQuerySchema(
  PaymentSortByEnum,
  PaymentSearchByEnum,
).extend({
  appointmentId: idSchema.optional(),
  status: PaymentStatusEnum.optional(),
});
