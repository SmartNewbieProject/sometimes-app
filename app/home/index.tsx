import {
	GlobalMatchingTimer,
	ModeToggle,
	useGlobalMatchingEnabled,
	useMatchingMode,
} from '@/src/features/global-matching';
import { useStep } from '@/src/features/guide/hooks/use-step';
import useMatchingFirst from '@/src/features/guide/queries/use-maching-first';
import LikeGuideScenario from '@/src/features/guide/ui/like-guide-scenario';
import type { Notification } from '@/src/features/home/apis';
import BannerSlide from '@/src/features/home/ui/banner-slide';
import FirstPurchaseEvent from '@/src/features/home/ui/first-purchase-event-banner';
import HomeInfoSection from '@/src/features/home/ui/home-info/home-info-section';
import type { PhotoCardStatus } from '@/src/features/home/ui/profile-photo-card';
import { DevScenarioFab } from '@/src/features/idle-match-timer/__dev__/dev-scenario-fab';
import { useSecondaryMatch } from '@/src/features/idle-match-timer/hooks/use-secondary-match';
import { PeekSheet } from '@/src/features/idle-match-timer/ui/peek-sheet';
import { useSignupDaysReviewTrigger } from '@/src/features/in-app-review';
import useLiked from '@/src/features/like/hooks/use-liked';
import LikeCollapse from '@/src/features/like/ui/like-collapse';
import NoneLikeBanner from '@/src/features/like/ui/none-like-banner';
import Loading from '@/src/features/loading';
import HistoryCollapse from '@/src/features/matching-history/ui/history-collapse';
import { NotificationIcon } from '@/src/features/notification/ui/notification-icon';
import { useHomeSummary } from '@/src/features/profile-viewer/queries';
import { FloatingSummaryCard } from '@/src/features/profile-viewer/ui';
import WelcomeReward from '@/src/features/welcome-reward';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useGlobalLoading } from '@/src/shared/hooks/use-global-loading';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { ImageResources, storage } from '@/src/shared/libs';
import { sendHeartbeat } from '@/src/shared/libs/heartbeat';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { ensurePushTokenRegistered, registerFcmTokenAsync } from '@/src/shared/libs/notifications';
import { BottomNavigation, BusinessInfo, Header, Show, Text } from '@/src/shared/ui';
import type { ProfileImage } from '@/src/types/user';
import { useAuth } from '@features/auth';
import Event from '@features/event';
import { Feedback } from '@features/feedback';
import Home from '@features/home';
import IdleMatchTimer from '@features/idle-match-timer';
import { useQueryClient } from '@tanstack/react-query';
import { ImageResource } from '@ui/image-resource';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	InteractionManager,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

function getPhotoCardStatus(images: ProfileImage[]): PhotoCardStatus {
	if (images.length === 0) return 'none';
	if (images.some((img) => img.reviewStatus === 'rejected')) return 'rejected';
	if (images.some((img) => img.reviewStatus === 'pending')) return 'reviewing';
	return 'partial';
}

const { ui, queries, hooks } = Home;
const {
	TotalMatchCounter,
	CommunityAnnouncement,
	ReviewSlide,
	ProfilePhotoCard,
	InstagramVerificationCard,
	LatestPostsCarousel,
} = ui;
const { usePreferenceSelfQuery } = queries;
const { useRedirectPreferences } = hooks;

const { ui: welcomeRewardUI, hooks: welcomeRewardHooks } = WelcomeReward;
const { WelcomeRewardModal } = welcomeRewardUI;
const { useWelcomeReward } = welcomeRewardHooks;

