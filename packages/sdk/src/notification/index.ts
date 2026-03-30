import apiClient, { executeApi } from "../lib/api-client";
import type {
  ConfigurePushNotificationsType,
  NotificationResponse,
} from "@workspace/contracts/notification";

export const getAllNotification = () =>
  executeApi<NotificationResponse[]>(() => apiClient.get("/notifications"));

export const markAsRead = (id: string) =>
  executeApi(() => apiClient.put(`/notifications/${id}`));

export const updatePushNotifications = (data: ConfigurePushNotificationsType) =>
  executeApi(() => apiClient.post("/notifications/push/configure", data));
