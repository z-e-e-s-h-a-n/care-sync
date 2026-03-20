import { createZodDto } from "nestjs-zod";
import { CUUserSchema, userQuerySchema } from "./schema";

export class CUUserDto extends createZodDto(CUUserSchema) {}

export class UserQueryDto extends createZodDto(userQuerySchema) {}
