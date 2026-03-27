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

import PageIntro from "@/components/dashboard/PageIntro";
import {
  useAppointments,
  useMyDoctorProfile,
  usePayments,
} from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
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

const STAT_ACCENTS = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
} as const;

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

const startOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const dateKey = (value: Date) => startOfDay(value).toISOString().slice(0, 10);

const titleCase = (value: string) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const buildSparkline = (values: number[]) =>
  values.length ? values : [0, 0, 0, 0, 0, 0, 0];

function DoctorStatCard({
  label,
  value,
  helper,
  badge,
  trendLabel,
  bars,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper: string;
  badge: string;
  trendLabel: string;
  bars: number[];
  icon: typeof ShieldCheck;
  tone?: keyof typeof STAT_ACCENTS;
}) {
  const normalizedBars = buildSparkline(bars);
  const maxBarValue = Math.max(...normalizedBars, 0);

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ${STAT_ACCENTS[tone]}`}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
                {value}
              </CardTitle>
            </div>
          </div>
          <CardAction>
            <Badge variant="secondary" className={STAT_ACCENTS[tone]}>
              {badge}
            </Badge>
          </CardAction>
        </div>
      </CardHeader>
      <CardFooter className="items-end justify-between gap-4 border-t border-border/50 pt-4">
        <div className="space-y-1.5">
          <div className="text-sm font-medium">{trendLabel}</div>
          <p className="max-w-56 text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="flex h-14 items-end gap-1.5">
          {normalizedBars.map((bar, index) => (
            <span
              key={`${label}-${index}`}
              className="w-2 rounded-full"
              style={{
                height: `${maxBarValue > 0 ? Math.max(18, Math.round((bar / maxBarValue) * 52)) : 22}px`,
                background:
                  "linear-gradient(180deg, rgba(59,130,246,0.88) 0%, rgba(59,130,246,0.18) 100%)",
              }}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function DoctorOverviewPage() {
  const doctorQuery = useMyDoctorProfile();
  const appointmentsQuery = useAppointments({
    page: 1,
    limit: 80,
    sortBy: "scheduledStartAt",
    sortOrder: "asc",
    searchBy: "doctorName",
  });
  const paymentsQuery = usePayments({
    page: 1,
    limit: 60,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "status",
  });

  const doctor = doctorQuery.data;
  const appointments = appointmentsQuery.data?.appointments ?? [];
  const payments = paymentsQuery.data?.payments ?? [];

  const today = startOfDay(new Date());
  const upcomingAppointments = appointments
    .filter((appointment) => new Date(appointment.scheduledStartAt) >= today)
    .sort(
      (left, right) =>
        new Date(left.scheduledStartAt).getTime() -
        new Date(right.scheduledStartAt).getTime(),
    );
  const activeAppointments = upcomingAppointments.filter(
    (appointment) => !["cancelled", "completed", "noShow"].includes(appointment.status),
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  );
  const todayAppointments = activeAppointments.filter(
    (appointment) => dateKey(new Date(appointment.scheduledStartAt)) === dateKey(today),
  ).length;

  const successfulPayments = payments.filter((payment) => payment.status === "succeeded");
  const pendingPayments = payments.filter((payment) => payment.status !== "succeeded");
  const earnings = sum(successfulPayments.map((payment) => Number(payment.amount)));
  const pendingValue = sum(pendingPayments.map((payment) => Number(payment.amount)));
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
      label: weekdayFormatter.format(date),
      date: shortDateFormatter.format(date),
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
      label: weekdayFormatter.format(date),
      date: shortDateFormatter.format(date),
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
      value: currencyFormatter.format(pendingValue),
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description="Manage your schedule, booking flow, and payment visibility from a more complete doctor workspace."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DoctorStatCard
          label="Verification"
          value={titleCase(doctor?.verificationStatus ?? "pending")}
          helper="Current admin review state for your doctor profile."
          badge={doctor?.branch?.name ?? "Branch pending"}
          trendLabel={doctor?.specialty ?? "Specialty not added yet"}
          bars={appointmentStatusData.map((item) => item.value)}
          icon={ShieldCheck}
          tone={doctor?.verificationStatus === "verified" ? "success" : "warning"}
        />
        <DoctorStatCard
          label="Booking access"
          value={doctor?.isAvailable ? "Open" : "Paused"}
          helper="Controls whether new patients can book from your profile."
          badge={doctor?.consultationFee ? currencyFormatter.format(Number(doctor.consultationFee)) : "Fee missing"}
          trendLabel={`${todayAppointments} appointments start today`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={Clock3}
          tone={doctor?.isAvailable ? "success" : "warning"}
        />
        <DoctorStatCard
          label="Upcoming visits"
          value={compactNumberFormatter.format(activeAppointments.length)}
          helper="Future consultations currently assigned to your account."
          badge={`${upcomingAppointments.length} total queued`}
          trendLabel={`${completedAppointments.length} already completed`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={CalendarRange}
        />
        <DoctorStatCard
          label="Captured earnings"
          value={currencyFormatter.format(earnings)}
          helper="Succeeded appointment payments visible in your role scope."
          badge={currencyFormatter.format(averageTicket || 0)}
          trendLabel={`${currencyFormatter.format(pendingValue)} still pending`}
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
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
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
                        {appointment.branch?.name ?? doctor?.branch?.name ?? "Branch not assigned"}
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
                    ? currencyFormatter.format(Number(doctor.consultationFee))
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

