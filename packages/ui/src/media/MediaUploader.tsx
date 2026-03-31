"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import { Edit, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { createMedia } from "@workspace/sdk/media";
import {
  MediaTypeEnum,
  type MediaType,
  type MediaVisibility,
} from "@workspace/contracts";
import type {
  MediaResponse,
  MediaUpdateType,
} from "@workspace/contracts/media";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useConfirm } from "@workspace/ui/hooks/use-confirm";
import { useDialog } from "@workspace/ui/hooks/use-dialog";
import MediaForm from "@workspace/ui/forms/MediaForm";
import {
  MediaUploadPlaceholder,
  MediaUploadQueueItem,
  type MediaUploadQueueItemData,
} from "./media-upload-surface";

const MAX_FILES = 10;
const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT = "image/*";

const PUBLIC_TYPES: MediaType[] = [];

type UploadQueueItem = MediaUploadQueueItemData & {
  uploadedMedia?: MediaResponse;
  metadata: MediaUpdateType;
};

interface MediaUploaderProps {
  onSelect?: (media: MediaResponse) => void;
}

function MediaUploader({ onSelect }: MediaUploaderProps) {
  const queryClient = useQueryClient();
  const { openDialog, closeDialog } = useDialog();
  const { confirm } = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef(new Map<string, AbortController>());

  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [type, setType] = useState<MediaType>("other");

  const visibility: MediaVisibility = PUBLIC_TYPES.includes(type)
    ? "public"
    : "private";

  const isUploading = items.some((item) => item.status === "uploading");
  const hasQueuedItems = items.some(
    (item) => item.status === "pending" || item.status === "error",
  );
  const canAddMore = items.length < MAX_FILES;

  const description = useMemo(
    () =>
      `Only images • Max ${MAX_FILES} files • ${MAX_SIZE / (1024 * 1024)}MB each`,
    [],
  );

  const addFiles = (files: File[]) => {
    const accepted: UploadQueueItem[] = [];
    const availableSlots = MAX_FILES - items.length;

    if (availableSlots <= 0) {
      toast.error(`You can upload up to ${MAX_FILES} files at a time.`);
      return;
    }

    for (const file of files.slice(0, availableSlots)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }

      if (file.size > MAX_SIZE) {
        toast.error(
          `${file.name} is larger than ${MAX_SIZE / (1024 * 1024)}MB.`,
        );
        continue;
      }

      accepted.push({
        id: ulid(),
        file,
        progress: 0,
        status: "pending",
        displayName: file.name,
        metadata: {
          name: file.name,
          altText: "",
          notes: "",
        },
      });
    }

    if (files.length > availableSlots) {
      toast.error(
        `Only ${availableSlots} more file(s) can be added right now.`,
      );
    }

    if (accepted.length > 0) {
      setItems((prev) => [...prev, ...accepted]);
    }
  };

  const updateItemMetadata = (itemId: string, metadata: MediaUpdateType) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              metadata,
              displayName: metadata.name,
            }
          : item,
      ),
    );
  };

  const openEditDialog = (item: UploadQueueItem) => {
    openDialog({
      title: "Edit Upload Details",
      content: (
        <MediaForm
          media={item.metadata}
          isPublic
          title="Upload Details"
          description="Save a custom file name, alt text, and notes for this queued upload."
          submitLabel="Save Details"
          onSubmit={(data) => {
            updateItemMetadata(item.id, data);
            closeDialog();
          }}
        />
      ),
    });
  };

  const uploadItem = async (itemId: string) => {
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem || currentItem.status === "uploading") {
      return;
    }

    const abortController = new AbortController();
    abortControllersRef.current.set(itemId, abortController);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: "uploading", progress: 0 }
          : item,
      ),
    );

    try {
      const formData = new FormData();
      formData.append("file", currentItem.file);
      formData.append("type", type);
      formData.append("visibility", visibility);
      formData.append("name", currentItem.metadata.name.trim());

      if (currentItem.metadata.altText?.trim()) {
        formData.append("altText", currentItem.metadata.altText.trim());
      }

      if (currentItem.metadata.notes?.trim()) {
        formData.append("notes", currentItem.metadata.notes.trim());
      }

      const result = await createMedia(formData, {
        signal: abortController.signal,
        onUploadProgress: (event) => {
          const total = event.total ?? currentItem.file.size;
          const progress = total
            ? Math.min(100, Math.round((event.loaded / total) * 100))
            : 0;

          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, progress } : item,
            ),
          );
        },
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "success",
                progress: 100,
                uploadedMedia: result.data,
              }
            : item,
        ),
      );

      await queryClient.invalidateQueries({ queryKey: ["mediaList"] });
      toast.success(`${currentItem.metadata.name} uploaded`);
    } catch (err: any) {
      if (err?.status === 499) {
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: "error", progress: 0 } : item,
        ),
      );

      if (err?.status === 409) {
        toast.error("Upload failed", {
          description: `${currentItem.metadata.name} already exists`,
        });
      } else {
        toast.error(`${currentItem.metadata.name} failed`, {
          description: err?.message,
        });
      }
    } finally {
      abortControllersRef.current.delete(itemId);
    }
  };

  const uploadAll = async () => {
    const targetIds = items
      .filter((item) => item.status === "pending" || item.status === "error")
      .map((item) => item.id);

    await Promise.all(targetIds.map((itemId) => uploadItem(itemId)));
  };

  const removeItem = async (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    if (item.status === "uploading") {
      const ok = await confirm({
        title: "Cancel this upload?",
        description: "The current file upload will be aborted immediately.",
        confirmText: "Cancel upload",
        cancelText: "Keep uploading",
      });

      if (!ok) {
        return;
      }

      abortControllersRef.current.get(itemId)?.abort();
      toast.success(`${item.metadata.name} upload canceled`);
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCompleted = () => {
    setItems((prev) => prev.filter((item) => item.status !== "success"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4 md:min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              Media Type:
            </p>
            <Select
              value={type}
              onValueChange={(value) => setType(value as MediaType)}
            >
              <SelectTrigger className="capitalize md:w-52">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MediaTypeEnum.options.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="capitalize"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            {items.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                Clear Uploaded
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={uploadAll}
              disabled={!hasQueuedItems}
            >
              <Upload />
              Upload All
            </Button>
          </div>
        </div>

        <MediaUploadPlaceholder
          onClick={() => inputRef.current?.click()}
          onDropFiles={addFiles}
          disabled={!canAddMore}
          description={description}
        />

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            addFiles(files);
            event.currentTarget.value = "";
          }}
        />
      </div>

      {items.length > 0 ? (
        <>
          <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
            Each upload keeps its own details. Use{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Edit className="size-4" />
              Edit
            </span>{" "}
            on a row before uploading if you want a custom name, alt text, or
            notes.
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <MediaUploadQueueItem
                key={item.id}
                item={item}
                leftActionLabel="Edit"
                onLeftAction={() => openEditDialog(item)}
                leftActionDisabled={
                  item.status === "uploading" || item.status === "success"
                }
                onStart={() => uploadItem(item.id)}
                onRetry={() => uploadItem(item.id)}
                onRemove={() => removeItem(item.id)}
                actionLabel={
                  item.uploadedMedia && onSelect ? "Select" : undefined
                }
                onAction={
                  item.uploadedMedia && onSelect
                    ? () => onSelect(item.uploadedMedia!)
                    : undefined
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default MediaUploader;
