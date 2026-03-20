"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationResponse } from "@workspace/contracts/notification";
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

export function useNotifications() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notification.getAllNotification,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    markAsReadAsync: markAsReadMutation.mutateAsync,
    isPending: markAsReadMutation.isPending,
    mutateError: markAsReadMutation.error as ApiException | null,
  };
}

export const getUnreadNotificationsCount = (
  notifications?: NotificationResponse[],
) => notifications?.filter((item) => !item.viewedAt).length ?? 0;
