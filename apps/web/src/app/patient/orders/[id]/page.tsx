"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import type { AppPageProps } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/shared/utils";
import { useOrder } from "@/hooks/healthcare";

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

export default function OrderDetailPage({ params }: AppPageProps) {
  const { id } = React.use(params);
  const { data: ord, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!ord) {
    return (
      <div className="container mx-auto flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
        <Package className="size-10 text-muted-foreground" />
        <p className="font-medium">Order not found</p>
        <Button variant="outline" asChild>
          <Link href="/patient/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const status = orderStatusConfig[ord.status] ?? orderStatusConfig.pending;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Link
        href="/patient/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ord.orderNumber}
        </h1>
        <p className="text-sm text-muted-foreground">
          Placed on {formatDate(ord.createdAt, { mode: "date" })}
        </p>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
        <Badge variant="outline" className="capitalize text-sm">
          {ord.deliveryType}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order items */}
        <SectionCard
          title="Items Ordered"
          contentClassName="space-y-3"
          className="shadow-sm"
        >
          {ord.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {formatAmount(item.unitPrice)}
                </p>
              </div>
              <p className="font-semibold shrink-0">
                {formatAmount(item.totalPrice)}
              </p>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatAmount(ord.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatAmount(ord.shippingCost)}</span>
            </div>
            {Number(ord.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatAmount(ord.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-1 border-t">
              <span>Total</span>
              <span>{formatAmount(ord.total)}</span>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          {/* Shipping address */}
          {ord.deliveryType === "delivery" && ord.shippingStreet && (
            <SectionCard
              title="Shipping Address"
              contentClassName="text-sm space-y-0.5"
              className="shadow-sm"
            >
              {ord.shippingName && (
                <p className="font-medium">{ord.shippingName}</p>
              )}
              {ord.shippingPhone && (
                <p className="text-muted-foreground">{ord.shippingPhone}</p>
              )}
              <p>{ord.shippingStreet}</p>
              <p>
                {[ord.shippingCity, ord.shippingState, ord.shippingPostalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {ord.shippingCountry && <p>{ord.shippingCountry}</p>}
            </SectionCard>
          )}

          {/* Shipments */}
          {ord.shipments && ord.shipments.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Shipment Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ord.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-lg border p-3 text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize text-xs">
                        {shipment.status}
                      </Badge>
                      {shipment.provider && (
                        <span className="text-muted-foreground text-xs">
                          {shipment.provider}
                        </span>
                      )}
                    </div>
                    {shipment.trackingNumber && (
                      <p className="text-muted-foreground">
                        Tracking:{" "}
                        {shipment.trackingUrl ? (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {shipment.trackingNumber}
                          </a>
                        ) : (
                          shipment.trackingNumber
                        )}
                      </p>
                    )}
                    {shipment.shippedAt && (
                      <p className="text-xs text-muted-foreground">
                        Shipped: {formatDate(shipment.shippedAt, { mode: "date" })}
                      </p>
                    )}
                    {shipment.deliveredAt && (
                      <p className="text-xs text-muted-foreground">
                        Delivered:{" "}
                        {formatDate(shipment.deliveredAt, { mode: "date" })}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
