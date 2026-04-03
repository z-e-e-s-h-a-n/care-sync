"use client";

import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import type { StaffProfileResponse } from "@workspace/contracts/staff";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useStaffMember } from "@/hooks/staff";

const formatDateTime = (value?: string) =>
  formatDate(value, { mode: "datetime", fallback: "Not recorded" });

const renderStatusBadge = (value?: string | null, label?: string) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {label ?? value ?? "Not set"}
  </Badge>
);

const sections: SectionConfig<StaffProfileResponse>[] = [
  {
    title: "Profile Overview",
    description: () => "Account details, branch assignment, and role information.",
    columns: 3,
    fields: [
      {
        label: "Name",
        accessor: (data) => data.user?.displayName,
      },
      {
        label: "Email",
        accessor: (data) => data.user?.email ?? "No email",
      },
      {
        label: "Phone",
        accessor: (data) => data.user?.phone ?? "No phone",
      },
      {
        label: "Branch",
        accessor: (data) => data.branch?.name ?? "Unassigned",
      },
      {
        label: "Job Title",
        accessor: "title",
      },
      {
        label: "Specialty",
        accessor: "specialty",
      },
    ],
  },
  {
    title: "Credentials",
    description: () => "ABA certifications and professional credentials.",
    columns: 3,
    fields: [
      {
        label: "Credentials",
        accessor: "credentials",
        render: (value) =>
          Array.isArray(value) && value.length ? value.join(", ") : "Not set",
      },
      {
        label: "Status",
        accessor: "isActive",
        render: (value) =>
          renderStatusBadge(
            value ? "active" : "closed",
            value ? "Active" : "Inactive",
          ),
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
    title: "Bio",
    columns: 1,
    fields: [
      {
        label: "Professional Bio",
        accessor: "bio",
      },
    ],
  },
];

const renderHeader = (data: StaffProfileResponse) => {
  const initials = `${data.user?.firstName?.[0] ?? "S"}${data.user?.lastName?.[0] ?? "T"}`;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="size-20 border border-border/60">
          <AvatarImage
            src={data.user?.avatar?.url ?? undefined}
            alt={data.user?.displayName ?? "Staff"}
            width={200}
            height={200}
            className="object-cover"
          />
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {data.user?.displayName ?? data.id}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.title}
              {data.specialty ? ` • ${data.specialty}` : ""}
              {data.branch?.name ? ` • ${data.branch.name}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderStatusBadge(
              data.isActive ? "active" : "closed",
              data.isActive ? "Active" : "Inactive",
            )}
            {data.credentials?.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="Staff Member"
      description={(data) =>
        `View ${data.user?.displayName ?? "this staff member"}'s profile, credentials, and branch assignment.`
      }
      useQuery={useStaffMember}
      sections={sections}
      renderHeader={renderHeader}
    />
  );
};

export default Page;
