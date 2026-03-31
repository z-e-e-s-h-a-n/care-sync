import { apiClient, executeApi } from "../lib";
import type {
  CUBranchType,
  BranchResponse,
  BranchQueryType,
  BranchQueryResponse,
  BusinessProfileType,
  BusinessProfileResponse,
} from "@workspace/contracts/business";

export const createBranch = (data: CUBranchType) =>
  executeApi(() => apiClient.post("/business/branches", data));

export const listBranches = (params?: BranchQueryType) =>
  executeApi<BranchQueryResponse>(() =>
    apiClient.get("/business/branches", { params }),
  );

export const getBranch = (id: string) =>
  executeApi<BranchResponse>(() => apiClient.get(`/business/branch/${id}`));

export const updateBranch = (id: string, data: Partial<CUBranchType>) =>
  executeApi(() => apiClient.put(`/business/branch/${id}`, data));

export const deleteBranch = (id: string) =>
  executeApi(() => apiClient.delete(`/business/branch/${id}`));

export const getBusinessProfile = () =>
  executeApi<BusinessProfileResponse>(() => apiClient.get("/business"));

export const upsertBusinessProfile = (data: BusinessProfileType) =>
  executeApi(() => apiClient.put("/business", data));
