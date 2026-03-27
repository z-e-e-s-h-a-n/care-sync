"use client";
import { FileClock } from "lucide-react";

import type { AuditLogResponse } from "@workspace/contracts/audit";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { GenericDetailsPage } from "@workspace/ui/shared/GenericDetailsPage";
import { useAuditLog } from "@/hooks/audit";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";

const AuditLogDetailsPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage<AuditLogResponse>
      entityId={id}
      entityName="audit log"
      canEdit={false}
      useQuery={useAuditLog}
      renderHeader={(log) => (
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-background/80 p-3">
            <FileClock className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold capitalize">{log.action}</h2>
            <p className="text-muted-foreground">
              {log.entityType} · {log.entityId}
            </p>
          </div>
        </div>
      )}
      sections={[
        {
          title: "Audit Details",
          columns: 2,
          fields: [
            { label: "Action", accessor: "action" },
            { label: "Entity Type", accessor: "entityType" },
            { label: "Entity Id", accessor: "entityId" },
            {
              label: "User",
              accessor: (log) =>
                log.user?.displayName ?? log.userId ?? "System",
            },
            { label: "IP Address", accessor: (log) => log.ip ?? "—" },
            { label: "User Agent", accessor: (log) => log.userAgent ?? "—" },
            { label: "Created At", accessor: "createdAt" },
          ],
        },
      ]}
    >
      {(log) =>
        log.meta ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null
      }
    </GenericDetailsPage>
  );
};

export default AuditLogDetailsPage;
