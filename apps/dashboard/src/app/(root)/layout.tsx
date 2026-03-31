"use client";

import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { useAuth } from "@workspace/ui/hooks/use-auth";
import RootLayoutSkeleton from "@/components/skeleton/RootLayoutSkeleton";
import type { AppLayoutProps } from "@workspace/contracts";
import AppSidebar from "@workspace/ui/shared/AppSidebar";
import Header from "@/components/dashboard/Header";
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
        <Header />
        <div className="section-wrapper py-12">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
