import type { OAuthProvider } from "@workspace/contracts";
import { API_URL, apiClient, executeApi } from "../lib";
import type {
  RequestOtpType,
  SessionResponse,
  SignInResponse,
  SignInType,
  SignUpType,
  UpdateIdentifierType,
  UpdateMfaType,
  ValidateOtpResponse,
  ValidateOtpType,
  ResetPasswordType,
} from "@workspace/contracts/auth";

/* =========================
   AUTH
   ========================= */

export const signUp = (data: SignUpType) =>
  executeApi(() => apiClient.post("/auth/signup", data));

export const signIn = (data: SignInType) =>
  executeApi<SignInResponse>(() => apiClient.post("/auth/signin", data));

export const signOut = () => executeApi(() => apiClient.post("/auth/signout"));

/* =========================
   OTP
   ========================= */

export const requestOtp = (data: RequestOtpType) =>
  executeApi(() => apiClient.post("/auth/request-otp", data));

export const validateOtp = (params: ValidateOtpType) =>
  executeApi<ValidateOtpResponse>(() =>
    apiClient.get("/auth/validate-otp", { params }),
  );

/* =========================
   PASSWORD / MFA
   ========================= */

export const resetPassword = (data: ResetPasswordType) =>
  executeApi(() => apiClient.post("/auth/reset-password", data));

export const updateMfa = (data: UpdateMfaType) =>
  executeApi(() => apiClient.post("/auth/update-mfa", data));

/* =========================
   IDENTIFIER CHANGE
   ========================= */

export const requestUpdateIdentifier = (data: UpdateIdentifierType) =>
  executeApi(() => apiClient.post("/auth/request-update-identifier", data));

export const verifyUpdateIdentifier = (params: UpdateIdentifierType) =>
  executeApi(() => apiClient.get("/auth/verify-update-identifier", { params }));

/* =========================
   OAuth
   ========================= */

export const redirectToOAuth = (provider: OAuthProvider) => {
  if (typeof window === "undefined") return;
  const redirectUrl = window.location.origin;
  window.location.href = `${API_URL}/oauth/${provider}?redirectUrl=${redirectUrl}`;
};

/* =========================
   Sessions
   ========================= */

export const listSessions = () =>
  executeApi<SessionResponse[]>(() => apiClient.get("/auth/sessions"));

export const revokeAllSessions = () =>
  executeApi(() => apiClient.delete("/auth/sessions"));

export const revokeSession = (id: string) =>
  executeApi(() => apiClient.delete(`/auth/sessions/${id}`));

export const validateSession = () =>
  executeApi<SignInResponse>(() => apiClient.get("/auth/session/validate"));
