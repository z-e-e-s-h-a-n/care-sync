"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import SectionCard from "@workspace/ui/shared/SectionCard";
import StatCard from "@workspace/ui/shared/StatCard";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { usePatientDashboard } from "@/hooks/dashboard";
import PatientOverviewSkeleton from "@/components/skeletons/PatientOverviewSkeleton";

const titleCase = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function PatientOverviewPage() {
  const { data: overview, isLoading } = usePatientDashboard();

  if (isLoading) {
    return <PatientOverviewSkeleton />;
  }

  const quickLinks = [
    {
      href: "/patient/appointments",
      title: "Appointments",
      description: "Review upcoming visits and book a new session.",
      icon: CalendarDays,
    },
    {
      href: "/patient/orders",
      title: "Orders",
      description: "Track deliveries and recent purchases.",
      icon: Package,
    },
    {
      href: "/patient/messages",
      title: "Messages",
      description: "Open conversations related to your visits.",
      icon: MessageSquare,
    },
    {
      href: "/shop",
      title: "Browse shop",
      description: "Discover products and therapy resources.",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {overview?.profile.displayName
            ? `Welcome back, ${overview.profile.displayName}`
            : "Patient Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep track of appointments, orders, notifications, and messages from
          one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming Visits"
          value={overview?.upcomingVisits.active ?? 0}
          className="border-primary/20 bg-linear-to-br from-primary/10 to-card"
        />
        <StatCard
          label="Active Orders"
          value={overview?.orders.active ?? 0}
          className="border-blue-200 bg-linear-to-br from-blue-100/60 to-card"
        />
        <StatCard
          label="Unread Notifications"
          value={overview?.inbox.unreadNotifications ?? 0}
          className="border-amber-200 bg-linear-to-br from-amber-100/60 to-card"
        />
        <StatCard
          label="Open Conversations"
          value={overview?.inbox.openConversations ?? 0}
          className="border-emerald-200 bg-linear-to-br from-emerald-100/60 to-card"
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Upcoming appointments"
          description="Your next scheduled visits."
          action={
            <Button variant="outline" asChild>
              <Link href="/patient/appointments">View all</Link>
            </Button>
          }
          contentClassName="space-y-3"
        >
          {!overview?.upcomingAppointments?.length && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No upcoming appointments right now.
            </div>
          )}

          {overview?.upcomingAppointments?.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/patient/appointments/${appointment.id}`}
              className="block rounded-xl border p-4 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(appointment.status)}
                      className="capitalize"
                    >
                      {titleCase(appointment.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {appointment.branchName ?? "Branch pending"}
                    </span>
                  </div>
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(appointment.scheduledStartAt, {
                      mode: "datetime",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </SectionCard>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              The patient portal tasks you’re most likely to need next.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
                >
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-4 font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Recent orders"
          description="Track your latest purchases and delivery progress."
          action={
            <Button variant="outline" asChild>
              <Link href="/patient/orders">Open orders</Link>
            </Button>
          }
          contentClassName="space-y-3"
        >
          {!overview?.recentOrders?.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No recent orders yet.
            </div>
          ) : (
            overview.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/patient/orders/${order.id}`}
                className="block rounded-xl border p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} ·{" "}
                      {formatDate(order.createdAt, { mode: "date" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className="capitalize"
                    >
                      {titleCase(order.status)}
                    </Badge>
                    <p className="mt-2 text-sm font-medium">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </SectionCard>

        <SectionCard
          title="Recent notifications"
          description="Important account and appointment updates."
          action={
            <Button variant="outline" asChild>
              <Link href="/patient/notifications">Open notifications</Link>
            </Button>
          }
          contentClassName="space-y-3"
        >
          {!overview?.recentNotifications?.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            overview.recentNotifications.map((notification) => (
              <Link
                key={notification.id}
                href="/patient/notifications"
                className="block rounded-xl border p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-primary" />
                      <Badge
                        variant={notification.readAt ? "secondary" : "default"}
                      >
                        {notification.readAt ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <p className="mt-2 font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.createdAt, { mode: "datetime" })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </SectionCard>
      </section>
    </div>
  );
}
