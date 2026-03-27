"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  SidebarProvider,
  SidebarInset,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import DashboardSkeleton from "./DashboardSke1eton";
import { adminSidebarMenu } from "@/lib/constants";

const RootLayoutSkeleton = () => {
  const sidebarMenu = adminSidebarMenu;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Left Sidebar Skeleton */}
      <Sidebar collapsible="icon" className="bg-background animate-pulse">
        {/* Sidebar Header */}
        <SidebarHeader className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[60%] rounded" />
          <Skeleton className="h-6 w-[40%]" />
        </SidebarHeader>

        {/* Sidebar Groups */}
        <SidebarContent className="mt-6 space-y-4 scrollbar-hidden">
          {sidebarMenu.map(({ groupLabel, items }, i) => (
            <SidebarGroup
              key={i}
              className={cn(i === sidebarMenu.length - 1 ? "mt-auto" : "")}
            >
              <SidebarGroupContent className="flex flex-col gap-2">
                {groupLabel && (
                  <SidebarGroupLabel>
                    <Skeleton className="h-4 w-20" />
                  </SidebarGroupLabel>
                )}
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-full" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Sidebar Footer / User */}
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Right Content */}
      <SidebarInset>
        {/* Header Skeleton */}
        <div className="sticky top-0 z-50 w-full h-(--header-height) border-b bg-background px-6 animate-pulse">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="hidden md:block">
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Dashboard Skeleton */}
        <DashboardSkeleton />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayoutSkeleton;
