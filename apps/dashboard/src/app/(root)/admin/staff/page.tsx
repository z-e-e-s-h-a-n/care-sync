"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useStaffList } from "@/hooks/staff";
import type {
  StaffProfileResponse,
  StaffQueryType,
} from "@workspace/contracts/staff";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import UserAvatar from "@workspace/ui/shared/UserAvatar";

const columns: ColumnConfig<StaffProfileResponse, StaffQueryType>[] = [
  {
    header: "Staff Member",
    accessor: (s) => (
      <div className="flex items-center gap-4 min-w-50">
        <UserAvatar user={s.user} />
        <p className="font-semibold">{s.user?.displayName}</p>
      </div>
    ),
    sortKey: "displayName",
  },
  {
    header: "Title",
    accessor: (s) => <Badge variant="outline">{s.title}</Badge>,
    sortKey: "title",
  },
  {
    header: "Specialty",
    accessor: (s) => s.specialty ?? "Not set",
  },
  {
    header: "Branch",
    accessor: (s) => s.branch?.name ?? "Unassigned",
  },
  {
    header: "Status",
    accessor: (s) => (
      <Badge variant={getStatusVariant(s.isActive ? "active" : "closed")}>
        {s.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const StaffPage = () => {
  return (
    <ListPage
      dataKey="staff"
      canEdit
      columns={columns}
      defaultSortBy="displayName"
      defaultSearchBy="displayName"
      searchByOptions={[
        { label: "Name", value: "displayName" },
        { label: "Email", value: "email" },
        { label: "Title", value: "title" },
      ]}
      useListHook={useStaffList}
      filterConfig={{
        key: "isActive",
        label: "Status",
        options: ["true", "false"],
      }}
    />
  );
};

export default StaffPage;
