"use client";

import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import type { UserResponse } from "@workspace/contracts/user";
import { formatDate } from "@workspace/shared/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import {
  type SectionConfig,
  GenericDetailsPage,
} from "@workspace/ui/shared/GenericDetailsPage";

import { useAdminUser } from "@/hooks/admin";

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
        render: (value) => (
          <Badge variant={getStatusVariant(value)}>{value}</Badge>
        ),
      },
      {
        label: "Status",
        accessor: "status",
        render: (value) => (
          <Badge variant={getStatusVariant(value)}>{value}</Badge>
        ),
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
          <Badge variant={getStatusVariant(value ? "verified" : "pending")}>
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
        format: (value) =>
          value ? formatDate(value, { mode: "datetime" }) : "Never",
      },
      {
        label: "Created At",
        accessor: "createdAt",
        format: (value) => formatDate(value, { mode: "datetime" }),
      },
    ],
    columns: 2,
  },
];

const renderHeader = (data: UserResponse) => (
  <div className="flex items-center gap-4">
    {data.avatar && (
      <Avatar className="size-20">
        <AvatarImage
          src={data.avatar.url}
          alt={data.displayName!}
          width={200}
          height={200}
          className="size-20 rounded-full object-cover"
        />
        <AvatarFallback className="bg-linear-to-br from-primary/50 to-secondary/50 text-2xl">
          {data.firstName.charAt(0)} {data.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    )}
    <div>
      <h2 className="text-2xl font-bold">{data.displayName}</h2>
      <p className="text-muted-foreground">{data.email}</p>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline">{data.role}</Badge>
        <Badge variant={getStatusVariant(data.status)}>{data.status}</Badge>
      </div>
    </div>
  </div>
);

const UserDetailsPage = ({ params }: AppPageProps) => {
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

export default UserDetailsPage;
