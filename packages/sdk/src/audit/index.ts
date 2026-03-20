import { apiClient, executeApi } from "../lib";
import type {
  AuditLogQueryResponse,
  AuditLogQueryType,
  AuditLogResponse,
} from "@workspace/contracts/audit";

export const getAuditLogs = (params?: AuditLogQueryType) =>
  executeApi<AuditLogQueryResponse>(() =>
    apiClient.get("/admin/audit-logs", { params }),
  );

export const getAuditLog = (id: string) =>
  executeApi<AuditLogResponse>(() => apiClient.get(`/admin/audit-logs/${id}`));
