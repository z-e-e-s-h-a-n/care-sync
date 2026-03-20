import { Global, Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { CloudinaryService } from "./cloudinary.service";
import { cloudinaryProvider } from "./cloudinary.provider";

@Global()
@Module({
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService, cloudinaryProvider],
  exports: [CloudinaryService],
})
export class MediaModule {}
