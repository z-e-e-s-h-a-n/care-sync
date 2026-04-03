"use client";

import Link from "next/link";
import {
  CalendarRange,
  MessageSquareText,
  Package,
  UserRoundCog,
  Users,
} from "lucide-react";

import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PageIntro from "@/components/dashboard/PageIntro";
import { useStaffDashboard } from "@/hooks/dashboard";
import type { DashboardStatCardProps } from "@/components/dashboard/DashboardStatCard";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { type ChartConfig } from "@workspace/ui/components/chart";
import {
  formatCompactNumber,
  formatDate,
} from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const appointmentChartConfig = {
  sessions: {
    label: "Sessions",
    color: "var(--chart-1)",
  },
  forecast: {
    label: "Prediction",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const coordinationChartConfig = {
  assignments: {
    label: "Assignments",
    color: "var(--chart-3)",
  },
  sessions: {
    label: "Sessions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const titleCase = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function StaffOverviewPage() {
  const { data: overview } = useStaffDashboard();

  const appointmentHistoryData =
    overview?.upcomingVisits.window.map(({ date, count }) => ({
      date,
      sessions: count,
    })) ?? [];

  const assignmentTrendData =
    overview?.caseload.recentAssignments.map(({ date, count }) => ({
      date,
      assignments: count,
      sessions:
        appointmentHistoryData.find((item) => item.date === date)?.sessions ?? 0,
    })) ?? [];

  const coordinationStatusData =
    overview?.coordination.orderStatusMix.map(({ status, count }) => ({
      label: status,
      value: count,
    })) ?? [];

  const quickActions = [
    {
      href: "/staff/appointments",
      title: "Manage appointments",
      description: "Review and coordinate assigned sessions.",
      icon: CalendarRange,
    },
    {
      href: "/staff/patients",
      title: "Assigned patients",
      description: "Open your caseload and review patient details.",
      icon: Users,
    },
    {
      href: "/staff/messages",
      title: "Messages",
      description: "Respond to patient and appointment conversations.",
      icon: MessageSquareText,
    },
    {
      href: "/staff/profile",
      title: "My profile",
      description: "Keep your title, credentials, and branch info current.",
      icon: UserRoundCog,
    },
  ];

  const focusItems = [
    {
      label: "Assigned branch",
      value: overview?.focus.branchName ?? "Unassigned",
    },
    {
      label: "Active patients",
      value: overview?.focus.activePatients ?? 0,
    },
    {
      label: "Open conversations",
      value: overview?.focus.openConversations ?? 0,
    },
    {
      label: "Pending orders",
      value: overview?.focus.pendingOrders ?? 0,
    },
  ];

  const stats: DashboardStatCardProps[] = [
    {
      label: "Caseload",
      value: formatCompactNumber(overview?.caseload.totalAssigned ?? 0),
      helper: "Patients currently assigned to your workflow.",
      badge: `${overview?.caseload.activePatients ?? 0} active`,
      trendLabel: `${overview?.upcomingVisits.todayCount ?? 0} sessions on today’s board`,
      bars: overview?.caseload.recentAssignments.map((item) => item.count) ?? [],
      icon: Users,
    },
    {
      label: "Upcoming sessions",
      value: formatCompactNumber(overview?.upcomingVisits.active ?? 0),
      helper: "Future appointments tied to your active caseload.",
      badge: `${overview?.upcomingVisits.completed ?? 0} completed`,
      trendLabel: `${overview?.upcomingVisits.todayCount ?? 0} start today`,
      bars: overview?.upcomingVisits.window.slice(-7).map((item) => item.count) ?? [],
      icon: CalendarRange,
      tone: "success",
    },
    {
      label: "Open conversations",
      value: formatCompactNumber(overview?.coordination.openConversations ?? 0),
      helper: "Patient conversations that still need coordination.",
      badge: `${overview?.coordination.pendingOrders ?? 0} pending orders`,
      trendLabel: `${overview?.coordination.deliveredOrders ?? 0} delivered orders already closed`,
      bars: coordinationStatusData.map((item) => item.value).slice(0, 7),
      icon: MessageSquareText,
      tone: "warning",
    },
    {
      label: "Role readiness",
      value: overview?.profile.isActive ? "Active" : "Paused",
      helper: "Your current staff availability inside the dashboard.",
      badge: overview?.profile.branchName ?? "Branch pending",
      trendLabel: overview?.profile.title ?? "Title not set",
      bars: overview?.caseload.recentAssignments.map((item) => item.count) ?? [],
      icon: UserRoundCog,
      tone: overview?.profile.isActive ? "success" : "warning",
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description={`Welcome back${overview?.profile.displayName ? `, ${overview.profile.displayName}` : ""}. Here is your caseload, coordination queue, and today’s operational picture.`}
      />

      <DashboardStats stats={stats} />

      <DashboardChart
        area={{
          title: "Session trend",
          description: "Assigned-patient appointment activity across the last 90 days.",
          config: appointmentChartConfig,
          data: appointmentHistoryData,
          valueKey: "sessions",
          secondaryValueKey: "forecast",
          forecastDays: 14,
          gradientId: "staffSessions",
        }}
        bar={{
          title: "Assignment momentum",
          description: "Recent assignment changes compared with session load.",
          config: coordinationChartConfig,
          data: assignmentTrendData,
          keys: ["assignments", "sessions"],
        }}
        pie={{
          title: "Order workload",
          description: "Operational order status mix visible to staff.",
          data: coordinationStatusData,
          emptyMessage: "No order activity is available yet.",
          formatLabel: titleCase,
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Upcoming sessions</CardTitle>
              <CardDescription>
                The next appointments connected to your assigned patients.
              </CardDescription>
            </div>
            <Button href="/staff/appointments" variant="outline">
              View schedule
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview?.upcomingAppointments?.length ? (
              overview.upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/staff/appointments/${appointment.id}`}
                  className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusVariant(appointment.status)}
                          className="capitalize"
                        >
                          {titleCase(appointment.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {appointment.branchName ?? overview?.profile.branchName ?? "Branch not assigned"}
                        </span>
                      </div>
                      <p className="mt-2 font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        With {appointment.doctorName}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(appointment.scheduledStartAt, {
                        mode: "datetime",
                      })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <DashboardEmptyState message="No upcoming sessions are assigned yet." />
            )}
          </CardContent>
        </Card>

        <DashboardQuickActions
          title="Quick actions"
          description="Common staff tasks during the workday."
          actions={quickActions}
          focusItems={focusItems}
        />
      </section>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Assigned patients</CardTitle>
            <CardDescription>
              A quick view of the people currently attached to your caseload.
            </CardDescription>
          </div>
          <Button href="/staff/patients" variant="outline">
            Open patients
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview?.assignedPatients?.length ? (
            overview.assignedPatients.map((patient) => (
              <Link
                key={patient.patientId}
                href={`/staff/patients/${patient.patientId}`}
                className="rounded-2xl border p-4 transition-colors hover:bg-muted/30"
              >
                <p className="font-medium">{patient.displayName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {patient.email ?? patient.phone ?? "No contact info"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Assigned {formatDate(patient.assignedAt, { mode: "date" })}
                </p>
              </Link>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <DashboardEmptyState message="No patients are assigned yet." />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
