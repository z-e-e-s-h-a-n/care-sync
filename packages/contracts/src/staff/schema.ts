import z from "zod";
import { StaffSearchByEnum, StaffSortByEnum } from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  optionalStringSchema,
} from "../lib/schema";

export const staffProfileSchema = z.object({
  userId: idSchema,
  branchId: idSchema,

  title: z.string().min(2),
  specialty: optionalStringSchema,
  bio: optionalStringSchema,
  credentials: z.array(z.string().min(1)).default([]),

  isActive: z.boolean().default(true),
});

export const staffQuerySchema = baseQuerySchema(
  StaffSortByEnum,
  StaffSearchByEnum,
).extend({
  branchId: idSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});
