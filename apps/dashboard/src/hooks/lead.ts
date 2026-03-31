"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiException } from "@workspace/sdk";
import { parseDuration } from "@workspace/shared/utils";

import * as contact from "@workspace/sdk/contact";
import * as newsletter from "@workspace/sdk/newsletter";

import type {
  ContactMessageQueryType,
  UpdateContactMessageType,
} from "@workspace/contracts/contact";
import type { NewsletterSubscriberQueryType } from "@workspace/contracts/newsletter";

const STALE_TIME = parseDuration("15m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useContactMessages(params: ContactMessageQueryType) {
  const query = useQuery({
    queryKey: ["contactMessages", params],
    queryFn: () => contact.getContactMessages(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,
  };
}

export function useContactMessage(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["contactMessage", id],
    queryFn: () => contact.getContactMessage(id!),
    select: (res) => res.data,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateContactMessageType) =>
      contact.replyContactMessage(id!, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
      queryClient.invalidateQueries({ queryKey: ["contactMessage", id] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,

    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    mutateError: mutation.error as ApiException,
  };
}

export function useNewsletterSubscribers(
  params: NewsletterSubscriberQueryType,
) {
  const query = useQuery({
    queryKey: ["newsletterSubscribers", params],
    queryFn: () => newsletter.listNewsletterSubscribers(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,
  };
}

export function useNewsletterSubscriber(id?: string) {
  const query = useQuery({
    queryKey: ["newsletterSubscriber", id],
    queryFn: () => newsletter.getNewsletterSubscriber(id!),
    select: (res) => res.data,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,
  };
}
