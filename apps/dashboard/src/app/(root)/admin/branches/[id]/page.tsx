"use client";

import React from "react";

import type { AppPageProps } from "@workspace/contracts";
import type { BranchResponse } from "@workspace/contracts/branch";
import { Badge } from "@workspace/ui/components/badge";

import {
  type RelatedEntityConfig,
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { useBranch } from "@/hooks/healthcare";
import { formatDate } from "@workspace/shared/utils";

const formatDateTime = (value?: string | null) =>
  value ? formatDate(value) : "Not recorded";

const renderBadge = (value: string) => (
  <Badge variant="outline" className="capitalize">
    {value}
  </Badge>
);

const sections: SectionConfig<BranchResponse>[] = [
  {
    title: "Contact and Status",
    description: () =>
      "Core branch identifiers, communication channels, and operational status.",
    columns: 3,
    fields: [
      {
        label: "Branch Name",
        accessor: "name",
      },
      {
        label: "Slug",
        accessor: "slug",
      },
      {
        label: "Status",
        accessor: "isActive",
        render: (value) => renderBadge(value ? "Active" : "Inactive"),
      },
      {
        label: "Email",
        accessor: "email",
      },
      {
        label: "Phone",
        accessor: "phone",
      },
      {
        label: "WhatsApp",
        accessor: "whatsapp",
      },
      {
        label: "Timezone",
        accessor: "timezone",
      },
      {
        label: "Created At",
        accessor: "createdAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Updated At",
        accessor: "updatedAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "Operations",
    description: () =>
      "Address and opening schedule details used by staff and patients.",
    columns: 2,
    fields: [
      {
        label: "Address",
        accessor: "address",
      },
      {
        label: "Office Days",
        accessor: "officeHoursDays",
      },
      {
        label: "Office Hours",
        accessor: "officeHoursTime",
      },
      {
        label: "Assigned Doctors",
        accessor: (data) => `${data.doctors?.length ?? 0} linked doctor(s)`,
      },
    ],
  },
];

const relatedEntities: RelatedEntityConfig<BranchResponse>[] = [
  {
    title: "Assigned Doctors",
    dataKey: "doctors",
    columns: [
      {
        header: "Doctor",
        accessor: (item) => item.user?.displayName ?? item.slug ?? item.id,
      },
      {
        header: "Specialty",
        accessor: (item) => item.specialty ?? "Not set",
      },
      {
        header: "Verification",
        accessor: (item) => item.verificationStatus ?? "pending",
      },
      {
        header: "Availability",
        accessor: (item) => (item.isAvailable ? "Available" : "Unavailable"),
      },
    ],
    viewPath: (item) => `/admin/doctors/${item.id}`,
  },
];

const renderHeader = (data: BranchResponse) => (
  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {renderBadge(data.isActive ? "Active" : "Inactive")}
        {data.timezone ? (
          <Badge variant="outline">{data.timezone}</Badge>
        ) : null}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{data.name}</h2>
        <p className="text-sm text-muted-foreground">
          {data.address ?? "Branch address has not been added yet."}
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-90">
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Assigned Doctors
        </p>
        <p className="mt-2 text-lg font-semibold">
          {data.doctors?.length ?? 0}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Contact
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.email ?? data.phone ?? "No contact set"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 sm:col-span-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Office Schedule
        </p>
        <p className="mt-2 text-sm font-medium">
          {data.officeHoursDays ?? "Office days not set"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.officeHoursTime ?? "Office hours not set"}
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
      entityName="Branch"
      description="Review branch contact details, operating hours, and assigned doctors from one structured details page."
      useQuery={useBranch}
      sections={sections}
      relatedEntities={relatedEntities}
      renderHeader={renderHeader}
      editLabel="Edit Branch"
    />
  );
};

export default Page;
