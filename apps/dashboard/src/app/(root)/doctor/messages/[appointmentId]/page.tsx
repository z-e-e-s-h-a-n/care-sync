"use client";

import Link from "next/link";
import ConversationThread from "@/components/dashboard/ConversationThread";
import PageIntro from "@/components/dashboard/PageIntro";
import { useAppointment } from "@/hooks/appointment";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { formatDate } from "@workspace/shared/utils";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";

const DoctorMessageThreadPage = ({ params }: AppPageProps) => {
  const { appointmentId } = React.use(params);
  const { data: appointment } = useAppointment(appointmentId);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Conversation thread"
        description="Review the appointment context and continue the patient conversation from one place."
      />

      {appointment && (
        <SectionCard
          title="Appointment context"
          action={
            <Link
              href={`/doctor/appointments/${appointment.id}`}
              className="text-sm text-primary hover:underline"
            >
              Open appointment
            </Link>
          }
          className="shadow-sm"
          contentClassName="grid gap-4 text-sm md:grid-cols-3"
        >
          <div>
            <p className="text-muted-foreground">Patient</p>
            <p className="font-medium">
              {appointment.patient?.user?.displayName ?? "Patient"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Scheduled</p>
            <p className="font-medium">
              {formatDate(appointment.scheduledStartAt)}
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

      <ConversationThread appointmentId={appointmentId} />
    </div>
  );
};

export default DoctorMessageThreadPage;
