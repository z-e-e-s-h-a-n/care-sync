import type z from "zod";
import type { StaffProfile } from "@workspace/db/browser";
import type { staffProfileSchema, staffQuerySchema } from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { UserResponse } from "../user/types";
import type { BranchResponse } from "../business/types";

export type StaffProfileType = z.input<typeof staffProfileSchema>;
export type StaffQueryType = z.input<typeof staffQuerySchema>;

export type StaffProfileResponse = Sanitize<StaffProfile> & {
  user: UserResponse;
  branch: BranchResponse;
};

export interface StaffQueryResponse extends BaseQueryResponse {
  staff: StaffProfileResponse[];
}
