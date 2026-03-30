import z from "zod";
import { nameSchema } from "../lib/schema";
import { ThemeModeEnum } from "../lib/enums";

export const userProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  displayName: nameSchema,
  avatarId: z.string().optional(),

  preferredTheme: ThemeModeEnum.default("system"),
  loginAlerts: z.boolean().default(true),
});
