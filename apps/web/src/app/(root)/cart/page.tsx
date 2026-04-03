"use client";

import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as product from "@workspace/sdk/product";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { Separator } from "@workspace/ui/components/separator";
import useUser from "@workspace/ui/hooks/use-user";
import {
  useServerCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useSyncLocalCart,
  useShopProduct,
} from "@/hooks/healthcare";
import { useLocalCart } from "@/hooks/use-local-cart";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function LocalCartRow({
  productId,
  quantity,
  onSetQty,
  onRemove,
}: {
  productId: string;
  quantity: number;
  onSetQty: (q: number) => void;
  onRemove: () => void;
}) {
  const { data: product, isLoading } = useShopProduct(productId);

  if (isLoading)
    return (
      <div className="flex gap-4 rounded-xl border p-4">
        <Skeleton className="size-20 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );

  if (!product) return null;

  const image = product.images?.[0]?.url;
  const lineTotal = product.sellPrice * quantity;

  return (
    <div className="flex gap-4 rounded-xl border p-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <ShoppingBag className="size-6" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/shop/${product.slug}`}
            className="font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
          <button
            onClick={onRemove}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center rounded-lg border">
            <button
              onClick={() => onSetQty(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={() => onSetQty(Math.min(product.stockCount, quantity + 1))}
              disabled={quantity >= product.stockCount}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <p className="font-semibold text-primary">{formatAmount(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { currentUser } = useUser();
  const isLoggedIn = Boolean(currentUser);

  const { data: serverCartData, isLoading: serverLoading } =
    useServerCart(isLoggedIn);
  const { updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { removeCartItem, isPending: isRemoving } = useRemoveCartItem();

  const {
    items: localItems,
    setItem,
    removeItem,
    clearCart: clearLocalCart,
    count: localCount,
  } = useLocalCart();

  const { syncCart } = useSyncLocalCart();
  useEffect(() => {
    if (isLoggedIn && localCount > 0) {
      syncCart(localItems).then(() => clearLocalCart());
    }
  }, [isLoggedIn]);

  const handleServerQtyChange = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ itemId, data: { quantity } });
    } catch (error: any) {
      toast.error("Could not update quantity", { description: error?.message });
    }
  };

  const handleServerRemove = async (itemId: string, name: string) => {
    try {
      await removeCartItem(itemId);
      toast.success(`${name} removed from cart.`);
    } catch (error: any) {
      toast.error("Could not remove item", { description: error?.message });
    }
  };

  if (isLoggedIn) {
    const items = serverCartData?.items ?? [];
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.sellPrice * item.quantity,
      0,
    );

    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your items before checkout.
          </p>
        </div>

        {serverLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border p-4">
                <Skeleton className="size-20 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!serverLoading && !items.length && <EmptyCart />}

        {!serverLoading && items.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <SectionCard title="Items" contentClassName="space-y-3" className="shadow-sm">
              {items.map((item) => {
                const image = item.product.images?.[0]?.url;
                const lineTotal = item.product.sellPrice * item.quantity;

                return (
                  <div key={item.id} className="flex gap-4 rounded-xl border p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/40">
                          <ShoppingBag className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          className="font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => handleServerRemove(item.id, item.product.name)}
                          disabled={isRemoving}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border">
                          <button
                            onClick={() => handleServerQtyChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleServerQtyChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockCount || isUpdating}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatAmount(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </SectionCard>
            <CartSummaryPanel
              items={items.map((i) => ({
                name: i.product.name,
                quantity: i.quantity,
                total: i.product.sellPrice * i.quantity,
              }))}
              subtotal={subtotal}
              checkoutHref="/checkout"
            />
          </div>
        )}
      </div>
    );
  }

  const guestSummaryQueries = useQueries({
    queries: localItems.map((item) => ({
      queryKey: ["products", item.productId],
      queryFn: () => product.getProduct(item.productId),
      select: (res: Awaited<ReturnType<typeof product.getProduct>>) => res.data,
      staleTime: STALE_TIME,
      gcTime: STALE_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      enabled: localItems.length > 0,
    })),
  });

  const guestSummaryItems = localItems
    .map((item, index) => {
      const productData = guestSummaryQueries[index]?.data;
      if (!productData) return null;

      return {
        name: productData.name,
        quantity: item.quantity,
        total: productData.sellPrice * item.quantity,
      };
    })
    .filter((item): item is { name: string; quantity: number; total: number } =>
      item !== null,
    );

  const localSubtotal = guestSummaryItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const isGuestSummaryLoading = guestSummaryQueries.some((query) => query.isLoading);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground">
          Review your items before checkout.
        </p>
      </div>

      {!localItems.length && <EmptyCart />}

      {localItems.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SectionCard title="Items" contentClassName="space-y-3" className="shadow-sm">
            {localItems.map((item) => (
              <LocalCartRow
                key={item.productId}
                productId={item.productId}
                quantity={item.quantity}
                onSetQty={(q) => setItem(item.productId, q)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </SectionCard>
          {isGuestSummaryLoading ? (
            <LocalCartSummaryPanel />
          ) : (
            <CartSummaryPanel
              items={guestSummaryItems}
              subtotal={localSubtotal}
              checkoutHref="/checkout"
            />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShoppingBag className="size-8" />
      </div>
      <div>
        <p className="font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our shop and add items to get started.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/shop">Browse Shop</Link>
      </Button>
    </div>
  );
}

function CartSummaryPanel({
  items,
  subtotal,
  checkoutHref,
}: {
  items: { name: string; quantity: number; total: number }[];
  subtotal: number;
  checkoutHref: string;
}) {
  return (
    <div className="space-y-4">
      <SectionCard title="Order Summary" contentClassName="space-y-3" className="shadow-sm">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
              {item.name} × {item.quantity}
            </span>
            <span className="shrink-0 font-medium">
              {formatAmount(item.total)}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping calculated at checkout.
        </p>
        <Button className="w-full" asChild>
          <Link href={checkoutHref}>Proceed to Checkout</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </SectionCard>
    </div>
  );
}

function LocalCartSummaryPanel() {
  return (
    <div className="space-y-4">
      <SectionCard title="Order Summary" contentClassName="space-y-3" className="shadow-sm">
        <p className="text-xs text-muted-foreground">
          Prices shown per item in cart.
        </p>
        <p className="text-xs text-muted-foreground">
          Shipping calculated at checkout.
        </p>
        <Button className="w-full" asChild>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </SectionCard>
    </div>
  );
}
