"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardResponse } from "@workspace/contracts/dashboard";
import type { ApiException } from "@workspace/sdk";
import { getDashboard } from "@workspace/sdk/dashboard";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("5m");

export function useDashboard() {
  const query = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: getDashboard,
    select: (res) => res.data as DashboardResponse,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}
