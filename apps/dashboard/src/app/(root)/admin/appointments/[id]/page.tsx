"use client";

import React from "react";

import type { AppPageProps } from "@workspace/contracts";
import type { AppointmentResponse } from "@workspace/contracts/appointment";
import { Badge } from "@workspace/ui/components/badge";

import AppointmentStatusPanel from "@/components/dashboard/AppointmentStatusPanel";
import ConversationThread from "@/components/dashboard/ConversationThread";
import {
  type RelatedEntityConfig,
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { useAppointment } from "@/hooks/appointment";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatDateTime = (value?: string) =>
  formatDate(value, { mode: "datetime", fallback: "Not recorded" });

const formatLabel = (value?: string) =>
  value
    ? value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    : "Not set";

const renderBadge = (value?: string) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {formatLabel(value)}
  </Badge>
);

const sections: SectionConfig<AppointmentResponse>[] = [
  {
    title: "Booking Summary",
    description: () =>
      "Scheduling, channel, and lifecycle details for this appointment booking.",
    columns: 3,
    fields: [
      {
        label: "Status",
        accessor: "status",
        render: (value) => renderBadge(value),
      },
      {
        label: "Payment Status",
        accessor: "paymentStatus",
        render: (value) => renderBadge(value),
      },
      {
        label: "Channel",
        accessor: "channel",
        render: (value) => renderBadge(value),
      },
      {
        label: "Booking Source",
        accessor: "bookingSource",
        render: (value) => renderBadge(value),
      },
      {
        label: "Scheduled Start",
        accessor: "scheduledStartAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Scheduled End",
        accessor: "scheduledEndAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Timezone",
        accessor: "timezone",
      },
      {
        label: "Booked At",
        accessor: "bookedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Reminder Sent",
        accessor: "reminderSentAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "People and Location",
    description: () =>
      "Linked doctor, patient, branch, and conversation status for this visit.",
    columns: 3,
    fields: [
      {
        label: "Patient",
        accessor: (data) => data.patient?.user?.displayName ?? "Patient",
      },
      {
        label: "Patient Contact",
        accessor: (data) =>
          data.patient?.user?.email ??
          data.patient?.user?.phone ??
          "No contact",
      },
      {
        label: "Doctor",
        accessor: (data) => data.doctor?.user?.displayName ?? "Doctor",
      },
      {
        label: "Branch",
        accessor: (data) => data.branch?.name ?? "Branch",
      },
      {
        label: "Conversation Status",
        accessor: (data) => data.conversation?.status,
        render: (value) => renderBadge(value),
      },
      {
        label: "Last Message",
        accessor: (data) => formatDateTime(data.conversation?.lastMessageAt),
      },
    ],
  },
  {
    title: "Clinical Notes and Follow-up",
    columns: 2,
    fields: [
      {
        label: "Patient Notes",
        accessor: "patientNotes",
      },
      {
        label: "Doctor Notes",
        accessor: "doctorNotes",
      },
      {
        label: "Admin Notes",
        accessor: "adminNotes",
      },
      {
        label: "Cancellation Reason",
        accessor: "cancellationReason",
      },
    ],
  },
  {
    title: "Timeline",
    columns: 2,
    fields: [
      {
        label: "Confirmed At",
        accessor: "confirmedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Cancelled At",
        accessor: "cancelledAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Completed At",
        accessor: "completedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Paid At",
        accessor: "paidAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
];

const relatedEntities: RelatedEntityConfig<AppointmentResponse>[] = [
  {
    title: "Payments",
    dataKey: "payments",
    columns: [
      {
        header: "Amount",
        accessor: (item) => currencyFormatter.format(item.amount),
      },
      {
        header: "Provider",
        accessor: (item) => formatLabel(item.provider),
      },
      {
        header: "Method",
        accessor: (item) => formatLabel(item.methodType),
      },
      {
        header: "Status",
        accessor: (item) => formatLabel(item.status),
      },
      {
        header: "Created",
        accessor: (item) => formatDateTime(item.createdAt),
      },
    ],
    viewPath: (item) => `/admin/payments/${item.id}`,
  },
];

const renderHeader = (data: AppointmentResponse) => (
  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {renderBadge(data.status)}
        {renderBadge(data.paymentStatus)}
        {renderBadge(data.channel)}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {data.appointmentNumber}
        </h2>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(data.scheduledStartAt)}
          {data.branch?.name ? ` • ${data.branch.name}` : ""}
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-90">
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Patient
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.patient?.user?.displayName ?? "Patient"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Doctor
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.doctor?.user?.displayName ?? "Doctor"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Conversation
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.conversation
            ? formatLabel(data.conversation.status)
            : "Not started"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Total Payments
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.payments?.length ?? 0} recorded
        </p>
      </div>
    </div>
  </div>
);

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage
      entityId={id}
      canEdit={false}
      entityName="Appointment"
      description="Review booking context, update appointment status, and continue the related conversation from a single details page."
      useQuery={useAppointment}
      sections={sections}
      relatedEntities={relatedEntities}
      renderHeader={renderHeader}
      renderActions={(data) => (
        <AppointmentStatusPanel appointment={data} variant="toolbar" />
      )}
    >
      {(data) => <ConversationThread appointmentId={data.id} />}
    </GenericDetailsPage>
  );
};

export default Page;

