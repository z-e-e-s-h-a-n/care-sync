"use client";

import React from "react";
import { toast } from "sonner";

import type { AppPageProps } from "@workspace/contracts";
import type { DoctorProfileResponse } from "@workspace/contracts/doctor";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { useDoctor, useVerifyDoctor } from "@/hooks/healthcare";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { formatDate, formatPrice } from "@workspace/shared/utils";
import Link from "next/link";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const formatDateTime = (value?: string) =>
  value ? formatDate(value, "datetime") : "Not recorded";

const renderStatusBadge = (value?: string | null, label?: string) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {label ?? value ?? "Not set"}
  </Badge>
);

const renderDocumentLink = (
  document?: { url?: string | null } | null,
  label = "Open document",
) =>
  document?.url ? (
    <Link
      href={document.url}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      {label}
    </Link>
  ) : (
    "Not uploaded"
  );

const sections: SectionConfig<DoctorProfileResponse>[] = [
  {
    title: "Profile Overview",
    description: () =>
      "Core account, branch, specialty, and commercial setup for this doctor profile.",
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
        label: "Specialty",
        accessor: "specialty",
      },
      {
        label: "Professional Title",
        accessor: "title",
      },
      {
        label: "Years of Experience",
        accessor: "yearsExperience",
        render: (value) =>
          value === null || value === undefined ? "Not set" : `${value} years`,
      },
      {
        label: "Consultation Fee",
        accessor: "consultationFee",
        render: (value) => (value ? formatPrice(value) : "Not set"),
      },
      {
        label: "Commission Percent",
        accessor: "commissionPercent",
        render: (value) =>
          value === null || value === undefined || value === ""
            ? "Not set"
            : `${value}%`,
      },
    ],
  },
  {
    title: "Credentials and Documents",
    description: () =>
      "Verification inputs, qualification details, and uploaded compliance files.",
    columns: 3,
    fields: [
      {
        label: "License Number",
        accessor: "licenseNumber",
      },
      {
        label: "Education",
        accessor: "education",
      },
      {
        label: "Qualifications",
        accessor: "qualifications",
      },
      {
        label: "Languages",
        accessor: "languages",
        render: (value) =>
          Array.isArray(value) && value.length ? value.join(", ") : "Not set",
      },
      {
        label: "License Document",
        accessor: "licenseDocument",
        render: (value) => renderDocumentLink(value, "Open license file"),
      },
    ],
  },
  {
    title: "Review Workflow",
    description: () =>
      "Internal review state, approver details, and any rejection notes captured during admin checks.",
    columns: 3,
    fields: [
      {
        label: "Verification Status",
        accessor: "verificationStatus",
        render: (value) => renderStatusBadge(value),
      },
      {
        label: "Availability",
        accessor: "isAvailable",
        render: (value) =>
          renderStatusBadge(
            value ? "active" : "closed",
            value ? "Available" : "Unavailable",
          ),
      },
      {
        label: "Verified At",
        accessor: "verifiedAt",
        render: (value) => formatDateTime(value),
      },
      {
        label: "Verified By",
        accessor: (data) => data.verifiedBy?.displayName ?? "Not assigned",
      },
      {
        label: "Created By",
        accessor: (data) => data.createdBy?.displayName ?? "System",
      },
      {
        label: "Updated At",
        accessor: "updatedAt",
        render: (value) => formatDateTime(value),
      },
    ],
  },
  {
    title: "Profile Notes",
    columns: 1,
    fields: [
      {
        label: "Professional Bio",
        accessor: "bio",
      },
      {
        label: "Rejection Reason",
        accessor: "rejectionReason",
      },
    ],
  },
];

const renderHeader = (data: DoctorProfileResponse) => {
  const initials = `${data.user?.firstName?.[0] ?? "D"}${data.user?.lastName?.[0] ?? "R"}`;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="size-20 border border-border/60">
          <AvatarImage
            src={data.user?.avatar?.url ?? undefined}
            alt={data.user?.displayName ?? "Doctor"}
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
              {data.user?.displayName ?? data.slug ?? data.id}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.specialty ?? "Specialty pending"}
              {data.branch?.name ? ` • ${data.branch.name}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderStatusBadge(data.verificationStatus)}
            {renderStatusBadge(
              data.isAvailable ? "active" : "closed",
              data.isAvailable ? "Available" : "Unavailable",
            )}
            {data.title ? <Badge variant="outline">{data.title}</Badge> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { verifyDoctor, isPending } = useVerifyDoctor(id);

  const updateVerification = async (
    verificationStatus: "pending" | "verified" | "rejected",
  ) => {
    try {
      await verifyDoctor({
        verificationStatus,
        rejectionReason:
          verificationStatus === "rejected"
            ? "Rejected during admin review."
            : undefined,
      });
      toast.success(`Doctor marked as ${verificationStatus}.`);
    } catch (error: any) {
      toast.error("Failed to update verification", {
        description: error?.message,
      });
    }
  };

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="Doctor"
      description={(data) =>
        `Review ${data.user?.displayName ?? "this provider"}'s profile, credentials, and verification workflow from one place.`
      }
      useQuery={useDoctor}
      sections={sections}
      renderHeader={renderHeader}
      renderActions={() => (
        <>
          <Button
            type="button"
            size="sm"
            onClick={() => updateVerification("verified")}
            disabled={isPending}
          >
            Verify Doctor
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => updateVerification("pending")}
            disabled={isPending}
          >
            Mark Pending
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => updateVerification("rejected")}
            disabled={isPending}
          >
            Reject
          </Button>
        </>
      )}
    />
  );
};

export default Page;
