import { apiClient, executeApi } from "../lib";
import type {
  CUUserType,
  UserQueryResponse,
  UserQueryType,
} from "@workspace/contracts/admin";
import type { UserResponse } from "@workspace/contracts/user";

export const createUser = (data: CUUserType) => {
  return executeApi<UserResponse>(() => apiClient.post("/users", data));
};

export const findAllUsers = (params?: UserQueryType) => {
  return executeApi<UserQueryResponse>(() =>
    apiClient.get("/users", { params }),
  );
};

export const findUser = (id: string) => {
  return executeApi<UserResponse>(() => apiClient.get(`/users/${id}`));
};

export const updateUser = (id: string, data: CUUserType) => {
  return executeApi<UserResponse>(() => apiClient.put(`/users/${id}`, data));
};

export const deleteUser = (id: string) => {
  return executeApi<null>(() => apiClient.delete(`/users/${id}`));
};

export const restoreUser = (id: string) => {
  return executeApi<null>(() => apiClient.post(`/users/${id}/restore`));
};
