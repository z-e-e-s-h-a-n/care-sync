"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import ConversationThread from "@/components/dashboard/ConversationThread";
import PageIntro from "@/components/dashboard/PageIntro";
import { useAppointment } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const DoctorMessageThreadPage = () => {
  const params = useParams<{ appointmentId: string }>();
  const appointmentId = params.appointmentId;
  const appointmentQuery = useAppointment(appointmentId);
  const appointment = appointmentQuery.data;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Conversation thread"
        description="Review the appointment context and continue the patient conversation from one place."
      />

      {appointment && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Appointment context</CardTitle>
            <Link href={`/doctor/appointments/${appointment.id}`} className="text-sm text-primary hover:underline">
              Open appointment
            </Link>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Patient</p>
              <p className="font-medium">{appointment.patient?.user?.displayName ?? "Patient"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Scheduled</p>
              <p className="font-medium">{formatter.format(new Date(appointment.scheduledStartAt))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={getStatusVariant(appointment.status)} className="mt-1 capitalize">{appointment.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <ConversationThread appointmentId={appointmentId} />
    </div>
  );
};

export default DoctorMessageThreadPage;
