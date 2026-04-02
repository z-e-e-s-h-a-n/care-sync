"use client";

import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { useAuth } from "@workspace/ui/hooks/use-auth";
import AppSidebar from "@workspace/ui/shared/AppSidebar";
import AppSidebarHeader from "./AppSidebarHeader";
import { footerSidebarMenu, getSidebarMenu } from "../lib/constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
  skelton?: React.ReactNode;
  appType: "web" | "dashboard";
}

const DashboardLayout = ({ children, skelton }: DashboardLayoutProps) => {
  const { data, isLoading, isSuccess, error } = useAuth();

  if (isLoading) return skelton;

  if (!isSuccess || !data) {
    redirect(`/auth/sign-in?error=${error.errorCode}&message=${error.message}`);
  }

  const sidebarMenu = getSidebarMenu(data?.role);

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
        <AppSidebarHeader />
        <div className="section-wrapper py-12">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
