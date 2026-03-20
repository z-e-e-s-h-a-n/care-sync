import z from "zod";
import { nameSchema } from "../lib/schema";
import { ThemeModeEnum, MessagingChannelEnum } from "../lib/enums";

export const userProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  displayName: nameSchema,
  imageId: z.string().optional(),

  preferredTheme: ThemeModeEnum.default("system"),
  fallbackChannel: MessagingChannelEnum.default("sms"),

  pushNotifications: z.boolean().optional(),
  loginAlerts: z.boolean().default(true),
});
