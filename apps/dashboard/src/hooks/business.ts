"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  BusinessProfileResponse,
  BusinessProfileType,
} from "@workspace/contracts/business";
import { ApiException } from "@workspace/sdk";
import * as business from "@workspace/sdk/business";
import { parseDuration } from "@workspace/shared/utils";
import { createCrudHooks } from "@workspace/ui/hooks/use-crud";

const STALE_TIME = parseDuration("15m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export const {
  useEntity: useBranch,
  useEntities: useBranches,
  useDeleteEntity: useDeleteBranch,
} = createCrudHooks(
  {
    findOne: business.getBranch,
    findAll: business.listBranches,
    create: business.createBranch,
    update: business.updateBranch,
    delete: business.deleteBranch,
  },
  {
    single: "branch",
    list: "branches",
  },
);

export function useBusinessProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["businessProfile"],
    queryFn: async () => {
      try {
        return await business.getBusinessProfile();
      } catch (error) {
        if (error instanceof ApiException && error.status === 404) {
          return null;
        }

        throw error;
      }
    },
    select: (res) => res?.data as BusinessProfileResponse | undefined,
    ...queryDefaults,
  });

  const mutation = useMutation({
    mutationFn: (data: BusinessProfileType) =>
      business.upsertBusinessProfile(data).then((res) => res.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["businessProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,

    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    mutateError: mutation.error as ApiException | null,
  };
}
