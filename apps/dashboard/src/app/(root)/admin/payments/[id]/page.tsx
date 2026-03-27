"use client";

import React from "react";
import { toast } from "sonner";

import type { AppPageProps } from "@workspace/contracts";
import type { PaymentResponse } from "@workspace/contracts/payment";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";

import {
  type RelatedEntityConfig,
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { usePayment, useUpdatePayment } from "@/hooks/healthcare";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatCurrency = (value?: number) =>
  value ? formatPrice(value) : "Not set";

const formatDateTime = (value?: string | null) =>
  value ? formatDate(value, "datetime") : "Not recorded";

const formatLabel = (value?: string | null) =>
  value
    ? value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    : "Not set";

const renderBadge = (value?: string | null) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {formatLabel(value)}
  </Badge>
);

const sections: SectionConfig<PaymentResponse>[] = [
  {
    title: "Payment Overview",
    description: () =>
      "Core transaction data, payment method details, and linked target information.",
    columns: 3,
    fields: [
      {
        label: "Amount",
        accessor: "amount",
        render: (value) => formatCurrency(value),
      },
      {
        label: "Status",
        accessor: "status",
        render: (value) => renderBadge(value),
      },
      {
        label: "Provider",
        accessor: "provider",
        render: (value) => renderBadge(value),
      },
      {
        label: "Method",
        accessor: "methodType",
        render: (value) => renderBadge(value),
      },
      {
        label: "Transaction ID",
        accessor: "transactionId",
      },
      {
        label: "Linked Target",
        accessor: (data) =>
          data.appointment?.appointmentNumber ??
          data.order?.orderNumber ??
          "No linked appointment or order",
      },
      {
        label: "Failure Message",
        accessor: "failureMessage",
      },
      {
        label: "Created At",
        accessor: "createdAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Updated At",
        accessor: "updatedAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "Settlement and Refund Tracking",
    description: () =>
      "Amounts and timestamps used for payout visibility and refund reconciliation.",
    columns: 3,
    fields: [
      {
        label: "Paid At",
        accessor: "paidAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Refunded At",
        accessor: "refundedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Commission Amount",
        accessor: "commissionAmount",
        render: (value) => formatCurrency(value),
      },
      {
        label: "Doctor Net Amount",
        accessor: "doctorNetAmount",
        render: (value) => formatCurrency(value),
      },
      {
        label: "Refund Count",
        accessor: (data) => `${data.refunds?.length ?? 0} refund request(s)`,
      },
    ],
  },
];

const relatedEntities: RelatedEntityConfig<PaymentResponse>[] = [
  {
    title: "Refund Requests",
    dataKey: "refunds",
    columns: [
      {
        header: "Amount",
        accessor: (item) => formatCurrency(item.amount),
      },
      {
        header: "Status",
        accessor: (item) => formatLabel(item.status),
      },
      {
        header: "Reason",
        accessor: (item) => item.reason ?? "No reason provided",
      },
      {
        header: "Requested",
        accessor: (item) => formatDateTime(item.requestedAt),
      },
      {
        header: "Processed",
        accessor: (item) => formatDateTime(item.processedAt),
      },
    ],
  },
];

const renderHeader = (data: PaymentResponse) => (
  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {renderBadge(data.status)}
        {renderBadge(data.provider)}
        {renderBadge(data.methodType)}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {formatCurrency(data.amount)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {data.appointment?.appointmentNumber ??
            data.order?.orderNumber ??
            "Standalone payment record"}
        </p>
      </div>
    </div>
  </div>
);

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { updatePaymentStatus, createRefund, isPending } = useUpdatePayment(id);
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");

  const setStatus = async (
    status: "pending" | "succeeded" | "failed" | "refunded",
  ) => {
    try {
      await updatePaymentStatus({ paymentId: id, status });
      toast.success(`Payment marked as ${status}.`);
    } catch (error: any) {
      toast.error("Failed to update payment", {
        description: error?.message,
      });
    }
  };

  const submitRefund = async () => {
    if (!refundAmount) return;

    try {
      await createRefund({
        paymentId: id,
        amount: Number(refundAmount),
        reason: refundReason || undefined,
      });
      toast.success("Refund request created.");
      setRefundAmount("");
      setRefundReason("");
    } catch (error: any) {
      toast.error("Failed to create refund", {
        description: error?.message,
      });
    }
  };

  return (
    <GenericDetailsPage
      entityId={id}
      canEdit={false}
      entityName="Payment"
      description="Track transaction status, review settlement amounts, and create refund requests from the top of the record."
      useQuery={usePayment}
      sections={sections}
      relatedEntities={relatedEntities}
      renderHeader={renderHeader}
      renderActions={() => (
        <>
          <Button
            type="button"
            size="sm"
            onClick={() => setStatus("succeeded")}
            disabled={isPending}
          >
            Mark Succeeded
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatus("pending")}
            disabled={isPending}
          >
            Mark Pending
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatus("failed")}
            disabled={isPending}
          >
            Mark Failed
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setStatus("refunded")}
            disabled={isPending}
          >
            Mark Refunded
          </Button>
        </>
      )}
    >
      {() => (
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Create Refund Request</CardTitle>
            <CardDescription>
              Log a refund amount and optional reason without leaving the
              payment details page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <p className="text-sm font-medium">Refund Amount</p>
              <Input
                value={refundAmount}
                onChange={(event) => setRefundAmount(event.target.value)}
                placeholder="Refund amount"
                type="number"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Refund Reason</p>
              <Input
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
                placeholder="Reason for refund"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={submitRefund}
              disabled={isPending || !refundAmount}
            >
              Create Refund
            </Button>
          </CardContent>
        </Card>
      )}
    </GenericDetailsPage>
  );
};

export default Page;
