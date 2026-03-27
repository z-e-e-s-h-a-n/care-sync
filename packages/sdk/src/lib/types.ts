export type AuthAction =
  | "verifyIdentifier"
  | "verifyMfa"
  | "setPassword"
  | "updateIdentifier";

export interface BaseApiResponse {
  status: number;
  message: string;
  action?: AuthAction;
  meta?: Record<string, any>;
}

export interface ApiSuccess<T> extends BaseApiResponse {
  success: true;
  data: T;
}

export interface ApiError extends BaseApiResponse {
  success: false;
  errorCode?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiException extends Error {
  status: number;
  action?: AuthAction;
  errorCode?: string;
  meta?: Record<string, any>;

  constructor(payload: {
    message?: string;
    status?: number;
    action?: AuthAction;
    errorCode?: string;
    meta?: Record<string, any>;
  }) {
    super(payload.message ?? "Network Error");
    this.name = "ApiException";
    this.status = payload.status ?? 0;
    this.action = payload.action;
    this.errorCode = payload.errorCode;
    this.meta = payload.meta;
  }
}
