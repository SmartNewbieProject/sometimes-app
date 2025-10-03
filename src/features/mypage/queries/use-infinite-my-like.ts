import {
  useInfiniteQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import apis from "../apis";

export const createMyLikeQueryKey = () => ["mypage", "my-like"];

export function prefetchMyLikeFirstPage(
  queryClient: QueryClient,
  pageSize = 10
) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: createMyLikeQueryKey(),
    queryFn: async ({ pageParam = 1 }) =>
      apis.mypageApis.getMyArticles({ page: pageParam, size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage?.meta?.hasNextPage
        ? (lastPage.meta.currentPage ?? 1) + 1
        : undefined,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInfiniteMyLikeQuery(pageSize = 10) {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    refetch,
  } = useInfiniteQuery({
    queryKey: createMyLikeQueryKey(),
    queryFn: async ({ pageParam = 1 }) =>
      apis.mypageApis.getMyLike({ page: pageParam, size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage?.meta?.hasNextPage
        ? (lastPage.meta.currentPage ?? 1) + 1
        : undefined,
    enabled: true,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const articles = data?.pages?.flatMap((p: any) => p.items) || [];
  const pagesCount = data?.pages?.length ?? 0;

  return {
    articles,
    pagesCount,
    isLoading: isLoading || isPending,
    isLoadingMore: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    loadMore: fetchNextPage,
    refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: createMyLikeQueryKey() }),
  };
}
