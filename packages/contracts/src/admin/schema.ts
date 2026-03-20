import z from "zod";
import {
  UserRoleEnum,
  UserSearchByEnum,
  UserSortByEnum,
  UserStatusEnum,
} from "../lib/enums";
import { baseQuerySchema, nameSchema, passwordSchema } from "../lib/schema";
import { signUpSchema } from "../auth";

export const CUUserSchema = signUpSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  role: UserRoleEnum,
  displayName: nameSchema,
  status: UserStatusEnum,
  password: passwordSchema.optional(),
});

export const userQuerySchema = baseQuerySchema(
  UserSortByEnum,
  UserSearchByEnum,
).extend({
  role: UserRoleEnum.optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  status: UserStatusEnum.optional(),
});
