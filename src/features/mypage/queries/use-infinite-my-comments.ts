import { useInfiniteQuery } from "@tanstack/react-query";
import mypageApis, { MyComment } from "../apis";

export const createMyCommentsQueryKey = () => ["mypage", "my-comments"];

export function useInfiniteMyCommentsQuery(pageSize: number) {
  const query = useInfiniteQuery({
    queryKey: createMyCommentsQueryKey(),
    queryFn: ({ pageParam = 1 }) =>
      mypageApis.getMyComments({ page: pageParam, size: pageSize }),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    initialPageParam: 1,
  });

  const comments: MyComment[] = (query.data?.pages ?? []).flatMap(
    (p) => p.content
  );
  const pagesCount = query.data?.pages?.length ?? 0;

  return {
    comments,
    pagesCount,
    isLoading: query.isLoading || query.isPending,
    isLoadingMore: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    refetch: () => query.refetch(),
  };
}
