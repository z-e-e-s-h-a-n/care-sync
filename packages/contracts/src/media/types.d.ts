import type z from "zod";
import type {
  mediaQuerySchema,
  mediaUpdateSchema,
} from "./schema";
import type { Media } from "@workspace/db/browser";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { BaseUserResponse } from "../user/types";

export type MediaUpdateType = z.input<typeof mediaUpdateSchema>;
export type MediaQueryType = z.input<typeof mediaQuerySchema>;

export interface MediaResponse extends Sanitize<Media> {
  uploadedBy: BaseUserResponse;
}

export interface MediaQueryResponse extends BaseQueryResponse {
  medias: MediaResponse[];
}
