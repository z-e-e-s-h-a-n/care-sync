"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddCartItemType,
  CreateOrderType,
  OrderQueryType,
  ProductQueryType,
} from "@workspace/contracts/commerce";
import type { ApiException } from "@workspace/sdk";
import * as commerce from "@workspace/sdk/commerce";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useProducts(params: ProductQueryType) {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: () => commerce.listProducts(params),
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

export function useProduct(id?: string) {
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => commerce.getProduct(id!),
    select: (res) => res.data,
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

export function useCart() {
  const query = useQuery({
    queryKey: ["cart"],
    queryFn: commerce.getCart,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useUpsertCartItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AddCartItemType) => commerce.upsertCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    saveCartItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (cartItemId: string) => commerce.removeCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    removeCartItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useOrders(params: OrderQueryType) {
  const query = useQuery({
    queryKey: ["orders", params],
    queryFn: () => commerce.listOrders(params),
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

export function useOrder(id?: string) {
  const query = useQuery({
    queryKey: ["order", id],
    queryFn: () => commerce.getOrder(id!),
    select: (res) => res.data,
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

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateOrderType) => commerce.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
