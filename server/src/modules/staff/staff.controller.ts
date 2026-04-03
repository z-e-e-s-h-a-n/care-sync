import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { StaffProfileDto, StaffQueryDto } from "@workspace/contracts/staff";

import { StaffService } from "./staff.service";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles("staff")
  @Get("me")
  me(@User("id") userId: string) {
    return this.staffService.findByUserId(userId);
  }

  @Roles("admin", "doctor")
  @Get()
  list(@Query() query: StaffQueryDto) {
    return this.staffService.list(query);
  }

  @Roles("admin", "doctor")
  @Get(":staffId")
  findOne(@Param("staffId") staffId: string) {
    return this.staffService.findOne(staffId);
  }

  @Roles("admin")
  @Post()
  create(@Body() dto: StaffProfileDto) {
    return this.staffService.create(dto);
  }

  @Roles("admin", "staff")
  @Put(":staffId")
  async update(
    @Param("staffId") staffId: string,
    @Body() dto: StaffProfileDto,
    @User() user: Express.User,
  ) {
    if (user.rol === "staff") {
      await this.staffService.assertStaffAccess(user, staffId);
    }
    return this.staffService.update(staffId, dto);
  }
}
