import { apiClient, executeApi } from "../lib";
import type {
  ContactMessageQueryResponse,
  ContactMessageQueryType,
  ContactMessageResponse,
  CreateContactMessageType,
  UpdateContactMessageType,
} from "@workspace/contracts/contact";

export const createContactMessage = (data: CreateContactMessageType) =>
  executeApi(() => apiClient.post("/contact", data));

export const getContactMessages = (params?: ContactMessageQueryType) =>
  executeApi<ContactMessageQueryResponse>(() =>
    apiClient.get("/contact", { params }),
  );

export const getContactMessage = (id: string) =>
  executeApi<ContactMessageResponse>(() => apiClient.get(`/contact/${id}`));

export const replyContactMessage = (
  id: string,
  data: UpdateContactMessageType,
) => executeApi(() => apiClient.put(`/contact/${id}/reply`, data));
