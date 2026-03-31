"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import ConversationPanel from "@/components/ConversationPanel";
import { useAppointment } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import SectionCard from "@workspace/ui/shared/SectionCard";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const MessageThreadPage = () => {
  const params = useParams<{ appointmentId: string }>();
  const appointmentQuery = useAppointment(params.appointmentId);
  const appointment = appointmentQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
            Messages
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Appointment conversation
          </h1>
        </div>
        {appointment && (
          <Button asChild variant="outline">
            <Link href={`/appointments/${appointment.id}`}>
              Back to appointment
            </Link>
          </Button>
        )}
      </div>

      {appointment && (
        <SectionCard
          title="Appointment context"
          className="rounded-[2rem] border-border/60 shadow-sm"
          contentClassName="grid gap-4 text-sm md:grid-cols-3"
        >
          <div>
            <p className="text-muted-foreground">Doctor</p>
            <p className="font-medium">
              {appointment.doctor?.user?.displayName ?? "Doctor"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Scheduled</p>
            <p className="font-medium">
              {formatter.format(new Date(appointment.scheduledStartAt))}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge
              variant={getStatusVariant(appointment.status)}
              className="mt-1 capitalize"
            >
              {appointment.status}
            </Badge>
          </div>
        </SectionCard>
      )}

      <ConversationPanel appointmentId={params.appointmentId} />
    </div>
  );
};

export default MessageThreadPage;
