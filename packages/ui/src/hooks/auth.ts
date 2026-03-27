"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SignInType, SignUpType } from "@workspace/contracts/auth";
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
    select: (res) => res.data,
  });

  return {
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    error: query.error as unknown as ApiError,
    data: query.data,
  };
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: (data: SignInType) => auth.signIn(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["patient", "me"] });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (data: SignUpType) => auth.signUp(data),
  });

  const signOutMutation = useMutation({
    mutationFn: auth.signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session"] });
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.removeQueries({ queryKey: ["patient", "me"] });
    },
  });

  return {
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isPending:
      signInMutation.isPending ||
      signUpMutation.isPending ||
      signOutMutation.isPending,
    error:
      (signInMutation.error as ApiError | null) ??
      (signUpMutation.error as ApiError | null) ??
      (signOutMutation.error as ApiError | null),
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: auth.revokeAllSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  return {
    sessions: sessionsQuery.data,
    isSessionsLoading: sessionsQuery.isLoading,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeAllSessions: revokeAllSessionsMutation.mutateAsync,
  };
};
