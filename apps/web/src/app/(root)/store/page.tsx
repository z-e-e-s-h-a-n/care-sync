"use client";

import { useState } from "react";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/commerce";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import SectionHeader from "@/components/SectionHeader";

const StorePage = () => {
  const [search, setSearch] = useState("");

  const productsQuery = useProducts({
    page: 1,
    limit: 24,
    sortBy: "name",
    sortOrder: "asc",
    searchBy: "name",
    search: search || undefined,
    isActive: true,
  });

  const products = productsQuery.data?.products ?? [];

  return (
    <>
      <section className="section-wrapper">
        <div className="section-container space-y-8">
          <SectionHeader
            subtitle="Store"
            title=" Care products and wellness essentials"
            description="Browse healthcare products and patient essentials from the commerce module."
          />

          <div className="grid gap-4 rounded-4xl border bg-secondary p-5 md:grid-cols-[1fr_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products by name"
            />
            <Button variant="outline" onClick={() => setSearch("")}>
              Reset filters
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!products.length && (
            <div className="rounded-4xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">
              No products matched your current filters.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default StorePage;
