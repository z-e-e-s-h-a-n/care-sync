"use client";

import Link from "next/link";
import type { CartResponse } from "@workspace/contracts/commerce";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface CartSummaryCardProps {
  cart?: CartResponse | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CartSummaryCard = ({ cart }: CartSummaryCardProps) => {
  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="rounded-[2rem] border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Cart summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Items</span>
          <span className="font-medium">{count}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{currencyFormatter.format(total)}</span>
        </div>
        <Button asChild className="w-full">
          <Link href="/cart">Open cart</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartSummaryCard;
