import type z from "zod";
import type { DoctorProfile } from "@workspace/db/browser";
import type {
  doctorProfileSchema,
  doctorQuerySchema,
  reviewDoctorSchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { UserResponse } from "../user/types";
import type { BranchResponse } from "../business/types";
import type { MediaResponse } from "../media/types";

export type DoctorProfileType = z.input<typeof doctorProfileSchema>;
export type ReviewDoctorType = z.input<typeof reviewDoctorSchema>;

export type DoctorQueryType = z.input<typeof doctorQuerySchema>;

export type DoctorProfileResponse = Sanitize<DoctorProfile> & {
  user: UserResponse;
  branch: BranchResponse;
  createdBy?: UserResponse;
  verifiedBy?: UserResponse;
  licenseDocument?: MediaResponse;
};

export interface DoctorQueryResponse extends BaseQueryResponse {
  doctors: DoctorProfileResponse[];
}
