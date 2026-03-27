import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BranchDto, BranchQueryDto } from "@workspace/contracts/branch";

import { BranchService } from "./branch.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";

@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Roles("admin")
  @Post()
  create(@Body() dto: BranchDto) {
    return this.branchService.create(dto);
  }

  @Public()
  @Get()
  list(@Query() query: BranchQueryDto) {
    return this.branchService.list(query);
  }

  @Public()
  @Get(":branchId")
  findOne(@Param("branchId") branchId: string) {
    return this.branchService.findOne(branchId);
  }

  @Roles("admin")
  @Put(":branchId")
  update(@Param("branchId") branchId: string, @Body() dto: BranchDto) {
    return this.branchService.update(branchId, dto);
  }
}
