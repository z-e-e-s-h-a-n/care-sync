import { createZodDto } from "nestjs-zod";
import { branchSchema, branchQuerySchema } from "./schema";

export class BranchDto extends createZodDto(branchSchema) {}
export class BranchQueryDto extends createZodDto(branchQuerySchema) {}
