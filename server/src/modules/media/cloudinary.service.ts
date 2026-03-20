import { createHash } from "crypto";
import * as streamifier from "streamifier";
import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { type UploadApiResponse, v2 as Cloudinary } from "cloudinary";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY") private readonly cloudinary: typeof Cloudinary,
    private readonly prisma: PrismaService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder = "posts",
  ): Promise<{ data: UploadApiResponse; hash: string }> {
    if (!file) throw new BadRequestException("No file provided");

    const hash = createHash("sha256").update(file.buffer).digest("hex");

    const existing = await this.prisma.media.findUnique({
      where: { hash },
    });

    if (existing) {
      throw new BadRequestException("File already uploaded");
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: hash,
          overwrite: false,
        },
        (error, res) => {
          if (error) reject(error);
          else resolve(res!);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    return { data: result, hash };
  }

  async deleteFile(publicId: string) {
    const res = await this.cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    if (res.result !== "ok" && res.result !== "not found") {
      throw new BadRequestException("Failed to delete file from Cloudinary");
    }

    return res;
  }
}
