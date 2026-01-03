/**
 * 카드뉴스 TanStack Query 훅
 */
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCardNewsHighlights,
  getCardNewsList,
  getCardNewsDetail,
  requestCardNewsReward,
} from "../apis";
import { CARD_NEWS_QUERY_KEYS } from "./keys";
import type { CardNewsListItem } from "../types";

const STALE_TIME = 30_000; // 30초
const GC_TIME = 10 * 60 * 1000; // 10분

/**
 * 하이라이트 카드뉴스 조회 훅
 * 홈 화면 캐러셀에 표시할 최신 3개 카드뉴스
 */
export const useCardNewsHighlights = () => {
  return useQuery({
    queryKey: CARD_NEWS_QUERY_KEYS.highlights(),
    queryFn: getCardNewsHighlights,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * 카드뉴스 목록 무한 스크롤 훅
 * Cursor 기반 페이지네이션
 */
export const useCardNewsInfiniteList = (limit = 10) => {
  const query = useInfiniteQuery({
    queryKey: CARD_NEWS_QUERY_KEYS.list(limit),
    queryFn: ({ pageParam }) =>
      getCardNewsList({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  // 모든 페이지에서 데이터 평탄화
  const items: CardNewsListItem[] =
    query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    items,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};

/**
 * 카드뉴스 상세 조회 훅
 */
export const useCardNewsDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: CARD_NEWS_QUERY_KEYS.detail(id),
    queryFn: () => getCardNewsDetail(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

/**
 * 카드뉴스 보상 요청 뮤테이션
 */
export const useCardNewsReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestCardNewsReward,
    onSuccess: () => {
      // 사용자 잔액 관련 쿼리 무효화 (구슬 개수 갱신)
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["my"] });
    },
  });
};

export { CARD_NEWS_QUERY_KEYS } from "./keys";
