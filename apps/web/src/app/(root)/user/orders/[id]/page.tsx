"use client";

import { useParams } from "next/navigation";

import { useOrder } from "@/hooks/commerce";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const OrderDetailPage = () => {
  const params = useParams<{ id: string }>();
  const orderQuery = useOrder(params.id);
  const order = orderQuery.data;

  if (!order) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">Loading order...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Order</p>
        <h1 className="text-4xl font-semibold tracking-tight">{order.orderNumber}</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{order.status}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment</span><span className="font-medium capitalize">{order.paymentStatus}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Shipment</span><span className="font-medium capitalize">{order.shipment?.status ?? "pending"}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Tracking</span><span className="font-medium">{order.shipment?.trackingNumber ?? "Not assigned"}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{currencyFormatter.format(Number(order.totalAmount))}</span></div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="font-medium">{currencyFormatter.format(Number(item.totalPrice))}</p>
                </div>
                <p className="mt-1 text-muted-foreground">{item.quantity} x {currencyFormatter.format(Number(item.unitPrice))}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailPage;
