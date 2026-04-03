"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
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
import { IconLogout, IconShoppingCart } from "@tabler/icons-react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";
import { userSidebarMenu } from "@workspace/ui/lib/constants";
import Logo from "@workspace/ui/shared/Logo";
import { useLocalCart } from "@/hooks/use-local-cart";
import { useServerCart } from "@/hooks/healthcare";
import FloatingCtas from "./FloatingCtas";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

const CartIcon = () => {
  const { currentUser } = useUser();
  const { count: localCount } = useLocalCart();
  const { data: serverCart } = useServerCart(Boolean(currentUser));
  const serverCount =
    serverCart?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;
  const count = currentUser ? serverCount : localCount;

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center size-10 rounded-full border border-border/60 bg-card/60 hover:bg-card transition"
      aria-label="Shopping cart"
    >
      <IconShoppingCart className="size-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

const Header = () => {
  const pathname = usePathname();
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-50 pt-5">
        <div className="section">
          <div className="flex items-center justify-between rounded-full border border-card/70 bg-card/70 px-3 py-3 shadow-card backdrop-blur md:px-6">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <CartIcon />

            {!currentUser && (
              <Button href="/auth/sign-in" variant="outline">
                Sign in
              </Button>
            )}
            <Button
              variant="gradient"
              className="cta-pluse hidden px-3 sm:px-4 md:inline-flex"
              onClick={() => setIsAppointmentOpen(true)}
            >
              <span>Book Appointment</span>
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

      <FloatingCtas>
        <Button
          variant="gradient"
          size="lg"
          className="cta-pluse h-12 rounded-full px-5 shadow-lg"
          onClick={() => setIsAppointmentOpen(true)}
        >
          <CalendarDays className="size-4.5" />
          Book Appointment
        </Button>
      </FloatingCtas>

      <Sheet open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b border-border/60 pb-5">
            <SheetTitle className="text-xl">Book Appointment</SheetTitle>
            <SheetDescription>
              Share a few details and our team will help you schedule the right visit.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 sm:p-6">
            <AppointmentForm />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
