"use client";

import React, { createContext, useCallback, useRef, useState } from "react";
import type { MediaResponse } from "@workspace/contracts/media";
import LibraryPopup from "@/components/media/LibraryPopup";

type MediaLibraryContextType = {
  onMediaSelect: (onSelect: (media: MediaResponse) => void) => void;
};

export const MediaLibraryContext =
  createContext<MediaLibraryContextType | null>(null);

export function MediaLibraryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const onMediaSelectRef = useRef<((media: MediaResponse) => void) | null>(
    null,
  );

  const onMediaSelect = useCallback(
    (onSelect: (media: MediaResponse) => void) => {
      onMediaSelectRef.current = onSelect;
      setOpen(true);
    },
    [],
  );

  const handleMediaSelect = useCallback((media: MediaResponse) => {
    onMediaSelectRef.current?.(media);
    setOpen(false);
  }, []);

  return (
    <MediaLibraryContext.Provider value={{ onMediaSelect }}>
      {children}

      <LibraryPopup
        open={open}
        setOpen={setOpen}
        onSelect={handleMediaSelect}
      />
    </MediaLibraryContext.Provider>
  );
}
