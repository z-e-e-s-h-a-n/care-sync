"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@workspace/sdk";
import type { PatientDashboardOverview } from "@workspace/contracts/dashboard";
import { getPatientDashboard } from "@workspace/sdk/dashboard";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("5m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function usePatientDashboard() {
  const { data, isLoading, isFetching, error } = useQuery<
    ApiSuccess<PatientDashboardOverview>,
    Error,
    PatientDashboardOverview
  >({
    queryKey: ["dashboard", "patient"],
    queryFn: getPatientDashboard,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return { data, isLoading, isFetching, error };
}
