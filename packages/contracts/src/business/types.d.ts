import type z from "zod";
import type {
  CUBranchSchema,
  branchQuerySchema,
  businessProfileSchema,
} from "./schema";
import type {
  Branch,
  BranchTiming,
  BusinessProfile,
} from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { MediaResponse } from "../media/types";
import type { DoctorProfileDto } from "../doctor";

export type BranchQueryType = z.input<typeof branchQuerySchema>;
export type CUBranchType = z.input<typeof CUBranchSchema>;
export type BusinessProfileType = z.input<typeof businessProfileSchema>;

export type BranchTimingResponse = Sanitize<BranchTiming>;
export type BranchResponse = Sanitize<Branch> & {
  branchTimings: BranchTimingResponse[];
  doctors: DoctorProfileDto[];
};

export interface BusinessProfileResponse extends Sanitize<BusinessProfile> {
  logo: MediaResponse;
  favicon: MediaResponse;
  cover?: MediaResponse;
  branches: BranchResponse[];
}

export interface BranchQueryResponse extends BaseQueryResponse {
  branches: BranchResponse[];
}
