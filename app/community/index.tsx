import { useAppInstallPrompt } from '@/src/features/app-install-prompt';
import { ArticleCategory } from '@/src/features/article/types';
// app/community/index.tsx
import { HOME_CODE, SOMETIME_STORY_CODE, useCategory } from '@/src/features/community/hooks';
import { NOTICE_CODE } from '@/src/features/community/queries/use-home';
import {
	prefetchArticlesFirstPage,
	useInfiniteArticlesQuery,
} from '@/src/features/community/queries/use-infinite-articles';
import { CategoryList, CreateArticleFAB } from '@/src/features/community/ui';
import CommuHome from '@/src/features/community/ui/home';
import { InfiniteArticleList } from '@/src/features/community/ui/infinite-article-list';
import { useCommunityEvent } from '@/src/features/event/hooks/use-community-event';
import { ArticleSkeleton } from '@/src/features/loading/skeleton/article-skeleton';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { NotificationIcon } from '@/src/features/notification/ui/notification-icon';
import { BottomNavigation, Header, HeaderWithNotification, Text } from '@/src/shared/ui';
import { SometimeArticleList } from '@/src/widgets/sometime-article';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	type Animated,
	Image,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';
import { type NavigationState, type SceneRendererProps, TabView } from 'react-native-tab-view';

const communityLogo = require('@/assets/images/community-logo.png');

type CategoryRoute = { key: string; title: string; isHome?: boolean; isSometimeStory?: boolean };

const SOMETIME_ARTICLE_CATEGORIES = new Set<string>(Object.values(ArticleCategory));

