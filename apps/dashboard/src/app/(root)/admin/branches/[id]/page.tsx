"use client";

import React from "react";
import { Building2, Calendar, Mail, MapPin, Phone } from "lucide-react";

import type { AppPageProps } from "@workspace/contracts";
import type { BranchResponse } from "@workspace/contracts/business";
import { formatDate } from "@workspace/shared/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  GenericDetailsPage,
  type SectionConfig,
} from "@workspace/ui/shared/GenericDetailsPage";

import { useBranch } from "@/hooks/business";

const formatWeekday = (weekday: string) =>
  weekday.charAt(0).toUpperCase() + weekday.slice(1);

const sections: SectionConfig<BranchResponse>[] = [
  {
    title: "Branch Details",
    columns: 2 as const,
    fields: [
      { label: "Branch Name", accessor: (branch) => branch.name },
      { label: "Slug", accessor: (branch) => branch.slug },
      {
        label: "Status",
        accessor: (branch: BranchResponse) => (
          <Badge variant={branch.isActive ? "success" : "secondary"}>
            {branch.isActive ? "active" : "inactive"}
          </Badge>
        ),
      },
      {
        label: "Timezone",
        accessor: (branch: BranchResponse) => branch.timezone ?? "—",
      },
    ],
  },
  {
    title: "Contact",
    columns: 2 as const,
    fields: [
      { label: "Email", accessor: (branch) => branch.email, icon: Mail },
      { label: "Phone", accessor: (branch) => branch.phone, icon: Phone },
      {
        label: "WhatsApp",
        accessor: (branch: BranchResponse) => branch.whatsapp ?? "—",
        icon: Phone,
      },
    ],
  },
  {
    title: "Address",
    columns: 2 as const,
    fields: [
      { label: "Street", accessor: (branch) => branch.street, icon: MapPin },
      { label: "City", accessor: (branch) => branch.city, icon: MapPin },
      { label: "State", accessor: (branch) => branch.state, icon: MapPin },
      {
        label: "Postal Code",
        accessor: (branch) => branch.postalCode,
        icon: MapPin,
      },
      { label: "Country", accessor: (branch) => branch.country, icon: MapPin },
      {
        label: "Coordinates",
        accessor: (branch: BranchResponse) =>
          branch.latitude && branch.longitude
            ? `${branch.latitude}, ${branch.longitude}`
            : "—",
      },
    ],
  },
  {
    title: "Timestamps",
    columns: 2 as const,
    fields: [
      {
        label: "Created At",
        accessor: (branch: BranchResponse) =>
          formatDate(branch.createdAt, { mode: "datetime" }),
        icon: Calendar,
      },
      {
        label: "Updated At",
        accessor: (branch: BranchResponse) =>
          formatDate(branch.updatedAt, { mode: "datetime" }),
        icon: Calendar,
      },
    ],
  },
];

const BranchDetailsPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage<BranchResponse>
      entityId={id}
      entityName="branch"
      useQuery={useBranch}
      sections={sections}
      renderHeader={(branch) => (
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-background/80 p-3">
            <Building2 className="size-6" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{branch.name}</h2>
              <Badge variant={branch.isActive ? "success" : "secondary"}>
                {branch.isActive ? "active" : "inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {branch.city}, {branch.country}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{branch.email}</p>
          </div>
        </div>
      )}
    >
      {(branch) => (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {branch.branchTimings.map((timing) => (
              <div
                key={timing.id}
                className="rounded-lg border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    {formatWeekday(timing.weekday)}
                  </div>
                  <Badge variant={timing.isClosed ? "secondary" : "success"}>
                    {timing.isClosed ? "Closed" : "Open"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {timing.isClosed
                    ? "Closed for the day"
                    : `${timing.openTime} - ${timing.closeTime}`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </GenericDetailsPage>
  );
};

export default BranchDetailsPage;
