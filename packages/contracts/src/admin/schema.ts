import z from "zod";
import {
  SafeUserRoleEnum,
  UserSearchByEnum,
  UserSortByEnum,
  UserStatusEnum,
} from "../lib/enums";
import { baseQuerySchema, nameSchema, passwordSchema } from "../lib/schema";
import { signUpSchema } from "../auth";

export const CUUserSchema = signUpSchema.extend({
  role: SafeUserRoleEnum,
  displayName: nameSchema,
  status: UserStatusEnum,
  password: passwordSchema.optional(),
});

export const userQuerySchema = baseQuerySchema(
  UserSortByEnum,
  UserSearchByEnum,
).extend({
  role: SafeUserRoleEnum.optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  status: UserStatusEnum.optional(),
});
