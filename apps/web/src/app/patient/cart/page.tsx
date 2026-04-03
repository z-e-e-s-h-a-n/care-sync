"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { Separator } from "@workspace/ui/components/separator";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/healthcare";

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export default function CartPage() {
  const { data, isLoading } = useCart();
  const { updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { removeCartItem, isPending: isRemoving } = useRemoveCartItem();

  const items = data?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handleQtyChange = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ itemId, data: { quantity } });
    } catch (error: any) {
      toast.error("Could not update quantity", { description: error?.message });
    }
  };

  const handleRemove = async (itemId: string, name: string) => {
    try {
      await removeCartItem(itemId);
      toast.success(`${name} removed from cart.`);
    } catch (error: any) {
      toast.error("Could not remove item", { description: error?.message });
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground">
          Review your items before checkout.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border p-4">
              <Skeleton className="size-20 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !items.length && (
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
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <SectionCard title="Items" contentClassName="space-y-3" className="shadow-sm">
            {items.map((item) => {
              const image = item.product.images?.[0]?.media?.url;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border p-4"
                >
                  {/* Thumbnail */}
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

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${item.product.slug}`}
                        className="font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() =>
                          handleRemove(item.id, item.product.name)
                        }
                        disabled={isRemoving}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Qty stepper */}
                      <div className="flex items-center rounded-lg border">
                        <button
                          onClick={() =>
                            handleQtyChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQtyChange(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.product.stockCount ||
                            isUpdating
                          }
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <p className="font-semibold text-primary">
                        {formatAmount(
                          Number(item.product.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </SectionCard>

          {/* Summary */}
          <div className="space-y-4">
            <SectionCard
              title="Order Summary"
              contentClassName="space-y-3"
              className="shadow-sm"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatAmount(Number(item.product.price) * item.quantity)}
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
                <Link href="/patient/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
