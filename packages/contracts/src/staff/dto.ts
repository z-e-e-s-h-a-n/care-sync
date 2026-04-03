import { createZodDto } from "nestjs-zod";
import { staffProfileSchema, staffQuerySchema } from "./schema";

export class StaffProfileDto extends createZodDto(staffProfileSchema) {}

export class StaffQueryDto extends createZodDto(staffQuerySchema) {}
