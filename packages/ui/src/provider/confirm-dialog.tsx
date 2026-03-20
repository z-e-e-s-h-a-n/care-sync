"use client";

import React, { createContext, useCallback, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

/* ========== Types ========== */
export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

/* ========== Context ========== */
export const ConfirmContext = createContext<ConfirmContextType | null>(null);

/* ========== Defaults ========== */
const DEFAULTS: Required<ConfirmOptions> = {
  title: "Are you sure you want to delete this item?",
  description: "This item will be moved to trash. You can restore it later.",
  confirmText: "Move to trash",
  cancelText: "Cancel",
};

/* ========== Provider ========== */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolverRef = useRef<(value: boolean) => void>(undefined);

  const confirm = useCallback((opts?: ConfirmOptions): Promise<boolean> => {
    setOptions(opts ?? {});
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolverRef.current?.(true);
    resolverRef.current = undefined;
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolverRef.current?.(false);
    resolverRef.current = undefined;
    setIsOpen(false);
  };

  const merged = { ...DEFAULTS, ...options };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <AlertDialogContent className="gap-8">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="text-lg sm:text-xl font-semibold">
              {merged.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {merged.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {merged.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {merged.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
