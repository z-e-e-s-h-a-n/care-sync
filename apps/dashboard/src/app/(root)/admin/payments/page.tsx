"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { usePayments } from "@/hooks/payment";
import type {
  PaymentQueryType,
  PaymentResponse,
} from "@workspace/contracts/payment";
import { formatPrice } from "@workspace/shared/utils";

const columns: ColumnConfig<PaymentResponse, PaymentQueryType>[] = [
  { header: "Payment", accessor: "id" },
  {
    header: "Target",
    accessor: (payment) =>
      payment.appointment?.appointmentNumber ??
      payment.order?.orderNumber ??
      payment.orderId ??
      "N/A",
  },
  {
    header: "Amount",
    accessor: (payment) => formatPrice(payment.amount),
  },
  { header: "Provider", accessor: "provider" },
  { header: "Status", accessor: "status", sortKey: "status" },
];

export default function PaymentsPage() {
  return (
    <ListPage
      dataKey="payments"
      canAdd={false}
      canEdit={false}
      columns={columns}
      defaultSortBy="createdAt"
      defaultSearchBy="status"
      searchByOptions={[
        { label: "Status", value: "status" },
        { label: "Appointment", value: "appointmentId" },
        { label: "Order", value: "orderId" },
        { label: "Transaction", value: "transactionId" },
      ]}
      useListHook={usePayments}
      filterConfig={{
        key: "status",
        label: "Status",
        options: ["pending", "succeeded", "failed", "refunded"],
      }}
    />
  );
}
