"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItemType,
  CartItemResponse,
} from "@workspace/contracts/order";
import * as order from "@workspace/sdk/order";
import * as product from "@workspace/sdk/product";
import { parseDuration } from "@workspace/shared/utils";
import type { ApiException } from "@workspace/sdk";
import useUser from "@workspace/ui/hooks/use-user";
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
  return normalizeCartItems(
    items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  );
}

function areCartItemsEqual(a: CartItemType[], b: CartItemType[]) {
  if (a.length !== b.length) return false;

  return a.every((item, index) => {
    const other = b[index];
    return (
      item.productId === other?.productId && item.quantity === other.quantity
    );
  });
}

function mergeLocalWithMissingServerItems(
  localItems: CartItemType[],
  serverItems: CartItemType[],
) {
  const localIds = new Set(localItems.map((item) => item.productId));

  return normalizeCartItems([
    ...localItems,
    ...serverItems.filter((item) => !localIds.has(item.productId)),
  ]);
}

export function useCart() {
  const queryClient = useQueryClient();
  const { currentUser, isLoading: userLoading } = useUser();
  const isLoggedIn = Boolean(currentUser);

  const [items, setItems] = useLocalStorage<CartItemType[]>(STORAGE_KEY, []);
  const normalizedItems = useMemo(() => normalizeCartItems(items), [items]);
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: order.getCart,
    select: (res: Awaited<ReturnType<typeof order.getCart>>) =>
      mapServerCartItems(res.data.items),
    enabled: isLoggedIn,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const syncMutation = useMutation({
    mutationFn: (nextItems: CartItemType[]) =>
      order.syncCart({
        items: normalizeCartItems(nextItems),
        mode: "replace",
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["cart"],
        mapServerCartItems(result.data.items),
      );
    },
  });

  const clearMutation = useMutation({
    mutationFn: order.clearCart,
    onSuccess: () => {
      queryClient.setQueryData(["cart"], []);
    },
  });

  useEffect(() => {
    if (!currentUser?.id) {
      setInitializedUserId(null);
      return;
    }

    if (userLoading || cartQuery.isLoading || syncMutation.isPending) return;
    if (initializedUserId === currentUser.id) return;

    const serverItems = cartQuery.data ?? [];
    const mergedItems = mergeLocalWithMissingServerItems(
      normalizedItems,
      serverItems,
    );
    const shouldUpdateLocal = !areCartItemsEqual(mergedItems, normalizedItems);
    const shouldSyncServer = !areCartItemsEqual(mergedItems, serverItems);

    if (shouldUpdateLocal) {
      setItems(mergedItems);
    }

    if (shouldSyncServer) {
      syncMutation.mutate(mergedItems, {
        onSuccess: () => {
          setInitializedUserId(currentUser.id);
        },
      });
      return;
    }

    setInitializedUserId(currentUser.id);
  }, [
    cartQuery.data,
    cartQuery.isLoading,
    currentUser?.id,
    initializedUserId,
    normalizedItems,
    setItems,
    syncMutation,
    userLoading,
  ]);

  const productsQuery = useQuery({
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
    enabled: normalizedItems.length > 0,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const displayItems = useMemo(() => {
    const productMap = new Map(
      (productsQuery.data ?? []).map((item) => [item.id, item]),
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
      .filter((item): item is CartItemResponse => Boolean(item));
  }, [normalizedItems, productsQuery.data]);

  const count = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0,
  );
  const isInitializingLoggedInCart =
    isLoggedIn && initializedUserId !== currentUser?.id;
  const isLoading =
    userLoading ||
    productsQuery.isLoading ||
    (isInitializingLoggedInCart &&
      (cartQuery.isLoading || syncMutation.isPending));

  const syncIfNeeded = (nextItems: CartItemType[]) => {
    if (!isLoggedIn || initializedUserId !== currentUser?.id) return;
    syncMutation.mutate(nextItems);
  };

  const updateLocalItems = (
    updater: (current: CartItemType[]) => CartItemType[],
  ) => {
    const nextItems = normalizeCartItems(updater(normalizedItems));
    setItems(nextItems);
    syncIfNeeded(nextItems);
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
    setItems([]);

    if (isLoggedIn && initializedUserId === currentUser?.id) {
      await clearMutation.mutateAsync();
    }
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
      productsQuery.error ??
      syncMutation.error ??
      clearMutation.error) as ApiException | null,
    addItem,
    setItem,
    removeItem,
    clearCart,
  };
}
