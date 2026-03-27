"use client";

import React, { Suspense } from "react";
import ThemeProvider from "./theme";
import ReactQueryProvider from "./react-query";
import { ConfirmProvider } from "./confirm-dialog";
import { Toaster } from "../components/sonner";
import { TooltipProvider } from "../components/tooltip";
import { DialogProvider } from "./dialog";
import { MediaLibraryProvider } from "./media-library";

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <DialogProvider>
          <ConfirmProvider>
            <TooltipProvider>
              <Suspense fallback={null}>
                <Toaster />
              </Suspense>
              <MediaLibraryProvider>{children}</MediaLibraryProvider>
            </TooltipProvider>
          </ConfirmProvider>
        </DialogProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
};

export default ProviderWrapper;
