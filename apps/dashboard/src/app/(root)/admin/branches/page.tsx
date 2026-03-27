"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useBranches } from "@/hooks/healthcare";
import type {
  BranchResponse,
  BranchQueryType,
} from "@workspace/contracts/branch";

const columns: ColumnConfig<BranchResponse, BranchQueryType>[] = [
  { header: "Branch", accessor: "name", sortKey: "name" },
  { header: "Slug", accessor: "slug" },
  { header: "Email", accessor: (branch) => branch.email ?? "N/A" },
  { header: "Doctors", accessor: (branch) => branch.doctors?.length ?? 0 },
];

export default function BranchesPage() {
  return (
    <ListPage
      dataKey="branches"
      entityType="branches"
      canEdit={false}
      columns={columns}
      useListHook={useBranches}
      defaultSortBy="name"
      defaultSearchBy="name"
      searchByOptions={[
        { label: "Branch", value: "name" },
        { label: "Slug", value: "slug" },
      ]}
    />
  );
}
