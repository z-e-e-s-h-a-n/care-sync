"use client";

import Link from "next/link";

import { useAppointments, useMyPatientProfile } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const MessagesPage = () => {
  const profileQuery = useMyPatientProfile();
  const appointmentsQuery = useAppointments({
    page: 1,
    limit: 20,
    sortBy: "scheduledStartAt",
    sortOrder: "desc",
    searchBy: "doctorName",
    patientId: profileQuery.data?.id,
  });

  const appointments = appointmentsQuery.data?.appointments ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Messages</p>
        <h1 className="text-4xl font-semibold tracking-tight">Provider conversations</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Every booked appointment gets its own conversation thread so follow-up stays tied to the right visit.
        </p>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Link key={appointment.id} href={`/messages/${appointment.id}`}>
            <Card className="rounded-[2rem] border-border/60 shadow-sm transition hover:border-foreground/20 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{appointment.doctor?.user?.displayName ?? "Doctor"}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appointment.doctor?.specialty ?? "Care provider"}
                  </p>
                </div>
                <Badge variant={getStatusVariant(appointment.status)} className="capitalize">{appointment.status}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{formatter.format(new Date(appointment.scheduledStartAt))}</span>
                <span className="font-medium">Open thread</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
