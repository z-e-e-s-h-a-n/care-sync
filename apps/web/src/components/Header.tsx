"use client";

import { Dot, HeartPulse, Menu } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { headerMenu, userMenu } from "@/lib/constants";
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MedMe</span>
          </div>

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
                    groups={userMenu}
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
