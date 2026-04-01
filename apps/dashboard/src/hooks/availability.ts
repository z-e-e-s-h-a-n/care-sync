"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AvailabilityRuleResponse,
  AvailabilityScheduleType,
  BlockedTimeResponse,
} from "@workspace/contracts/availability";
import type { ApiException } from "@workspace/sdk";
import * as availability from "@workspace/sdk/availability";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useDoctorAvailability(doctorId?: string) {
  const query = useQuery({
    queryKey: ["doctorAvailability", doctorId],
    queryFn: () => availability.getDoctorAvailability(doctorId!),
    select: (res) => res.data,
    enabled: Boolean(doctorId),
    ...queryDefaults,
  });

  return {
    data: query.data as
      | { rules: AvailabilityRuleResponse[]; blockedTimes: BlockedTimeResponse[] }
      | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useReplaceDoctorAvailability(doctorId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AvailabilityScheduleType) =>
      availability.replaceDoctorAvailability(doctorId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctorAvailability", doctorId],
      });
    },
  });

  return {
    replaceAvailability: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
