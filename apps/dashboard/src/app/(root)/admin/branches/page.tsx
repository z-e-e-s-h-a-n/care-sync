"use client";

import { Badge } from "@workspace/ui/components/badge";
import type {
  BranchQueryType,
  BranchResponse,
} from "@workspace/contracts/business";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import ListPage from "@workspace/ui/shared/ListPage";
import type { SearchByOption } from "@workspace/ui/shared/SearchToolbar";

import { useBranches, useDeleteBranch } from "@/hooks/business";

const branchColumns: ColumnConfig<BranchResponse, BranchQueryType>[] = [
  {
    header: "Branch",
    accessor: "name",
    sortKey: "name",
  },
  {
    header: "Slug",
    accessor: "slug",
  },
  {
    header: "Contact",
    accessor: (branch) => (
      <div>
        <div className="text-sm">{branch.email}</div>
        <div className="text-xs text-muted-foreground">{branch.phone}</div>
      </div>
    ),
  },
  {
    header: "Location",
    accessor: (branch) => `${branch.city}, ${branch.country}`,
  },
  {
    header: "Status",
    accessor: (branch) => (
      <Badge variant={getStatusVariant(branch.isActive ? "active" : "inactive")}>
        {branch.isActive ? "active" : "inactive"}
      </Badge>
    ),
  },
  {
    header: "Created",
    accessor: (branch) => formatDate(branch.createdAt),
    sortKey: "createdAt",
  },
];

const branchSearchOptions: SearchByOption<BranchQueryType>[] = [
  { value: "name", label: "Name" },
  { value: "slug", label: "Slug" },
];

const page = () => {
  return (
    <ListPage
      dataKey="branches"
      entityType="branches"
      columns={branchColumns}
      searchByOptions={branchSearchOptions}
      useListHook={useBranches}
      useDeleteHook={useDeleteBranch}
      defaultSortBy="createdAt"
      defaultSearchBy="name"
    />
  );
};

export default page;
