import type { ReactNode } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
}: PageHeaderProps) {
  const isCenter = align === "center";

  return (
    <section className={cn("pt-6 sm:pt-8", className)}>
      <div className="section">
        <div className="relative overflow-hidden rounded-4xl  bg-linear-to-br from-primary via-primary/85 to-primary px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-14">
          <div className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-size-[46px_46px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_84%_24%,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_55%_88%,rgba(255,255,255,0.12),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary/60 via-secondary/30 to-transparent" />

          <div
            className={cn(
              "relative space-y-5",
              isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
            )}
          >
            <Badge
              variant="secondary"
              appearance="solid"
              className="w-fit border-white/25 bg-white/12 px-4 py-2 text-white backdrop-blur-sm"
            >
              {eyebrow}
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
              {description}
            </p>
            {actions ? (
              <div
                className={cn(
                  "flex flex-wrap gap-4 pt-2",
                  isCenter && "justify-center",
                )}
              >
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
