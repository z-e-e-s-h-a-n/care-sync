import ms, { type StringValue } from "ms";
import {
  format,
  differenceInCalendarDays,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { TZDate } from "@date-fns/tz";

export type DateMode =
  | "date"
  | "time"
  | "datetime"
  | "dayCount"
  | "relative"
  | "custom";

/**
 * Convert a human-readable duration into milliseconds or a future timestamp
 */
export const parseDuration = (
  duration: StringValue,
  future = false,
): number => {
  const value = ms(duration);
  if (value === undefined) throw new Error("Invalid duration format");
  return future ? Date.now() + value : value;
};

/**
 * Get a Date object in the future from now based on duration
 */
export const futureDate = (duration: StringValue): Date =>
  new Date(parseDuration(duration, true));

/**
 * Add a duration to an ISO date string and return a new ISO string
 */
export const futureToIsoDate = (
  isoDate: string,
  duration: StringValue,
): string => {
  if (!isoDate) return isoDate;
  const baseDate = new Date(isoDate);
  const durationMs = ms(duration);
  if (!durationMs) throw new Error("Invalid duration format");
  return new Date(baseDate.getTime() + durationMs).toISOString();
};

/**
 * Convert any date input to a Date object in a specific timezone
 */
export const toZonedDate = (
  date: Date | string,
  timeZone: string = "UTC",
): Date => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return new TZDate(parsed, timeZone);
};

/**
 * Format a date according to mode
 */
export const formatDate = (
  date: Date | string,
  mode: DateMode = "date",
  formatString?: string,
  timeZone?: string,
): string => {
  const zonedDate = toZonedDate(
    typeof date === "string" ? parseISO(date) : date,
    timeZone,
  );

  switch (mode) {
    case "time":
      return format(zonedDate, "hh:mm a");
    case "datetime":
      return format(zonedDate, formatString || "dd MMM yyyy, hh:mm a");
    case "relative":
      return formatDistanceToNow(zonedDate, { addSuffix: true });
    case "dayCount": {
      const days = Math.abs(differenceInCalendarDays(new Date(), zonedDate));
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
    case "custom":
      return format(zonedDate, formatString || "dd MMM yyyy");
    case "date":
    default:
      return format(zonedDate, "dd MMM yyyy");
  }
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string | number): boolean => {
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return d.getTime() < Date.now();
};

/**
 * Returns difference from now in minutes
 */
export const diffInMinutes = (futureDate: Date | string): number => {
  const date =
    typeof futureDate === "string" ? parseISO(futureDate) : futureDate;
  return Math.max(Math.ceil((date.getTime() - Date.now()) / 1000 / 60), 0);
};

/**
 * Difference in calendar days between two dates
 */
export const diffInDays = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return Math.abs(differenceInCalendarDays(d1, d2));
};

/**
 * Start of day
 */
export const startOfDay = (date: Date | string): Date => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return new Date(d.setHours(0, 0, 0, 0));
};

/**
 * End of day
 */
export const endOfDay = (date: Date | string): Date => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return new Date(d.setHours(23, 59, 59, 999));
};

export const addDays = (dateString?: string, days = 0) => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
