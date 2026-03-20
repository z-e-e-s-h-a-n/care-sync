import { createZodDto } from "nestjs-zod";
import { userProfileSchema } from "./schema";

export class UserProfileDto extends createZodDto(userProfileSchema) {}
