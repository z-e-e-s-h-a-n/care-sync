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
import { User } from "@/decorators/user.decorator";

@Controller("users")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles("admin", "doctor")
  @Post()
  createUser(@Body() dto: CUUserDto, @User() user: Express.User) {
    return this.adminService.createUser(dto, user);
  }

  @Roles("admin", "doctor")
  @Get()
  findAllUsers(@Query() query: UserQueryDto, @User() user: Express.User) {
    return this.adminService.findAllUsers(query, user);
  }

  @Roles("admin", "doctor")
  @Get(":userId")
  async findUser(@Param("userId") userId: string) {
    return this.adminService.findUser(userId);
  }

  @Roles("admin")
  @Put(":userId")
  async updateUser(@Body() dto: CUUserDto, @Param("userId") userId: string) {
    return this.adminService.updateUser(dto, userId);
  }

  @Roles("admin")
  @Delete(":userId")
  async deleteUser(
    @Param("userId") userId: string,
    @BooleanQuery("force") force: boolean,
  ) {
    return this.adminService.deleteUser(userId, force);
  }

  @Roles("admin")
  @Post(":userId/restore")
  async restoreUser(@Param("userId") userId: string) {
    return this.adminService.restoreUser(userId);
  }
}
