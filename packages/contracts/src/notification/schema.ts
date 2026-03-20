import z from "zod";
import { PushProviderEnum } from "../lib/enums";

export const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  provider: PushProviderEnum,
});
