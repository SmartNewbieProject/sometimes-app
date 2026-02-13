import NotSome from '@/src/features/post-box/ui/not-some';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useGlobalLoadingStore } from '@/src/shared/stores/global-loading-store';
import { Text } from '@/src/shared/ui';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { useRevealWithConfirm } from '../hooks';
import { useLikeViewer, useViewerList } from '../queries';
import type { ProfileViewerItem } from '../type';
import { FreeUnlockFab } from './free-unlock-fab';
import { ViewerCard } from './viewer-card';

export function ViewerList() {
	const { t } = useTranslation();
	const { data, isLoading } = useViewerList();
	const { handleRevealWithConfirm } = useRevealWithConfirm();
	const likeMutation = useLikeViewer();
	const listRef = useRef<FlashListRef<ProfileViewerItem>>(null);
	const flatListRef = useRef<FlatList<ProfileViewerItem>>(null);
	const setGlobalLoading = useGlobalLoadingStore((state) => state.setLoading);

	// 전역 로딩 모달 제어
	useEffect(() => {
		setGlobalLoading(isLoading);
		return () => {
			setGlobalLoading(false);
		};
	}, [isLoading, setGlobalLoading]);

	const nextFreeUnlock = data?.nextFreeUnlock ?? null;
	const freeUnlockSummaryId = nextFreeUnlock?.summaryId;

	// 플로팅 카드 스크롤 기반 표시/숨김
	const [isFabVisible, setIsFabVisible] = useState(true);
	const lastScrollY = useRef(0);

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const currentScrollY = event.nativeEvent.contentOffset.y;
		const scrollDelta = currentScrollY - lastScrollY.current;

		// 스크롤 임계값 (5px 이상 움직여야 반응)
		if (Math.abs(scrollDelta) > 5) {
			if (scrollDelta > 0 && currentScrollY > 50) {
				// 아래로 스크롤 (50px 이상 내려갔을 때만)
				setIsFabVisible(false);
			} else if (scrollDelta < 0) {
				// 위로 스크롤
				setIsFabVisible(true);
			}
		}

		lastScrollY.current = currentScrollY;
	}, []);

	useEffect(() => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_VIEWER_LIST_VIEWED, {
			timestamp: new Date().toISOString(),
		});
	}, []);

	const sortedViewers = useMemo(() => {
		const viewers = data?.viewers;
		if (!viewers) return [];

		return [...viewers].sort((a, b) => {
			// 무료 대상을 맨 앞으로
			if (freeUnlockSummaryId) {
				if (a.summaryId === freeUnlockSummaryId) return -1;
				if (b.summaryId === freeUnlockSummaryId) return 1;
			}
			// 기존: 최신 조회순
			return new Date(b.lastViewAt).getTime() - new Date(a.lastViewAt).getTime();
		});
	}, [data?.viewers, freeUnlockSummaryId]);

	const handleReveal = useCallback(
		(summaryId: string, canUnlockFree: boolean) => {
			// nextFreeUnlock 대상이면 canUnlockFreeNow 사용
			const isFreeTarget = summaryId === freeUnlockSummaryId;
			const actualCanUnlockFree = isFreeTarget
				? (nextFreeUnlock?.canUnlockFreeNow ?? canUnlockFree)
				: canUnlockFree;

			console.log('[ViewerList] handleReveal called', {
				summaryId,
				canUnlockFree,
				isFreeTarget,
				actualCanUnlockFree,
			});
			mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_VIEWER_REVEAL_CLICKED, {
				summaryId,
				timestamp: new Date().toISOString(),
			});

			handleRevealWithConfirm(summaryId, actualCanUnlockFree);
		},
		[handleRevealWithConfirm, freeUnlockSummaryId, nextFreeUnlock],
	);

	const handleLike = useCallback(
		async (summaryId: string) => {
			if (likeMutation.isPending) return;

			mixpanelAdapter.track(MIXPANEL_EVENTS.PROFILE_VIEWER_LIKE_CLICKED, {
				summaryId,
				timestamp: new Date().toISOString(),
			});

			try {
				await likeMutation.mutateAsync({ summaryId });
			} catch {
				// Error handling is done in the mutation
			}
		},
		[likeMutation],
	);

	const handleCardPress = useCallback(
		(summaryId: string) => {
			const viewer = sortedViewers.find((v) => v.summaryId === summaryId);
			if (viewer?.isRevealed && viewer.matchId) {
				router.push({
					pathname: '/partner/view/[id]',
					params: { id: viewer.matchId, redirectTo: encodeURIComponent('/viewed-me') },
				});
			}
		},
		[sortedViewers],
	);

	const handleFabPress = useCallback(() => {
		if (!nextFreeUnlock) return;

		const canUnlockNow = nextFreeUnlock.canUnlockFreeNow;

		if (canUnlockNow) {
			// 바로 해제 실행
			handleRevealWithConfirm(nextFreeUnlock.summaryId, true);
		} else {
			// 해당 카드로 스크롤 (무료 대상이 맨 앞이므로 0번 인덱스)
			if (Platform.OS === 'web') {
				flatListRef.current?.scrollToIndex({ index: 0, animated: true });
			} else {
				listRef.current?.scrollToIndex({ index: 0, animated: true });
			}
		}
	}, [nextFreeUnlock, handleRevealWithConfirm]);

	const renderItem = useCallback(
		({ item }: { item: ProfileViewerItem }) => {
			const isFreeUnlockTarget = item.summaryId === freeUnlockSummaryId && !item.isRevealed;

			return (
				<ViewerCard
					item={item}
					onReveal={handleReveal}
					onLike={handleLike}
					onPress={handleCardPress}
					isFreeUnlockTarget={isFreeUnlockTarget}
				/>
			);
		},
		[handleReveal, handleLike, handleCardPress, freeUnlockSummaryId],
	);

	if (isLoading) {
		return null;
	}

	if (sortedViewers.length === 0) {
		return <NotSome type="viewedMe" />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.descriptionContainer}>
				<Text size="14" textColor="muted" style={styles.description}>
					{t(PROFILE_VIEWER_KEYS.viewedMeDescription)}
				</Text>
			</View>

			{Platform.OS === 'web' ? (
				<FlatList
					ref={flatListRef}
					data={sortedViewers}
					renderItem={renderItem}
					numColumns={2}
					keyExtractor={(item) => item.summaryId}
					contentContainerStyle={styles.listContent}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				/>
			) : (
				<FlashList
					ref={listRef}
					data={sortedViewers}
					renderItem={renderItem}
					numColumns={2}
					contentContainerStyle={styles.listContent}
					{...({ estimatedItemSize: 200 } as object)}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				/>
			)}

			<FreeUnlockFab
				nextFreeUnlock={nextFreeUnlock}
				onPress={handleFabPress}
				isVisible={isFabVisible}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 16,
	},
	descriptionContainer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: semanticColors.surface.secondary,
		marginHorizontal: 8,
		marginBottom: 8,
		borderRadius: 12,
	},
	description: {
		textAlign: 'center',
		lineHeight: 20,
	},
	listContent: {
		paddingHorizontal: 4,
	},
});
