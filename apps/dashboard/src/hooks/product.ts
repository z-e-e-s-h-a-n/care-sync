"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCategoryType,
  CategoryQueryType,
  CreateProductType,
  ProductQueryType,
  ProductResponse,
  ProductCategoryResponse,
} from "@workspace/contracts/product";
import type { ApiException } from "@workspace/sdk";
import * as product from "@workspace/sdk/product";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useCategoryList(params?: CategoryQueryType) {
  const query = useQuery({
    queryKey: ["categories", params],
    queryFn: () => product.listCategories(params),
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

export function useCategory(identifier?: string) {
  const query = useQuery({
    queryKey: ["categories", identifier],
    queryFn: () => product.getCategory(identifier!),
    select: (res) => res.data as ProductCategoryResponse,
    enabled: Boolean(identifier),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSaveCategory(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateCategoryType) =>
      id ? product.updateCategory(id, data) : product.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    saveCategory: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useProductList(params?: ProductQueryType) {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: () => product.listProducts(params),
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

export function useProduct(identifier?: string) {
  const query = useQuery({
    queryKey: ["products", identifier],
    queryFn: () => product.getProduct(identifier!),
    select: (res) => res.data as ProductResponse,
    enabled: Boolean(identifier),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSaveProduct(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProductType) =>
      id ? product.updateProduct(id, data) : product.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["products", id] });
    },
  });

  return {
    saveProduct: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => product.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    deleteProduct: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
