"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { headerMenu } from "@/lib/constants";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import useUser from "@workspace/ui/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import UserCard from "@workspace/ui/shared/UserCard";
import DropdownNav from "@workspace/ui/shared/DropdownNav";
import { IconLogout } from "@tabler/icons-react";
import { toast } from "sonner";
import { useDialog } from "@workspace/ui/hooks/use-dialog";
import AppointmentForm from "./AppointmentForm";
import { userSidebarMenu } from "@workspace/ui/lib/constants";
import Logo from "@workspace/ui/shared/Logo";

const Header = () => {
  const pathname = usePathname();
  const { openDialog } = useDialog();

  const { currentUser, isLoading, logoutUser, isLogoutPending, logoutError } =
    useUser();

  const logout = async () => {
    await logoutUser();
    if (logoutError) {
      toast.error("Error: in Logout User");
    }
    toast.success("Logout Successfully.");
    redirect("/");
  };

  return (
    <header className="sticky top-0 z-50 pt-5">
      <div className="section">
        <div className="flex items-center justify-between rounded-full border border-card/70 bg-card/70 px-4 py-3 shadow-card backdrop-blur md:px-6">
          <Logo />

          <nav className="hidden items-center gap-6 lg:flex">
            {headerMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                    isActive && "font-medium text-primary",
                  )}
                >
                  {isActive && (
                    <div className="size-1.5 bg-primary rounded-full" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {!currentUser && (
              <Button href="/auth/sign-in" variant="outline">
                Sign in
              </Button>
            )}
            <Button
              variant="gradient"
              className="cta-pluse"
              onClick={() =>
                openDialog({
                  title: "Book Appointment",
                  content: <AppointmentForm />,
                })
              }
            >
              Book Appointment
            </Button>
            {currentUser && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <UserCard
                      variant="avatar"
                      currentUser={currentUser}
                      isLoading={isLoading}
                      avatarSize="size-12"
                    />
                  </DropdownMenuTrigger>
                  <DropdownNav
                    groups={userSidebarMenu}
                    header={
                      <DropdownMenuLabel className="p-0 font-normal">
                        <UserCard
                          currentUser={currentUser}
                          isLoading={isLoading}
                        />
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
