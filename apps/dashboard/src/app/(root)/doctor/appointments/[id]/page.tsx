"use client";

import Link from "next/link";
import React from "react";

import type { AppPageProps } from "@workspace/contracts";
import type { AppointmentResponse } from "@workspace/contracts/appointment";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import AppointmentStatusPanel from "@/components/dashboard/AppointmentStatusPanel";
import ConversationThread from "@/components/dashboard/ConversationThread";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { useAppointment } from "@/hooks/healthcare";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDateTime = (value?: string | null) =>
  value ? dateTimeFormatter.format(new Date(value)) : "Not recorded";

const formatLabel = (value?: string | null) =>
  value
    ? value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    : "Not set";

const renderBadge = (value?: string | null) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {formatLabel(value)}
  </Badge>
);

const sections: SectionConfig<AppointmentResponse>[] = [
  {
    title: "Visit Overview",
    description: () =>
      "The live booking state, timing window, and care channel for this appointment.",
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
        label: "Confirmed At",
        accessor: "confirmedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Completed At",
        accessor: "completedAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "Patient and Branch Context",
    description: () =>
      "The patient record, branch location, and conversation status connected to this visit.",
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
        label: "Branch",
        accessor: (data) => data.branch?.name ?? "Branch",
      },
      {
        label: "Conversation",
        accessor: (data) => data.conversation?.status,
        render: (value) => renderBadge(value),
      },
      {
        label: "Last Message",
        accessor: (data) => formatDateTime(data.conversation?.lastMessageAt),
      },
      {
        label: "Cancellation Reason",
        accessor: "cancellationReason",
      },
    ],
  },
  {
    title: "Clinical Notes",
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
    ],
  },
];

const renderHeader = (data: AppointmentResponse) => (
  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {renderBadge(data.status)}
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
          Conversation
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.conversation
            ? formatLabel(data.conversation.status)
            : "Not started"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 sm:col-span-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Patient Notes Snapshot
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {data.patientNotes ??
            "No patient notes were added for this appointment."}
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
      entityName="Appointment"
      description="Manage the appointment lifecycle, review patient notes, and continue the related thread without leaving the record."
      useQuery={useAppointment}
      sections={sections}
      renderHeader={renderHeader}
      renderActions={(data) => (
        <>
          <Button asChild variant="outline">
            <Link href={`/doctor/messages/${data.id}`}>Open Thread</Link>
          </Button>
          <AppointmentStatusPanel appointment={data} variant="toolbar" />
        </>
      )}
      canEdit={false}
    >
      {(data) => <ConversationThread appointmentId={data.id} />}
    </GenericDetailsPage>
  );
};

export default Page;
