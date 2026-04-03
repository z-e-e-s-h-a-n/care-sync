"use client";

import React from "react";
import { toast } from "sonner";
import type { AppPageProps } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/shared/utils";
import PageIntro from "@/components/dashboard/PageIntro";
import { useOrder, useUpdateOrderStatus } from "@/hooks/order";

const statusFlow = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof statusFlow)[number];

const nextStatus: Record<string, OrderStatus | null> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
  refunded: null,
};

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { data: order, isLoading } = useOrder(id);
  const { updateStatus, isPending } = useUpdateOrderStatus(id);

  const handleAdvance = async () => {
    if (!order) return;
    const next = nextStatus[order.status];
    if (!next) return;

    try {
      await updateStatus({ status: next, notes: null });
      toast.success(`Order status updated to ${next}.`);
    } catch (error: any) {
      toast.error("Failed to update order status", {
        description: error?.message,
      });
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await updateStatus({ status: "cancelled", notes: null });
      toast.success("Order cancelled.");
    } catch (error: any) {
      toast.error("Failed to cancel order", { description: error?.message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageIntro title="Order details" description="Loading..." />
      </div>
    );
  }

  if (!order) return null;

  const canAdvance = Boolean(nextStatus[order.status]);
  const canCancel =
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.status !== "refunded";

  return (
    <div className="space-y-6">
      <PageIntro
        title={order.orderNumber}
        description={`Order placed on ${formatDate(order.createdAt)} by ${order.user?.displayName ?? "Customer"}`}
      />

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={getStatusVariant(
            order.status === "delivered"
              ? "active"
              : order.status === "cancelled" || order.status === "refunded"
                ? "cancelled"
                : "pending",
          )}
          className="capitalize text-sm px-3 py-1"
        >
          {order.status}
        </Badge>
        <Badge variant="outline" className="capitalize text-sm px-3 py-1">
          {order.deliveryType}
        </Badge>
        {canAdvance && (
          <Button size="sm" onClick={handleAdvance} disabled={isPending}>
            {isPending ? "Updating..." : `Mark as ${nextStatus[order.status]}`}
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Order Items"
          contentClassName="space-y-3"
          className="shadow-sm"
        >
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">
                ${Number(item.totalPrice).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="border-t border-border/60 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${Number(order.shippingCost).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          {order.deliveryType === "delivery" && (
            <SectionCard
              title="Shipping Address"
              contentClassName="space-y-1 text-sm"
              className="shadow-sm"
            >
              {order.shippingName && (
                <p className="font-medium">{order.shippingName}</p>
              )}
              {order.shippingPhone && (
                <p className="text-muted-foreground">{order.shippingPhone}</p>
              )}
              {order.shippingStreet && <p>{order.shippingStreet}</p>}
              <p>
                {[
                  order.shippingCity,
                  order.shippingState,
                  order.shippingPostalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.shippingCountry && <p>{order.shippingCountry}</p>}
            </SectionCard>
          )}

          {order.shipments && order.shipments.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Shipments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-lg border border-border/60 p-3 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={getStatusVariant(
                          shipment.status === "delivered" ? "active" : "pending",
                        )}
                        className="capitalize"
                      >
                        {shipment.status}
                      </Badge>
                      {shipment.provider && (
                        <span className="text-muted-foreground">
                          {shipment.provider}
                        </span>
                      )}
                    </div>
                    {shipment.trackingNumber && (
                      <p>
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
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
