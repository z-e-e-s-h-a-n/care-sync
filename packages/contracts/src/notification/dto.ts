import { createZodDto } from "nestjs-zod";
import { configurePushNotificationsSchema } from "./schema";

export class ConfigurePushNotificationsDto extends createZodDto(
  configurePushNotificationsSchema,
) {}
