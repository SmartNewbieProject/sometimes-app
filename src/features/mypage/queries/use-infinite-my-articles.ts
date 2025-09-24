import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import apis from "../apis";
import type { MyArticle, PageResp } from "../apis";

export const createMyArticlesQueryKey = () => ["mypage", "my-articles"];

export function useInfiniteMyArticlesQuery(pageSize: number) {
  const queryKey = createMyArticlesQueryKey();
  const qc = useQueryClient();

  const query = useInfiniteQuery<PageResp<MyArticle>>({
    queryKey,
    initialPageParam: 1,
    enabled: true,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    queryFn: ({ pageParam }) =>
      apis.mypageApis.getMyArticles({
        page: pageParam as number,
        size: pageSize,
      }),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });

  const articles = (query.data?.pages ?? []).flatMap((p) => p.content);

  return {
    articles,
    pagesCount: query.data?.pages?.length ?? 0,
    isLoading: query.isLoading || query.isPending,
    isLoadingMore: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    refetch: () => query.refetch(),
    invalidate: async () => qc.invalidateQueries({ queryKey }),
  };
}
