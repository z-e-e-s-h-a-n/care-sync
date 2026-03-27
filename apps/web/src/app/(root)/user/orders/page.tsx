"use client";

import Link from "next/link";

import { useOrders } from "@/hooks/commerce";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const OrdersPage = () => {
  const ordersQuery = useOrders({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "orderNumber",
  });

  const orders = ordersQuery.data?.orders ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Orders</p>
          <h1 className="text-4xl font-semibold tracking-tight">Your commerce orders</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/store">Shop products</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="rounded-[2rem] border-border/60 shadow-sm transition hover:border-foreground/20 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <p className="text-sm font-medium capitalize">{order.status}</p>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-medium">{order.items?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{order.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipment</p>
                  <p className="font-medium capitalize">{order.shipment?.status ?? "pending"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
