import { apiClient, executeApi } from "../lib";
import type {
  NewsletterSubscriberQueryResponse,
  NewsletterSubscriberQueryType,
  NewsletterSubscriberResponse,
  NewsletterSubscriberType,
  NewsletterUnSubscriberType,
} from "@workspace/contracts/newsletter";

export const subscribeNewsletter = (data: NewsletterSubscriberType) =>
  executeApi(() => apiClient.post("/newsletter/subscribe", data));

export const unsubscribeNewsletter = (data: NewsletterUnSubscriberType) =>
  executeApi(() => apiClient.post("/newsletter/unsubscribe", data));

export const listNewsletterSubscribers = (
  params?: NewsletterSubscriberQueryType,
) =>
  executeApi<NewsletterSubscriberQueryResponse>(() =>
    apiClient.get("/newsletter", { params }),
  );

export const getNewsletterSubscriber = (id: string) =>
  executeApi<NewsletterSubscriberResponse>(() =>
    apiClient.get(`/newsletter/${id}`),
  );

export const deleteNewsletterSubscriber = (id: string) =>
  executeApi(() => apiClient.delete(`/newsletter/${id}`));

export const restoreNewsletterSubscriber = (id: string) =>
  executeApi(() => apiClient.post(`/newsletter/${id}/restore`));
