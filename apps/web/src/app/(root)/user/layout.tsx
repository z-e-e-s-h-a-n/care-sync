"use client";
import { redirect } from "next/navigation";
import { useAuth } from "@workspace/ui/hooks/auth";
import type { AppLayoutProps } from "@workspace/contracts";
import { Loader2 } from "lucide-react";

const Layout = ({ children }: AppLayoutProps) => {
  const { isLoading, isSuccess, error } = useAuth();

  if (isLoading)
    return (
      <div>
        <Loader2 className="size-12 animate-spin" />
      </div>
    );

  if (!isSuccess) {
    redirect(`/auth/sign-in?error=${error.errorCode}&message=${error.message}`);
  }

  return <>{children}</>;
};

export default Layout;
