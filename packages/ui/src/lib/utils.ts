import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import type { BadgeVariants } from "../components/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const copyToClipboard = async (text: string, label: string) => {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export const handleDownload = async (media: { url: string; name: string }) => {
  try {
    const response = await fetch(media.url);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = media.name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch {
    toast.error("Failed to download file.");
  }
};

export const getBackPath = (pathname: string, count = 1) => {
  const segments = pathname.split("/").filter(Boolean);

  if (count <= 0) return pathname;

  return (
    "/" + segments.slice(0, Math.max(segments.length - count, 0)).join("/")
  );
};

export const getStatusVariant = (status: string): BadgeVariants["variant"] => {
  const map: Record<string, BadgeVariants["variant"]> = {
    pending: "warning",
    active: "success",
    suspended: "destructive",
    verified: "success",
    rejected: "destructive",
    booked: "success",
    confirmed: "info",
    cancelled: "destructive",
    completed: "success",
    noShow: "warning",
    succeeded: "success",
    failed: "destructive",
    refunded: "warning",
    processed: "success",
    paid: "success",
    processing: "info",
    shipped: "info",
    delivered: "success",
    draft: "outline",
    scheduled: "success",
    sent: "success",
    partial: "warning",
    open: "info",
    closed: "destructive",
    revoked: "destructive",
    expired: "warning",
    default: "default",
  };

  return map[status] ?? "secondary";
};
