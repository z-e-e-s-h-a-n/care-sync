import z from "zod";
import { PushProviderEnum } from "../lib/enums";

export const configurePushNotificationsSchema = z
  .object({
    enabled: z.boolean(),
    token: z.string().min(1).optional(),
    provider: PushProviderEnum.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) return;

    if (!value.token) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["token"],
        message: "Token is required when enabling push notifications.",
      });
    }

    if (!value.provider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["provider"],
        message: "Provider is required when enabling push notifications.",
      });
    }
  });
