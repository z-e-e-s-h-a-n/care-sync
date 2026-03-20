"use client";

import { UserRoleEnum } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";

import { useAdminUsers } from "@/hooks/admin";
import UserCard from "@/components/user/UserCard";
import ListPage from "@/components/shared/ListPage";
import DateWrapper from "@/components/shared/DateWrapper";
import type { ColumnConfig } from "@/components/shared/GenericTable";
import type { SearchByOption } from "@/components/shared/SearchToolbar";
import type { UserResponse } from "@workspace/contracts/user";
import type { UserQueryType } from "@workspace/contracts/admin";

const userColumns: ColumnConfig<UserResponse, UserQueryType>[] = [
  {
    header: "Name",
    accessor: (u) => (
      <div className="flex items-center gap-2 min-w-40">
        <UserCard currentUser={u} variant="avatar" />
        <span className="font-medium text-sm truncate" title={u.displayName}>
          {u.displayName}
        </span>
      </div>
    ),
    sortKey: "displayName",
  },
  {
    header: "Role",
    accessor: (u) => <Badge variant="secondary">{u.role}</Badge>,
    sortKey: "role",
  },
  {
    header: "Status",
    accessor: (u) => (
      <Badge variant={u.status === "suspended" ? "destructive" : "secondary"}>
        {u.status}
      </Badge>
    ),
    sortKey: "status",
  },

  {
    header: "Email",
    accessor: "email",
    sortKey: "email",
  },
  {
    header: "Phone",
    accessor: "phone",
    sortKey: "phone",
  },
  {
    header: "Last Login",
    accessor: (u) =>
      u.lastLoginAt ? <DateWrapper date={u.lastLoginAt} /> : "—",
    sortKey: "lastLoginAt",
  },
  {
    header: "Created",
    accessor: (u) => <DateWrapper date={u.createdAt} />,
    sortKey: "createdAt",
  },
];

const userSearchByOptions: SearchByOption<UserQueryType>[] = [
  { value: "id", label: "User Id" },
  { value: "displayName", label: "Name" },
  { value: "email", label: "Email" },
];

const page = () => {
  return (
    <ListPage
      dataKey="users"
      columns={userColumns}
      searchByOptions={userSearchByOptions}
      useListHook={useAdminUsers}
      defaultSortBy="createdAt"
      defaultSearchBy="displayName"
      filterConfig={{
        key: "role",
        label: "Roles",
        options: UserRoleEnum.options,
      }}
    />
  );
};

export default page;
