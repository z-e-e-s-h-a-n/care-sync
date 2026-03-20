/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import type { ApiException } from "@workspace/sdk";
import { parseDuration } from "@workspace/shared/utils";

type ApiFn = (...args: any[]) => Promise<{ data: any }>;
type ExtractData<T extends ApiFn> = Awaited<ReturnType<T>>["data"];

const STALE_TIME = parseDuration("1h");

export const createLookupHook = <TApi extends ApiFn>(
  key: string,
  apiFn: TApi,
) => {
  type Data = ExtractData<TApi>;

  return (...args: Parameters<TApi>) => {
    const enabled = args.every(Boolean);

    const query = useQuery<Data, ApiException>({
      queryKey: [key, ...args],
      queryFn: () => apiFn(...args),
      enabled,
      select: (res) => res.data as Data,
      staleTime: STALE_TIME,
      gcTime: STALE_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

    return {
      data: query.data,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      fetchError: query.error,
    };
  };
};
