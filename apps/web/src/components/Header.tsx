"use client";

import Link from "next/link";

import { IconLogout } from "@tabler/icons-react";

import useUser from "@workspace/ui/hooks/use-user";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import UserCard from "@workspace/ui/shared/UserCard";
import Logo from "@workspace/ui/shared/Logo";
import { headerMenu, userMenu } from "@/lib/constants";
import DropdownNav from "@workspace/ui/shared/DropdownNav";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import ThemeSwitch from "@workspace/ui/components/theme-toggle";
import { useNotifications } from "@workspace/ui/hooks/use-notification";
import HeaderActionsSkeleton from "./skeletons/HeaderActions";

const Header = () => {
  const { currentUser, isLoading, logoutUser, isLogoutPending, logoutError } =
    useUser();

  const { unreadCount } = useNotifications(!!currentUser);

  const logout = async () => {
    await logoutUser();
    if (logoutError) {
      toast.error("Error: in Logout User");
    }
    toast.success("Logout Successfully.");
    redirect("/");
  };

  return (
    <header className="section-wrapper sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur py-2">
      <div className="section-container flex items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-5 lg:flex">
          {headerMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser && (
            <Button
              href="/user/notifications"
              aria-label="Open notifications"
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 min-w-5 px-1.5 text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          )}
          {!isLoading && <ThemeSwitch variant="classic" />}
          {currentUser ? (
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
          ) : isLoading ? (
            <HeaderActionsSkeleton />
          ) : (
            <>
              <div className="hidden sm:flex gap-2">
                <Button href="/auth/sign-in" variant="ghost">
                  Sign in
                </Button>
                <Button href="/auth/sign-up">Create account</Button>
              </div>

              <Button href="/auth/sign-in" className="sm:hidden">
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
