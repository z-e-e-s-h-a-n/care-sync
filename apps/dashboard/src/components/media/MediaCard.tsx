"use client";

import Image from "next/image";
import { toast } from "sonner";
import type {
  MediaResponse,
  MediaUpdateType,
} from "@workspace/contracts/media";
import {
  MoreVertical,
  Trash2,
  Download,
  ImageIcon,
  FileIcon,
  Edit,
  Info,
} from "lucide-react";

import { useDialog } from "@workspace/ui/hooks/use-dialog";
import { useConfirm } from "@workspace/ui/hooks/use-confirm";
import { cn, handleDownload } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import MediaDetails from "./MediaDetails";
import MediaForm from "@/components/forms/MediaForm";
import { useDeleteMedia, useUpdateMedia } from "@/hooks/media";

interface MediaCardProps {
  media: MediaResponse;
  onSelect?: (media: MediaResponse) => void;
}

export function MediaCard({ media, onSelect }: MediaCardProps) {
  const { openDialog, closeDialog } = useDialog();
  const { confirm } = useConfirm();
  const { updateAsync } = useUpdateMedia(media.id);
  const { deleteAsync, isDeleting } = useDeleteMedia();
  const isImage = media.mimeType.startsWith("image/");

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    await deleteAsync({ id });
  };

  const handleUpdate = async (data: MediaUpdateType) => {
    try {
      await updateAsync(data);
      toast.success("Media Updated Successfully.");
      closeDialog();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(media)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-background transition-all duration-300 ease-out",
        onSelect && "cursor-pointer hover:ring-2 hover:ring-primary",
      )}
    >
      {/* Preview */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {isImage ? (
          <Image
            src={media.url}
            alt={media.filename}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="size-10 text-muted-foreground" />
          </div>
        )}

        {/* Top overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out" />

        {/* Actions */}
        <div className="absolute top-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-all sm:duration-300 ease-out">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="size-8 rounded-full"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40 [&>div]:cursor-pointer"
            >
              <DropdownMenuItem
                onClick={() =>
                  openDialog({
                    title: "Media Details",
                    content: <MediaDetails media={media} />,
                  })
                }
              >
                <Info />
                Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="w-full"
                onClick={() =>
                  openDialog({
                    title: "Update Media Form",
                    content: (
                      <MediaForm
                        media={media}
                        isPublic
                        onSubmit={handleUpdate}
                      />
                    ),
                  })
                }
              >
                <Edit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(media)}>
                <Download />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(media.id)}
                disabled={isDeleting}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File type badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          {isImage ? (
            <ImageIcon className="size-3" />
          ) : (
            <FileIcon className="size-3" />
          )}
          {media.mimeType.split("/")[1]}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium">{media.title}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span> {(media.size / 1024).toFixed(1)} KB</span>
          <span>{new Date(media.createdAt).toLocaleDateString()}</span>
        </div>
        <span className="truncate text-[11px] text-muted-foreground">
          By: {media.uploadedBy.displayName}
        </span>
      </div>
    </div>
  );
}
