"use client";

import React, { createContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@workspace/ui/components/dialog";

/* ========== Types ========== */
export type DialogOptions = {
  title: string;
  description?: string;
  content: React.ReactNode;
};

type DialogContextType = {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
};

/* ========== Context ========== */
export const DialogContext = createContext<DialogContextType | null>(null);

/* ========== Provider ========== */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [_openDialog, _setOpenDialog] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const openDialog = (opts: DialogOptions) => {
    setOptions(opts);
    _setOpenDialog(true);
  };

  const closeDialog = () => {
    _setOpenDialog(false);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <Dialog open={_openDialog} onOpenChange={_setOpenDialog}>
        <DialogContent className="gap-8">
          {options && (
            <>
              <div className="sr-only">
                <DialogTitle>{options.title}</DialogTitle>
                {options.description && (
                  <DialogDescription>{options.description}</DialogDescription>
                )}
              </div>

              {options.content}
            </>
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}
