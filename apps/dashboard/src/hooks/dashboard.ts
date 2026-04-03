"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@workspace/sdk";
import type {
  AdminDashboardOverview,
  DoctorDashboardOverview,
  StaffDashboardOverview,
} from "@workspace/contracts/dashboard";
import {
  getAdminDashboard,
  getDoctorDashboard,
  getStaffDashboard,
} from "@workspace/sdk/dashboard";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("5m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useAdminDashboard() {
  const { data, isLoading, isFetching, error } = useQuery<
    ApiSuccess<AdminDashboardOverview>,
    Error,
    AdminDashboardOverview
  >({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return { data, isLoading, isFetching, error };
}

export function useDoctorDashboard() {
  const { data, isLoading, isFetching, error } = useQuery<
    ApiSuccess<DoctorDashboardOverview>,
    Error,
    DoctorDashboardOverview
  >({
    queryKey: ["dashboard", "doctor"],
    queryFn: getDoctorDashboard,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return { data, isLoading, isFetching, error };
}

export function useStaffDashboard() {
  const { data, isLoading, isFetching, error } = useQuery<
    ApiSuccess<StaffDashboardOverview>,
    Error,
    StaffDashboardOverview
  >({
    queryKey: ["dashboard", "staff"],
    queryFn: getStaffDashboard,
    select: (res) => res.data,
    ...queryDefaults,
  });

  return { data, isLoading, isFetching, error };
}
