"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { type Accept, useDropzone } from "react-dropzone";

import {
  MediaTypeEnum,
  type MediaType,
  type MediaVisibility,
} from "@workspace/contracts";
import { cn } from "@workspace/ui/lib/utils";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useCreateMedia } from "@/hooks/media";

const MAX_FILES = 1;
const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT: Accept = { "image/*": [] };

const PUBLIC_TYPES: MediaType[] = [];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(2)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MediaUploader() {
  const { createAsync, isCreating } = useCreateMedia();
  const [files, setFiles] = useState<File[]>([]);
  const [type, setType] = useState<MediaType>("other");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [notes, setNotes] = useState("");

  const visibility: MediaVisibility = PUBLIC_TYPES.includes(type)
    ? "public"
    : "private";

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles.slice(0, MAX_FILES));
  };

  const uploadSequentially = async () => {
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("visibility", visibility);
        if (title.trim()) formData.append("title", title.trim());
        if (altText.trim()) formData.append("altText", altText.trim());
        if (notes.trim()) formData.append("notes", notes.trim());

        await createAsync(formData);

        toast.success(`${file.name} uploaded`);
        setFiles([]);
        setTitle("");
        setAltText("");
        setNotes("");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.status === 409) {
          toast.error("Upload failed", {
            description: `${file.name} already exists`,
          });
        } else {
          toast.error(`${file.name} failed`, {
            description: err?.message,
          });
        }
      }
    }
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: files.length > 0,
  });

  const maxSizeMB = Math.round(MAX_SIZE / (1024 * 1024));

  return (
    <div className="space-y-4">
      {/* TYPE SELECT */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground font-medium">Media Type:</p>
        <Select value={type} onValueChange={(val) => setType(val as MediaType)}>
          <SelectTrigger className="capitalize">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MediaTypeEnum.options.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">Media Details</p>
              <p className="text-xs text-muted-foreground">
                Add optional metadata now to keep the media library organized.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="media-title">
                Title
              </label>
              <Input
                id="media-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hero banner, office logo, team photo..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="media-alt-text">
                Alt Text
              </label>
              <Input
                id="media-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Short accessible description"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="media-notes">
                Notes
              </label>
              <Textarea
                id="media-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional internal notes for this media asset"
              />
            </div>
          </div>

          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={200}
                  height={200}
                  className="size-12 object-cover rounded-md"
                />
                <div>
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFile(file)}
                disabled={isCreating}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={uploadSequentially} disabled={isCreating}>
              {isCreating ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}

      {/* DROPZONE */}
      {files.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed px-6 py-10 text-center cursor-pointer transition",
            "border-muted hover:border-primary hover:bg-primary/10",
            isDragActive && "border-primary bg-primary/10",
          )}
        >
          <Input {...getInputProps()} />
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Only images • Max 1 file • {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
