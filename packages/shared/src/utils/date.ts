import ms, { type StringValue } from "ms";
import {
  differenceInCalendarDays,
  formatDistanceToNow,
  parseISO,
  isValid,
} from "date-fns";
import { TZDate } from "@date-fns/tz";

type DateInput = Date | string;
type SafeDateInput = Date | string | number;

type DateFormatMode = "date" | "time" | "datetime" | "shortDate" | "weekday";
type DateMetaMode = "relative" | "dayCount";

type BaseDateOptions = {
  timeZone?: string;
  locale?: string;
  fallback?: string;
};

type FormatDateOptions = BaseDateOptions & {
  mode?: DateFormatMode;
  options?: Intl.DateTimeFormatOptions;
};

type FormatDateMetaOptions = Pick<BaseDateOptions, "fallback"> & {
  mode?: DateMetaMode;
  addSuffix?: boolean;
};

const DEFAULT_TIME_ZONE = "UTC";
const DEFAULT_FALLBACK = "-";

const DEFAULT_INTL_OPTIONS: Record<DateFormatMode, Intl.DateTimeFormatOptions> =
  {
    shortDate: {
      month: "short",
      day: "numeric",
    },
    date: {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
    datetime: {
      dateStyle: "medium",
      timeStyle: "short",
    },
    weekday: {
      weekday: "short",
    },
  };

/**
 * Parse unknown date input into a valid Date
 */
export const parseDate = (date?: DateInput): Date | undefined => {
  if (!date) return undefined;

  const parsed = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsed) ? parsed : undefined;
};

/**
 * Parse unknown date-like input into a valid Date
 */
const parseDateLike = (date: SafeDateInput): Date | undefined => {
  const parsed =
    typeof date === "string"
      ? parseISO(date)
      : date instanceof Date
        ? date
        : new Date(date);

  return isValid(parsed) ? parsed : undefined;
};

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
  const baseDate = parseDate(isoDate);
  if (!baseDate) return isoDate;

  const durationMs = ms(duration);
  if (durationMs === undefined) throw new Error("Invalid duration format");

  return new Date(baseDate.getTime() + durationMs).toISOString();
};

/**
 * Convert any date input to a Date object in a specific timezone
 */
export const toZonedDate = (
  date: DateInput,
  timeZone = DEFAULT_TIME_ZONE,
): Date => {
  const parsed = parseDate(date);
  if (!parsed) throw new Error("Invalid date");
  return new TZDate(parsed, timeZone);
};

/**
 * Format a date using Intl.DateTimeFormat
 */
export const formatDate = (
  date?: DateInput,
  fOptions?: FormatDateOptions,
): string => {
  const {
    mode = "date",
    timeZone,
    locale,
    fallback = DEFAULT_FALLBACK,
    options,
  } = fOptions || {};

  const parsedDate = parseDate(date);
  if (!parsedDate) return fallback;

  try {
    return new Intl.DateTimeFormat(locale, {
      ...DEFAULT_INTL_OPTIONS[mode],
      ...options,
      ...(timeZone ? { timeZone } : {}),
    }).format(parsedDate);
  } catch {
    return fallback;
  }
};

/**
 * Format date metadata like relative time or day count
 */
export const formatDateMeta = (
  date?: DateInput,
  options?: FormatDateMetaOptions,
): string => {
  const {
    mode = "relative",
    fallback = DEFAULT_FALLBACK,
    addSuffix = true,
  } = options || {};

  const parsedDate = parseDate(date);
  if (!parsedDate) return fallback;

  try {
    if (mode === "relative") {
      return formatDistanceToNow(parsedDate, { addSuffix });
    }

    const days = Math.abs(differenceInCalendarDays(new Date(), parsedDate));
    return `${days} day${days !== 1 ? "s" : ""}`;
  } catch {
    return fallback;
  }
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: SafeDateInput): boolean => {
  const parsed = parseDateLike(date);
  return parsed ? parsed.getTime() < Date.now() : false;
};

/**
 * Returns difference from now in minutes
 */
export const diffInMinutes = (date: DateInput): number => {
  const parsed = parseDate(date);
  if (!parsed) return 0;

  return Math.max(Math.ceil((parsed.getTime() - Date.now()) / 1000 / 60), 0);
};

/**
 * Difference in calendar days between two dates
 */
export const diffInDays = (date1: DateInput, date2: DateInput): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);

  if (!d1 || !d2) return 0;
  return Math.abs(differenceInCalendarDays(d1, d2));
};

/**
 * Start of day
 */
export const startOfDay = (date: DateInput): Date => {
  const parsed = parseDate(date);
  if (!parsed) throw new Error("Invalid Date");

  const next = new Date(parsed);
  next.setHours(0, 0, 0, 0);
  return next;
};

/**
 * End of day
 */
export const endOfDay = (date: DateInput): Date => {
  const parsed = parseDate(date);
  if (!parsed) throw new Error("Invalid Date");

  const next = new Date(parsed);
  next.setHours(23, 59, 59, 999);
  return next;
};

/**
 * Extend Date
 */
export const addDays = (date: DateInput, days = 0): Date => {
  const parsed = parseDate(date);
  if (!parsed) throw new Error("Invalid Date");
  const next = new Date(parsed);
  next.setDate(next.getDate() + days);
  return next;
};
