"use client";

import Link from "next/link";
import {
  CalendarRange,
  MessageSquareText,
  UserRoundCog,
  Users,
} from "lucide-react";

import PageIntro from "@/components/dashboard/PageIntro";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import { useAppointments } from "@/hooks/appointment";
import { useMyStaffProfile } from "@/hooks/staff";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import StatCard from "@workspace/ui/shared/StatCard";

export default function StaffOverviewPage() {
  const { data: profile } = useMyStaffProfile();
  const { data: appointmentsData } = useAppointments({
    page: 1,
    limit: 50,
    sortBy: "scheduledStartAt",
    sortOrder: "asc",
  });

  const appointments = appointmentsData?.appointments ?? [];
  const upcoming = appointments.filter((a) =>
    ["booked", "confirmed"].includes(a.status),
  );
  const completed = appointments.filter((a) => a.status === "completed");
  const today = appointments.filter((a) => {
    const d = new Date(a.scheduledStartAt);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const quickActions = [
    {
      href: "/staff/appointments/new",
      title: "Book appointment",
      description: "Schedule a session for one of your assigned patients.",
      icon: CalendarRange,
    },
    {
      href: "/staff/patients",
      title: "View patients",
      description: "Review your caseload and patient records.",
      icon: Users,
    },
    {
      href: "/staff/messages",
      title: "Messages",
      description: "Catch up on appointment conversations.",
      icon: MessageSquareText,
    },
    {
      href: "/staff/profile",
      title: "My profile",
      description: "Keep your credentials and branch assignment current.",
      icon: UserRoundCog,
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description={`Welcome back${profile?.user?.displayName ? `, ${profile.user.displayName}` : ""}. Here's a summary of your caseload and upcoming sessions.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today's sessions" value={today.length} />
        <StatCard label="Upcoming sessions" value={upcoming.length} />
        <StatCard label="Completed sessions" value={completed.length} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Upcoming sessions</CardTitle>
              <CardDescription>
                Your next scheduled appointments.
              </CardDescription>
            </div>
            <Button href="/staff/appointments" variant="outline">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.slice(0, 6).length ? (
              upcoming.slice(0, 6).map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/staff/appointments/${appointment.id}`}
                  className="group block rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {appointment.patient?.user?.displayName ?? "Patient"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.scheduledStartAt, {
                          mode: "datetime",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusVariant(appointment.status)}
                      className="capitalize shrink-0"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming sessions.
              </p>
            )}
          </CardContent>
        </Card>

        <DashboardQuickActions
          title="Quick actions"
          description="Common staff tasks."
          actions={quickActions}
          focusItems={[
            {
              label: "Branch",
              value: profile?.branch?.name ?? "Not assigned",
            },
            { label: "Title", value: profile?.title ?? "Not set" },
            {
              label: "Credentials",
              value: profile?.credentials?.join(", ") || "None added",
            },
          ]}
        />
      </section>
    </div>
  );
}
