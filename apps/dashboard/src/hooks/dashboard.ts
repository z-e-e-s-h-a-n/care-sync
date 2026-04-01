"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard, getDoctorDashboard } from "@workspace/sdk/dashboard";
import type {
  AdminDashboardOverview,
  DoctorDashboardOverview,
} from "@workspace/contracts/dashboard";

const STALE = 5 * 60 * 1000; // 5 minutes

export function useAdminDashboard() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
    select: (res) => res.data as AdminDashboardOverview,
    staleTime: STALE,
    gcTime: STALE,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return { data, isLoading, isFetching, error };
}

export function useDoctorDashboard() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dashboard", "doctor"],
    queryFn: getDoctorDashboard,
    select: (res) => res.data as DoctorDashboardOverview,
    staleTime: STALE,
    gcTime: STALE,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return { data, isLoading, isFetching, error };
}
