import { apiClient, executeApi } from "../lib";
import type {
  NewsletterSubscriberQueryResponse,
  NewsletterSubscriberQueryType,
  NewsletterSubscriberResponse,
  NewsletterSubscriberType,
  NewsletterUnSubscriberType,
} from "@workspace/contracts/lead";

// Subscribe to newsletter
export const subscribeNewsletter = (data: NewsletterSubscriberType) =>
  executeApi<null>(() => apiClient.post("/newsletter/subscribe", data));

// Unsubscribe from newsletter
export const unsubscribeNewsletter = (data: NewsletterUnSubscriberType) =>
  executeApi<null>(() => apiClient.post("/newsletter/unsubscribe", data));

// Admin: list subscribers
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
