"use client";
import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { useAuth } from "@/hooks/auth";
import Header from "@/components/layout/Header";
import AppSidebar from "@/components/layout/AppSidebar";
import RootLayoutSkeleton from "@/components/skeleton/RootLayoutSkeleton";
import type { AppLayoutProps } from "@workspace/contracts";

const Layout = ({ children }: AppLayoutProps) => {
  const { isLoading, isSuccess, error } = useAuth();

  if (isLoading) return <RootLayoutSkeleton />;

  if (!isSuccess) {
    redirect(`/auth/sign-in?error=${error.errorCode}&message=${error.message}`);
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header />
        <div className="section-wrapper">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
