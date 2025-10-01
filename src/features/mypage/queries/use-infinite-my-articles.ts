import {
  useInfiniteQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import apis from "../apis";
import type { MyArticle } from "../apis";

export const createMyArticlesQueryKey = () => ["mypage", "my-articles"];

export function prefetchMyArticlesFirstPage(
  queryClient: QueryClient,

  pageSize = 10
) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: createMyArticlesQueryKey(),

    queryFn: async ({ pageParam = 1 }) => {
      return apis.mypageApis.getMyArticles({ page: pageParam, size: pageSize });
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage: {
      meta: { hasNextPage: any; currentPage: any };
    }) =>
      lastPage?.meta?.hasNextPage
        ? (lastPage.meta.currentPage ?? 1) + 1
        : undefined,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInfiniteMyArticlesQuery(pageSize = 10) {
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
    queryKey: createMyArticlesQueryKey(),

    queryFn: async ({ pageParam = 1 }) =>
      apis.mypageApis.getMyArticles({ page: pageParam, size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.hasNextPage
        ? (lastPage.meta.currentPage ?? 1) + 1
        : undefined,
    enabled: true,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const articles = data?.pages?.flatMap((p) => p.items) || [];
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
      queryClient.invalidateQueries({ queryKey: createMyArticlesQueryKey() }),
  };
}
