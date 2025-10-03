import {
  useInfiniteQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import apis from "../apis";
import type { Article as ArticleType } from "@/src/features/community/types";

export type MyFeedType = "articles" | "comments" | "likes";

const KEY = (type: MyFeedType) => ["mypage", `my-${type}`] as const;

const fetcher = (type: MyFeedType) => {
  switch (type) {
    case "articles":
      return apis.mypageApis.getMyArticles;
    case "comments":
      return apis.mypageApis.getMyComments;
    case "likes":
      return apis.mypageApis.getMyLike;
  }
};

export function prefetchMyFeedFirstPage(
  queryClient: QueryClient,
  type: MyFeedType,
  pageSize = 10
) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: KEY(type),
    queryFn: async ({ pageParam = 1 }) =>
      fetcher(type)!({ page: pageParam, size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage?.meta?.hasNextPage
        ? (lastPage.meta.currentPage ?? 1) + 1
        : undefined,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInfiniteMyFeedQuery(type: MyFeedType, pageSize = 10) {
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
    queryKey: KEY(type),
    queryFn: async ({ pageParam = 1 }) =>
      fetcher(type)!({ page: pageParam, size: pageSize }),
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

  const articles: ArticleType[] =
    data?.pages?.flatMap((p: any) => p.items) ?? [];
  const pagesCount = data?.pages?.length ?? 0;

  return {
    key: KEY(type),
    articles,
    pagesCount,
    isLoading: isLoading || isPending,
    isLoadingMore: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    loadMore: fetchNextPage,
    refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: KEY(type) }),
  };
}
