"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  StaffProfileResponse,
  StaffProfileType,
  StaffQueryType,
} from "@workspace/contracts/staff";
import type { ApiException } from "@workspace/sdk";
import * as staff from "@workspace/sdk/staff";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useStaffList(params?: StaffQueryType) {
  const query = useQuery({
    queryKey: ["staff", params],
    queryFn: () => staff.listStaff(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useStaffMember(id?: string) {
  const query = useQuery({
    queryKey: ["staff", id],
    queryFn: () => staff.getStaff(id!),
    select: (res) => res.data as StaffProfileResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useMyStaffProfile() {
  const query = useQuery({
    queryKey: ["staff", "me"],
    queryFn: staff.getMyStaffProfile,
    select: (res) => res.data as StaffProfileResponse,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSaveStaff(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: StaffProfileType) =>
      id ? staff.updateStaff(id, data) : staff.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["staff", id] });
    },
  });

  return {
    saveStaff: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
