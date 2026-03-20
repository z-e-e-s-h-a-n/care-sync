"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@workspace/sdk";
import * as auth from "@workspace/sdk/auth";
import { parseDuration } from "@workspace/shared/utils";

const SLATE_TIME = parseDuration("14m");

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: auth.validateSession,
    retry: false,
    staleTime: SLATE_TIME,
    gcTime: Infinity,
    refetchInterval: SLATE_TIME,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  return {
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    error: query.error as unknown as ApiError,
    data: query.data,
  };
};

export const useSession = () => {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: auth.listSessions,
    select: (res) => res.data,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: auth.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: auth.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  return {
    sessions: sessionsQuery.data,
    isSessionsLoading: sessionsQuery.isLoading,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeAllSessions: revokeAllSessionsMutation.mutateAsync,
  };
};
