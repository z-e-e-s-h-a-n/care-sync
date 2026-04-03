"use client";

import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface FloatingCtasProps {
  children: ReactNode;
  className?: string;
}

export default function FloatingCtas({
  children,
  className,
}: FloatingCtasProps) {
  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
