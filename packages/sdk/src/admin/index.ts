import { apiClient, executeApi } from "../lib";
import type {
  CUUserType,
  UserQueryResponse,
  UserQueryType,
} from "@workspace/contracts/admin";
import type { UserResponse } from "@workspace/contracts/user";

export const createUser = (data: CUUserType) => {
  return executeApi<UserResponse>(() => apiClient.post("/admin/users", data));
};

export const findAllUsers = (params?: UserQueryType) => {
  return executeApi<UserQueryResponse>(() =>
    apiClient.get("/admin/users", { params }),
  );
};

export const findUser = (id: string) => {
  return executeApi<UserResponse>(() => apiClient.get(`/admin/users/${id}`));
};

export const updateUser = (id: string, data: CUUserType) => {
  return executeApi<UserResponse>(() =>
    apiClient.put(`/admin/users/${id}`, data),
  );
};

export const deleteUser = (id: string, force?: boolean) => {
  return executeApi<null>(() =>
    apiClient.delete(`/admin/users/${id}`, { params: { force } }),
  );
};

export const restoreUser = (id: string) => {
  return executeApi<null>(() => apiClient.post(`/admin/users/${id}/restore`));
};
