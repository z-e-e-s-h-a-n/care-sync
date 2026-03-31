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
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {isImage ? (
          <Image
            src={media.url}
            alt={media.altText ?? media.name}
            fill
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="size-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Detail label="Name" value={media.name} />
        <Detail label="Filename" value={media.name} />
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
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="break-all font-medium">{value}</span>
  </div>
);

export default MediaDetails;
