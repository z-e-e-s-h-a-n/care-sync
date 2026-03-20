import { createZodDto } from "nestjs-zod";

import { auditLogQuerySchema } from "./schema";

export class AuditLogQueryDto extends createZodDto(auditLogQuerySchema) {}
