import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CUUserDto, UserQueryDto } from "@workspace/contracts/admin";

import { AdminService } from "./admin.service";
import { Roles } from "@/decorators/roles.decorator";
import { BooleanQuery } from "@/decorators/boolean-query.decorator";

@Roles("admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("users")
  createUser(@Body() dto: CUUserDto) {
    return this.adminService.createUser(dto);
  }

  @Get("users")
  findAllUsers(@Query() query: UserQueryDto) {
    return this.adminService.findAllUsers(query);
  }

  @Get("users/:userId")
  async findUser(@Param("userId") userId: string) {
    return this.adminService.findUser(userId);
  }

  @Put("users/:userId")
  async updateUser(@Body() dto: CUUserDto, @Param("userId") userId: string) {
    return this.adminService.updateUser(dto, userId);
  }

  @Delete("users/:userId")
  async deleteUser(
    @Param("userId") userId: string,
    @BooleanQuery("force") force: boolean,
  ) {
    return this.adminService.deleteUser(userId, force);
  }

  @Post("users/:userId/restore")
  async restoreUser(@Param("userId") userId: string) {
    return this.adminService.restoreUser(userId);
  }
}
