"use client";

import Link from "next/link";
import { toast } from "sonner";

import { useCart, useCreateOrder, useRemoveCartItem } from "@/hooks/commerce";
import { useMyPatientProfile } from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CartPage = () => {
  const cartQuery = useCart();
  const profileQuery = useMyPatientProfile();
  const { removeCartItem, isPending: isRemoving } = useRemoveCartItem();
  const { createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const checkout = async () => {
    if (!profileQuery.data?.id) {
      toast.error("Complete your patient profile before checkout.");
      return;
    }

    try {
      const order = await createOrder({
        patientId: profileQuery.data.id,
        notes: "Created from patient web cart.",
      });
      toast.success("Order created successfully.");
      window.location.href = `/orders/${order.data.id}`;
    } catch (error: any) {
      toast.error("Checkout failed", { description: error?.message });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Cart</p>
          <h1 className="text-4xl font-semibold tracking-tight">Your selected products</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/store">Continue shopping</Link>
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="rounded-[2rem] border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{item.product?.name ?? "Product"}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.product?.sku ?? "No SKU"}
                  </p>
                </div>
                <Button variant="ghost" disabled={isRemoving} onClick={() => removeCartItem(item.id)}>
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit price</p>
                  <p className="font-medium">{currencyFormatter.format(Number(item.unitPrice))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Line total</p>
                  <p className="font-medium">{currencyFormatter.format(Number(item.totalPrice))}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {!items.length && (
            <div className="rounded-[2rem] border border-dashed border-border/60 p-8 text-sm text-muted-foreground">
              Your cart is empty. Add products from the store to create an order.
            </div>
          )}
        </div>

        <Card className="rounded-[2rem] border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Checkout summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{currencyFormatter.format(total)}</span>
            </div>
            <Button className="w-full" onClick={checkout} disabled={!items.length || isCreatingOrder}>
              {isCreatingOrder ? "Creating order..." : "Create order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