export default function CommunityScreen() {
	const { t } = useTranslation();
	const {
		refresh: shouldRefresh,
		receivedGemReward,
		category: requestedCategory,
		articleCategory: requestedArticleCategory,
	} = useLocalSearchParams<{
		refresh: string;
		receivedGemReward?: string;
		category?: string;
		articleCategory?: string;
	}>();
	const { categories, currentCategory: categoryCode, changeCategory } = useCategory();
	const layout = useWindowDimensions();
	const queryClient = useQueryClient();
	const safeWidth = Math.max(1, layout.width || 0);

	const { renderPromptModal } = useCommunityEvent();
	const { showModal } = useModal();
	const [hasShownGemReward, setHasShownGemReward] = useState(false);
	const { communityEvents } = useMixpanel();
	const { showPromptForCommunity } = useAppInstallPrompt();

	useEffect(() => {
		if (receivedGemReward === 'true' && !hasShownGemReward) {
			setHasShownGemReward(true);

			showModal({
				showLogo: true,
				customTitle: (
					<View style={modalStyles.titleContainer}>
						<Text size="20" weight="bold" textColor="black">
							{t('features.payment.ui.community_event_modal.title')}
						</Text>
					</View>
				),
				children: (
					<View style={modalStyles.contentContainer}>
						<Text textColor="black" weight="semibold">
							{t('features.payment.ui.community_event_modal.description')}
						</Text>
					</View>
				),
				primaryButton: {
					text: t('features.payment.ui.community_event_modal.confirm_button'),
					onClick: () => {},
				},
			});
		}
	}, [receivedGemReward, hasShownGemReward, showModal, t]);

	const getCategoryDisplayName = useCallback(
		(code: string, fallbackName: string) => {
			const translationKey = `features.community.ui.categories.${code}`;
			const translated = t(translationKey);
			return translated !== translationKey ? translated : fallbackName;
		},
		[t],
	);

	const routes: CategoryRoute[] = useMemo(() => {
		const safeCategories = Array.isArray(categories) ? categories : [];
		const filtered = safeCategories.filter((c) => c.code !== NOTICE_CODE);
		return [
			{ key: HOME_CODE, title: t('features.community.ui.home.tab_title'), isHome: true },
			...filtered
				.map((c) => ({ key: c.code, title: getCategoryDisplayName(c.code, c.displayName) })),
			{
				key: SOMETIME_STORY_CODE,
				title: t('features.community.ui.category_list.sometime_story', '썸타임 이야기'),
				isSometimeStory: true,
			},
		];
	}, [categories, t, getCategoryDisplayName]);

	const isNotice = (categoryCode ?? HOME_CODE) === NOTICE_CODE;
	const sometimeArticleCategory =
		typeof requestedArticleCategory === 'string' &&
		SOMETIME_ARTICLE_CATEGORIES.has(requestedArticleCategory)
			? (requestedArticleCategory as ArticleCategory)
			: undefined;
	const sometimeReturnPath = useMemo(() => {
		if (sometimeArticleCategory) {
			return `/community?category=${SOMETIME_STORY_CODE}&articleCategory=${sometimeArticleCategory}`;
		}
		return `/community?category=${SOMETIME_STORY_CODE}`;
	}, [sometimeArticleCategory]);

	const currentIndex = useMemo(() => {
		const targetKey = categoryCode ?? HOME_CODE;
		const idx = routes.findIndex((r) => r.key === targetKey);
		return idx >= 0 ? idx : 0;
	}, [routes, categoryCode]);

	useEffect(() => {
		if (!requestedCategory) return;
		const hasRequestedRoute = routes.some((route) => route.key === requestedCategory);
		if (!hasRequestedRoute || categoryCode === requestedCategory) return;
		changeCategory(requestedCategory);
	}, [requestedCategory, routes, categoryCode, changeCategory]);

	useEffect(() => {
		if (isNotice || routes.length === 0) return;
		const targets = [currentIndex, currentIndex - 1, currentIndex + 1]
			.filter((i) => i >= 0 && i < routes.length)
			.map((i) => routes[i].key)
			.filter((code) => code !== HOME_CODE);
		targets.forEach((code) => {
			prefetchArticlesFirstPage(queryClient, code, 10).catch(() => {});
		});
	}, [currentIndex, routes, queryClient, isNotice]);

	const onIndexChange = useCallback(
		(next: number) => {
			if (next < 0 || next >= routes.length) return;
			const nextKey = routes[next]?.key;
			if (nextKey) changeCategory(nextKey);
		},
		[routes, changeCategory],
	);

	// 스와이프 도중 뱃지 동시 업데이트: position Animated.Value 리스너
	const routesRef = useRef(routes);
	routesRef.current = routes;
	const changeCategoryRef = useRef(changeCategory);
	changeCategoryRef.current = changeCategory;
	const lastBadgeIndexRef = useRef(currentIndex);
	const tabPositionRef = useRef<Animated.Value | null>(null);
	const listenerIdRef = useRef<string>('');

	// 렌더 시 동기적으로 ref 동기화 (useEffect 비동기 방식은 position listener와 race condition 발생)
	lastBadgeIndexRef.current = currentIndex;

	const renderTabBar = useCallback(
		(props: SceneRendererProps & { navigationState: NavigationState<CategoryRoute> }) => {
			const position = props.position as Animated.Value;
			if (tabPositionRef.current !== position) {
				if (listenerIdRef.current && tabPositionRef.current) {
					tabPositionRef.current.removeListener(listenerIdRef.current);
				}
				tabPositionRef.current = position;
				listenerIdRef.current = position.addListener(({ value }) => {
					const roundedIndex = Math.round(value);
					if (
						roundedIndex !== lastBadgeIndexRef.current &&
						roundedIndex >= 0 &&
						roundedIndex < routesRef.current.length
					) {
						lastBadgeIndexRef.current = roundedIndex;
						const nextKey = routesRef.current[roundedIndex]?.key;
						if (nextKey) changeCategoryRef.current(nextKey);
					}
				});
			}
			return null;
		},
		[],
	);

	const { refetch } = useInfiniteArticlesQuery({
		categoryCode: isNotice ? undefined : categoryCode,
		pageSize: 10,
	});
	useEffect(() => {
		if (shouldRefresh === 'true' && !isNotice) {
			refetch();
		}
	}, [shouldRefresh, refetch, isNotice]);

	useEffect(() => {
		const feedType = isNotice ? 'notice' : categoryCode === HOME_CODE ? 'home' : 'category';
		const entryPoint = shouldRefresh === 'true' ? 'refresh' : 'tab';

		communityEvents.trackFeedViewed(entryPoint, feedType);
	}, [categoryCode, isNotice, shouldRefresh, communityEvents]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 마운트 시 1회만 실행
	useEffect(() => {
		const timer = setTimeout(() => {
			showPromptForCommunity();
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const hasRoutes = routes.length > 0;

	const renderScene = useCallback(
		(props: SceneRendererProps & { route: CategoryRoute }) => {
			const { route } = props;
			if (route.isHome) {
				return (
					<View style={styles.sceneContainer} key={route.key}>
						<View style={styles.sceneDivider} />
						<CommuHome />
					</View>
				);
			}
			if (route.isSometimeStory) {
				return (
					<View style={styles.sceneContainer} key={route.key}>
						<View style={styles.sceneDivider} />
						<SometimeArticleList
							embedded
							category={sometimeArticleCategory}
							returnPath={sometimeReturnPath}
						/>
					</View>
				);
			}
			return (
				<View style={styles.sceneContainer} key={route.key}>
					<View style={styles.sceneDivider} />
					<InfiniteArticleList
						key={`list-${route.key}`}
						initialSize={10}
						categoryCode={route.key}
						preferSkeletonOnCategoryChange
					/>
				</View>
			);
		},
		[sometimeArticleCategory, sometimeReturnPath],
	);

	const renderLazyPlaceholder = useCallback((_: SceneRendererProps & { route: CategoryRoute }) => {
		return (
			<View style={styles.lazyPlaceholderContainer}>
				<View style={styles.lazyPlaceholderDivider} />
				<View style={styles.lazyPlaceholderPadding}>
					<ActivityIndicator size="large" color="#8B5CF6" />
				</View>
				{Array.from({ length: 8 }).map((_, i) => (
					<ArticleSkeleton
						key={`tab-skel-${i}`}
						variant={i % 3 === 0 ? 'short' : i % 3 === 1 ? 'medium' : 'long'}
					/>
				))}
			</View>
		);
	}, []);

	const isHome = !isNotice && routes[currentIndex]?.isHome === true;

	return (
		<View style={styles.container}>
			<ListHeaderComponent />

			<View style={styles.contentArea}>
				{/** 공지 전용: 스와이프 불가 */}
				{isNotice ? (
					<View style={styles.sceneContainer} key="__notice__">
						<View style={styles.sceneDivider} />
						<InfiniteArticleList
							key={`list-${NOTICE_CODE}`}
							initialSize={10}
							categoryCode={NOTICE_CODE}
							preferSkeletonOnCategoryChange
						/>
					</View>
				) : hasRoutes ? (
					<TabView<CategoryRoute>
						key="community-tab-view"
						navigationState={{ index: currentIndex, routes } as NavigationState<CategoryRoute>}
						renderScene={renderScene}
						renderLazyPlaceholder={renderLazyPlaceholder}
						onIndexChange={onIndexChange}
						initialLayout={{ width: safeWidth }}
						lazy
						lazyPreloadDistance={1}
						swipeEnabled={!isHome}
						renderTabBar={renderTabBar}
					/>
				) : (
					<View style={{ flex: 1 }} />
				)}
			</View>

			{!isHome && <CreateArticleFAB />}
			<BottomNavigation />

			{renderPromptModal()}
		</View>
	);
}

const ListHeaderComponent = () => {
	return (
		<View style={{ backgroundColor: semanticColors.surface.background }}>
			<Header.Container>
				<Image source={communityLogo} style={{ width: 152, height: 18 }} resizeMode="contain" />
				<Header.RightContent><NotificationIcon size={41} /></Header.RightContent>
			</Header.Container>
			<View style={styles.categoryListContainer}>
				<CategoryList />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		backgroundColor: semanticColors.surface.background,
	},
	contentArea: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	categoryListContainer: {
		paddingTop: 14,
		backgroundColor: semanticColors.surface.background,
	},
	sceneContainer: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	sceneDivider: {
		height: 1,
		backgroundColor: semanticColors.surface.other,
	},
	lazyPlaceholderContainer: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	lazyPlaceholderDivider: {
		height: 1,
		backgroundColor: semanticColors.surface.background,
	},
	lazyPlaceholderPadding: {
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
});

const modalStyles = StyleSheet.create({
	titleContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
		paddingBottom: 5,
	},
	contentContainer: {
		flexDirection: 'column',
		gap: 4,
		alignItems: 'center',
	},
});
