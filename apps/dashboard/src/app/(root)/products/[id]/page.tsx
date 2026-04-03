"use client";

import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import type { ProductResponse } from "@workspace/contracts/product";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useProduct } from "@/hooks/product";

const formatDateTime = (value?: string) =>
  formatDate(value, { mode: "datetime", fallback: "Not recorded" });

const renderStatusBadge = (value?: string) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {value ?? "Not set"}
  </Badge>
);

const renderHeader = (data: ProductResponse) => (
  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {data.name || data.slug || data.id}
        </h2>
        <p className="text-sm text-muted-foreground">
          {data.category?.name ?? "Uncategorized"}
          {data.slug ? ` • ${data.slug}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {renderStatusBadge(data.status)}
        {renderStatusBadge(data.inventoryStatus)}
        <Badge variant="outline">
          {data.requiresShipping ? "Requires Shipping" : "Pickup Friendly"}
        </Badge>
      </div>
    </div>

    <div className="rounded-lg border bg-background/80 px-4 py-3 text-right shadow-xs">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Price
      </p>
      <p className="text-2xl font-semibold">{formatPrice(data.sellPrice)}</p>
      <p className="text-sm text-muted-foreground">
        Stock: {data.stockCount ?? 0}
      </p>
    </div>
  </div>
);

const sections: SectionConfig<ProductResponse>[] = [
  {
    title: "Product Details",
    description: () => "Name, category, slug, and description.",
    columns: 3,
    fields: [
      { label: "Name", accessor: "name" },
      { label: "Slug", accessor: "slug" },
      { label: "Category", accessor: (d) => d.category?.name ?? "Uncategorized" },
      {
        label: "Description",
        accessor: "description",
        render: (v) => v ?? "No description",
      },
    ],
  },
  {
    title: "Pricing & Inventory",
    description: () => "Sell price, cost price, compare-at price, and stock information.",
    columns: 3,
    fields: [
      {
        label: "Price",
        accessor: (d) => formatPrice(d.sellPrice),
      },
      {
        label: "Cost Price",
        accessor: (d) => (d.costPrice != null ? formatPrice(d.costPrice) : "Not set"),
      },
      {
        label: "Compare-at Price",
        accessor: (d) => (d.compareAtPrice ? formatPrice(d.compareAtPrice) : "Not set"),
      },
      { label: "Stock Count", accessor: "stockCount" },
      {
        label: "Inventory Status",
        accessor: "inventoryStatus",
        render: (v) => renderStatusBadge(v),
      },
      {
        label: "Product Status",
        accessor: "status",
        render: (v) => renderStatusBadge(v),
      },
      {
        label: "Requires Shipping",
        accessor: "requiresShipping",
        render: (v) => (v ? "Yes" : "No"),
      },
    ],
  },
  {
    title: "Timestamps",
    columns: 3,
    fields: [
      {
        label: "Created At",
        accessor: "createdAt",
        render: (v) => formatDateTime(v),
      },
      {
        label: "Updated At",
        accessor: "updatedAt",
        render: (v) => formatDateTime(v),
      },
    ],
  },
];

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="Product"
      description={(data) => `View and manage details for ${data.name}.`}
      useQuery={useProduct}
      sections={sections}
      renderHeader={renderHeader}
    />
  );
};

export default Page;
