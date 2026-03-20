import { createZodDto } from "nestjs-zod";
import { registerPushTokenSchema } from "./schema";

export class RegisterPushTokenDto extends createZodDto(
  registerPushTokenSchema,
) {}
