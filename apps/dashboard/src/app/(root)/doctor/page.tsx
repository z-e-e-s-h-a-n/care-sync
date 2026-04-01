"use client";

import {
  CalendarRange,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  UserRoundCog,
  Wallet,
} from "lucide-react";

import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PageIntro from "@/components/dashboard/PageIntro";
import { useDoctorDashboard } from "@/hooks/dashboard";
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
  formatPrice,
} from "@workspace/shared/utils";

const appointmentChartConfig = {
  appointments: {
    label: "Booked",
    color: "var(--chart-1)",
  },
  forecast: {
    label: "Prediction",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const earningsChartConfig = {
  earned: {
    label: "Earned",
    color: "var(--chart-2)",
  },
  expected: {
    label: "Expected",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const titleCase = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function DoctorOverviewPage() {
  const { data: overview } = useDoctorDashboard();

  const doctor = overview?.profile;

  const appointmentHistoryData =
    overview?.upcomingVisits.window.map(({ date, count }) => ({
      date,
      appointments: count,
    })) ?? [];

  const earningsTrendData =
    overview?.earnings.trend.map(({ date, earned, expected }) => ({
      date,
      earned,
      expected,
    })) ?? [];

  const appointmentStatusData =
    overview?.appointmentStatusMix.map(({ status, count }) => ({
      label: status,
      value: count,
    })) ?? [];

  const quickActions = [
    {
      href: "/doctor/appointments/new",
      title: "Book appointment",
      description: "Schedule a visit directly from your doctor workspace.",
      icon: CalendarRange,
    },
    {
      href: "/doctor/patients/new",
      title: "Register patient",
      description: "Create a new patient record before booking the visit.",
      icon: UserRoundCog,
    },
    {
      href: "/doctor/availability",
      title: "Manage availability",
      description:
        "Keep your schedule open only when you can actually take visits.",
      icon: Clock3,
    },
    {
      href: "/doctor/messages",
      title: "Review messages",
      description:
        "Catch up on appointment conversations and patient questions.",
      icon: MessageSquareText,
    },
  ];

  const focusItems = [
    {
      label: "Assigned branch",
      value: doctor?.branchName ?? "Unassigned",
    },
    {
      label: "Completed visits",
      value: overview?.upcomingVisits.completed ?? 0,
    },
    {
      label: "Settled payments",
      value: overview?.earnings.settledCount ?? 0,
    },
    {
      label: "Pending payment value",
      value: formatPrice(overview?.earnings.pending ?? 0),
    },
  ];

  const stats: DashboardStatCardProps[] = [
    {
      label: "Verification",
      value: titleCase(doctor?.verificationStatus ?? "pending"),
      helper: "Current admin review state for your doctor profile.",
      badge: doctor?.branchName ?? "Branch pending",
      trendLabel: doctor?.specialty ?? "Specialty not added yet",
      bars: appointmentStatusData.map((item) => item.value).slice(0, 7),
      icon: ShieldCheck,
      tone: doctor?.verificationStatus === "verified" ? "success" : "warning",
    },
    {
      label: "Booking access",
      value: doctor?.isAvailable ? "Open" : "Paused",
      helper: "Controls whether new patients can book from your profile.",
      badge: doctor?.consultationFee
        ? formatPrice(Number(doctor.consultationFee))
        : "Fee missing",
      trendLabel: `${overview?.bookingAccess.todayCount ?? 0} appointments start today`,
      bars: appointmentHistoryData.slice(-7).map((item) => item.appointments),
      icon: Clock3,
      tone: doctor?.isAvailable ? "success" : "warning",
    },
    {
      label: "Upcoming visits",
      value: formatCompactNumber(overview?.upcomingVisits.active ?? 0),
      helper: "Future consultations currently assigned to your account.",
      badge: `${overview?.upcomingVisits.queued ?? 0} total queued`,
      trendLabel: `${overview?.upcomingVisits.completed ?? 0} already completed`,
      bars: appointmentHistoryData.slice(-7).map((item) => item.appointments),
      icon: CalendarRange,
    },
    {
      label: "Captured earnings",
      value: formatPrice(overview?.earnings.total ?? 0),
      helper: "Succeeded appointment payments visible in your role scope.",
      badge: formatPrice(overview?.earnings.average ?? 0),
      trendLabel: `${formatPrice(overview?.earnings.pending ?? 0)} still pending`,
      bars: earningsTrendData
        .slice(-7)
        .map((item) => item.earned + item.expected),
      icon: Wallet,
      tone: "warning",
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description="Manage your schedule, booking flow, and payment visibility from a more complete doctor workspace."
      />

      <DashboardStats stats={stats} />

      <DashboardChart
        area={{
          title: "Appointments trend",
          description:
            "Booked appointments over the last 90 days, with a simple prediction line.",
          config: appointmentChartConfig,
          data: appointmentHistoryData,
          valueKey: "appointments",
          secondaryValueKey: "forecast",
          forecastDays: 14,
          gradientId: "doctorAppointments",
        }}
        bar={{
          title: "Earnings flow",
          description:
            "Settled and expected value from the recent payment activity.",
          config: earningsChartConfig,
          data: earningsTrendData,
          keys: ["earned", "expected"],
        }}
        pie={{
          title: "Visit status mix",
          description:
            "How the visible appointments are distributed by status.",
          data: appointmentStatusData,
          emptyMessage:
            "No appointment activity is available for charting yet.",
          formatLabel: titleCase,
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Next appointments</CardTitle>
              <CardDescription>
                Your upcoming consultation queue and timing.
              </CardDescription>
            </div>
            <Button href="/doctor/appointments" variant="outline">
              Open schedule
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.upcomingAppointments?.slice(0, 6).length ? (
              overview.upcomingAppointments.slice(0, 6).map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.branchName ??
                          doctor?.branchName ??
                          "Branch not assigned"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDate(appointment.scheduledStartAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit capitalize">
                      {titleCase(appointment.status)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No appointments are assigned yet.
              </p>
            )}
          </CardContent>
        </Card>

        <DashboardQuickActions
          title="Quick actions"
          description="The doctor tasks you usually need in the middle of a workday."
          actions={quickActions}
          focusItems={focusItems}
        />
      </section>
    </div>
  );
}
