import { useContext } from "react";
import * as media from "@workspace/sdk/media";
import { createCrudHooks } from "./crud";
import { MediaLibraryContext } from "../provider/media-library";

export function useMediaLibrary() {
  const ctx = useContext(MediaLibraryContext);
  if (!ctx) {
    throw new Error("useMediaLibrary must be used within MediaLibraryProvider");
  }
  return ctx;
}

export const {
  useEntity: useMedia,
  useEntities: useMedias,
  useCreateEntity: useCreateMedia,
  useUpdateEntity: useUpdateMedia,
  useDeleteEntity: useDeleteMedia,
  useRestoreEntity: useRestoreMedia,
} = createCrudHooks(
  {
    findOne: media.findMedia,
    findAll: media.findAllMedia,
    create: media.createMedia,
    update: media.updateMedia,
    delete: media.deleteMedia,
    restore: media.restoreMedia,
  },
  {
    single: "media",
    list: "mediaList",
  },
);
