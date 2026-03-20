"use client";

import { Badge } from "@workspace/ui/components/badge";
import { AuditActionEnum } from "@workspace/contracts";
import type {
  AuditLogQueryType,
  AuditLogResponse,
} from "@workspace/contracts/audit";

import { useAuditLogs } from "@/hooks/audit";
import ListPage from "@/components/shared/ListPage";
import DateWrapper from "@/components/shared/DateWrapper";
import type { ColumnConfig } from "@/components/shared/GenericTable";
import type { SearchByOption } from "@/components/shared/SearchToolbar";

const auditColumns: ColumnConfig<AuditLogResponse, AuditLogQueryType>[] = [
  {
    header: "Action",
    accessor: (log) => <Badge variant="secondary">{log.action}</Badge>,
    sortKey: "createdAt",
  },
  {
    header: "Entity Type",
    accessor: "entityType",
    sortKey: "entityType",
  },
  {
    header: "Entity Id",
    accessor: "entityId",
  },
  {
    header: "User",
    accessor: (log) => log.user?.displayName ?? log.userId ?? "System",
  },
  {
    header: "Created",
    accessor: (log) => <DateWrapper date={log.createdAt} />,
    sortKey: "createdAt",
  },
];

const auditSearchOptions: SearchByOption<AuditLogQueryType>[] = [
  { value: "entityType", label: "Entity Type" },
  { value: "entityId", label: "Entity Id" },
  { value: "userId", label: "User Id" },
];

const AuditLogsPage = () => {
  return (
    <ListPage
      dataKey={"logs"}
      entityType="audit-logs"
      canEdit={false}
      columns={auditColumns}
      searchByOptions={auditSearchOptions}
      useListHook={useAuditLogs}
      defaultSortBy="createdAt"
      defaultSearchBy="entityType"
      filterConfig={{
        key: "action",
        label: "Action",
        options: AuditActionEnum.options,
      }}
    />
  );
};

export default AuditLogsPage;
