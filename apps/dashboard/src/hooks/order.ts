"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateManualOrderType,
  UpdateOrderStatusType,
  CreateShipmentType,
  UpdateShipmentType,
  OrderQueryType,
  OrderResponse,
} from "@workspace/contracts/order";
import type { ApiException } from "@workspace/sdk";
import * as order from "@workspace/sdk/order";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useOrderList(params?: OrderQueryType) {
  const query = useQuery({
    queryKey: ["orders", params],
    queryFn: () => order.listOrders(params),
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

export function useOrder(orderId?: string) {
  const query = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => order.getOrder(orderId!),
    select: (res) => res.data as OrderResponse,
    enabled: Boolean(orderId),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateManualOrderType) => order.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateOrderStatusType) =>
      order.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    },
  });

  return {
    updateStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useCreateShipment(orderId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateShipmentType) =>
      order.createShipment(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    },
  });

  return {
    createShipment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: UpdateShipmentType;
    }) => order.updateShipment(shipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    updateShipment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
