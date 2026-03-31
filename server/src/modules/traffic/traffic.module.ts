import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";

import { TrafficController } from "./traffic.controller";
import { TrafficService } from "./traffic.service";

@Module({
  imports: [AuditModule],
  controllers: [TrafficController],
  providers: [TrafficService],
  exports: [TrafficService],
})
export class TrafficModule {}
