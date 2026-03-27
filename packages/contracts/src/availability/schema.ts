import z from "zod";
import { WeekdayEnum } from "../lib/enums";
import {
  isoDateSchema,
  nullableStringSchema,
  timeStringSchema,
} from "../lib/schema";

export const availabilityRuleSchema = z.object({
  weekday: WeekdayEnum,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  slotDurationMinute: z.coerce.number().int().min(5).default(30),
  isActive: z.boolean().default(true),
});

export const blockedTimeSchema = z.object({
  startAt: isoDateSchema,
  endAt: isoDateSchema,
  reason: nullableStringSchema,
});

export const availabilityScheduleSchema = z.object({
  rules: z.array(availabilityRuleSchema).default([]),
  blockedTimes: z.array(blockedTimeSchema).default([]),
});

export const availabilitySlotsQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
});
