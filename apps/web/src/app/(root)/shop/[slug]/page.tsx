"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { AppPageProps } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import useUser from "@workspace/ui/hooks/use-user";
import { useShopProduct, useAddToCart } from "@/hooks/healthcare";
import { useLocalCart } from "@/hooks/use-local-cart";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export default function ProductPage({ params }: AppPageProps) {
  const { slug } = React.use(params);
  const { data: product, isLoading } = useShopProduct(slug);
  const { addToCart, isPending } = useAddToCart();
  const { addItem } = useLocalCart();
  const { currentUser } = useUser();

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = async () => {
    if (!product) return;

    if (currentUser) {
      try {
        await addToCart({ productId: product.id, quantity: qty });
        toast.success(`${product.name} added to cart.`);
      } catch (error: any) {
        toast.error("Could not add to cart", { description: error?.message });
      }
    } else {
      addItem(product.id, qty);
      toast.success(`${product.name} added to cart.`);
    }
  };

  if (isLoading) {
    return (
      <div className="section py-12 space-y-8">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section py-20 flex flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium">Product not found</p>
        <Button variant="outline" asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage]?.url;
  const outOfStock = product.inventoryStatus === "outOfStock";

  return (
    <div className="section py-8 space-y-10">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/40">
                <ShoppingBag className="size-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                    i === selectedImage
                      ? "border-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} image ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <p className="text-sm text-primary font-medium">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice &&
                Number(product.compareAtPrice) > Number(product.price) && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <Badge className="bg-destructive text-destructive-foreground text-xs">
                      Sale
                    </Badge>
                  </>
                )}
            </div>
          </div>

          {product.description && (
            <p className="text-base leading-7 text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge
              variant={outOfStock ? "destructive" : "outline"}
              className="capitalize"
            >
              {outOfStock
                ? "Out of Stock"
                : product.inventoryStatus === "lowStock"
                  ? "Low Stock"
                  : "In Stock"}
            </Badge>
            {product.requiresShipping && (
              <Badge variant="secondary">Ships to you</Badge>
            )}
          </div>

          {!outOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">Qty</p>
                <div className="flex items-center rounded-lg border">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition"
                    disabled={qty <= 1}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stockCount, q + 1))
                    }
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition"
                    disabled={qty >= product.stockCount}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleAddToCart}
                disabled={isPending}
              >
                <ShoppingCart className="size-4" />
                {isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          {outOfStock && (
            <p className="text-sm text-muted-foreground">
              This product is currently out of stock. Check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
