"use client";

import React, { Suspense } from "react";
import ThemeProvider from "./theme";
import ReactQueryProvider from "./react-query";
import { ConfirmProvider } from "./confirm-dialog";
import { Toaster } from "../components/sonner";
import { TooltipProvider } from "../components/tooltip";
import { DialogProvider } from "./dialog";

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <ConfirmProvider>
            <DialogProvider>
              <Suspense fallback={null}>
                <Toaster />
              </Suspense>
              {children}
            </DialogProvider>
          </ConfirmProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
};

export default ProviderWrapper;
