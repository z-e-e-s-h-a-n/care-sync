import apiClient, { executeApi } from "../lib/api-client";
import type {
  BranchQueryResponse,
  BranchQueryType,
  BranchResponse,
  BranchType,
} from "@workspace/contracts/branch";

export const createBranch = (data: BranchType) =>
  executeApi<BranchResponse>(() => apiClient.post("/branches", data));

export const listBranches = (params?: BranchQueryType) =>
  executeApi<BranchQueryResponse>(() => apiClient.get("/branches", { params }));

export const getBranch = (id: string) =>
  executeApi<BranchResponse>(() => apiClient.get(`/branch/${id}`));

export const updateBranch = (id: string, data: Partial<BranchType>) =>
  executeApi<BranchResponse>(() => apiClient.put(`/branch/${id}`, data));
