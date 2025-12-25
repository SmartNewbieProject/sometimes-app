/**
 * 카드뉴스 Query Key Factory
 * TanStack Query의 캐시 무효화와 재사용을 위한 키 관리
 */
export const CARD_NEWS_QUERY_KEYS = {
  all: ["card-news"] as const,

  // 하이라이트 목록
  highlights: () => [...CARD_NEWS_QUERY_KEYS.all, "highlights"] as const,

  // 목록 (무한 스크롤)
  lists: () => [...CARD_NEWS_QUERY_KEYS.all, "list"] as const,
  list: (limit?: number) =>
    [...CARD_NEWS_QUERY_KEYS.lists(), { limit }] as const,

  // 상세
  details: () => [...CARD_NEWS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CARD_NEWS_QUERY_KEYS.details(), id] as const,
};
