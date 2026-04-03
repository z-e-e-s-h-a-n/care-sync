import z from "zod";
import { WeekdayEnum } from "../lib/enums";
import {
  intNumberSchema,
  isoDateSchema,
  optionalStringSchema,
  timeStringSchema,
} from "../lib/schema";

export const availabilityRuleSchema = z.object({
  weekday: WeekdayEnum,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  slotDurationMinute: intNumberSchema.min(5).default(30),
  isActive: z.boolean().default(true),
});

export const blockedTimeSchema = z.object({
  startAt: isoDateSchema,
  endAt: isoDateSchema,
  reason: optionalStringSchema,
});

export const availabilityScheduleSchema = z.object({
  rules: z.array(availabilityRuleSchema).default([]),
  blockedTimes: z.array(blockedTimeSchema).default([]),
});

export const availabilitySlotsQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
});
