import { Button } from "@workspace/ui/components/button";
import React from "react";

interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  href?: string;
}

const SectionHeader = ({
  subtitle,
  title,
  href,
  description,
}: SectionHeaderProps) => {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          {subtitle}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-foreground/50 mt-2">{description}</p>
        )}
      </div>
      {href && (
        <Button href={href} variant="ghost">
          View all
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
