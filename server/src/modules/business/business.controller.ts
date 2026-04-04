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
import {
  CUBranchDto,
  BranchQueryDto,
  BusinessProfileDto,
} from "@workspace/contracts/business";

import { BusinessService } from "./business.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";

@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Public()
  @Get()
  async getProfile() {
    return this.businessService.getProfile();
  }

  @Roles("admin")
  @Put()
  async upsertProfile(@Body() dto: BusinessProfileDto) {
    return this.businessService.upsertProfile(dto);
  }

  @Roles("admin")
  @Post("branches")
  async createBranch(@Body() dto: CUBranchDto) {
    return this.businessService.createBranch(dto);
  }

  @Get("branches")
  async listBranches(@Query() query: BranchQueryDto) {
    return this.businessService.listBranches(query);
  }

  @Get("branch/:branchId")
  async getBranch(@Param("branchId") branchId: string) {
    return this.businessService.getBranch(branchId);
  }

  @Roles("admin")
  @Put("branch/:branchId")
  async updateBranch(
    @Body() dto: CUBranchDto,
    @Param("branchId") branchId: string,
  ) {
    return this.businessService.updateBranch(dto, branchId);
  }

  @Roles("admin")
  @Delete("branch/:branchId")
  async deleteBranch(@Param("branchId") branchId: string) {
    return this.businessService.deleteBranch(branchId);
  }

  @Roles("admin")
  @Post("branch/:branchId/restore")
  async restoreBranch(@Param("branchId") branchId: string) {
    return this.businessService.restoreBranch(branchId);
  }
}
