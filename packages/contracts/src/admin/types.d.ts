import type z from "zod";
import { CUUserSchema, userQuerySchema } from "./schema";
import type { BaseQueryResponse } from "../lib/types";
import type { UserResponse } from "../user/types";

export type CUUserType = z.input<typeof CUUserSchema>;
export type UserQueryType = z.input<typeof userQuerySchema>;

export interface UserQueryResponse extends BaseQueryResponse {
  users: UserResponse[];
}
