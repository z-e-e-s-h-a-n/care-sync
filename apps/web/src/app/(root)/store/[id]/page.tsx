"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import CartSummaryCard from "@/components/CartSummaryCard";
import { useCart, useProduct, useUpsertCartItem } from "@/hooks/commerce";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import SectionCard from "@workspace/ui/shared/SectionCard";
import StatCard from "@workspace/ui/shared/StatCard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const ProductDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productQuery = useProduct(params.id);
  const cartQuery = useCart();
  const { saveCartItem, isPending } = useUpsertCartItem();
  const [quantity, setQuantity] = useState(1);

  const product = productQuery.data;

  const addToCart = async () => {
    if (!product) return;

    try {
      await saveCartItem({
        productId: product.id,
        quantity,
      });
      toast.success("Added to cart.");
      router.push("/cart");
    } catch (error: any) {
      toast.error("Failed to update cart", { description: error?.message });
    }
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading product...
      </div>
    );
  }

  const displayPrice = Number(product.salePrice ?? product.price);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={getStatusVariant(product.isActive ? "active" : "draft")}
                className="capitalize"
              >
                {product.isActive ? "active" : "inactive"}
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {product.category?.name ?? "Healthcare product"}
              </p>
            </div>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {product.description ??
                "Product description will appear here once published by the care team."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Price"
              value={currencyFormatter.format(displayPrice)}
              labelVariant="title"
              valueInContent
              className="rounded-[1.75rem] border-border/60 shadow-sm"
            />
            <StatCard
              label="Stock"
              value={product.stockQuantity}
              labelVariant="title"
              valueInContent
              className="rounded-[1.75rem] border-border/60 shadow-sm"
            />
            <StatCard
              label="SKU"
              value={product.sku}
              labelVariant="title"
              valueInContent
              valueClassName="text-lg font-semibold"
              className="rounded-[1.75rem] border-border/60 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Add to cart"
            className="rounded-[2rem] border-border/60 shadow-sm"
            contentClassName="space-y-4"
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <Input
                type="number"
                min={1}
                max={product.stockQuantity}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number(event.target.value || 1))
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={addToCart}
              disabled={isPending || product.stockQuantity < 1}
            >
              {isPending ? "Updating cart..." : "Add to cart"}
            </Button>
          </SectionCard>

          <CartSummaryCard cart={cartQuery.data} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
