import { apiClient, executeApi } from "../lib";
import type {
  ContactMessageQueryResponse,
  ContactMessageQueryType,
  ContactMessageResponse,
  CreateContactMessageType,
  UpdateContactMessageType,
} from "@workspace/contracts/lead";

// Public route to create a new contact message
export const createContactMessage = (data: CreateContactMessageType) =>
  executeApi<null>(() => apiClient.post("/contact", data));

// Admin routes
export const getContactMessages = (params?: ContactMessageQueryType) =>
  executeApi<ContactMessageQueryResponse>(() =>
    apiClient.get("/contact", { params }),
  );

export const getContactMessage = (id: string) =>
  executeApi<ContactMessageResponse>(() => apiClient.get(`/contact/${id}`));

export const replyContactMessage = (
  id: string,
  data: UpdateContactMessageType,
) => executeApi<any>(() => apiClient.put(`/contact/${id}/reply`, data));
