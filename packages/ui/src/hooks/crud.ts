"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiException, ApiSuccess } from "@workspace/sdk";
import { parseDuration } from "@workspace/shared/utils";

/* -------------------------------------------
 * Helpers
 * ------------------------------------------- */

type ApiFn<T = any> = (...args: any[]) => Promise<ApiSuccess<T>>;
type ExtractData<T extends ApiFn> = Awaited<ReturnType<T>>["data"];
// type ExtractParams<T extends ApiFn> = Parameters<T>;

const STALE_TIME = parseDuration("1h");

/* -------------------------------------------
 * Return Type Helpers
 * ------------------------------------------- */

export type EntityHookReturn<TData> = {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  fetchError: ApiException | null;
  mutateAsync: (data: any) => Promise<TData>;
  isPending: boolean;
  mutateError: ApiException | null;
};

export type EntitiesHookReturn<TData> = {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  fetchError: ApiException | null;
};

export type CreateHookReturn<TData, TPayload> = {
  createAsync: (data: TPayload) => Promise<TData>;
  isCreating: boolean;
  createError: ApiException | null;
};

export type UpdateHookReturn<TData, TPayload> = {
  updateAsync: (data: TPayload) => Promise<TData>;
  isUpdating: boolean;
  updateError: ApiException | null;
};

export type DeleteHookReturn = {
  deleteAsync: (params: {
    id: string;
    force?: boolean;
  }) => Promise<ApiSuccess<null>>;
  isDeleting: boolean;
  deleteError: ApiException | null;
};

export type RestoreHookReturn = {
  restoreAsync: (...args: any[]) => Promise<any>;
  isRestoring: boolean;
  restoreError: ApiException | null;
};

/* -------------------------------------------
 * CRUD Factory
 * ------------------------------------------- */
export const createCrudHooks = <
  TFindOne extends ApiFn,
  TFindAll extends ApiFn,
  TCreate extends ApiFn,
  TUpdate extends ApiFn | undefined,
  TDelete extends ApiFn | undefined,
  TRestore extends ApiFn | undefined,
>(
  api: {
    findOne: TFindOne;
    findAll: TFindAll;
    create: TCreate;
    update?: TUpdate;
    delete?: TDelete;
    restore?: TRestore;
  },
  keys: { single: string; list: string },
) => {
  type SingleData = ExtractData<TFindOne>;
  type ListData = ExtractData<TFindAll>;
  type CreatePayload = Parameters<TCreate>[0];
  type UpdatePayload = TUpdate extends ApiFn ? Parameters<TUpdate>[1] : never;
  type FindOneParams = Parameters<TFindOne>;
  type FindAllParams = Parameters<TFindAll>;

  /* =========================================================
   * SINGLE (create / update / find one)
   * ======================================================= */
  const useEntity = (...args: FindOneParams): EntityHookReturn<SingleData> => {
    const queryClient = useQueryClient();
    const { findOne, create, update } = api;

    const id = args[0];

    const query = useQuery<SingleData, ApiException>({
      queryKey: [keys.single, ...args],
      queryFn: () => findOne(...args),
      enabled: !!id,
      select: (res) => res.data,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: STALE_TIME,
      gcTime: STALE_TIME,
    });

    const mutation = useMutation<
      SingleData,
      ApiException,
      CreatePayload | UpdatePayload
    >({
      mutationFn: (data) => {
        if (id) {
          if (!update) throw new Error("Update function missing.");
          return update(id, data as UpdatePayload);
        }
        return create(data as CreatePayload);
      },
      onSuccess: async () => {
        if (id) {
          await queryClient.invalidateQueries({ queryKey: [keys.single] });
        }
        await queryClient.invalidateQueries({ queryKey: [keys.list] });
      },
    });

    return {
      data: query.data,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      fetchError: query.error,

      mutateAsync: mutation.mutateAsync,
      isPending: mutation.isPending,
      mutateError: mutation.error,
    };
  };

  /* =========================================================
   * LIST
   * ======================================================= */
  const useEntities = (
    ...args: FindAllParams
  ): EntitiesHookReturn<ListData> => {
    const { findAll } = api;

    const query = useQuery<ListData, ApiException>({
      queryKey: [keys.list, ...args],
      queryFn: () => findAll(...args),
      select: (res) => res.data as ListData,
      placeholderData: (prev) => prev,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: STALE_TIME,
      gcTime: STALE_TIME,
    });

    return {
      data: query.data,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      fetchError: query.error,
    };
  };

  /* =========================================================
   * CREATE
   * ======================================================= */
  const useCreateEntity = (): CreateHookReturn<SingleData, CreatePayload> => {
    const queryClient = useQueryClient();
    const { create } = api;

    const mutation = useMutation<SingleData, ApiException, CreatePayload>({
      mutationFn: create,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [keys.list] });
      },
    });

    return {
      createAsync: mutation.mutateAsync,
      isCreating: mutation.isPending,
      createError: mutation.error,
    };
  };

  /* =========================================================
   * UPDATE
   * ======================================================= */

  const useUpdateEntity = (
    id: string,
  ): UpdateHookReturn<SingleData, UpdatePayload> => {
    const queryClient = useQueryClient();
    const { update } = api;

    if (!update) throw new Error("Update function missing.");

    const mutation = useMutation<SingleData, ApiException, UpdatePayload>({
      mutationFn: (data) => update(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [keys.single] });
        await queryClient.invalidateQueries({ queryKey: [keys.list] });
      },
    });

    return {
      updateAsync: mutation.mutateAsync,
      isUpdating: mutation.isPending,
      updateError: mutation.error,
    };
  };

  /* =========================================================
   * Delete
   * ======================================================= */
  const useDeleteEntity = (): DeleteHookReturn => {
    const queryClient = useQueryClient();
    const { delete: d } = api;

    if (!d) throw new Error("Delete function missing.");

    const mutation = useMutation<
      ApiSuccess<null>,
      ApiException,
      { id: string; force?: boolean }
    >({
      mutationFn: ({ id, force }) => d(id, force),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [keys.list] });
      },
    });

    return {
      deleteAsync: mutation.mutateAsync,
      isDeleting: mutation.isPending,
      deleteError: mutation.error,
    };
  };

  /* =========================================================
   * RESTORE
   * ======================================================= */
  const useRestoreEntity = (): RestoreHookReturn => {
    const queryClient = useQueryClient();
    const { restore } = api;

    if (!restore) throw new Error("Restore function missing.");

    const mutation = useMutation<ApiSuccess<null>, ApiException>({
      mutationFn: restore,
      onSuccess: async () =>
        queryClient.invalidateQueries({ queryKey: [keys.list] }),
    });

    return {
      restoreAsync: mutation.mutateAsync,
      isRestoring: mutation.isPending,
      restoreError: mutation.error,
    };
  };

  return {
    useEntity,
    useEntities,
    useCreateEntity,
    useUpdateEntity,
    useDeleteEntity,
    useRestoreEntity,
  };
};
