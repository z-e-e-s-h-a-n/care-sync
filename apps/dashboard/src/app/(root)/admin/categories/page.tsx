"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useCategoryList } from "@/hooks/product";
import type {
  ProductCategoryResponse,
  CategoryQueryType,
} from "@workspace/contracts/product";

const columns: ColumnConfig<ProductCategoryResponse, CategoryQueryType>[] = [
  {
    header: "Category",
    accessor: (c) => (
      <div className="min-w-40">
        <p className="font-semibold">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.slug}</p>
      </div>
    ),
    sortKey: "name",
  },
  {
    header: "Parent",
    accessor: (c) => c.parent?.name ?? "Top-level",
  },
  {
    header: "Description",
    accessor: (c) => c.description ?? "—",
  },
  {
    header: "Status",
    accessor: (c) => (
      <Badge
        variant={getStatusVariant(c.isActive ? "active" : "closed")}
        className="capitalize"
      >
        {c.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const CategoriesPage = () => (
  <ListPage
    dataKey="categories"
    canEdit
    columns={columns}
    defaultSortBy="name"
    defaultSearchBy="name"
    searchByOptions={[
      { label: "Name", value: "name" },
      { label: "Slug", value: "slug" },
    ]}
    useListHook={useCategoryList}
    filterConfig={{
      key: "isActive",
      label: "Status",
      options: ["true", "false"],
    }}
  />
);

export default CategoriesPage;
