import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useGlobalLoadingStore } from '../stores/global-loading-store';

const LOADING_DELAY_MS = 300;
// 오버레이가 표시된 후 자동으로 해제되는 최대 시간 (무한 차단 방지)
const MAX_LOADING_DURATION_MS = 8000;

// 탭 포커스 시 백그라운드에서 재검증되는 쿼리 목록.
// 이 쿼리들의 네트워크 요청은 전역 로딩 오버레이를 표시하지 않는다.
const BACKGROUND_REFETCH_QUERY_KEYS = [
	'notification',
	'check-preference-fill',
	'my-profile-details',
	'latest-matching-v31',
	'latest-matching-v2',
	'gem',
	'mbti',
	// 홈 화면 자동 refetch 쿼리 — 오버레이 표시 불필요
	'preference-self',
	'public-reviews',
	'total-match-count',
	'banners',
	'homeSummary',
];

export function useGlobalLoadingSync() {
	const isFetching = useIsFetching({
		predicate: (query) => {
			const firstKey = query.queryKey[0];
			return !BACKGROUND_REFETCH_QUERY_KEYS.includes(firstKey as string);
		},
	});
	const isMutating = useIsMutating();
	const { setLoading } = useGlobalLoadingStore();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const maxLoadingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const isActive = isFetching > 0 || isMutating > 0;

		if (isActive) {
			if (!timeoutRef.current) {
				timeoutRef.current = setTimeout(() => {
					setLoading(true);
					// 최대 표시 시간 초과 시 강제 해제 (무한 차단 방지)
					maxLoadingRef.current = setTimeout(() => {
						setLoading(false);
					}, MAX_LOADING_DURATION_MS);
				}, LOADING_DELAY_MS);
			}
		} else {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (maxLoadingRef.current) {
				clearTimeout(maxLoadingRef.current);
				maxLoadingRef.current = null;
			}
			setLoading(false);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (maxLoadingRef.current) {
				clearTimeout(maxLoadingRef.current);
				maxLoadingRef.current = null;
			}
		};
	}, [isFetching, isMutating, setLoading]);
}

export function useGlobalLoading() {
	const {
		setLoading,
		incrementLoading,
		decrementLoading,
		isLoading,
		disableGlobalLoading,
		enableGlobalLoading,
	} = useGlobalLoadingStore();

	return {
		isLoading,
		showLoading: () => setLoading(true),
		hideLoading: () => setLoading(false),
		incrementLoading,
		decrementLoading,
		disableGlobalLoading,
		enableGlobalLoading,
	};
}
