import apiClient, { executeApi } from "../lib/api-client";
import type {
  CreatePaymentIntentType,
  CreateRefundType,
  PaymentQueryResponse,
  PaymentQueryType,
  PaymentResponse,
  UpdatePaymentStatusType,
  UpdateRefundStatusType,
} from "@workspace/contracts/payment";

export const createPayment = (data: CreatePaymentIntentType) =>
  executeApi<PaymentResponse>(() => apiClient.post("/payments", data));

export const listPayments = (params?: PaymentQueryType) =>
  executeApi<PaymentQueryResponse>(() =>
    apiClient.get("/payments", { params }),
  );

export const getPayment = (id: string) =>
  executeApi<PaymentResponse>(() => apiClient.get(`/payments/${id}`));

export const updatePaymentStatus = (
  id: string,
  data: UpdatePaymentStatusType,
) =>
  executeApi<PaymentResponse>(() =>
    apiClient.patch(`/payments/${id}/status`, data),
  );

export const createRefund = (data: CreateRefundType) =>
  executeApi(() => apiClient.post("/payments/refunds", data));

export const updateRefundStatus = (id: string, data: UpdateRefundStatusType) =>
  executeApi(() => apiClient.patch(`/payments/refunds/${id}/status`, data));
