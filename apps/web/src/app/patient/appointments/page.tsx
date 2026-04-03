"use client";

import { CalendarDays, CalendarPlus, Clock } from "lucide-react";
import { useDialog } from "@workspace/ui/hooks/use-dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import SectionCard from "@workspace/ui/shared/SectionCard";
import StatCard from "@workspace/ui/shared/StatCard";
import { cn } from "@workspace/ui/lib/utils";
import { useAppointments } from "@/hooks/healthcare";
import AppointmentForm from "@/components/shared/AppointmentForm";
import Link from "next/link";
import { formatDate } from "@workspace/shared/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  booked: {
    label: "Booked",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  confirmed: {
    label: "Confirmed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  completed: {
    label: "Completed",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200 bg-red-50 text-red-600",
  },
  noShow: {
    label: "No Show",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export default function AppointmentsPage() {
  const { openDialog } = useDialog();
  const { data, isLoading } = useAppointments({});

  const appointments = data?.appointments ?? [];
  const upcoming = appointments.filter((a) =>
    ["booked", "confirmed"].includes(a.status),
  );
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) =>
    ["cancelled", "noShow"].includes(a.status),
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          className="border-primary/20 bg-linear-to-br from-primary/10 to-card"
        />
        <StatCard
          label="Completed"
          value={completed.length}
          className="border-emerald-200 bg-linear-to-br from-emerald-100/60 to-card"
        />
        <StatCard
          label="Cancelled"
          value={cancelled.length}
          className="border-red-200 bg-linear-to-br from-red-100/60 to-card"
        />
      </div>

      {/* List */}
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            My Appointments
          </span>
        }
        description="View all your scheduled, completed, and past appointments."
        action={
          <Button
            onClick={() =>
              openDialog({
                title: "Book Appointment",
                content: <AppointmentForm />,
              })
            }
          >
            <CalendarPlus className="size-4" />
            Book Appointment
          </Button>
        }
        contentClassName="space-y-3"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}

        {!isLoading && !appointments.length && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
            <CalendarDays className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No appointments yet</p>
              <p className="text-sm text-muted-foreground">
                Book your first appointment to get started.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                openDialog({
                  title: "Book Appointment",
                  content: <AppointmentForm />,
                })
              }
            >
              Book Now
            </Button>
          </div>
        )}

        {appointments.map((appt) => {
          const status = statusConfig[appt.status] ?? statusConfig.booked;
          return (
            <Link
              key={appt.id}
              href={`/patient/appointments/${appt.id}`}
              className="block"
            >
              <div className="rounded-xl border p-4 transition-colors hover:bg-secondary/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {appt.channel}
                      </Badge>
                    </div>
                    <p className="font-medium">
                      {(appt as any).doctor?.user?.displayName ?? "Doctor"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {formatDate(appt.scheduledStartAt, {
                          mode: "date",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDate(appt.scheduledStartAt, { mode: "time" })}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </SectionCard>
    </div>
  );
}
