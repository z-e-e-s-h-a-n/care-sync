"use client";

import { adminSidebarMenu } from "@workspace/ui/lib/constants";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

interface DashboardLayoutSkeletonProps {
  contentSkeleton: React.ReactNode;
}

const DashboardLayoutSkeleton = ({
  contentSkeleton,
}: DashboardLayoutSkeletonProps) => {
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
      <Sidebar collapsible="icon" className="animate-pulse bg-background">
        <SidebarHeader className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[60%] rounded" />
          <Skeleton className="h-6 w-[40%]" />
        </SidebarHeader>

        <SidebarContent className="mt-6 space-y-4 scrollbar-hidden">
          {sidebarMenu.map(({ groupLabel, items }, index) => (
            <SidebarGroup
              key={index}
              className={cn(index === sidebarMenu.length - 1 ? "mt-auto" : "")}
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

      <SidebarInset>
        <div className="sticky top-0 z-50 h-(--header-height) w-full animate-pulse border-b bg-background px-6">
          <div className="flex h-full items-center justify-between">
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

        <div className="section-wrapper py-12">{contentSkeleton}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayoutSkeleton;
