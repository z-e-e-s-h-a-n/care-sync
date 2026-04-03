"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CUUserType, UserQueryType } from "@workspace/contracts/admin";
import type { ApiException, ApiSuccess } from "@workspace/sdk";
import * as user from "@workspace/sdk/admin";
import { parseDuration } from "@workspace/shared/utils";
import type { UserResponse } from "@workspace/contracts/user";

const STALE_TIME = parseDuration("15m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useAdminUsers(params?: UserQueryType) {
  const usersQuery = useQuery({
    queryKey: ["users", params],
    queryFn: () => user.findAllUsers(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: usersQuery.data,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    fetchError: usersQuery.error as ApiException,
  };
}

export function useAdminUser(id?: string) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => user.findUser(id!),
    select: (res) => res.data,
    enabled: Boolean(id),
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  const CUMutation = useMutation<
    ApiSuccess<UserResponse>,
    ApiException,
    CUUserType
  >({
    mutationFn: (data) =>
      id ? user.updateUser(id, data) : user.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });

  return {
    data: userQuery.data,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    fetchError: userQuery.error as ApiException,

    mutateAsync: CUMutation.mutateAsync,
    isPending: CUMutation.isPending,
    mutateError: CUMutation.error,
  };
}

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const removeMutation = useMutation<
    null,
    ApiException,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      const res = await user.deleteUser(id);
      return res.data;
    },
    onSuccess: invalidateUsers,
  });

  const restoreMutation = useMutation({
    mutationFn: user.restoreUser,
    onSuccess: invalidateUsers,
  });

  return {
    deleteAsync: removeMutation.mutateAsync,
    isDeleting: removeMutation.isPending,
    deleteError: removeMutation.error,

    restoreAsync: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    restoreError: restoreMutation.error,
  };
}
