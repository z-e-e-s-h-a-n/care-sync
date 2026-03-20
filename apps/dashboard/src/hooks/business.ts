"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BusinessProfileType } from "@workspace/contracts/business";
import type { ApiException } from "@workspace/sdk";
import * as business from "@workspace/sdk/business";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("1h");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useBusinessProfile() {
  const queryClient = useQueryClient();

  const businessQuery = useQuery({
    queryKey: ["business-profile"],
    queryFn: business.getBusinessProfile,
    select: (res) => res.data,
    ...queryDefaults,
  });

  const mutation = useMutation({
    mutationFn: (data: BusinessProfileType) =>
      business.upsertBusinessProfile(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
    },
  });

  return {
    data: businessQuery.data,
    isLoading: businessQuery.isLoading,
    isFetching: businessQuery.isFetching,
    fetchError: businessQuery.error as ApiException,

    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    mutateError: mutation.error as ApiException,
  };
}
