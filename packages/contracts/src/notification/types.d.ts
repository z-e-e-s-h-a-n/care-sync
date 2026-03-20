import type z from "zod";
import { registerPushTokenSchema } from "./schema";
import type { Notification } from "@workspace/db/browser";
import type { Sanitize } from "../lib/types";

export type RegisterPushTokenType = z.input<typeof registerPushTokenSchema>;
export type NotificationResponse = Sanitize<Notification>;
