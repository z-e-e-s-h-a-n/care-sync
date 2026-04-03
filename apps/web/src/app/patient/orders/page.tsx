"use client";

import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import SectionCard from "@workspace/ui/shared/SectionCard";
import StatCard from "@workspace/ui/shared/StatCard";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/shared/utils";
import { useOrders } from "@/hooks/healthcare";

const orderStatusConfig: Record<string, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    processing: {
      label: "Processing",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    shipped: {
      label: "Shipped",
      className: "border-purple-200 bg-purple-50 text-purple-700",
    },
    delivered: {
      label: "Delivered",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-red-200 bg-red-50 text-red-600",
    },
    refunded: {
      label: "Refunded",
      className: "border-gray-200 bg-gray-50 text-gray-500",
    },
  };

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export default function OrdersPage() {
  const { data, isLoading } = useOrders({ page: 1, limit: 50, sortBy: "createdAt", sortOrder: "desc" });

  const orders = data?.orders ?? [];
  const active = orders.filter((o) =>
    ["pending", "processing", "shipped"].includes(o.status),
  );
  const delivered = orders.filter((o) => o.status === "delivered");
  const totalSpent = delivered.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active Orders"
          value={active.length}
          className="border-primary/20 bg-linear-to-br from-primary/10 to-card"
        />
        <StatCard
          label="Delivered"
          value={delivered.length}
          className="border-emerald-200 bg-linear-to-br from-emerald-100/60 to-card"
        />
        <StatCard
          label="Total Spent"
          value={formatAmount(totalSpent)}
          className="border-purple-200 bg-linear-to-br from-purple-100/60 to-card"
        />
      </div>

      {/* List */}
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            My Orders
          </span>
        }
        description="Track your product orders and purchase history."
        action={
          <Button variant="outline" asChild>
            <Link href="/shop">Browse Shop</Link>
          </Button>
        }
        contentClassName="space-y-3"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}

        {!isLoading && !orders.length && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
            <Package className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Browse our shop and place your first order.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        )}

        {orders.map((ord) => {
          const status =
            orderStatusConfig[ord.status] ?? orderStatusConfig.pending;
          const itemCount = ord.items?.length ?? 0;

          return (
            <Link
              key={ord.id}
              href={`/patient/orders/${ord.id}`}
              className="block"
            >
              <div className="rounded-xl border p-4 transition-colors hover:bg-secondary/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {ord.deliveryType}
                      </Badge>
                    </div>
                    <p className="font-medium">{ord.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                      {formatAmount(ord.total)} ·{" "}
                      {formatDate(ord.createdAt, { mode: "date" })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    View Order
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </SectionCard>
    </div>
  );
}
