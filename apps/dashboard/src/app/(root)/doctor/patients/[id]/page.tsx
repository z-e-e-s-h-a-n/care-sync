"use client";

import Link from "next/link";
import React from "react";

import type { AppPageProps } from "@workspace/contracts";
import type { PatientProfileResponse } from "@workspace/contracts/patient";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { usePatient } from "@/hooks/healthcare";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const renderBadge = (value?: string | null) => (
  <Badge variant={getStatusVariant(value ?? "")} className="capitalize">
    {value ?? "Not set"}
  </Badge>
);

const renderDocumentLink = (document?: { url?: string | null } | null) =>
  document?.url ? (
    <Link
      href={document.url}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      View document
    </Link>
  ) : (
    "Not uploaded"
  );

const sections: SectionConfig<PatientProfileResponse>[] = [
  {
    title: "Patient Account",
    description: () =>
      "Linked user details, demographic profile, and branch preference for this patient.",
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
        label: "Gender",
        accessor: "gender",
        render: (value) => renderBadge(value),
      },
      {
        label: "Date of Birth",
        accessor: "birthDate",
        render: (value) => (value ? formatDate(value) : "Not provided"),
      },
      {
        label: "Address",
        accessor: "address",
      },
      {
        label: "Occupation",
        accessor: "occupation",
      },
      {
        label: "Profile Updated",
        accessor: "updatedAt",
        render: (value) =>
          value ? formatDate(value, "datetime") : "Not recorded",
      },
    ],
  },
  {
    title: "Emergency and Insurance",
    description: () =>
      "The best fallback contact information and current insurance details for care coordination.",
    columns: 2,
    fields: [
      {
        label: "Emergency Contact Name",
        accessor: "emergencyContactName",
      },
      {
        label: "Emergency Contact Number",
        accessor: "emergencyContactNumber",
      },
      {
        label: "Insurance Provider",
        accessor: "insuranceProvider",
      },
      {
        label: "Insurance Policy Number",
        accessor: "insurancePolicyNumber",
      },
    ],
  },
  {
    title: "Medical Information",
    description: () =>
      "Important health context captured for safer appointments and follow-up planning.",
    columns: 2,
    fields: [
      {
        label: "Allergies",
        accessor: "allergies",
      },
      {
        label: "Current Medications",
        accessor: "currentMedication",
      },
      {
        label: "Family Medical History",
        accessor: "familyMedicalHistory",
      },
      {
        label: "Past Medical History",
        accessor: "pastMedicalHistory",
      },
    ],
  },
  {
    title: "Identification and Verification",
    columns: 3,
    fields: [
      {
        label: "Identification Type",
        accessor: "identificationType",
        render: (value) => renderBadge(value),
      },
      {
        label: "Identification Number",
        accessor: "identificationNumber",
      },
      {
        label: "Scanned Document",
        accessor: "identificationDocument",
        render: (value) => renderDocumentLink(value),
      },
    ],
  },
];

const renderHeader = (data: PatientProfileResponse) => {
  const initials = `${data.user?.firstName?.[0] ?? "P"}${data.user?.lastName?.[0] ?? "T"}`;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="size-20 border border-border/60">
          <AvatarImage
            src={data.user?.avatar?.url ?? undefined}
            alt={data.user?.displayName ?? "Patient"}
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
              {data.user?.displayName ?? "Patient"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.user?.email ??
                data.user?.phone ??
                "Contact details pending"}
            </p>
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
      entityName="Patient"
      description={(data) =>
        `Review ${data.user?.displayName ?? "this patient"}'s medical profile, emergency contacts, and linked verification details.`
      }
      useQuery={usePatient}
      sections={sections}
      renderHeader={renderHeader}
      renderActions={(data) => (
        <Button asChild variant="outline">
          <Link href={`/admin/appointments/new?patientId=${data.id}`}>
            Book Appointment
          </Link>
        </Button>
      )}
      editLabel="Edit Profile"
    />
  );
};

export default Page;
