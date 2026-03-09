import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { getArticles, getHotArticles } from '../apis/articles';
import type { Article, HotArticle } from '../types';

export const NOTICE_CODE = 'notice';
export const HOT_CODE = 'hot';
export const GENERAL_CODE = 'general';

export const HOME_QUERY_KEYS = {
	notices: ['home', 'notices'] as const,
	hots: ['home', 'hots'] as const,
	latestArticles: ['home', 'latestArticles'] as const,
};

const COMMUNITY_STALE = {
	notices: 3 * 60 * 1000, // 3분 — 공지는 자주 안 바뀜
	hots: 60 * 1000, // 1분 — 인기글은 적당히
	latest: 30 * 1000, // 30초 — 최신글은 실시간성 필요
} as const;
const GC_TIME = 10 * 60 * 1000;

export async function fetchHomeNotices(size = 5) {
	const res = await getArticles({ code: 'notice', page: 1, size });
	return Array.isArray(res?.items) ? (res.items.slice(0, size) as Article[]) : [];
}

export function prefetchHomeNotices(queryClient: QueryClient, size = 5) {
	return queryClient.prefetchQuery({
		queryKey: [...HOME_QUERY_KEYS.notices, { size }],
		queryFn: () => fetchHomeNotices(size),
		staleTime: COMMUNITY_STALE.notices,
		gcTime: GC_TIME,
	});
}

export function useHomeNoticesQuery(size = 5) {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: [...HOME_QUERY_KEYS.notices, { size }],
		queryFn: () => fetchHomeNotices(size),
		staleTime: COMMUNITY_STALE.notices,
		gcTime: GC_TIME,
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
		staleTime: COMMUNITY_STALE.hots,
		gcTime: GC_TIME,
	});
}

export function useHomeHotsQuery() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: HOME_QUERY_KEYS.hots,
		queryFn: () => fetchHomeHots(),
		staleTime: COMMUNITY_STALE.hots,
		gcTime: GC_TIME,
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

export async function fetchHomeLatestArticles(size = 10) {
	const res = await getArticles({ code: GENERAL_CODE, page: 1, size });
	return Array.isArray(res?.items) ? (res.items.slice(0, size) as Article[]) : [];
}

export function prefetchHomeLatestArticles(queryClient: QueryClient, size = 10) {
	return queryClient.prefetchQuery({
		queryKey: [...HOME_QUERY_KEYS.latestArticles, { size }],
		queryFn: () => fetchHomeLatestArticles(size),
		staleTime: COMMUNITY_STALE.latest,
		gcTime: GC_TIME,
	});
}

export function useHomeLatestArticlesQuery(size = 10) {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: [...HOME_QUERY_KEYS.latestArticles, { size }],
		queryFn: () => fetchHomeLatestArticles(size),
		staleTime: COMMUNITY_STALE.latest,
		gcTime: GC_TIME,
	});
	const prefetch = () => prefetchHomeLatestArticles(queryClient, size);

	return {
		articles: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		prefetch,
	};
}
