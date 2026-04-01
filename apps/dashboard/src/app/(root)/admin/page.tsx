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
      description: "Create a full patient record directly from the admin panel.",
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
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
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
          <Tabs defaultValue="appointments" className="gap-0">
            <CardHeader className="border-b">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="appointments">
                  Upcoming Appointments
                </TabsTrigger>
                <TabsTrigger value="patients">Recent Patients</TabsTrigger>
                <TabsTrigger value="doctors">Recent Doctors</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="appointments" className="mt-0 space-y-3">
                {(overview?.upcomingAppointments ?? []).length ? (
                  overview!.upcomingAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium">
                            {appt.patientName} with {appt.doctorName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {appt.branchName ?? "Branch not assigned"}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatDate(appt.scheduledStartAt, {
                              mode: "datetime",
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit capitalize">
                          {titleCase(appt.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No appointments are scheduled yet." />
                )}
                <div className="flex justify-end pt-2">
                  <Button
                    href="/admin/appointments"
                    variant="ghost"
                    size="sm"
                  >
                    View all appointments
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="patients" className="mt-0 space-y-3">
                {(overview?.recentPatients ?? []).length ? (
                  overview!.recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{patient.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.email ?? patient.phone ?? "No contact"}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(patient.createdAt)}
                      </span>
                    </div>
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

              <TabsContent value="doctors" className="mt-0 space-y-3">
                {(overview?.doctorRoster ?? []).length ? (
                  overview!.doctorRoster.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{doctor.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="capitalize">
                          {titleCase(doctor.verificationStatus)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {doctor.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
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
            </CardContent>
          </Tabs>
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
      </section>

      {/* ── Tab group 2: Outreach & Activity ── */}
      <section>
        <Card className="shadow-sm">
          <Tabs defaultValue="campaigns" className="gap-0">
            <CardHeader className="border-b">
              <TabsList>
                <TabsTrigger value="campaigns">Recent Campaigns</TabsTrigger>
                <TabsTrigger value="leads">Leads & Outreach</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="campaigns" className="mt-0">
                {(overview?.campaigns ?? []).length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {overview!.campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="rounded-xl border border-border/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-snug">
                            {campaign.title}
                          </p>
                          <Badge
                            variant="outline"
                            className="shrink-0 capitalize"
                          >
                            {titleCase(campaign.status)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Audience: {titleCase(campaign.audience)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No campaigns have been created yet." />
                )}
                <div className="flex justify-end pt-4">
                  <Button href="/admin/campaigns" variant="ghost" size="sm">
                    View all campaigns
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="leads" className="mt-0 space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Contact Messages
                  </p>
                  {(overview?.contactMessages ?? []).length ? (
                    <div className="space-y-2">
                      {overview!.contactMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">
                              {msg.firstName}
                              {msg.lastName ? ` ${msg.lastName}` : ""}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {msg.subject ?? msg.email}
                            </p>
                          </div>
                          <div className="ml-4 flex shrink-0 flex-col items-end gap-1">
                            <Badge variant="outline" className="capitalize">
                              {titleCase(msg.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No contact messages yet." />
                  )}
                  <div className="flex justify-end pt-3">
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
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Newsletter Subscribers
                  </p>
                  {(overview?.newsletterSubscribers ?? []).length ? (
                    <div className="space-y-2">
                      {overview!.newsletterSubscribers.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">{sub.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sub.email}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={sub.isActive ? "default" : "secondary"}
                            >
                              {sub.isActive ? "Active" : "Unsubscribed"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(sub.subscribedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No newsletter subscribers yet." />
                  )}
                  <div className="flex justify-end pt-3">
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

              <TabsContent value="activity" className="mt-0 space-y-2">
                {(overview?.auditLogs ?? []).length ? (
                  overview!.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            log.action === "delete"
                              ? "destructive"
                              : log.action === "create"
                                ? "default"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {titleCase(log.action)}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {titleCase(log.entityType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.userName ?? "System"}
                            {log.ip ? ` · ${log.ip}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No activity has been recorded yet." />
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </section>
    </div>
  );
}
