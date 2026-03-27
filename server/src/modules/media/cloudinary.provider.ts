import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY = "CLOUDINARY";

export const cloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    cloudinary.config();
    return cloudinary;
  },
};
