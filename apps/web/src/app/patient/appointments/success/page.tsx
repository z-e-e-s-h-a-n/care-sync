"use client";

import { use } from "react";
import { CalendarDays, CheckCircle, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { useAppointment } from "@/hooks/healthcare";
import { formatDate } from "@workspace/shared/utils";
import { useSearchParams } from "next/navigation";

export default function AppointmentSuccessPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") ?? undefined;
  const { data: appt, isLoading } = useAppointment(appointmentId);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="size-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Appointment Booked!
          </h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully submitted. You'll receive a
            confirmation once the team reviews it.
          </p>
        </div>

        {/* Appointment summary */}
        {isLoading && (
          <div className="rounded-xl border p-5 space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        )}

        {appt && (
          <div className="rounded-xl border bg-secondary/50 p-5 text-left space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
              Appointment Summary
            </p>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Doctor</p>
                <p className="font-medium text-sm">
                  {(appt as any).doctor?.user?.displayName ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium text-sm capitalize">{appt.channel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  {formatDate(appt.scheduledStartAt, { mode: "date" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {formatDate(appt.scheduledStartAt, { mode: "time" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {appointmentId && (
            <Button asChild>
              <Link href={`/patient/appointments/${appointmentId}`}>
                <MessageSquare className="size-4" />
                View Appointment
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/patient/appointments">
              <CalendarDays className="size-4" />
              All Appointments
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
