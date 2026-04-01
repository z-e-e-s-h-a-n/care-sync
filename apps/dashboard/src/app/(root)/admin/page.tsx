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
  ArrowUpRight,
  CalendarClock,
  FilePlus2,
  History,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  MoveRight,
  Newspaper,
  PencilLine,
  Plus,
  RefreshCcw,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import OverviewStatCard from "@/components/dashboard/OverviewStatCard";
import PageIntro from "@/components/dashboard/PageIntro";
import { useAdminDashboard } from "@/hooks/dashboard";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  formatCompactNumber,
  formatDate,
  formatPrice,
} from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const appointmentChartConfig = {
  appointments: { label: "Appointments", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  settled: { label: "Settled", color: "var(--chart-2)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
} satisfies ChartConfig;

const titleCase = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const auditActionIconMap: Record<string, React.ElementType> = {
  create: Plus,
  update: PencilLine,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  statusChange: RefreshCcw,
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: overview } = useAdminDashboard();

  const appointmentWindowData =
    overview?.upcomingVisits.window.map(({ date, count }) => ({
      label: formatDate(date, { options: { weekday: "short" } }),
      date: formatDate(date, { mode: "shortDate" }),
      appointments: count,
    })) ?? [];

  const revenueTrendData =
    overview?.revenue.trend.map(({ date, settled, pending }) => ({
      label: formatDate(date, { options: { weekday: "short" } }),
      date: formatDate(date, { mode: "shortDate" }),
      settled,
      pending,
    })) ?? [];

  const paymentStatusData =
    overview?.paymentStatusMix.map(({ status, count }) => ({
      label: status,
      value: count,
    })) ?? [];

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
      value: overview?.focus.pendingDoctorReviews ?? 0,
    },
    {
      label: "Inactive branches",
      value: overview?.focus.inactiveBranches ?? 0,
    },
    {
      label: "Pending payment value",
      value: formatPrice(overview?.focus.pendingPaymentValue ?? 0),
    },
    {
      label: "Draft campaigns",
      value: overview?.focus.draftCampaigns ?? 0,
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Overview"
        description="Monitor providers, bookings, payments, and branch activity from one operational dashboard shaped around the current healthcare modules."
      />

      {/* ── Stat cards ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Care team"
          value={formatCompactNumber(overview?.careTeam.total ?? 0)}
          helper={`${overview?.careTeam.branchTotal ?? 0} branches are represented in the current roster feed.`}
          badge={`${overview?.careTeam.verified ?? 0} verified`}
          trendLabel={`${overview?.careTeam.available ?? 0} available for new bookings`}
          bars={overview?.careTeam.rosterBars ?? []}
          icon={Stethoscope}
          tone="success"
        />
        <OverviewStatCard
          label="Patient growth"
          value={formatCompactNumber(overview?.patientGrowth.total ?? 0)}
          helper="Recent signups and profile creation activity from the last month."
          badge={`+${overview?.patientGrowth.newThisMonth ?? 0} this month`}
          trendLabel={`${overview?.upcomingVisits.todayCount ?? 0} appointments are on deck for today`}
          bars={overview?.patientGrowth.growthBars.map((d) => d.count) ?? []}
          icon={Users}
        />
        <OverviewStatCard
          label="Upcoming visits"
          value={formatCompactNumber(overview?.upcomingVisits.active ?? 0)}
          helper="Active appointments scheduled ahead, excluding completed and cancelled visits."
          badge={`${overview?.upcomingVisits.queued ?? 0} queued`}
          trendLabel={`${overview?.upcomingVisits.todayCount ?? 0} appointments start today`}
          bars={appointmentWindowData.map((item) => item.appointments)}
          icon={CalendarClock}
        />
        <OverviewStatCard
          label="Collected revenue"
          value={formatPrice(overview?.revenue.collected ?? 0)}
          helper="Succeeded payments captured across all time."
          badge={`${overview?.revenue.successRate ?? 0}% success`}
          trendLabel={`${formatPrice(overview?.revenue.pending ?? 0)} still pending`}
          bars={revenueTrendData.map((item) => item.settled + item.pending)}
          icon={Wallet}
          tone="warning"
        />
      </section>

      {/* ── Charts ── */}
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
                Snapshot of payment outcomes across all time.
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
                <EmptyState message="No payment activity is available for charting yet." />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Tab group 1: People & Appointments | Quick Actions ── */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5" />
              People & Scheduling
            </CardTitle>
            <CardDescription>
              Upcoming appointments plus the latest patient and doctor activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appointments" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-3">
                {(overview?.upcomingAppointments ?? []).length ? (
                  overview!.upcomingAppointments.map((appt) => (
                    <Link
                      key={appt.id}
                      href={`/admin/appointments/${appt.id}`}
                      className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            className="rounded-lg size-10"
                          >
                            <CalendarClock />
                          </Button>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getStatusVariant(appt.status)}
                                className="capitalize"
                              >
                                {titleCase(appt.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {appt.branchName ?? "Branch not assigned"}
                              </span>
                            </div>
                            <p className="mt-2 font-medium">
                              {appt.patientName} with {appt.doctorName}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(appt.scheduledStartAt, {
                            mode: "datetime",
                          })}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          Open appointment details
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState message="No appointments are scheduled yet." />
                )}
                <div className="flex justify-end pt-2">
                  <Button href="/admin/appointments" variant="ghost" size="sm">
                    View all appointments
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="patients" className="space-y-3">
                {(overview?.recentPatients ?? []).length ? (
                  overview!.recentPatients.map((patient) => (
                    <Link
                      key={patient.id}
                      href={`/admin/patients/${patient.id}`}
                      className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            className="rounded-lg size-10"
                          >
                            <UserRound />
                          </Button>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {patient.displayName}
                            </p>
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {patient.email ?? patient.phone ?? "No contact"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(patient.createdAt)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          Review patient profile
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState message="No patients are available yet." />
                )}
                <div className="flex justify-end pt-2">
                  <Button href="/admin/patients" variant="ghost" size="sm">
                    View all patients
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-3">
                {(overview?.doctorRoster ?? []).length ? (
                  overview!.doctorRoster.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/admin/doctors/${doctor.id}`}
                      className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            className="rounded-lg size-10"
                          >
                            <Stethoscope />
                          </Button>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {doctor.displayName}
                            </p>
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {doctor.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={getStatusVariant(
                              doctor.verificationStatus,
                            )}
                            className="capitalize"
                          >
                            {titleCase(doctor.verificationStatus)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doctor.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          Open doctor profile
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState message="No doctors yet." />
                )}
                <div className="flex justify-end pt-2">
                  <Button href="/admin/doctors" variant="ghost" size="sm">
                    View all doctors
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
                    <Button
                      variant="default"
                      appearance="soft"
                      className="rounded-lg size-10"
                    >
                      <Icon />
                    </Button>
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
      </section>

      {/* ── Tab group 2: Outreach & Activity ── */}
      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              Outreach & Activity
            </CardTitle>
            <CardDescription>
              Keep an eye on campaigns, inbound leads, and operational changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="campaigns" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns" className="space-y-3">
                {(overview?.campaigns ?? []).length ? (
                  <div className="grid gap-3">
                    {overview!.campaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/admin/campaigns/${campaign.id}`}
                        className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Button variant="default">
                              <Megaphone />
                            </Button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={getStatusVariant(campaign.status)}
                                  className="capitalize"
                                >
                                  {titleCase(campaign.status)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {titleCase(campaign.audience)}
                                </span>
                              </div>
                              <p className="mt-2 truncate font-medium">
                                {campaign.title}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                          <span className="text-muted-foreground">
                            Open campaign details
                          </span>
                          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No campaigns have been created yet." />
                )}
                <div className="flex justify-end pt-2">
                  <Button href="/admin/campaigns" variant="ghost" size="sm">
                    View all campaigns
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="leads" className="space-y-6">
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium">Contact Messages</p>
                    <p className="text-xs text-muted-foreground">
                      Latest inbound messages from your landing pages.
                    </p>
                  </div>
                  {(overview?.contactMessages ?? []).length ? (
                    <div className="space-y-3">
                      {overview!.contactMessages.map((msg) => (
                        <Link
                          key={msg.id}
                          href={`/admin/leads/messages/${msg.id}`}
                          className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Button variant="default">
                                <Mail />
                              </Button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={getStatusVariant(msg.status)}
                                    className="capitalize"
                                  >
                                    {titleCase(msg.status)}
                                  </Badge>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {msg.email}
                                  </span>
                                </div>
                                <p className="mt-2 truncate font-medium">
                                  {msg.firstName}
                                  {msg.lastName ? ` ${msg.lastName}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                            <span className="truncate text-muted-foreground">
                              {msg.subject ?? "Open message thread"}
                            </span>
                            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No contact messages yet." />
                  )}
                  <div className="flex justify-end pt-2">
                    <Button
                      href="/admin/leads/messages"
                      variant="ghost"
                      size="sm"
                    >
                      View all messages
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium">
                      Newsletter Subscribers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Signups and opt-outs from your email outreach.
                    </p>
                  </div>
                  {(overview?.newsletterSubscribers ?? []).length ? (
                    <div className="space-y-3">
                      {overview!.newsletterSubscribers.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/admin/leads/subscribers/${sub.id}`}
                          className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Button variant="default">
                                <Newspaper />
                              </Button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      sub.isActive ? "success" : "destructive"
                                    }
                                  >
                                    {sub.isActive ? "Active" : "Unsubscribed"}
                                  </Badge>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {sub.email}
                                  </span>
                                </div>
                                <p className="mt-2 truncate font-medium">
                                  {sub.name}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(sub.subscribedAt)}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                            <span className="text-muted-foreground">
                              Open subscriber details
                            </span>
                            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No newsletter subscribers yet." />
                  )}
                  <div className="flex justify-end pt-2">
                    <Button
                      href="/admin/leads/subscribers"
                      variant="ghost"
                      size="sm"
                    >
                      View all subscribers
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                {(overview?.auditLogs ?? []).length ? (
                  overview!.auditLogs.map((log) => {
                    const ActionIcon =
                      auditActionIconMap[log.action] ?? History;

                    return (
                      <Link
                        key={log.id}
                        href={`/admin/audit-logs/${log.id}`}
                        className="group block rounded-2xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Button variant="default">
                              <ActionIcon />
                            </Button>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {titleCase(log.action)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {titleCase(log.entityType)}
                                </span>
                              </div>
                              <p className="mt-2 font-medium">
                                {log.userName ?? "System"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm">
                          <span className="text-muted-foreground">
                            {log.ip
                              ? `IP: ${log.ip}`
                              : "Tracked dashboard activity"}
                          </span>
                          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <EmptyState message="No activity has been recorded yet." />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
