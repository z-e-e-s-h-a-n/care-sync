"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useOrder } from "@/hooks/healthcare";
import { formatDate } from "@workspace/shared/utils";

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;
  const { data: order, isLoading } = useOrder(orderId);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="size-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Order Placed!
          </h1>
          <p className="text-muted-foreground">
            Your order has been received. Our team will review it and contact
            you to confirm payment and delivery details.
          </p>
        </div>

        {/* Order summary */}
        {isLoading && (
          <div className="rounded-xl border p-5 space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        )}

        {order && (
          <div className="rounded-xl border bg-secondary/50 p-5 text-left space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
              Order Summary
            </p>
            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-medium text-sm">{order.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-sm">
                  {formatDate(order.createdAt, { mode: "date" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-medium text-sm">
                  {order.items?.length ?? 0} item
                  {(order.items?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-medium text-sm text-primary">
                  {formatAmount(order.total)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatAmount(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {orderId && (
            <Button asChild>
              <Link href={`/patient/orders/${orderId}`}>
                <Package className="size-4" />
                Track Order
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/shop">
              <ShoppingBag className="size-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
