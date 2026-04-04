"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItemType,
  CartItemResponse,
} from "@workspace/contracts/order";
import * as order from "@workspace/sdk/order";
import * as product from "@workspace/sdk/product";
import { parseDuration } from "@workspace/shared/utils";
import useUser from "@workspace/ui/hooks/use-user";
import type { ApiException } from "@workspace/sdk";
import { useLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "care-sync-cart";
const STALE_TIME = parseDuration("10m");

function normalizeCartItems(items: CartItemType[]) {
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

  const [items, setItems] = useLocalStorage<CartItemType[]>(STORAGE_KEY, []);
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
    mutationFn: (nextItems: CartItemType[]) =>
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

  const guestProductsQuery = useQuery({
    queryKey: [
      "products",
      "cart",
      normalizedItems.map((item) => item.productId).join(","),
    ],
    queryFn: () =>
      product.listProducts({
        productIds: normalizedItems.map((item) => item.productId),
        limit: normalizedItems.length || 1,
        page: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    select: (res: Awaited<ReturnType<typeof product.listProducts>>) =>
      res.data.products,
    enabled: !isLoggedIn && normalizedItems.length > 0,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const displayItems = useMemo(() => {
    if (isLoggedIn) {
      return cartQuery.data?.items ?? [];
    }

    const productMap = new Map(
      (guestProductsQuery.data ?? []).map((item) => [item.id, item]),
    );

    return normalizedItems
      .map((item) => {
        const productData = productMap.get(item.productId);
        if (!productData) return null;

        return {
          id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          product: productData,
        };
      })
      .filter((item) => Boolean(item));
  }, [
    cartQuery.data?.items,
    guestProductsQuery.data,
    isLoggedIn,
    normalizedItems,
  ]) as CartItemResponse[];

  const count = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0,
  );
  const isResolvingProducts = !isLoggedIn && guestProductsQuery.isLoading;
  const isLoading =
    userLoading ||
    (isLoggedIn && (cartQuery.isLoading || syncMutation.isPending)) ||
    isResolvingProducts;

  const updateLocalItems = (
    updater: (current: CartItemType[]) => CartItemType[],
  ) => {
    const nextItems = normalizeCartItems(updater(normalizedItems));
    setItems(nextItems);

    if (isLoggedIn) {
      syncMutation.mutate(nextItems);
    }
  };

  const addItem = async (data: CartItemType) => {
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
      guestProductsQuery.error ??
      syncMutation.error ??
      clearMutation.error) as ApiException | null,
    addItem,
    setItem,
    removeItem,
    clearCart,
  };
}
