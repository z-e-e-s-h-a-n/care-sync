import { createZodDto } from "nestjs-zod";
import {
  CUBranchSchema,
  branchQuerySchema,
  businessProfileSchema,
} from "./schema";

export class CUBranchDto extends createZodDto(CUBranchSchema) {}

export class BranchQueryDto extends createZodDto(branchQuerySchema) {}

export class BusinessProfileDto extends createZodDto(businessProfileSchema) {}
