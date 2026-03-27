import { z } from "zod";
import { MfaMethodEnum, OtpPurposeEnum, OtpTypeEnum } from "../lib/enums";
import { identifierSchema, nameSchema, passwordSchema } from "../lib/schema";

export const signInSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
});

export const signUpSchema = signInSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema.optional(),
});

export const requestOtpSchema = z.object({
  identifier: identifierSchema,
  purpose: OtpPurposeEnum,
});

export const validateOtpSchema = requestOtpSchema.extend({
  secret: z.string().min(6),
  type: OtpTypeEnum.default("numericCode"),
});

export const resetPasswordSchema = validateOtpSchema.extend({
  newPassword: passwordSchema,
});

export const updateMfaSchema = validateOtpSchema.extend({
  preferredMfa: MfaMethodEnum,
});

export const updateIdentifierSchema = validateOtpSchema.extend({
  newIdentifier: identifierSchema,
});
