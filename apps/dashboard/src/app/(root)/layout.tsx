"use client";

import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { useAuth } from "@workspace/ui/hooks/auth";
import RootLayoutSkeleton from "@/components/skeleton/RootLayoutSkeleton";
import type { AppLayoutProps } from "@workspace/contracts";
import AppSidebar from "@workspace/ui/shared/AppSidebar";
import SidebarHeader from "@workspace/ui/shared/AppSidebarHeader";
import { getSidebarMenu, footerSidebarMenu } from "@/lib/constants";

const DashboardLayout = ({ children }: AppLayoutProps) => {
  const { data, isLoading, isSuccess, error } = useAuth();
  const sidebarMenu = getSidebarMenu(data?.role);

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
      <AppSidebar
        variant="inset"
        mainMenu={sidebarMenu}
        footerMenu={footerSidebarMenu}
      />
      <SidebarInset>
        <SidebarHeader appType="dashboard" />
        <div className="section-wrapper sm:py-6 md:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
