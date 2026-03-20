import z from "zod";

import { baseQuerySchema, idSchema } from "../lib/schema";
import {
  AuditActionEnum,
  AuditLogSearchByEnum,
  AuditLogSortByEnum,
} from "../lib/enums";

export const auditLogQuerySchema = baseQuerySchema(
  AuditLogSortByEnum,
  AuditLogSearchByEnum,
).extend({
  action: AuditActionEnum.optional(),
  userId: idSchema.optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});
