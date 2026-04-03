import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import type { AppPageProps } from "@workspace/contracts";
import { Button } from "@workspace/ui/components/button";
import SectionCard from "@workspace/ui/shared/SectionCard";

export default async function CheckoutSuccessPage({
  searchParams,
}: AppPageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <SectionCard className="shadow-sm">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Order placed successfully
            </h1>
            <p className="text-sm text-muted-foreground">
              Your order has been received and our team will contact you to
              confirm payment and fulfillment details.
            </p>
            {orderId ? (
              <p className="text-sm font-medium text-foreground">
                Order ID: {orderId}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/shop">
                <ShoppingBag className="mr-2 size-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/patient/orders">View My Orders</Link>
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
