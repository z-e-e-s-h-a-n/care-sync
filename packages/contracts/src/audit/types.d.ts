import type z from "zod";
import type { auditLogQuerySchema } from "./schema";
import type { AuditLog } from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { BaseUserResponse } from "../user/types";

export type AuditLogQueryType = z.input<typeof auditLogQuerySchema>;

export interface AuditLogResponse extends Sanitize<AuditLog> {
  user?: BaseUserResponse;
}

export interface AuditLogQueryResponse extends BaseQueryResponse {
  logs: AuditLogResponse[];
}
