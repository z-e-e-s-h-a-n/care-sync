"use client";

import React from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { FormField, type BaseFieldProps } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import { toast } from "sonner";
import { useMediaLibrary } from "@/hooks/media";
import type { MediaResponse } from "@workspace/contracts/media";

export interface MediaFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  label?: string;
  defaultMedia?: MediaResponse;
}

export const MediaField = <TFormData,>({
  label,
  defaultMedia,
  ...props
}: MediaFieldProps<TFormData>) => {
  const [preview, setPreview] = React.useState(defaultMedia?.url);
  const { onMediaSelect } = useMediaLibrary();

  React.useEffect(() => {
    setPreview(defaultMedia?.url);
  }, [defaultMedia?.url]);

  return (
    <FormField {...props}>
      {(field) => {
        const selectMedia = () => {
          onMediaSelect((media) => {
            try {
              field.onChange(media.id);
              setPreview(media.url);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              toast.error(err?.message || "Failed to set media");
            }
          });
        };

        const handleRemove = () => {
          setPreview(undefined);
          field.onChange(undefined);
        };

        return (
          <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-medium">{label}</label>}

            {preview ? (
              <div className="relative group">
                <div className="relative w-full h-48 rounded-md border border-input overflow-hidden bg-muted">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={selectMedia}
                    >
                      <Upload className="size-4" /> Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                    >
                      <X className="size-4" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md hover:bg-muted"
                onClick={selectMedia}
              >
                <ImageIcon className="size-12 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Click to select media
                </span>
              </Button>
            )}
          </div>
        );
      }}
    </FormField>
  );
};
