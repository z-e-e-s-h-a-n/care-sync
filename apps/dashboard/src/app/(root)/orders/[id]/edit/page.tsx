"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppPageProps } from "@workspace/contracts";
import type { OrderStatus, ShipmentStatus } from "@workspace/db/enums";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import PageIntro from "@/components/dashboard/PageIntro";
import {
  useCreateShipment,
  useOrder,
  useUpdateOrderStatus,
  useUpdateShipment,
} from "@/hooks/order";

const orderStatusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const shipmentStatusOptions: ShipmentStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

const EditOrderPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { data: order, isLoading } = useOrder(id);
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus(id);
  const { createShipment, isPending: isCreatingShipment } = useCreateShipment(id);
  const { updateShipment, isPending: isUpdatingShipment } = useUpdateShipment();

  const [status, setStatus] = useState<OrderStatus>("pending");
  const [statusNotes, setStatusNotes] = useState("");
  const [newShipment, setNewShipment] = useState({
    provider: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  const [shipmentForms, setShipmentForms] = useState<
    Record<
      string,
      {
        status: ShipmentStatus;
        provider: string;
        trackingNumber: string;
        trackingUrl: string;
      }
    >
  >({});

  React.useEffect(() => {
    if (!order) return;

    setStatus(order.status);
    setShipmentForms(
      Object.fromEntries(
        (order.shipments ?? []).map((shipment) => [
          shipment.id,
          {
            status: shipment.status,
            provider: shipment.provider ?? "",
            trackingNumber: shipment.trackingNumber ?? "",
            trackingUrl: shipment.trackingUrl ?? "",
          },
        ]),
      ),
    );
  }, [order]);

  const orderSummary = useMemo(
    () => ({
      items: order?.items?.length ?? 0,
      subtotal: order?.subtotal ?? 0,
      total: order?.total ?? 0,
    }),
    [order],
  );

  const handleStatusSave = async () => {
    try {
      await updateStatus({ status, notes: statusNotes || undefined });
      toast.success("Order status updated.");
      setStatusNotes("");
    } catch (error: any) {
      toast.error("Failed to update order status", {
        description: error?.message,
      });
    }
  };

  const handleCreateShipment = async () => {
    try {
      await createShipment({
        provider: newShipment.provider.trim(),
        trackingNumber: newShipment.trackingNumber.trim(),
        trackingUrl: newShipment.trackingUrl.trim() || undefined,
      });
      toast.success("Shipment created.");
      setNewShipment({ provider: "", trackingNumber: "", trackingUrl: "" });
    } catch (error: any) {
      toast.error("Failed to create shipment", {
        description: error?.message,
      });
    }
  };

  const handleUpdateShipment = async (shipmentId: string) => {
    const shipment = shipmentForms[shipmentId];
    if (!shipment) return;

    try {
      await updateShipment({
        shipmentId,
        data: {
          status: shipment.status,
          provider: shipment.provider.trim() || undefined,
          trackingNumber: shipment.trackingNumber.trim() || undefined,
          trackingUrl: shipment.trackingUrl.trim() || undefined,
        },
      });
      toast.success("Shipment updated.");
    } catch (error: any) {
      toast.error("Failed to update shipment", {
        description: error?.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageIntro title="Edit order" description="Loading order details..." />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <PageIntro
        title={`Edit ${order.orderNumber}`}
        description={`Manage status and shipment details for the order placed on ${formatDate(order.createdAt)}.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SectionCard
            title="Status"
            description="Update the order lifecycle status and internal note."
            contentClassName="space-y-4"
            className="shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as OrderStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Note</label>
                <Input
                  value={statusNotes}
                  onChange={(event) => setStatusNotes(event.target.value)}
                  placeholder="Optional internal note"
                />
              </div>
            </div>
            <Button onClick={handleStatusSave} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Saving..." : "Save Status"}
            </Button>
          </SectionCard>

          <SectionCard
            title="Create Shipment"
            description="Add a shipment record for this order."
            contentClassName="space-y-4"
            className="shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Input
                  value={newShipment.provider}
                  onChange={(event) =>
                    setNewShipment((current) => ({
                      ...current,
                      provider: event.target.value,
                    }))
                  }
                  placeholder="UPS"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tracking Number</label>
                <Input
                  value={newShipment.trackingNumber}
                  onChange={(event) =>
                    setNewShipment((current) => ({
                      ...current,
                      trackingNumber: event.target.value,
                    }))
                  }
                  placeholder="1Z999..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Tracking URL</label>
                <Input
                  value={newShipment.trackingUrl}
                  onChange={(event) =>
                    setNewShipment((current) => ({
                      ...current,
                      trackingUrl: event.target.value,
                    }))
                  }
                  placeholder="https://tracking.example.com"
                />
              </div>
            </div>
            <Button onClick={handleCreateShipment} disabled={isCreatingShipment}>
              {isCreatingShipment ? "Creating..." : "Create Shipment"}
            </Button>
          </SectionCard>

          <SectionCard
            title="Existing Shipments"
            description="Edit shipment provider, tracking, and delivery status."
            contentClassName="space-y-4"
            className="shadow-sm"
          >
            {(order.shipments ?? []).length ? (
              (order.shipments ?? []).map((shipment) => {
                const values = shipmentForms[shipment.id];
                if (!values) return null;

                return (
                  <Card key={shipment.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Shipment {shipment.trackingNumber || shipment.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={values.status}
                            onValueChange={(value) =>
                              setShipmentForms((current) => ({
                                ...current,
                                [shipment.id]: {
                                  ...current[shipment.id]!,
                                  status: value as ShipmentStatus,
                                },
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select shipment status" />
                            </SelectTrigger>
                            <SelectContent>
                              {shipmentStatusOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Provider</label>
                          <Input
                            value={values.provider}
                            onChange={(event) =>
                              setShipmentForms((current) => ({
                                ...current,
                                [shipment.id]: {
                                  ...current[shipment.id]!,
                                  provider: event.target.value,
                                },
                              }))
                            }
                            placeholder="UPS"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Tracking Number
                          </label>
                          <Input
                            value={values.trackingNumber}
                            onChange={(event) =>
                              setShipmentForms((current) => ({
                                ...current,
                                [shipment.id]: {
                                  ...current[shipment.id]!,
                                  trackingNumber: event.target.value,
                                },
                              }))
                            }
                            placeholder="1Z999..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tracking URL</label>
                          <Input
                            value={values.trackingUrl}
                            onChange={(event) =>
                              setShipmentForms((current) => ({
                                ...current,
                                [shipment.id]: {
                                  ...current[shipment.id]!,
                                  trackingUrl: event.target.value,
                                },
                              }))
                            }
                            placeholder="https://tracking.example.com"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUpdateShipment(shipment.id)}
                        disabled={isUpdatingShipment}
                      >
                        {isUpdatingShipment ? "Saving..." : "Save Shipment"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No shipments have been added for this order yet.
              </p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Order Summary"
            contentClassName="space-y-3"
            className="shadow-sm"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span>{order.user?.displayName ?? "Customer"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="capitalize">{order.deliveryType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{orderSummary.items}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(orderSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(orderSummary.total)}</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPage;
