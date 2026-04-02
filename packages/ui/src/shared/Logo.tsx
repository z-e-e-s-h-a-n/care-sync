"use client";
import Link from "next/link";
import { useTheme } from "@workspace/ui/hooks/use-theme";
import { cn } from "../lib/utils";
import { HeartPulse } from "lucide-react";

interface LogoProps {
  href?: string;
  className?: string;
}

const Logo = ({ href = "/", className }: LogoProps) => {
  const { theme } = useTheme();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3",
        theme === "dark" ? "" : "",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <HeartPulse className="size-5" />
      </div>
      <span className="text-lg font-semibold tracking-tight">MedMe</span>
    </Link>
  );
};

export default Logo;
