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
  Req,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import {
  MediaCreateDto,
  MediaUpdateDto,
  MediaQueryDto,
} from "@workspace/contracts/media";

import { MediaService } from "./media.service";
import { User } from "@/decorators/user.decorator";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: MediaCreateDto,
    @User("id") userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const abortController = new AbortController();

    const handleAbort = () => {
      abortController.abort(new Error("Client disconnected"));
    };

    const handleClose = () => {
      if (!res.writableEnded) {
        abortController.abort(new Error("Connection closed"));
      }
    };

    req.once("aborted", handleAbort);
    res.once("close", handleClose);

    try {
      return await this.mediaService.createMedia(
        file,
        dto,
        userId,
        abortController.signal,
      );
    } finally {
      req.off("aborted", handleAbort);
      res.off("close", handleClose);
    }
  }

  @Get()
  async findAllMedia(
    @Query() query: MediaQueryDto,
    @User() currentUser: Express.User,
  ) {
    return this.mediaService.findAllMedia(query, currentUser);
  }

  @Get("/:mediaId")
  async findMedia(
    @Param("mediaId") mediaId: string,
    @User() currentUser: Express.User,
  ) {
    return this.mediaService.findMedia(mediaId, currentUser);
  }

  @Put("/:mediaId")
  async updateMedia(
    @Body() dto: MediaUpdateDto,
    @Param("mediaId") mediaId: string,
    @User() currentUser: Express.User,
  ) {
    return this.mediaService.updateMedia(dto, mediaId, currentUser);
  }

  @Delete("/:mediaId")
  async deleteMedia(
    @Param("mediaId") mediaId: string,
    @User() currentUser: Express.User,
  ) {
    return this.mediaService.deleteMedia(mediaId, currentUser);
  }

  @Post("/:mediaId/restore")
  async restoreMedia(
    @Param("mediaId") mediaId: string,
    @User() currentUser: Express.User,
  ) {
    return this.mediaService.restoreMedia(mediaId, currentUser);
  }
}
