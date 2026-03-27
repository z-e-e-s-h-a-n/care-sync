import apiClient, { executeApi } from "../lib/api-client";
import type {
  ConversationResponse,
  MessageResponse,
  SendMessageType,
  UpdateConversationType,
} from "@workspace/contracts/chat";

export const getConversationByAppointment = (appointmentId: string) =>
  executeApi<ConversationResponse>(() =>
    apiClient.get(`/chat/appointments/${appointmentId}`),
  );

export const listMessages = (conversationId: string) =>
  executeApi<MessageResponse[]>(() =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`),
  );

export const sendMessage = (data: SendMessageType) =>
  executeApi<MessageResponse>(() => apiClient.post("/chat/messages", data));

export const updateConversation = (
  conversationId: string,
  data: UpdateConversationType,
) =>
  executeApi<ConversationResponse>(() =>
    apiClient.patch(`/chat/conversations/${conversationId}`, data),
  );

export const markMessageRead = (messageId: string) =>
  executeApi<MessageResponse>(() =>
    apiClient.patch(`/chat/messages/${messageId}/read`),
  );
