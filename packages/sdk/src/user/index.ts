import apiClient, { executeApi } from "../lib/api-client";
import type { UserProfileType, UserResponse } from "@workspace/contracts/user";

export const getCurrentUser = () =>
  executeApi<UserResponse>(() => apiClient.get("/user"));

export const updateProfile = (data: UserProfileType) =>
  executeApi<null>(() => apiClient.post("/user", data));
