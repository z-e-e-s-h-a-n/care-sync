import apiClient, { executeApi } from "../lib/api-client";
import type { AxiosRequestConfig } from "axios";
import type {
  MediaQueryResponse,
  MediaQueryType,
  MediaResponse,
  MediaUpdateType,
} from "@workspace/contracts/media";

export const createMedia = (
  data: FormData,
  config?: AxiosRequestConfig<FormData>,
) =>
  executeApi<MediaResponse>(() =>
    apiClient.post("/media", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    }),
  );

export const findAllMedia = (params?: MediaQueryType) =>
  executeApi<MediaQueryResponse>(() => apiClient.get("/media", { params }));

export const findMedia = (id: string) =>
  executeApi<MediaResponse>(() => apiClient.get(`/media/${id}`));

export const updateMedia = (id: string, data: MediaUpdateType) =>
  executeApi<MediaResponse>(() => apiClient.put(`/media/${id}`, data));

export const deleteMedia = (id: string, force = false) =>
  executeApi<MediaResponse>(() =>
    apiClient.delete(`/media/${id}`, { params: { force } }),
  );

export const restoreMedia = (id: string) =>
  executeApi<MediaResponse>(() => apiClient.post(`/media/${id}/restore`));
