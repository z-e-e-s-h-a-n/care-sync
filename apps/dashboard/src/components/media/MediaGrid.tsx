"use client";
import { IconCloud } from "@tabler/icons-react";
import type { MediaResponse } from "@workspace/contracts/media";
import { MediaCard } from "./MediaCard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";

interface MediaGridProps {
  medias: MediaResponse[];
  isLoading?: boolean;
  onSelect?: (media: MediaResponse) => void;
}

export function MediaGrid({ medias, isLoading, onSelect }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return medias.length > 0 ? (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      {medias.map((m) => (
        <MediaCard key={m.id} media={m} onSelect={onSelect} />
      ))}
    </div>
  ) : (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCloud />
        </EmptyMedia>
        <EmptyTitle>Cloud Storage Empty</EmptyTitle>
        <EmptyDescription>
          Upload files to your cloud storage to access them anywhere.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
