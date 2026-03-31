import type { Request } from "express";
import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { Roles } from "@/decorators/roles.decorator";
import { Public } from "@/decorators/public.decorator";
import {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  UpdateContactMessageDto,
} from "@workspace/contracts/contact";

@Controller("contact")
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Public()
  @Post()
  async createMessage(
    @Body() dto: CreateContactMessageDto,
    @Req() req: Request,
  ) {
    return this.service.createMessage(dto, req);
  }

  @Roles("admin")
  @Get()
  async queryMessages(@Query() query: ContactMessageQueryDto) {
    return this.service.queryMessages(query);
  }

  @Roles("admin")
  @Get(":id")
  async getMessage(@Param("id") id: string) {
    return this.service.getMessage(id);
  }

  @Roles("admin")
  @Put(":id/reply")
  async replyMessage(
    @Param("id") id: string,
    @Body() dto: UpdateContactMessageDto,
  ) {
    return this.service.updateMessage(id, dto);
  }
}
