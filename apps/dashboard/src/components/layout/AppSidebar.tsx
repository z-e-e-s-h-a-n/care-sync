"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { appName } from "@workspace/shared/constants";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import useUser from "@/hooks/user";
import NavMain from "@/components/layout/NavMain";
import UserCard from "@/components/user/UserCard";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar();

  const { currentUser, isLoading, logoutUser, isLogoutPending, logoutError } =
    useUser();

  const logout = async () => {
    await logoutUser();
    if (logoutError) {
      toast.error("Error: in Logout User");
    }
    toast.success("Logout Successfully.");
    redirect("/auth/sign-in");
  };

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              onClick={toggleSidebar}
            >
              <IconInnerShadowTop className="size-5!" />
              <span className="transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                {appName.default}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hidden">
        <NavMain closeSidebar={closeSidebar} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <UserCard currentUser={currentUser} isLoading={isLoading} />
                  <IconDotsVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <UserCard currentUser={currentUser} isLoading={isLoading} />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    asChild
                    onClick={closeSidebar}
                  >
                    <Link href="/users/account">
                      <IconUserCircle />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <IconNotification />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLogoutPending}
                  onClick={logout}
                  className="cursor-pointer"
                >
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
