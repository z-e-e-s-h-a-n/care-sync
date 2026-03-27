import z from "zod";
import { BranchSearchByEnum, BranchSortByEnum } from "../lib/enums";
import {
  baseQuerySchema,
  nullableStringSchema,
  slugSchema,
} from "../lib/schema";

export const branchSchema = z.object({
  name: z.string().min(2),
  slug: slugSchema,
  email: nullableStringSchema,
  phone: nullableStringSchema,
  whatsapp: nullableStringSchema,
  address: nullableStringSchema,
  timezone: nullableStringSchema,
  officeHoursDays: nullableStringSchema,
  officeHoursTime: nullableStringSchema,
  isActive: z.boolean().default(true),
});

export const branchQuerySchema = baseQuerySchema(
  BranchSortByEnum,
  BranchSearchByEnum,
).extend({
  isActive: z.coerce.boolean().optional(),
});
