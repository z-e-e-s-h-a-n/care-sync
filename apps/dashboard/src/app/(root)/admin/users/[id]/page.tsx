"use client";

import React from "react";
import Image from "next/image";

import { useAdminUser } from "@/hooks/admin";
import { Badge } from "@workspace/ui/components/badge";

import {
  type SectionConfig,
  GenericDetailsPage,
} from "@/components/shared/GenericDetailsPage";
import type { UserResponse } from "@workspace/contracts/user";
import type { AppPageProps } from "@workspace/contracts";

const sections: SectionConfig<UserResponse>[] = [
  {
    title: "Profile Information",
    fields: [
      { label: "First Name", accessor: "firstName" },
      { label: "Last Name", accessor: "lastName" },
      { label: "Display Name", accessor: "displayName" },
      { label: "Email", accessor: "email" },
      {
        label: "Role",
        accessor: "role",
        render: (value) => <Badge variant="outline">{value}</Badge>,
      },
      {
        label: "Status",
        accessor: "status",
        render: (value) => <Badge variant="outline">{value}</Badge>,
      },
    ],
    columns: 3,
  },
  {
    title: "Account Details",
    fields: [
      {
        label: "Email Verified",
        accessor: "isEmailVerified",
        render: (value) => (
          <Badge variant={value ? "default" : "outline"}>
            {value ? "Verified" : "Pending"}
          </Badge>
        ),
      },
      {
        label: "Theme",
        accessor: "preferredTheme",
      },
      {
        label: "Last Login",
        accessor: "lastLoginAt",
        format: (value) => (value ? new Date(value).toLocaleString() : "Never"),
      },
      {
        label: "Created At",
        accessor: "createdAt",
        format: (value) => new Date(value).toLocaleString(),
      },
    ],
    columns: 2,
  },
];

const renderHeader = (data: UserResponse) => (
  <div className="flex items-center gap-4">
    {data.image && (
      <Image
        src={data.image.url}
        alt={data.displayName}
        width={200}
        height={200}
        className="w-20 h-20 rounded-full object-cover"
      />
    )}
    <div>
      <h2 className="text-2xl font-bold">{data.displayName}</h2>
      <p className="text-muted-foreground">{data.email}</p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline">{data.role}</Badge>
        <Badge variant={data.status === "active" ? "default" : "outline"}>
          {data.status}
        </Badge>
      </div>
    </div>
  </div>
);

const Page = ({ params }: AppPageProps<{ id: string }>) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage
      entityId={id}
      entityName="User"
      useQuery={useAdminUser}
      sections={sections}
      renderHeader={renderHeader}
    />
  );
};

export default Page;
