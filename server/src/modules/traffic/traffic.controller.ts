import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  CreateTrafficSourceDto,
  TrafficSourceQueryDto,
} from "@workspace/contracts/traffic";

import { TrafficService } from "./traffic.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";

@Controller()
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Public()
  @Post("traffic-sources")
  async create(@Body() dto: CreateTrafficSourceDto) {
    return this.trafficService.create(dto);
  }

  @Roles("admin")
  @Get("admin/traffic-sources")
  async list(@Query() query: TrafficSourceQueryDto) {
    return this.trafficService.list(query);
  }

  @Roles("admin")
  @Get("admin/traffic-sources/:id")
  async findOne(@Param("id") id: string) {
    return this.trafficService.findOne(id);
  }
}
