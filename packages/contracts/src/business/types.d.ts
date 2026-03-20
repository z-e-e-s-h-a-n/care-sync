import type z from "zod";
import type {
  businessAddressSchema,
  businessPhoneSchema,
  businessProfileSchema,
} from "./schema";
import type { BusinessProfile } from "@workspace/db/browser";
import type { Sanitize } from "../lib/types";
import type { MediaResponse } from "../media/types";

export type BusinessProfileType = z.input<typeof businessProfileSchema>;
export type BusinessPhone = z.input<typeof businessPhoneSchema>;
export type BusinessAddress = z.input<typeof businessAddressSchema>;

export interface BusinessProfileResponse extends Sanitize<BusinessProfile> {
  whatsapp: BusinessPhone;
  fax: BusinessPhone[];
  phones: BusinessPhone[];
  addresses: BusinessAddress[];
  logo: MediaResponse;
  favicon: MediaResponse;
  cover?: MediaResponse;
}
