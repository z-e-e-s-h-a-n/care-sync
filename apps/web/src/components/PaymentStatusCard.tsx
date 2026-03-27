"use client";

import { toast } from "sonner";
import type { AppointmentResponse } from "@workspace/contracts/appointment";

import { useCreatePayment } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface PaymentStatusCardProps {
  appointment: AppointmentResponse;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const PaymentStatusCard = ({ appointment }: PaymentStatusCardProps) => {
  const { createPayment, isPending } = useCreatePayment();
  const amount = Number(appointment.doctor?.consultationFee ?? 0);
  const latestPayment = appointment.payments?.[0];

  const createIntent = async () => {
    try {
      await createPayment({
        appointmentId: appointment.id,
        amount,
        provider: "stripe",
        methodType: "card",
      });
      toast.success("Payment record created.");
    } catch (error: any) {
      toast.error("Failed to create payment record", {
        description: error?.message,
      });
    }
  };

  return (
    <Card className="rounded-[2rem] border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Payment status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">
            {amount > 0 ? currencyFormatter.format(amount) : "No charge listed"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Current status</span>
          <Badge variant="outline" className="capitalize">
            {latestPayment?.status ?? "not created"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Provider</span>
          <span className="font-medium capitalize">
            {latestPayment?.provider ?? "stripe"}
          </span>
        </div>

        {!latestPayment && amount > 0 && (
          <Button className="w-full" onClick={createIntent} disabled={isPending}>
            {isPending ? "Preparing payment..." : "Create payment record"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusCard;
