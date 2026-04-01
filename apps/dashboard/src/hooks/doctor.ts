"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DoctorProfileResponse,
  DoctorProfileType,
  DoctorQueryType,
  ReviewDoctorType,
} from "@workspace/contracts/doctor";
import type { ApiException } from "@workspace/sdk";
import * as doctor from "@workspace/sdk/doctor";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useDoctors(params?: DoctorQueryType) {
  const query = useQuery({
    queryKey: ["doctors", params],
    queryFn: () => doctor.listDoctors(params),
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

export function useDoctor(id?: string) {
  const query = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctor.getDoctor(id!),
    select: (res) => res.data as DoctorProfileResponse,
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

export function useMyDoctorProfile() {
  const query = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: doctor.getMyDoctorProfile,
    select: (res) => res.data as DoctorProfileResponse,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSaveDoctor(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: DoctorProfileType) =>
      id ? doctor.updateDoctor(id, data) : doctor.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    },
  });

  return {
    saveDoctor: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useVerifyDoctor(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ReviewDoctorType) => doctor.verifyDoctor(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });

  return {
    verifyDoctor: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
