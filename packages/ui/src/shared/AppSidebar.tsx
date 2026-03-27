"use client";

import * as React from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import {
  IconDotsVertical,
  IconLogout,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import useUser from "@workspace/ui/hooks/user";
import SidebarNav from "@workspace/ui/shared/AppSidebarNav";
import UserCard from "@workspace/ui/shared/UserCard";
import type { NavGroup } from "@workspace/contracts";
import DropdownNav from "./DropdownNav";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  mainMenu: NavGroup[];
  footerMenu?: NavGroup[];
}

const AppSidebar = ({ mainMenu, footerMenu, ...props }: AppSidebarProps) => {
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
        <SidebarNav closeSidebar={closeSidebar} groups={mainMenu} />
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
              <DropdownNav
                groups={footerMenu || []}
                side={isMobile ? "bottom" : "right"}
                header={
                  <DropdownMenuLabel className="p-0 font-normal">
                    <UserCard currentUser={currentUser} isLoading={isLoading} />
                  </DropdownMenuLabel>
                }
                footer={
                  <DropdownMenuItem
                    disabled={isLogoutPending}
                    onClick={logout}
                    className="cursor-pointer"
                  >
                    <IconLogout />
                    Log out
                  </DropdownMenuItem>
                }
              />
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
