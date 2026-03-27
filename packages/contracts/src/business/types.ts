import type z from "zod";
import type { businessProfileSchema } from "./schema";
import type { BusinessProfile } from "@workspace/db/browser";
import type { Sanitize } from "../lib/types";
import type { MediaResponse } from "../media/types";

export type BusinessProfileType = z.input<typeof businessProfileSchema>;

export interface BusinessProfileResponse extends Sanitize<BusinessProfile> {
  logo: MediaResponse;
  favicon: MediaResponse;
  cover?: MediaResponse;
}
