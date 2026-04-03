"use client";

import type { OrderQueryType, OrderResponse } from "@workspace/contracts/order";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import { Badge } from "@workspace/ui/components/badge";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import ListPage from "@workspace/ui/shared/ListPage";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useOrderList } from "@/hooks/order";

const columns: ColumnConfig<OrderResponse, OrderQueryType>[] = [
  {
    header: "Order",
    accessor: (o) => (
      <div className="min-w-40">
        <p className="font-semibold">{o.orderNumber}</p>
        <p className="text-xs text-muted-foreground">
          {o.user?.displayName ?? "Customer"}
        </p>
      </div>
    ),
    sortKey: "createdAt",
  },
  {
    header: "Items",
    accessor: (o) => `${o.items?.length ?? 0} item(s)`,
  },
  {
    header: "Total",
    accessor: (o) => `${formatPrice(o.total)}`,
    sortKey: "total",
  },
  {
    header: "Delivery",
    accessor: (o) => (
      <Badge variant="outline" className="capitalize">
        {o.deliveryType}
      </Badge>
    ),
  },
  {
    header: "Status",
    accessor: (o) => (
      <Badge
        variant={getStatusVariant(
          o.status === "delivered"
            ? "active"
            : o.status === "cancelled" || o.status === "refunded"
              ? "cancelled"
              : "pending",
        )}
        className="capitalize"
      >
        {o.status}
      </Badge>
    ),
    sortKey: "status",
  },
  {
    header: "Placed",
    accessor: (o) => formatDate(o.createdAt),
  },
];

const OrdersPage = () => {
  return (
    <ListPage
      dataKey="orders"
      canAdd={false}
      columns={columns}
      defaultSortBy="createdAt"
      defaultSearchBy="orderNumber"
      searchByOptions={[
        { label: "Order #", value: "orderNumber" },
        { label: "Status", value: "status" },
      ]}
      useListHook={useOrderList}
      filterConfig={{
        key: "status",
        label: "Status",
        options: [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ],
      }}
    />
  );
};

export default OrdersPage;
