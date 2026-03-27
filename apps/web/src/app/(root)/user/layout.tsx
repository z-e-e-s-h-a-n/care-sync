"use client";
import { redirect } from "next/navigation";
import { useAuth } from "@workspace/ui/hooks/auth";
import UserLayoutSkeleton from "@/components/UserLayoutSkeleton";
import type { AppLayoutProps } from "@workspace/contracts";

const Layout = ({ children }: AppLayoutProps) => {
  const { isLoading, isSuccess, error } = useAuth();

  if (isLoading) return <UserLayoutSkeleton />;

  if (!isSuccess) {
    redirect(`/auth/sign-in?error=${error.errorCode}&message=${error.message}`);
  }

  return <div className="section-wrapper">{children}</div>;
};

export default Layout;
