"use client";

import Link from "next/link";

import PageIntro from "@/components/dashboard/PageIntro";
import { useAppointments } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const DoctorMessagesPage = () => {
  const appointmentsQuery = useAppointments({
    page: 1,
    limit: 12,
    sortBy: "scheduledStartAt",
    sortOrder: "desc",
    searchBy: "patientName",
  });

  const threadedAppointments = (appointmentsQuery.data?.appointments ?? []).filter(
    (appointment) => Boolean(appointment.conversation),
  );

  return (
    <div className="space-y-6">
      <PageIntro
        title="Patient conversations"
        description="Every booked appointment opens a dedicated thread, so doctors can coordinate care updates in context."
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Appointment threads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {threadedAppointments.length ? (
            threadedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {appointment.patient?.user?.displayName ?? "Patient"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatter.format(new Date(appointment.scheduledStartAt))}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={getStatusVariant(appointment.status)}
                    className="capitalize"
                  >
                    {appointment.status}
                  </Badge>
                  <Link
                    href={`/doctor/messages/${appointment.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Open thread
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No conversation threads are available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorMessagesPage;
