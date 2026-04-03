"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/sections/CTASection";
import { useProducts } from "@/hooks/healthcare";
import PageHeader from "@/components/PageHeader";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function ShopPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({
    status: "active",
    limit: 48,
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: search || undefined,
    searchBy: "name",
  });

  const products = data?.products ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Therapy Tools & Resources"
        description="Supplements, learning materials, and therapy tools recommended by our clinical team — delivered to your door."
        align="center"
      />

      <section className="py-20 section space-y-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title="All Products"
            description="Browse our curated selection of ABA therapy materials."
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-52 w-full rounded-none" />
                <CardContent className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !products.length && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="size-8" />
            </div>
            <div>
              <p className="font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Check back soon — new products are on their way."}
              </p>
            </div>
            {search && (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const image = p.images?.[0]?.url;
              const isOnSale = Boolean(
                p.compareAtPrice && p.compareAtPrice > p.sellPrice,
              );

              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-52 overflow-hidden bg-secondary">
                      {image ? (
                        <Image
                          src={image}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/40">
                          <ShoppingBag className="size-12" />
                        </div>
                      )}
                      {isOnSale && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <CardContent className="space-y-3 pt-4">
                      <div>
                        <p className="font-semibold leading-tight line-clamp-2">
                          {p.name}
                        </p>
                        {p.category && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.category.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-primary">
                          {formatPrice(p.sellPrice)}
                        </span>
                        {isOnSale && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(p.compareAtPrice!)}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize w-fit"
                      >
                        {p.inventoryStatus === "inStock"
                          ? "In Stock"
                          : p.inventoryStatus === "lowStock"
                            ? "Low Stock"
                            : "Out of Stock"}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <CTASection
        eyebrow="Shop"
        title="Need Help Choosing the Right Tools?"
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="Learn About ABA Therapy"
        secondaryHref="/services"
      />
    </>
  );
}
