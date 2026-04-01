"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRefundType,
  PaymentQueryType,
  PaymentResponse,
  UpdatePaymentStatusType,
} from "@workspace/contracts/payment";
import type { ApiException } from "@workspace/sdk";
import * as payment from "@workspace/sdk/payment";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function usePayments(params: PaymentQueryType) {
  const query = useQuery({
    queryKey: ["payments", params],
    queryFn: () => payment.listPayments(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function usePayment(id?: string) {
  const query = useQuery({
    queryKey: ["payment", id],
    queryFn: () => payment.getPayment(id!),
    select: (res) => res.data as PaymentResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useUpdatePayment(id?: string) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (data: UpdatePaymentStatusType) =>
      payment.updatePaymentStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: (data: CreateRefundType) => payment.createRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
    },
  });

  return {
    updatePaymentStatus: statusMutation.mutateAsync,
    createRefund: refundMutation.mutateAsync,
    isPending: statusMutation.isPending || refundMutation.isPending,
    error:
      (statusMutation.error as ApiException | null) ??
      (refundMutation.error as ApiException | null),
  };
}
