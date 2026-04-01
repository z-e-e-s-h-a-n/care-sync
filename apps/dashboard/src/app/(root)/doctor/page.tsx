"use client";

import Link from "next/link";
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
import { useMyDoctorProfile } from "@/hooks/doctor";
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
  addDays,
  formatCompactNumber,
  formatDate,
  formatPrice,
  startOfDay,
} from "@workspace/shared/utils";
import { useAppointments } from "@/hooks/appointment";
import { usePayments } from "@/hooks/payment";
import type { DashboardStatCardProps } from "@/components/dashboard/DashboardStatCard";

const appointmentChartConfig = {
  appointments: {
    label: "Appointments",
    color: "var(--chart-1)",
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

const dateKey = (value: Date) => startOfDay(value).toISOString().slice(0, 10);

const titleCase = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export default function DoctorOverviewPage() {
  const { data: doctor } = useMyDoctorProfile();
  const { data: appointmentsQuery } = useAppointments({
    page: 1,
    limit: 80,
    sortBy: "scheduledStartAt",
    sortOrder: "asc",
    searchBy: "doctorName",
  });
  const { data: paymentsQuery } = usePayments({
    page: 1,
    limit: 60,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "status",
  });

  const appointments = appointmentsQuery?.appointments ?? [];
  const payments = paymentsQuery?.payments ?? [];

  const today = startOfDay(new Date());
  const upcomingAppointments = appointments
    .filter((appointment) => new Date(appointment.scheduledStartAt) >= today)
    .sort(
      (left, right) =>
        new Date(left.scheduledStartAt).getTime() -
        new Date(right.scheduledStartAt).getTime(),
    );
  const activeAppointments = upcomingAppointments.filter(
    (appointment) =>
      !["cancelled", "completed", "noShow"].includes(appointment.status),
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  );
  const todayAppointments = activeAppointments.filter(
    (appointment) =>
      dateKey(new Date(appointment.scheduledStartAt)) === dateKey(today),
  ).length;

  const successfulPayments = payments.filter(
    (payment) => payment.status === "succeeded",
  );
  const pendingPayments = payments.filter(
    (payment) => payment.status !== "succeeded",
  );
  const earnings = sum(
    successfulPayments.map((payment) => Number(payment.amount)),
  );
  const pendingValue = sum(
    pendingPayments.map((payment) => Number(payment.amount)),
  );
  const averageTicket = successfulPayments.length
    ? earnings / successfulPayments.length
    : 0;

  const appointmentWindowData = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const key = dateKey(date);
    const count = activeAppointments.filter(
      (appointment) => dateKey(new Date(appointment.scheduledStartAt)) === key,
    ).length;

    return {
      label: formatDate(date, { options: { weekday: "short" } }),
      date: formatDate(date, { mode: "shortDate" }),
      appointments: count,
    };
  });

  const earningsTrendData = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = dateKey(date);
    const earned = successfulPayments
      .filter((payment) => dateKey(new Date(payment.createdAt)) === key)
      .reduce((total, payment) => total + Number(payment.amount), 0);
    const expected = pendingPayments
      .filter((payment) => dateKey(new Date(payment.createdAt)) === key)
      .reduce((total, payment) => total + Number(payment.amount), 0);

    return {
      label: formatDate(date, { options: { weekday: "short" } }),
      date: formatDate(date, { mode: "shortDate" }),
      earned,
      expected,
    };
  });

  const appointmentStatusData = Array.from(
    appointments.reduce((accumulator, appointment) => {
      accumulator.set(
        appointment.status,
        (accumulator.get(appointment.status) ?? 0) + 1,
      );
      return accumulator;
    }, new Map<string, number>()),
    ([label, value]) => ({ label, value }),
  );

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
      value: doctor?.branch?.name ?? "Unassigned",
    },
    {
      label: "Completed visits",
      value: completedAppointments.length,
    },
    {
      label: "Settled payments",
      value: successfulPayments.length,
    },
    {
      label: "Pending payment value",
      value: formatPrice(pendingValue),
    },
  ];

  const stats: DashboardStatCardProps[] = [
    {
      label: "Verification",
      value: titleCase(doctor?.verificationStatus ?? "pending"),
      helper: "Current admin review state for your doctor profile.",
      badge: doctor?.branch?.name ?? "Branch pending",
      trendLabel: doctor?.specialty ?? "Specialty not added yet",
      bars: appointmentStatusData.map((item) => item.value),
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
      trendLabel: `${todayAppointments} appointments start today`,
      bars: appointmentWindowData.map((item) => item.appointments),
      icon: Clock3,
      tone: doctor?.isAvailable ? "success" : "warning",
    },
    {
      label: "Upcoming visits",
      value: formatCompactNumber(activeAppointments.length),
      helper: "Future consultations currently assigned to your account.",
      badge: `${upcomingAppointments.length} total queued`,
      trendLabel: `${completedAppointments.length} already completed`,
      bars: appointmentWindowData.map((item) => item.appointments),
      icon: CalendarRange,
    },
    {
      label: "Captured earnings",
      value: formatPrice(earnings),
      helper: "Succeeded appointment payments visible in your role scope.",
      badge: formatPrice(averageTicket || 0),
      trendLabel: `${formatPrice(pendingValue)} still pending`,
      bars: earningsTrendData.map((item) => item.earned + item.expected),
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
          title: "Weekly schedule load",
          description: "Appointment volume mapped across the next seven days.",
          config: appointmentChartConfig,
          data: appointmentWindowData,
          valueKey: "appointments",
          gradientId: "doctorAppointments",
          rangeMode: "head",
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
            {upcomingAppointments.slice(0, 6).length ? (
              upcomingAppointments.slice(0, 6).map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.user?.displayName ?? "Patient"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.branch?.name ??
                          doctor?.branch?.name ??
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

        <div className="space-y-6">
          <DashboardQuickActions
            title="Quick actions"
            description="The doctor tasks you usually need in the middle of a workday."
            actions={quickActions}
            focusItems={focusItems}
          />

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Profile snapshot</CardTitle>
                <CardDescription>
                  Core doctor information used across bookings and scheduling.
                </CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href="/doctor/profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Doctor</p>
                <p className="mt-1 font-medium">
                  {doctor?.user?.displayName ?? "Doctor profile"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Specialty</p>
                <p className="mt-1 font-medium">
                  {doctor?.specialty ?? "Specialty not set"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Branch</p>
                <p className="mt-1 font-medium">
                  {doctor?.branch?.name ?? "Unassigned"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Consultation fee</p>
                <p className="mt-1 font-medium">
                  {doctor?.consultationFee
                    ? formatPrice(Number(doctor.consultationFee))
                    : "Not set"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Bio</p>
                <p className="mt-1 font-medium">
                  {doctor?.bio ?? "No bio added yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
