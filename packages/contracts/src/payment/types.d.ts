import type z from "zod";
import type { Payment } from "@workspace/db/browser";
import type {
  createPaymentIntentSchema,
  createRefundSchema,
  paymentQuerySchema,
  updatePaymentStatusSchema,
  updateRefundStatusSchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { AppointmentResponse } from "../appointment/types";

export type CreatePaymentIntentType = z.input<typeof createPaymentIntentSchema>;
export type UpdatePaymentStatusType = z.input<typeof updatePaymentStatusSchema>;

export type CreateRefundType = z.input<typeof createRefundSchema>;
export type UpdateRefundStatusType = z.input<typeof updateRefundStatusSchema>;

export type PaymentQueryType = z.input<typeof paymentQuerySchema>;

export type PaymentResponse = Sanitize<Payment> & {
  appointment?: AppointmentResponse | nul;
  order?: {
    id: string;
    orderNumber: string;
  };
  refunds?: Array<{
    id: string;
    amount: number;
    status: string;
    reason?: string;
    requestedAt: string;
    processedAt?: string;
  }>;
};

export interface PaymentQueryResponse extends BaseQueryResponse {
  payments: PaymentResponse[];
}
