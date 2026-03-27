"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import ConversationPanel from "@/components/ConversationPanel";
import PaymentStatusCard from "@/components/PaymentStatusCard";
import { useAppointment, useUpdateAppointmentStatus } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const AppointmentDetailPage = () => {
  const params = useParams<{ id: string }>();
  const appointmentQuery = useAppointment(params.id);
  const appointment = appointmentQuery.data;
  const { updateStatus, isPending } = useUpdateAppointmentStatus(params.id);

  const cancelAppointment = async () => {
    try {
      await updateStatus({
        status: "cancelled",
        cancellationSource: "patient",
        cancellationReason: "Cancelled by patient from web portal.",
      });
      toast.success("Appointment cancelled.");
    } catch (error: any) {
      toast.error("Failed to cancel appointment", {
        description: error?.message,
      });
    }
  };

  if (!appointment) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading appointment...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
            Appointment
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {appointment.appointmentNumber}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/messages/${appointment.id}`}>Open messages</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={cancelAppointment}
            disabled={isPending || appointment.status === "cancelled"}
          >
            Cancel appointment
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Visit details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">
                  {appointment.doctor?.user?.displayName ?? "Doctor"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Specialty</span>
                <span className="font-medium">
                  {appointment.doctor?.specialty ?? "Not listed"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">
                  {formatter.format(new Date(appointment.scheduledStartAt))}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-medium">
                  {appointment.branch?.name ?? "Branch"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium capitalize">
                  {appointment.channel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={getStatusVariant(appointment.status)}
                  className="capitalize"
                >
                  {appointment.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p className="mt-1 font-medium">
                  {appointment.patientNotes ?? "No notes added."}
                </p>
              </div>
            </CardContent>
          </Card>

          <PaymentStatusCard appointment={appointment} />
        </div>

        <ConversationPanel appointmentId={appointment.id} />
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
