import type z from "zod";
import { configurePushNotificationsSchema } from "./schema";
import type { Notification } from "@workspace/db/browser";
import type { Sanitize } from "../lib/types";

export type ConfigurePushNotificationsType = z.input<
  typeof configurePushNotificationsSchema
>;
export type NotificationResponse = Sanitize<Notification>;
