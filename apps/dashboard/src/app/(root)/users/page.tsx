"use client";

import { Badge } from "@workspace/ui/components/badge";
import { LoaderCircle } from "lucide-react";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAdminMutations, useAdminUsers } from "@/hooks/admin";
import useUser from "@workspace/ui/hooks/use-user";
import type { UserQueryType } from "@workspace/contracts/admin";
import type { UserResponse } from "@workspace/contracts/user";
import { SafeUserRoleEnum } from "@workspace/contracts";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const columns: ColumnConfig<UserResponse, UserQueryType>[] = [
  {
    header: "User",
    accessor: (user) => user.displayName,
    sortKey: "displayName",
  },
  {
    header: "Email",
    accessor: (user) => user.email ?? "N/A",
    sortKey: "email",
  },
  {
    header: "Phone",
    accessor: (user) => user.phone ?? "N/A",
    sortKey: "phone",
  },
  {
    header: "Role",
    accessor: (user) => (
      <Badge variant="outline" className="capitalize">
        {user.role}
      </Badge>
    ),
    sortKey: "role",
  },
  {
    header: "Status",
    accessor: (user) => (
      <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
    ),
    sortKey: "status",
  },
];

const Page = () => {
  const { currentUser, isLoading } = useUser();

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading users...
      </div>
    );
  }

  const isDoctor = currentUser.role === "doctor";

  return (
    <ListPage<UserResponse, UserQueryType, "users">
      dataKey="users"
      entityType={isDoctor ? "Patients" : "users"}
      canAdd
      canEdit
      columns={columns}
      defaultParams={isDoctor ? { role: "patient" } : undefined}
      defaultSortBy="displayName"
      defaultSearchBy="displayName"
      searchByOptions={[
        { label: "Name", value: "displayName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "ID", value: "id" },
      ]}
      useListHook={useAdminUsers}
      useDeleteHook={isDoctor ? undefined : useAdminMutations}
      filterConfig={
        isDoctor
          ? undefined
          : {
              key: "role",
              label: "Role",
              options: SafeUserRoleEnum.options,
            }
      }
    />
  );
};

export default Page;
