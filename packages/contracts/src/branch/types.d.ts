import type z from "zod";
import type { Branch } from "@workspace/db/browser";
import type { branchSchema, branchQuerySchema } from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { DoctorProfileResponse } from "../doctor/types";

export type BranchType = z.input<typeof branchSchema>;

export type BranchQueryType = z.input<typeof branchQuerySchema>;

export type BranchResponse = Sanitize<Branch> & {
  doctors?: DoctorProfileResponse[];
};

export interface BranchQueryResponse extends BaseQueryResponse {
  branches: BranchResponse[];
}
