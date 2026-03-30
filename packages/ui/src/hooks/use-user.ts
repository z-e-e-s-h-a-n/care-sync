"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfileType } from "@workspace/contracts/user";
import { signOut } from "@workspace/sdk/auth";
import { getCurrentUser, updateProfile } from "@workspace/sdk/user";
import { parseDuration } from "@workspace/shared/utils";
import { useAuth } from "./use-auth";

const SLATE_TIME = parseDuration("15m");

const useUser = () => {
  const { isSuccess, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: isSuccess,
    select: (res) => res.data,
    staleTime: SLATE_TIME,
    gcTime: SLATE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const signoutMutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session"] });
      queryClient.removeQueries({ queryKey: ["currentUser"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserProfileType) => updateProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  return {
    currentUser: userQuery.data,
    isLoading: userQuery.isLoading || isLoading,
    isFetching: userQuery.isFetching,
    fetchError: userQuery.error,
    refetchUser: userQuery.refetch,

    logoutUser: signoutMutation.mutateAsync,
    isLogoutPending: signoutMutation.isPending,
    logoutError: signoutMutation.error,

    updateProfile: updateMutation.mutateAsync,
    isUpdatePending: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};

export default useUser;
