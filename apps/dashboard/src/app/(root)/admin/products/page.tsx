"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useProductList } from "@/hooks/product";
import type {
  ProductResponse,
  ProductQueryType,
} from "@workspace/contracts/product";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const columns: ColumnConfig<ProductResponse, ProductQueryType>[] = [
  {
    header: "Product",
    accessor: (p) => (
      <div className="min-w-48">
        <p className="font-semibold">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.slug}</p>
      </div>
    ),
    sortKey: "name",
  },
  {
    header: "Category",
    accessor: (p) => p.category?.name ?? "Uncategorized",
  },
  {
    header: "Price",
    accessor: (p) => `$${Number(p.price).toFixed(2)}`,
    sortKey: "price",
  },
  {
    header: "Stock",
    accessor: (p) => p.stockCount,
    sortKey: "stockCount",
  },
  {
    header: "Inventory",
    accessor: (p) => (
      <Badge
        variant={getStatusVariant(
          p.inventoryStatus === "inStock"
            ? "active"
            : p.inventoryStatus === "lowStock"
              ? "pending"
              : "cancelled",
        )}
        className="capitalize"
      >
        {p.inventoryStatus}
      </Badge>
    ),
  },
  {
    header: "Status",
    accessor: (p) => (
      <Badge
        variant={getStatusVariant(
          p.status === "active"
            ? "active"
            : p.status === "draft"
              ? "pending"
              : "cancelled",
        )}
        className="capitalize"
      >
        {p.status}
      </Badge>
    ),
  },
];

const ProductsPage = () => {
  return (
    <ListPage
      dataKey="products"
      canEdit
      columns={columns}
      defaultSortBy="name"
      defaultSearchBy="name"
      searchByOptions={[
        { label: "Name", value: "name" },
        { label: "Slug", value: "slug" },
      ]}
      useListHook={useProductList}
      filterConfig={{
        key: "status",
        label: "Status",
        options: ["draft", "active", "archived"],
      }}
    />
  );
};

export default ProductsPage;
