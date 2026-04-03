"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { AddToCartType } from "@workspace/contracts/order";
import * as order from "@workspace/sdk/order";
import * as product from "@workspace/sdk/product";
import { parseDuration } from "@workspace/shared/utils";
import useUser from "@workspace/ui/hooks/use-user";
import type { ApiException } from "@workspace/sdk";
import { useLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "care-sync-cart";
const STALE_TIME = parseDuration("10m");

function normalizeCartItems(items: AddToCartType[]) {
  const quantityByProductId = new Map<string, number>();

  for (const item of items) {
    if (!item.productId || item.quantity <= 0) continue;

    quantityByProductId.set(
      item.productId,
      (quantityByProductId.get(item.productId) ?? 0) + item.quantity,
    );
  }

  return Array.from(quantityByProductId, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function mapServerCartItems(
  items: Awaited<ReturnType<typeof order.getCart>>["data"]["items"] = [],
) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
}

export function useCart() {
  const queryClient = useQueryClient();
  const { currentUser, isLoading: userLoading } = useUser();
  const isLoggedIn = Boolean(currentUser);

  const [items, setItems] = useLocalStorage<AddToCartType[]>(STORAGE_KEY, []);
  const normalizedItems = useMemo(() => normalizeCartItems(items), [items]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: order.getCart,
    select: (res: Awaited<ReturnType<typeof order.getCart>>) => res.data,
    enabled: isLoggedIn,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const syncMutation = useMutation({
    mutationFn: (nextItems: AddToCartType[]) =>
      order.syncCart({ items: normalizeCartItems(nextItems) }),
    onSuccess: (result) => {
      setItems(mapServerCartItems(result.data.items));
      queryClient.setQueryData(["cart"], result.data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: order.clearCart,
    onSuccess: () => {
      setItems([]);
      queryClient.setQueryData(["cart"], { items: [] });
    },
  });

  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      syncedUserIdRef.current = null;
      return;
    }

    if (userLoading || cartQuery.isLoading || syncMutation.isPending) return;
    if (syncedUserIdRef.current === currentUser.id) return;

    if (normalizedItems.length > 0) {
      syncMutation.mutate(normalizedItems, {
        onSuccess: () => {
          syncedUserIdRef.current = currentUser.id;
        },
      });
      return;
    }

    setItems(mapServerCartItems(cartQuery.data?.items));
    syncedUserIdRef.current = currentUser.id;
  }, [
    cartQuery.data?.items,
    cartQuery.isLoading,
    currentUser?.id,
    normalizedItems,
    setItems,
    syncMutation,
    userLoading,
  ]);

  const productQueries = useQueries({
    queries: normalizedItems.map((item) => ({
      queryKey: ["products", item.productId],
      queryFn: () => product.getProduct(item.productId),
      select: (res: Awaited<ReturnType<typeof product.getProduct>>) => res.data,
      staleTime: STALE_TIME,
      gcTime: STALE_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      enabled: !isLoggedIn && normalizedItems.length > 0,
    })),
  });

  const displayItems = useMemo(() => {
    if (isLoggedIn) {
      return (cartQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));
    }

    return normalizedItems
      .map((item, index) => {
        const productData = productQueries[index]?.data;
        if (!productData) return null;

        return {
          id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          product: productData,
        };
      })
      .filter(
        (
          item,
        ): item is {
          id: string;
          productId: string;
          quantity: number;
          product: NonNullable<(typeof productQueries)[number]["data"]>;
        } => Boolean(item),
      );
  }, [cartQuery.data?.items, isLoggedIn, normalizedItems, productQueries]);

  const count = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0,
  );
  const isResolvingProducts =
    !isLoggedIn && productQueries.some((query) => query.isLoading);
  const isLoading =
    userLoading ||
    (isLoggedIn && (cartQuery.isLoading || syncMutation.isPending)) ||
    isResolvingProducts;

  const updateLocalItems = (
    updater: (current: AddToCartType[]) => AddToCartType[],
  ) => {
    const nextItems = normalizeCartItems(updater(normalizedItems));
    setItems(nextItems);

    if (isLoggedIn) {
      syncMutation.mutate(nextItems);
    }
  };

  const addItem = async (data: AddToCartType) => {
    updateLocalItems((current) => {
      const existing = current.find(
        (item) => item.productId === data.productId,
      );

      if (!existing) return [...current, data];

      return current.map((item) =>
        item.productId === data.productId
          ? { ...item, quantity: item.quantity + data.quantity }
          : item,
      );
    });
  };

  const setItem = async (productId: string, quantity: number) => {
    updateLocalItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
    );
  };

  const removeItem = async (productId: string) => {
    updateLocalItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      await clearMutation.mutateAsync();
      return;
    }

    setItems([]);
  };

  return {
    items: normalizedItems,
    displayItems,
    count,
    subtotal,
    isLoggedIn,
    isLoading,
    isSyncing: syncMutation.isPending || clearMutation.isPending,
    error: (cartQuery.error ??
      syncMutation.error ??
      clearMutation.error) as ApiException | null,
    addItem,
    setItem,
    removeItem,
    clearCart,
  };
}
