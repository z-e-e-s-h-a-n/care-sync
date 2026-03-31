import type z from "zod";
import type { PatientProfile } from "@workspace/db/browser";
import type { patientProfileSchema, patientQuerySchema } from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { UserResponse } from "../user/types";
import type { MediaResponse } from "../media/types";

export type PatientProfileType = z.input<typeof patientProfileSchema>;

export type PatientQueryType = z.input<typeof patientQuerySchema>;

export type PatientProfileResponse = Sanitize<PatientProfile> & {
  user: UserResponse;
  identificationDocument?: MediaResponse;
};

export interface PatientQueryResponse extends BaseQueryResponse {
  patients: PatientProfileResponse[];
}
