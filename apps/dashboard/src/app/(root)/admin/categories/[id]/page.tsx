"use client";

import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import type { ProductCategoryResponse } from "@workspace/contracts/product";
import { Badge } from "@workspace/ui/components/badge";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useCategory } from "@/hooks/product";

const formatDateTime = (value?: string) =>
  formatDate(value, { mode: "datetime", fallback: "Not recorded" });

const sections: SectionConfig<ProductCategoryResponse>[] = [
  {
    title: "Category Details",
    description: () => "Name, slug, parent, and description.",
    columns: 3,
    fields: [
      { label: "Name", accessor: "name" },
      { label: "Slug", accessor: "slug" },
      {
        label: "Parent",
        accessor: (c) => c.parent?.name ?? "Top-level",
      },
      {
        label: "Description",
        accessor: "description",
        render: (v) => v ?? "No description",
      },
      {
        label: "Status",
        accessor: "isActive",
        render: (v) => (
          <Badge variant={getStatusVariant(v ? "active" : "closed")}>
            {v ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
  },
  {
    title: "Timestamps",
    columns: 3,
    fields: [
      { label: "Created At", accessor: "createdAt", render: formatDateTime },
      { label: "Updated At", accessor: "updatedAt", render: formatDateTime },
    ],
  },
];

const renderHeader = (data: ProductCategoryResponse) => (
  <div className="space-y-1">
    <h2 className="text-2xl font-semibold tracking-tight">{data.name}</h2>
    <p className="text-sm text-muted-foreground">
      {data.slug}
      {data.parent ? ` • Under: ${data.parent.name}` : " • Top-level category"}
    </p>
  </div>
);

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="Category"
      description={(data) => `Manage the "${data.name}" category.`}
      useQuery={useCategory}
      sections={sections}
      renderHeader={renderHeader}
    />
  );
};

export default Page;
