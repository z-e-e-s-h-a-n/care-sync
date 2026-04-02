"use client";

import { CalendarDays, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { cn } from "@workspace/ui/lib/utils";
import { useAppointments } from "@/hooks/healthcare";
import { formatDate } from "@workspace/shared/utils";

// Messages in this platform are tied to appointments.
// This page lists all appointments that may have an active conversation.
const activeStatuses = ["booked", "confirmed", "completed"];

const statusColors: Record<string, string> = {
  booked: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function MessagesPage() {
  const { data, isLoading } = useAppointments({});

  const conversations = (data?.items ?? []).filter((a) =>
    activeStatuses.includes(a.status),
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Messages
          </span>
        }
        description="Your conversations are linked to appointments. Select one below to open the chat."
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

        {!isLoading && !conversations.length && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
            <MessageSquare className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Messages are available once you have a booked or confirmed appointment.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/patient/appointments">View Appointments</Link>
            </Button>
          </div>
        )}

        {conversations.map((appt) => {
          const colorClass = statusColors[appt.status] ?? statusColors.booked;
          const doctorName =
            (appt as any).doctor?.user?.displayName ?? "Therapist";

          return (
            <Link
              key={appt.id}
              href={`/patient/appointments/${appt.id}`}
              className="block"
            >
              <div className="rounded-xl border p-4 transition-colors hover:bg-secondary/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {doctorName
                        .split(" ")
                        .map((p: string) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{doctorName}</p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            colorClass,
                          )}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {formatDate(appt.scheduledStartAt, { mode: "date" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDate(appt.scheduledStartAt, { mode: "time" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Open Chat
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
