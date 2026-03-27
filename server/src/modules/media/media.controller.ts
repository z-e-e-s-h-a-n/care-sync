import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  MediaCreateDto,
  MediaUpdateDto,
  MediaQueryDto,
} from "@workspace/contracts/media";

import { MediaService } from "./media.service";
import { User } from "@/decorators/user.decorator";
import { BooleanQuery } from "@/lib/decorators/boolean-query.decorator";
import { Roles } from "@/lib/decorators/roles.decorator";

@Roles("admin")
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: MediaCreateDto,
    @User("id") userId: string,
  ) {
    return this.mediaService.createMedia(file, dto, userId);
  }

  @Get()
  async findAllMedia(@Query() query: MediaQueryDto) {
    return this.mediaService.findAllMedia(query);
  }

  @Get("/:mediaId")
  async findMedia(@Param("mediaId") mediaId: string) {
    return this.mediaService.findMedia(mediaId);
  }

  @Put("/:mediaId")
  async updateMedia(
    @Body() dto: MediaUpdateDto,
    @Param("mediaId") mediaId: string,
  ) {
    return this.mediaService.updateMedia(dto, mediaId);
  }

  @Delete("/:mediaId")
  async deleteMedia(
    @Param("mediaId") mediaId: string,
    @BooleanQuery("force") force: boolean,
  ) {
    return this.mediaService.deleteMedia(mediaId, force);
  }

  @Post("/:mediaId/restore")
  async restoreMedia(@Param("mediaId") mediaId: string) {
    return this.mediaService.restoreMedia(mediaId);
  }
}
