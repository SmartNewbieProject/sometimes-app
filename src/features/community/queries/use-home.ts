import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { getArticles, getHotArticles } from "../apis/articles";
import type { Article, HotArticle } from "../types";

export const NOTICE_CODE = "notice";
export const HOT_CODE = "hot";

export const HOME_QUERY_KEYS = {
  notices: ["home", "notices"] as const,
  hots: ["home", "hots"] as const,
};

export async function fetchHomeNotices(size = 5) {
  const res = await getArticles({ code: "notice", page: 1, size });
  return Array.isArray(res?.items)
    ? (res.items.slice(0, size) as Article[])
    : [];
}

export function prefetchHomeNotices(queryClient: QueryClient, size = 5) {
  return queryClient.prefetchQuery({
    queryKey: [...HOME_QUERY_KEYS.notices, { size }],
    queryFn: () => fetchHomeNotices(size),
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useHomeNoticesQuery(size = 5) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...HOME_QUERY_KEYS.notices, { size }],
    queryFn: () => fetchHomeNotices(size),
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });

  const refetchPrefetch = () => prefetchHomeNotices(queryClient, size);

  return {
    notices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    prefetch: refetchPrefetch,
  };
}

export async function fetchHomeHots() {
  const res = await getHotArticles();
  return Array.isArray(res) ? res : [];
}

export function prefetchHomeHots(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: HOME_QUERY_KEYS.hots,
    queryFn: () => fetchHomeHots(),
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useHomeHotsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: HOME_QUERY_KEYS.hots,
    queryFn: () => fetchHomeHots(),
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
  const prefetch = () => prefetchHomeHots(queryClient);

  return {
    hots: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    prefetch,
  };
}
