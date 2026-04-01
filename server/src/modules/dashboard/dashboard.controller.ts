import { Controller, Get } from "@nestjs/common";

import { DashboardService } from "./dashboard.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles("admin")
  @Get("admin")
  getAdminOverview() {
    return this.dashboardService.getAdminOverview();
  }

  @Roles("doctor")
  @Get("doctor")
  getDoctorOverview(@User("id") userId: string) {
    return this.dashboardService.getDoctorOverview(userId);
  }
}
