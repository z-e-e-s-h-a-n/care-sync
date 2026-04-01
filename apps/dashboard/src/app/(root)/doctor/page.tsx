"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarRange,
  Clock3,
  MessageSquareText,
  MoveRight,
  ShieldCheck,
  UserRoundCog,
  Wallet,
} from "lucide-react";

import OverviewStatCard from "@/components/dashboard/OverviewStatCard";
import PageIntro from "@/components/dashboard/PageIntro";
import { useDoctorDashboard } from "@/hooks/dashboard";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

const titleCase = (value: string) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

export default function DoctorOverviewPage() {
  const { data: overview } = useDoctorDashboard();

  const appointmentWindowData =
    overview?.bookingAccess.window.map(({ date, count }) => ({
      label: weekdayFormatter.format(new Date(date)),
      date: shortDateFormatter.format(new Date(date)),
      appointments: count,
    })) ?? [];

  const earningsTrendData =
    overview?.earnings.trend.map(({ date, earned, expected }) => ({
      label: weekdayFormatter.format(new Date(date)),
      date: shortDateFormatter.format(new Date(date)),
      earned,
      expected,
    })) ?? [];

  const appointmentStatusData =
    overview?.appointmentStatusMix.map(({ status, count }) => ({
      label: status,
      value: count,
    })) ?? [];

  const appointmentStatusConfig: ChartConfig = Object.fromEntries(
    appointmentStatusData.map((item, index) => [
      item.label,
      {
        label: titleCase(item.label),
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
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
      description: "Keep your schedule open only when you can actually take visits.",
      icon: Clock3,
    },
    {
      href: "/doctor/messages",
      title: "Review messages",
      description: "Catch up on appointment conversations and patient questions.",
      icon: MessageSquareText,
    },
  ];

  const focusItems = [
    {
      label: "Assigned branch",
      value: overview?.focus.branchName ?? "Unassigned",
    },
    {
      label: "Completed visits",
      value: overview?.focus.completedVisits ?? 0,
    },
    {
      label: "Settled payments",
      value: overview?.focus.settledPayments ?? 0,
    },
    {
      label: "Pending payment value",
      value: currencyFormatter.format(overview?.focus.pendingPaymentValue ?? 0),
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description="Manage your schedule, booking flow, and payment visibility from a more complete doctor workspace."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Verification"
          value={titleCase(overview?.profile.verificationStatus ?? "pending")}
          helper="Current admin review state for your doctor profile."
          badge={overview?.profile.branchName ?? "Branch pending"}
          trendLabel={overview?.profile.specialty ?? "Specialty not added yet"}
          bars={appointmentStatusData.map((item) => item.value)}
          icon={ShieldCheck}
          tone={overview?.profile.verificationStatus === "verified" ? "success" : "warning"}
        />
        <OverviewStatCard
          label="Booking access"
          value={overview?.profile.isAvailable ? "Open" : "Paused"}
          helper="Controls whether new patients can book from your profile."
          badge={
            overview?.profile.consultationFee
              ? currencyFormatter.format(overview.profile.consultationFee)
              : "Fee missing"
          }
          trendLabel={`${overview?.bookingAccess.todayCount ?? 0} appointments start today`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={Clock3}
          tone={overview?.profile.isAvailable ? "success" : "warning"}
        />
        <OverviewStatCard
          label="Upcoming visits"
          value={compactNumberFormatter.format(overview?.upcomingVisits.active ?? 0)}
          helper="Future consultations currently assigned to your account."
          badge={`${overview?.upcomingVisits.queued ?? 0} total queued`}
          trendLabel={`${overview?.upcomingVisits.completed ?? 0} already completed`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={CalendarRange}
        />
        <OverviewStatCard
          label="Captured earnings"
          value={currencyFormatter.format(overview?.earnings.total ?? 0)}
          helper="Succeeded appointment payments visible in your role scope."
          badge={currencyFormatter.format(overview?.earnings.average ?? 0)}
          trendLabel={`${currencyFormatter.format(overview?.earnings.pending ?? 0)} still pending`}
          bars={earningsTrendData.map((item) => item.earned + item.expected)}
          icon={Wallet}
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Weekly schedule load</CardTitle>
            <CardDescription>
              Appointment volume mapped across the next seven days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={appointmentChartConfig} className="h-80 w-full">
              <AreaChart accessibilityLayer data={appointmentWindowData}>
                <defs>
                  <linearGradient id="doctorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-appointments)" stopOpacity={0.75} />
                    <stop offset="95%" stopColor="var(--color-appointments)" stopOpacity={0.12} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""} />}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="var(--color-appointments)"
                  fill="url(#doctorAppointments)"
                  strokeWidth={2.5}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Earnings flow</CardTitle>
              <CardDescription>
                Settled and expected value from the recent payment activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={earningsChartConfig} className="h-64 w-full">
                <BarChart accessibilityLayer data={earningsTrendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""} />}
                  />
                  <Bar dataKey="earned" fill="var(--color-earned)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expected" fill="var(--color-expected)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Visit status mix</CardTitle>
              <CardDescription>
                How the visible appointments are distributed by status.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {appointmentStatusData.length ? (
                <>
                  <ChartContainer config={appointmentStatusConfig} className="h-56 w-full">
                    <PieChart accessibilityLayer>
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel nameKey="label" />}
                      />
                      <Pie
                        data={appointmentStatusData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={52}
                        outerRadius={84}
                        paddingAngle={4}
                      >
                        {appointmentStatusData.map((item, index) => (
                          <Cell
                            key={item.label}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="grid gap-3">
                    {appointmentStatusData.map((item, index) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span>{titleCase(item.label)}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed px-4 py-10 text-sm text-muted-foreground">
                  No appointment activity is available for charting yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

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
            {overview?.upcomingAppointments.length ? (
              overview.upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.branchName ?? overview.profile.branchName ?? "Branch not assigned"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(appointment.scheduledStartAt))}
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                The doctor tasks you usually need in the middle of a workday.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl border border-border/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <MoveRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-4 font-medium">{action.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 border-t pt-6">
              {focusItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardFooter>
          </Card>

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
                  {overview?.profile.displayName ?? "Doctor profile"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Specialty</p>
                <p className="mt-1 font-medium">
                  {overview?.profile.specialty ?? "Specialty not set"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Branch</p>
                <p className="mt-1 font-medium">
                  {overview?.profile.branchName ?? "Unassigned"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Consultation fee</p>
                <p className="mt-1 font-medium">
                  {overview?.profile.consultationFee
                    ? currencyFormatter.format(overview.profile.consultationFee)
                    : "Not set"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-muted-foreground">Bio</p>
                <p className="mt-1 font-medium">
                  {overview?.profile.bio ?? "No bio added yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