const HomeScreen = () => {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { disableGlobalLoading, enableGlobalLoading } = useGlobalLoading();
	const { featureEvents } = useMixpanel();
	const { trackHomeViewed } = featureEvents;
	const hasTrackedHomeView = useRef(false);
	const { step } = useStep();
	const { isPreferenceFill, onboardingLoading } = useRedirectPreferences();
	const { data: preferencesSelf, isLoading: isPreferencesSelfLoading } = usePreferenceSelfQuery();
	const { trackEventAction } = Event.hooks.useEventAnalytics('home');
	const { my, profileDetails } = useAuth();
	const queryClient = useQueryClient();
	const { isGlobalMode } = useMatchingMode();
	const { data: globalMatchingFlag } = useGlobalMatchingEnabled();
	const isGlobalMatchingEnabled = globalMatchingFlag?.enabled ?? false;
	const { showCollapse } = useLiked();
	const collapse = showCollapse();

	const profileImages = profileDetails?.profileImages ?? [];
	const allPhotosApproved =
		profileImages.length > 0 && profileImages.every((img) => img.reviewStatus === 'approved');
	const photoCardStatus = getPhotoCardStatus(profileImages);

	const hasCharacteristics = preferencesSelf && preferencesSelf.length > 0;
	const hasPreferences = isPreferenceFill;
	const showPhotoGuide = hasCharacteristics && hasPreferences && !allPhotosApproved;

	// const [tutorialFinished, setTutorialFinished] = useState<boolean>(false);
	// const { data: hasFirst, isLoading: hasFirstLoading } = useMatchingFirst();

	const { value, setValue, loading } = useStorage<string | null>({
		key: 'show-push-token-modal',
	});
	// 환영 보상 관련
	const { shouldShowReward, markRewardAsReceived } = useWelcomeReward();

	// 인앱 리뷰: 가입 후 3일 경과 시 리뷰 요청
	useSignupDaysReviewTrigger({
		userCreatedAt: my?.createdAt,
		enabled: true,
	});

	// 플로팅 카드 데이터
	const { data: homeSummary, isLoading: isHomeSummaryLoading } = useHomeSummary();
	const viewerCount = homeSummary?.viewerCount ?? 0;
	const previewImages = homeSummary?.previewImages ?? [];
	const shouldShowFloatingCard = !isHomeSummaryLoading && viewerCount > 0;

	// 2차 매칭 floating PeekSheet
	const secondary = useSecondaryMatch((s) => s.secondary);
	const notFoundMatch = useSecondaryMatch((s) => s.notFoundMatch);
	const [isPeekSheetDismissed, setIsPeekSheetDismissed] = useState(false);

	// PeekSheet에 표시할 데이터: secondary 우선, 없으면 not-found의 untilNext
	const peekSheetData = secondary ?? notFoundMatch;

	// secondary 또는 notFoundMatch가 새로 생기면 dismissed 리셋
	useEffect(() => {
		if (peekSheetData) setIsPeekSheetDismissed(false);
	}, [peekSheetData?.id, peekSheetData?.type, peekSheetData?.untilNext]);

	// BottomNavigation 실제 높이 측정
	const [bottomNavHeight, setBottomNavHeight] = useState(82);
	// Header 높이 측정 (PeekSheet 상단 배치)
	const [headerHeight, setHeaderHeight] = useState(0);

	// 플로팅 카드 스크롤 기반 표시/숨김
	const [isFloatingVisible, setIsFloatingVisible] = useState(true);
	const lastScrollY = useRef(0);
	const [isHorizontalGestureActive, setIsHorizontalGestureActive] = useState(false);

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const currentScrollY = event.nativeEvent.contentOffset.y;
		const scrollDelta = currentScrollY - lastScrollY.current;

		if (Math.abs(scrollDelta) > 5) {
			if (scrollDelta > 0 && currentScrollY > 50) {
				setIsFloatingVisible(false);
			} else if (scrollDelta < 0) {
				setIsFloatingVisible(true);
			}
		}

		lastScrollY.current = currentScrollY;
	}, []);

	// useEffect(() => {
	//   const fetchTutorialStatus = async () => {
	//     const finished = await storage.getItem("like-guide");

	//     setTutorialFinished(finished === "true");
	//   };
	//   fetchTutorialStatus();
	// }, []);

	// const visibleLikeGuide =
	//   step < 11 && !tutorialFinished && !hasFirstLoading && hasFirst;

	const onNavigateGemStore = () => {
		mixpanelAdapter.track('onNavigateGemStore', {
			...my,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		router.navigate('/purchase/gem-store');
	};

	const handleFloatingCardPress = useCallback(() => {
		mixpanelAdapter.track('floating_summary_card_clicked', {
			viewerCount: viewerCount,
			imageCount: previewImages.length,
			timestamp: new Date().toISOString(),
		});
		router.push('/viewed-me');
	}, [viewerCount, previewImages.length]);

	useEffect(() => {
		registerFcmTokenAsync().catch(() => {});
	}, []);

	useEffect(() => {
		trackEventAction('home_view');
		if (!loading && value !== 'true') {
			ensurePushTokenRegistered(showModal);
			setValue('true');
		}
	}, [loading, value, showModal]);

	// 화면이 포커스될 때마다 데이터 리프레시, 홈 조회 추적 및 heartbeat 전송
	useFocusEffect(
		useCallback(() => {
			// 홈 화면에서는 미호 로딩 오버레이 비활성화
			disableGlobalLoading();

			if (!hasTrackedHomeView.current) {
				trackHomeViewed();
				hasTrackedHomeView.current = true;
			}

			// 화면 전환 애니메이션 완료 후 무거운 작업 실행 (탭 전환 지연 방지)
			const task = InteractionManager.runAfterInteractions(() => {
				sendHeartbeat();
				queryClient.invalidateQueries({ queryKey: ['notification'], refetchType: 'active' });
				queryClient.invalidateQueries({
					queryKey: ['check-preference-fill'],
					refetchType: 'active',
				});
				queryClient.invalidateQueries({ queryKey: ['latest-matching-v31'], refetchType: 'active' });
				queryClient.invalidateQueries({ queryKey: ['my-profile-details'], refetchType: 'active' });
			});

			return () => {
				task.cancel();
				// 홈 화면을 떠날 때 로딩 오버레이 재활성화
				enableGlobalLoading();
			};
		}, [queryClient, trackHomeViewed, disableGlobalLoading, enableGlobalLoading]),
	);

	const renderMatchingSection = () => {
		const isProfileComplete = allPhotosApproved && hasCharacteristics && hasPreferences;
		const isOnboardingInfoComplete = hasCharacteristics && hasPreferences;

		if (onboardingLoading) {
			return (
				<View style={styles.matchingSection}>
					<IdleMatchTimer />
				</View>
			);
		}

		if (isProfileComplete) {
			return (
				<View style={styles.matchingSection}>
					{isGlobalMatchingEnabled && <ModeToggle />}
					{isGlobalMatchingEnabled && isGlobalMode ? <GlobalMatchingTimer /> : <IdleMatchTimer />}
				</View>
			);
		}

		if (isOnboardingInfoComplete && !allPhotosApproved) {
			return null;
		}

		return <HomeInfoSection />;
	};

		return (
			<View style={styles.container}>
				{/* <LikeGuideScenario visible={!!visibleLikeGuide} hideModal={() => {}} /> */}
				<WelcomeRewardModal visible={shouldShowReward} onClose={markRewardAsReceived} />
				<View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
				<Header
					centered={true}
					logoSize={128}
					showBackButton={false}
					rightContent={
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 16 }}>
							<NotificationIcon size={41} />
							<TouchableOpacity activeOpacity={0.8} onPress={onNavigateGemStore}>
								<ImageResource resource={ImageResources.GEM} width={41} height={41} />
							</TouchableOpacity>
						</View>
					}
				/>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				scrollEnabled={!isHorizontalGestureActive}
			>
				<View style={{ paddingBottom: 4, marginTop: 2 }}>
					<BannerSlide onGestureStateChange={setIsHorizontalGestureActive} />
				</View>
				<View>
					{collapse ? (
						<LikeCollapse collapse={collapse.data} type={collapse.type} />
					) : (
						<NoneLikeBanner />
					)}
				</View>

				<Show when={showPhotoGuide ?? false}>
					<View style={styles.profilePhotoSection}>
						<ProfilePhotoCard status={photoCardStatus} images={profileImages} />
						<InstagramVerificationCard />
					</View>
				</Show>

				{renderMatchingSection()}
				<View>
					<HistoryCollapse />
				</View>
				<View>
					<CommunityAnnouncement />
					<ReviewSlide onGestureStateChange={setIsHorizontalGestureActive} />
				</View>
				<LatestPostsCarousel onGestureStateChange={setIsHorizontalGestureActive} />
				<Feedback.WallaFeedbackBanner />

				<View style={{ marginTop: 'auto' }}>
					<BusinessInfo />
				</View>
			</ScrollView>

			{/* 상단 플로팅: 나를 본 사용자 */}
			{shouldShowFloatingCard && (
				<FloatingSummaryCard
					viewerCount={viewerCount}
					previewImages={previewImages}
					onPress={handleFloatingCardPress}
					isVisible={isFloatingVisible}
					containerStyle={{
						top: headerHeight + 8,
					}}
				/>
			)}

			{/* 하단 플로팅: 다음 목·일 매칭/유료매칭 공개 PeekSheet */}
			{peekSheetData && !isPeekSheetDismissed && (
				<PeekSheet
					secondary={peekSheetData}
					slideFrom="bottom"
					onDismiss={() => setIsPeekSheetDismissed(true)}
					containerStyle={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: bottomNavHeight,
					}}
					isVisible={isFloatingVisible}
				/>
			)}
				{__DEV__ && <DevScenarioFab bottomOffset={shouldShowFloatingCard ? 160 : 100} />}
			<View onLayout={(e) => setBottomNavHeight(e.nativeEvent.layout.height)}>
				<BottomNavigation />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	matchingSection: {},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
		flexDirection: 'column',
		gap: 14,
		paddingBottom: 20,
	},
	profilePhotoSection: {},
});

export default HomeScreen;
