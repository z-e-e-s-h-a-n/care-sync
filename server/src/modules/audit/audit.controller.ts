import { Controller, Get, Param, Query } from "@nestjs/common";
import { AuditLogQueryDto } from "@workspace/contracts/audit";

import { AuditService } from "./audit.service";
import { Roles } from "@/decorators/roles.decorator";

@Roles("admin")
@Controller("admin/audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(@Query() query: AuditLogQueryDto) {
    return this.auditService.list(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.auditService.findOne(id);
  }
}
