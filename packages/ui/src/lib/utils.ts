import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const copyToClipboard = async (text: string, label: string) => {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export const handleDownload = async (media: {
  url: string;
  filename: string;
}) => {
  try {
    const response = await fetch(media.url);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = media.filename;
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
