import axios from "axios";
import qs from "qs";
import type { AxiosInstance, AxiosResponse } from "axios";
import { ApiException, type ApiResponse, type ApiSuccess } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

export const setClientUrl = (url: string) => {
  apiClient.defaults.headers["x-client-url"] = url;
};

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["x-client-url"] = APP_URL;

  if (typeof window !== "undefined") {
    if (window.location.pathname === "/auth/sign-in") {
      config.headers["x-trusted-device"] = String(
        config.data?.rememberDevice ?? false,
      );
    }
  }

  return config;
});

export const executeApi = async <T = null>(
  fn: () => Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<ApiSuccess<T>> => {
  try {
    const response = await fn();
    const payload = response.data;

    if (!payload.success) {
      throw new ApiException(payload);
    }

    return payload;
  } catch (err: unknown) {
    if (err instanceof ApiException) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      if (err.code === "ERR_CANCELED") {
        throw new ApiException({
          message: "Request canceled",
          status: 499,
        });
      }

      const res = err.response?.data;

      throw new ApiException({
        message: res?.message ?? "Network error",
        status: res?.status ?? 0,
        action: res?.action,
        errorCode: res?.errorCode,
        meta: res?.meta,
      });
    }

    throw new ApiException({
      message: "Unexpected error",
      status: 0,
    });
  }
};

export default apiClient;
