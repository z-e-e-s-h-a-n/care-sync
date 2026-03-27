"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiException } from "@workspace/sdk";
import * as notification from "@workspace/sdk/notification";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("5m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useNotifications(enabled = false) {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notification.getAllNotification,
    select: (res) => res.data,
    enabled,
    ...queryDefaults,
  });

  const unreadCount = query.data?.filter((item) => !item.readAt).length ?? 0;

  return {
    unreadCount,
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,
  };
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notification.markAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    markAsReadAsync: markAsReadMutation.mutateAsync,
    isPending: markAsReadMutation.isPending,
    mutateError: markAsReadMutation.error as ApiException | null,
  };
}
