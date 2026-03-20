import Image from "next/image";
import { FileIcon } from "lucide-react";
import type { MediaResponse } from "@workspace/contracts/media";
import { formatDate } from "@workspace/shared/utils";

interface MediaDetailsProps {
  media: MediaResponse;
}

const MediaDetails = ({ media }: MediaDetailsProps) => {
  const isImage = media.mimeType.startsWith("image/");

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        {isImage ? (
          <Image
            src={media.url}
            alt={media.altText ?? media.title}
            fill
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="size-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Detail label="Title" value={media.title} />
        <Detail label="Filename" value={media.title} />
        <Detail label="Type" value={media.mimeType} />
        <Detail label="Size" value={`${(media.size / 1024).toFixed(2)} KB`} />
        <Detail label="Uploaded By" value={media.uploadedBy.displayName} />
        <Detail label="Uploaded On" value={formatDate(media.createdAt)} />
        <Detail label="Visibility" value={media.visibility} />
        {media.notes && <Detail label="Notes" value={media.notes} />}
      </div>
    </div>
  );
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className="font-medium break-all">{value}</span>
  </div>
);

export default MediaDetails;
