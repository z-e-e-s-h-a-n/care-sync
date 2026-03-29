import { cn } from "../lib/utils";

type InfoNoticeProps = {
  message: string;
  variant?: "warning" | "info" | "error";
  className?: string;
};

const variantClasses = {
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-green-200 bg-green-50 text-green-900",
  default: "border-gray-200 bg-gray-50 text-gray-900",
};

export function InfoNotice({
  message,
  variant = "warning",
  className,
}: InfoNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
