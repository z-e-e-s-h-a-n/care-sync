import { BadRequestException, Injectable } from "@nestjs/common";
import type {
  MediaCreateDto,
  MediaQueryDto,
  MediaUpdateDto,
} from "@workspace/contracts/media";
import type { Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";
import { CloudinaryService } from "./cloudinary.service";

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createMedia(
    file: Express.Multer.File,
    dto: MediaCreateDto,
    userId: string,
    abortSignal?: AbortSignal,
  ) {
    const uploaded = await this.cloudinary.uploadFile(
      file,
      dto.type,
      abortSignal,
    );

    try {
      if (abortSignal?.aborted) {
        throw new BadRequestException("Upload cancelled");
      }

      const media = await this.prisma.media.create({
        data: {
          ...dto,
          hash: uploaded.hash,
          name: dto.name ?? uploaded.data.original_filename,
          url: uploaded.data.secure_url,
          publicId: uploaded.data.public_id,
          uploadedById: userId,
          size: uploaded.data.bytes,
          resourceType: uploaded.data.resource_type,
          mimeType: `${uploaded.data.resource_type}/${uploaded.data.format}`,
        },
        include: this.mediaInclude,
      });

      return {
        message: "Media uploaded successfully",
        data: media,
      };
    } catch (error) {
      await this.cloudinary
        .deleteFile(uploaded.data.public_id, uploaded.data.resource_type)
        .catch(() => undefined);

      throw error;
    }
  }

  async findAllMedia(query: MediaQueryDto, currentUser: Express.User) {
    const { page, limit, sortBy, sortOrder, search, searchBy, mimeType, type } =
      query;

    const where: Prisma.MediaWhereInput = {};

    where.uploadedById = currentUser.id;
    if (type) where.type = { equals: type };
    if (mimeType) where.mimeType = { contains: mimeType, mode: "insensitive" };

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.MediaWhereInput> = {
        id: { id: search },
        name: {
          name: { contains: search, mode: "insensitive" },
        },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [medias, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.mediaInclude,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      message: "Media fetched successfully",
      data: {
        medias,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMedia(mediaId: string, currentUser: Express.User) {
    const media = await this.prisma.media.findUniqueOrThrow({
      where: { id: mediaId, uploadedById: currentUser.id },
      include: this.mediaInclude,
    });

    return {
      message: "Media fetched successfully",
      data: media,
    };
  }

  async updateMedia(
    dto: MediaUpdateDto,
    mediaId: string,
    currentUser: Express.User,
  ) {
    const updated = await this.prisma.media.update({
      where: { id: mediaId, uploadedById: currentUser.id },
      data: dto,
      include: this.mediaInclude,
    });

    return {
      message: "Media updated successfully",
      data: updated,
    };
  }

  async deleteMedia(mediaId: string, force = false, currentUser: Express.User) {
    const media = await this.prisma.media.findUniqueOrThrow({
      where: { id: mediaId, uploadedById: currentUser.id },
    });

    if (force) {
      await this.cloudinary.deleteFile(media.publicId, media.resourceType);
    }

    await this.prisma.media.delete({
      where: { id: mediaId },
    });

    return {
      message: "Media deleted successfully",
    };
  }

  async restoreMedia(mediaId: string, currentUser: Express.User) {
    await this.prisma.media.update({
      where: { id: mediaId, uploadedById: currentUser.id },
      data: { deletedAt: null },
    });

    return {
      message: "Media restored successfully",
    };
  }

  private mediaInclude = {
    uploadedBy: { omit: { password: true } },
  };
}
