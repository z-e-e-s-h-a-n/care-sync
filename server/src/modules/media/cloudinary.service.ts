import { createHash } from "crypto";
import * as streamifier from "streamifier";
import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { type UploadApiResponse, v2 as Cloudinary } from "cloudinary";

import { PrismaService } from "@/modules/prisma/prisma.service";
import { EnvService } from "../env/env.service";
import { CLOUDINARY } from "./cloudinary.provider";

@Injectable()
export class CloudinaryService {
  private readonly rootFolder: string;

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
  ) {
    this.rootFolder = this.env.get("CLOUDINARY_ROOT_FOLDER");
  }

  async uploadFile(
    file: Express.Multer.File,
    subFolder: string,
  ): Promise<{ data: UploadApiResponse; hash: string }> {
    if (!file) throw new BadRequestException("No file provided");

    const hash = createHash("sha256").update(file.buffer).digest("hex");

    const existing = await this.prisma.media.findUnique({
      where: { hash },
    });

    if (existing) {
      throw new BadRequestException("File already uploaded");
    }

    const assetFolder = `${this.rootFolder}/${subFolder}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          asset_folder: assetFolder,
          use_asset_folder_as_public_id_prefix: true,
          resource_type: "auto",
          public_id: hash,
          overwrite: false,
          tags: [this.rootFolder, subFolder],
        },
        (error, res) => {
          if (error) return reject(error);
          if (!res) return reject(new BadRequestException("Upload failed"));
          resolve(res);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    return { data: result, hash };
  }

  async deleteFile(publicId: string, resourceType: string) {
    const res = await this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (res.result !== "ok" && res.result !== "not found") {
      throw new BadRequestException("Failed to delete file from Cloudinary");
    }

    return res;
  }
}
