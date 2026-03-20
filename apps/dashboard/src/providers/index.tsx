"use client";

import React from "react";
import BaseProviderWrapper from "@workspace/ui/provider-wrapper";
import { MediaLibraryProvider } from "./media-library";

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseProviderWrapper>
      <MediaLibraryProvider>{children}</MediaLibraryProvider>
    </BaseProviderWrapper>
  );
};

export default ProviderWrapper;
