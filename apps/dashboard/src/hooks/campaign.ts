"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CampaignQueryType,
  NotificationCampaignResponse,
  NotificationCampaignType,
  UpdateCampaignStatusType,
} from "@workspace/contracts/campaign";
import type { ApiException } from "@workspace/sdk";
import * as campaign from "@workspace/sdk/campaign";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useCampaigns(params: CampaignQueryType) {
  const query = useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => campaign.listCampaigns(params),
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

export function useCampaign(id?: string) {
  const query = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaign.getCampaign(id!),
    select: (res) => res.data as NotificationCampaignResponse,
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

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: NotificationCampaignType) => campaign.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  return {
    createCampaign: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdateCampaign(id?: string) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (data: UpdateCampaignStatusType) =>
      campaign.updateCampaignStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => campaign.sendCampaign(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  return {
    updateCampaignStatus: statusMutation.mutateAsync,
    sendCampaign: sendMutation.mutateAsync,
    isPending: statusMutation.isPending || sendMutation.isPending,
    error:
      (statusMutation.error as ApiException | null) ??
      (sendMutation.error as ApiException | null),
  };
}
