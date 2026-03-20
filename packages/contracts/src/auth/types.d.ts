import type z from "zod";
import * as schema from "./schema";
import type { Session } from "@workspace/db/browser";

export type SignInType = z.input<typeof schema.signInSchema>;
export type SignUpType = z.input<typeof schema.signUpSchema>;
export type RequestOtpType = z.input<typeof schema.requestOtpSchema>;
export type ValidateOtpType = z.input<typeof schema.validateOtpSchema>;
export type ResetPasswordType = z.input<typeof schema.resetPasswordSchema>;
export type UpdateMfaType = z.input<typeof schema.updateMfaSchema>;
export type UpdateIdentifierType = z.input<
  typeof schema.updateIdentifierSchema
>;

export interface SignInResponse {
  id: string;
  role: UserRole;
}

export interface ValidateOtpResponse {
  secret?: string;
}

export type SessionResponse = Pick<
  Session,
  | "id"
  | "ip"
  | "isp"
  | "location"
  | "timezone"
  | "deviceType"
  | "deviceInfo"
  | "status"
  | "isTrusted"
  | "lastSeenAt"
  | "createdAt"
  | "expiresAt"
  | "revokedAt"
>;
