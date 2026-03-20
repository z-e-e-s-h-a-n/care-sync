import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate, type DateMode } from "@workspace/shared/utils";

interface DateWrapperProps {
  date?: Date | string | number | null;
  mode?: DateMode;
  formatString?: string;
  fallback?: React.ReactNode;
  className?: string;
  timeZone?: string;
  title?: string;
}

const DateWrapper = ({
  date,
  title,
  mode = "date",
  formatString,
  fallback = "—",
  className = "text-sm",
  timeZone = "UTC",
}: DateWrapperProps) => {
  if (!date) return <span className={className}>{fallback}</span>;

  const parsedDate =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  if (isNaN(parsedDate.getTime()))
    return <span className={className}>{fallback}</span>;

  const formatted = formatDate(parsedDate, mode, formatString, timeZone);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {title && <span>{title}</span>}
      <span>{formatted}</span>
    </div>
  );
};

export default DateWrapper;
