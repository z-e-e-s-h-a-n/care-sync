"use client";

import React from "react";
import { toast } from "sonner";

import type { AppPageProps } from "@workspace/contracts";
import type { NotificationCampaignResponse } from "@workspace/contracts/campaign";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import {
  type RelatedEntityConfig,
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { useCampaign, useUpdateCampaign } from "@/hooks/campaign";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

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

const sections: SectionConfig<NotificationCampaignResponse>[] = [
  {
    title: "Campaign Overview",
    description: () =>
      "Targeting, delivery status, and ownership details for this communication campaign.",
    columns: 3,
    fields: [
      {
        label: "Audience",
        accessor: "audience",
        render: (value) => renderBadge(value),
      },
      {
        label: "Status",
        accessor: "status",
        render: (value) => renderBadge(value),
      },
      {
        label: "Channel",
        accessor: "channel",
        render: (value) => renderBadge(value),
      },
      {
        label: "Subject",
        accessor: "subject",
      },
      {
        label: "Created By",
        accessor: (data) => data.createdBy?.displayName ?? "System",
      },
      {
        label: "Recipients",
        accessor: (data) => `${data.recipients?.length ?? 0} linked user(s)`,
      },
      {
        label: "Scheduled At",
        accessor: "scheduledAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Sent At",
        accessor: "sentAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Created At",
        accessor: "createdAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "Message Content",
    columns: 1,
    fields: [
      {
        label: "Message",
        accessor: "message",
      },
    ],
  },
];

const relatedEntities: RelatedEntityConfig<NotificationCampaignResponse>[] = [
  {
    title: "Recipients",
    dataKey: "recipients",
    columns: [
      {
        header: "Recipient",
        accessor: (item) => item.user?.displayName ?? item.userId,
      },
      {
        header: "Contact",
        accessor: (item) =>
          item.user?.email ?? item.user?.phone ?? "No contact",
      },
      {
        header: "Role",
        accessor: (item) => formatLabel(item.user?.role),
      },
      {
        header: "Sent At",
        accessor: (item) => formatDateTime(item.sentAt),
      },
    ],
    viewPath: (item) => `/users/${item.userId}`,
  },
];

const renderHeader = (data: NotificationCampaignResponse) => (
  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {renderBadge(data.status)}
        {renderBadge(data.channel)}
        {renderBadge(data.audience)}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{data.title}</h2>
        <p className="text-sm text-muted-foreground">
          {data.subject ?? "No subject provided"}
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-90">
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Recipients
        </p>
        <p className="mt-2 text-lg font-semibold">
          {data.recipients?.length ?? 0}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Created By
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.createdBy?.displayName ?? "System"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 sm:col-span-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Delivery Window
        </p>
        <p className="mt-2 text-sm font-medium">
          Scheduled: {formatDateTime(data.scheduledAt)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sent: {formatDateTime(data.sentAt)}
        </p>
      </div>
    </div>
  </div>
);

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { updateCampaignStatus, sendCampaign, isPending } =
    useUpdateCampaign(id);

  const setStatus = async (
    status: "draft" | "scheduled" | "sent" | "failed",
  ) => {
    try {
      await updateCampaignStatus({ campaignId: id, status });
      toast.success(`Campaign marked as ${status}.`);
    } catch (error: any) {
      toast.error("Failed to update campaign", {
        description: error?.message,
      });
    }
  };

  const triggerSend = async () => {
    try {
      await sendCampaign();
      toast.success("Campaign send started.");
    } catch (error: any) {
      toast.error("Failed to send campaign", {
        description: error?.message,
      });
    }
  };

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="Campaign"
      description="Review audience targeting, campaign message content, and delivery actions from a single admin details view."
      useQuery={useCampaign}
      sections={sections}
      relatedEntities={relatedEntities}
      renderHeader={renderHeader}
      renderActions={() => (
        <>
          <Button
            type="button"
            size="sm"
            onClick={triggerSend}
            disabled={isPending}
          >
            Send Now
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatus("scheduled")}
            disabled={isPending}
          >
            Mark Scheduled
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatus("draft")}
            disabled={isPending}
          >
            Move to Draft
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setStatus("failed")}
            disabled={isPending}
          >
            Mark Failed
          </Button>
        </>
      )}
      canEdit={false}
    />
  );
};

export default Page;
