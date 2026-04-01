"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PatientProfileType,
  PatientQueryType,
} from "@workspace/contracts/patient";
import type { ApiException } from "@workspace/sdk";
import * as patient from "@workspace/sdk/patient";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function usePatients(params?: PatientQueryType) {
  const query = useQuery({
    queryKey: ["patients", params],
    queryFn: () => patient.listPatients(params),
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

export function usePatient(id?: string) {
  const query = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patient.getPatient(id!),
    select: (res) => res.data,
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

export function useSavePatient(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: PatientProfileType) =>
      id ? patient.updatePatient(id, data) : patient.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
  });

  return {
    savePatient: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}
