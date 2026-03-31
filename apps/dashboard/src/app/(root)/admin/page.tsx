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
  CalendarClock,
  FilePlus2,
  MoveRight,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";

import OverviewStatCard from "@/components/dashboard/OverviewStatCard";
import PageIntro from "@/components/dashboard/PageIntro";
import {
  useAppointments,
  useCampaigns,
  useDoctors,
  usePatients,
  usePayments,
} from "@/hooks/healthcare";
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
import { useBranches } from "@/hooks/business";

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

const revenueChartConfig = {
  settled: {
    label: "Settled",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending",
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
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export default function AdminOverviewPage() {
  const doctorsQuery = useDoctors({
    page: 1,
    limit: 24,
    sortBy: "displayName",
    sortOrder: "asc",
    searchBy: "displayName",
  });
  const patientsQuery = usePatients({
    page: 1,
    limit: 60,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "displayName",
  });
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
  const campaignsQuery = useCampaigns({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
    searchBy: "title",
  });
  const branchesQuery = useBranches({
    page: 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
    searchBy: "name",
  });

  const doctors = doctorsQuery.data?.doctors ?? [];
  const patients = patientsQuery.data?.patients ?? [];
  const appointments = appointmentsQuery.data?.appointments ?? [];
  const payments = paymentsQuery.data?.payments ?? [];
  const campaigns = campaignsQuery.data?.campaigns ?? [];
  const branches = branchesQuery.data?.branches ?? [];

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
  const collectedRevenue = sum(
    successfulPayments.map((payment) => Number(payment.amount)),
  );
  const pendingRevenue = sum(
    pendingPayments.map((payment) => Number(payment.amount)),
  );

  const verifiedDoctors = doctors.filter(
    (doctor) => doctor.verificationStatus === "verified",
  ).length;
  const availableDoctors = doctors.filter(
    (doctor) => doctor.isAvailable,
  ).length;
  const recentPatients = patients.filter((patient) => {
    const createdAt = new Date(patient.createdAt);
    return createdAt >= addDays(today, -30);
  }).length;

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

  const patientGrowthBars = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = dateKey(date);
    return patients.filter(
      (patient) => dateKey(new Date(patient.createdAt)) === key,
    ).length;
  });

  const rosterBars = branches
    .slice(0, 7)
    .map((branch) => branch.doctors?.length ?? 0);

  const revenueTrendData = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = dateKey(date);
    const settled = successfulPayments
      .filter((payment) => dateKey(new Date(payment.createdAt)) === key)
      .reduce((total, payment) => total + Number(payment.amount), 0);
    const pending = pendingPayments
      .filter((payment) => dateKey(new Date(payment.createdAt)) === key)
      .reduce((total, payment) => total + Number(payment.amount), 0);

    return {
      label: weekdayFormatter.format(date),
      date: shortDateFormatter.format(date),
      settled,
      pending,
    };
  });

  const paymentStatusData = Array.from(
    payments.reduce((accumulator, payment) => {
      accumulator.set(
        payment.status,
        (accumulator.get(payment.status) ?? 0) + 1,
      );
      return accumulator;
    }, new Map<string, number>()),
    ([label, value]) => ({ label, value }),
  );

  const paymentStatusConfig: ChartConfig = Object.fromEntries(
    paymentStatusData.map((item, index) => [
      item.label,
      {
        label: titleCase(item.label),
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
  );

  const quickActions = [
    {
      href: "/admin/doctors/new",
      title: "Add doctor",
      description: "Create a provider profile and assign a branch.",
      icon: Stethoscope,
    },
    {
      href: "/admin/patients/new",
      title: "Add patient",
      description:
        "Create a full patient record directly from the admin panel.",
      icon: Users,
    },
    {
      href: "/admin/appointments/new",
      title: "Book appointment",
      description: "Schedule a visit on behalf of a patient and doctor.",
      icon: CalendarClock,
    },
    {
      href: "/admin/branches/new",
      title: "Add branch",
      description: "Open another care location with contact details.",
      icon: FilePlus2,
    },
  ];

  const focusItems = [
    {
      label: "Pending doctor reviews",
      value: doctors.filter((doctor) => doctor.verificationStatus === "pending")
        .length,
    },
    {
      label: "Inactive branches",
      value: branches.filter((branch) => !branch.isActive).length,
    },
    {
      label: "Pending payment value",
      value: currencyFormatter.format(pendingRevenue),
    },
    {
      label: "Draft campaigns",
      value: campaigns.filter((campaign) => campaign.status === "draft").length,
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description="Monitor providers, bookings, payments, and branch activity from one operational dashboard shaped around the current healthcare modules."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Care team"
          value={compactNumberFormatter.format(
            doctorsQuery.data?.total ?? doctors.length,
          )}
          helper={`${branchesQuery.data?.total ?? branches.length} branches are represented in the current roster feed.`}
          badge={`${verifiedDoctors} verified`}
          trendLabel={`${availableDoctors} available for new bookings`}
          bars={rosterBars}
          icon={Stethoscope}
          tone="success"
        />
        <OverviewStatCard
          label="Patient growth"
          value={compactNumberFormatter.format(
            patientsQuery.data?.total ?? patients.length,
          )}
          helper="Recent signups and profile creation activity from the last month."
          badge={`+${recentPatients} this month`}
          trendLabel={`${todayAppointments} appointments are on deck for today`}
          bars={patientGrowthBars}
          icon={Users}
        />
        <OverviewStatCard
          label="Upcoming visits"
          value={compactNumberFormatter.format(activeAppointments.length)}
          helper="Active appointments scheduled ahead, excluding completed and cancelled visits."
          badge={`${upcomingAppointments.length} queued`}
          trendLabel={`${appointmentWindowData[0]?.appointments ?? 0} appointments start today`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={CalendarClock}
        />
        <OverviewStatCard
          label="Collected revenue"
          value={currencyFormatter.format(collectedRevenue)}
          helper="Succeeded payments captured across the visible payment feed."
          badge={`${payments.length ? Math.round((successfulPayments.length / payments.length) * 100) : 0}% success`}
          trendLabel={`${currencyFormatter.format(pendingRevenue)} still pending`}
          bars={revenueTrendData.map((item) => item.settled + item.pending)}
          icon={Wallet}
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Appointment load</CardTitle>
            <CardDescription>
              Daily booking pressure across the next seven days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={appointmentChartConfig}
              className="h-80 w-full"
            >
              <AreaChart accessibilityLayer data={appointmentWindowData}>
                <defs>
                  <linearGradient
                    id="adminAppointments"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-appointments)"
                      stopOpacity={0.75}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-appointments)"
                      stopOpacity={0.12}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.date ?? ""
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="var(--color-appointments)"
                  fill="url(#adminAppointments)"
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
              <CardTitle>Revenue flow</CardTitle>
              <CardDescription>
                Settled versus pending payment value over the last seven days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueChartConfig}
                className="h-64 w-full"
              >
                <BarChart accessibilityLayer data={revenueTrendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dashed"
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.date ?? ""
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="settled"
                    fill="var(--color-settled)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    fill="var(--color-pending)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment status mix</CardTitle>
              <CardDescription>
                Snapshot of payment outcomes in the currently loaded data set.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {paymentStatusData.length ? (
                <>
                  <ChartContainer
                    config={paymentStatusConfig}
                    className="h-56 w-full"
                  >
                    <PieChart accessibilityLayer>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent hideLabel nameKey="label" />
                        }
                      />
                      <Pie
                        data={paymentStatusData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={52}
                        outerRadius={84}
                        paddingAngle={4}
                      >
                        {paymentStatusData.map((item, index) => (
                          <Cell
                            key={item.label}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="grid gap-3">
                    {paymentStatusData.map((item, index) => (
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
                  No payment activity is available for charting yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Upcoming appointments</CardTitle>
              <CardDescription>
                Next scheduled visits across patients and providers.
              </CardDescription>
            </div>
            <Button href="/admin/appointments" variant="outline">
              View all
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
                        {appointment.patient?.user?.displayName ?? "Patient"}{" "}
                        with {appointment.doctor?.user?.displayName ?? "Doctor"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.branch?.name ?? "Branch not assigned"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {dateFormatter.format(
                          new Date(appointment.scheduledStartAt),
                        )}
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
                No appointments are scheduled yet.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Jump into the admin tasks that usually need attention first.
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
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardFooter>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Campaign pulse</CardTitle>
                <CardDescription>
                  Latest outreach items prepared for patients and staff.
                </CardDescription>
              </div>
              <Button href="/admin/campaigns" variant="ghost">
                Open
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaigns.slice(0, 4).length ? (
                campaigns.slice(0, 4).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="rounded-xl border border-border/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{campaign.title}</p>
                      <Badge variant="outline" className="capitalize">
                        {titleCase(campaign.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Audience: {titleCase(campaign.audience)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No campaigns have been created yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Doctor roster</CardTitle>
              <CardDescription>
                Availability and verification at a glance.
              </CardDescription>
            </div>
            <Button href="/admin/doctors" variant="ghost">
              Open
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctors.slice(0, 5).length ? (
              doctors.slice(0, 5).map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {doctor.user?.displayName ?? doctor.slug ?? doctor.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialty ?? "No specialty"}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <Badge variant="secondary" className="capitalize">
                      {titleCase(doctor.verificationStatus)}
                    </Badge>
                    <p className="mt-1 text-muted-foreground">
                      {doctor.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No doctors yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent patients</CardTitle>
              <CardDescription>
                Most recent profiles coming into the system.
              </CardDescription>
            </div>
            <Button href="/admin/patients" variant="ghost">
              Open
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {patients.slice(0, 5).length ? (
              patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {patient.user?.displayName ?? patient.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.user?.email ??
                        patient.user?.phone ??
                        "No contact"}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {shortDateFormatter.format(new Date(patient.createdAt))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No patients are available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
