"use client";

import { usePayments } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const PaymentsPage = () => {
  const paymentsQuery = usePayments({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "status",
  });

  const payments = paymentsQuery.data?.payments ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          Payments
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Payment history
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Review completed appointment payments and keep a clear record of your
          recent transactions.
        </p>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{payment.provider}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payment.methodType}
                </p>
              </div>
              <Badge
                variant={getStatusVariant(payment.status)}
                className="capitalize"
              >
                {payment.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {currencyFormatter.format(Number(payment.amount))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="font-medium">
                  {payment.appointment?.appointmentNumber ??
                    payment.order?.orderNumber ??
                    "Other"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(new Date(payment.createdAt))}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;
