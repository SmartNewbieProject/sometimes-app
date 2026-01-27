import { useStep } from '@/src/features/guide/hooks/use-step';
import useMatchingFirst from '@/src/features/guide/queries/use-maching-first';
import LikeGuideScenario from '@/src/features/guide/ui/like-guide-scenario';
import type { Notification } from '@/src/features/home/apis';
import BannerSlide from '@/src/features/home/ui/banner-slide';
import FirstPurchaseEvent from '@/src/features/home/ui/first-purchase-event-banner';
import HomeInfoSection from '@/src/features/home/ui/home-info/home-info-section';
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
import { useModal } from '@/src/shared/hooks/use-modal';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { ImageResources, storage } from '@/src/shared/libs';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { ensurePushTokenRegistered } from '@/src/shared/libs/notifications';
import { AnnounceCard, BottomNavigation, BusinessInfo, Header, Show, Text } from '@/src/shared/ui';
import { useAuth } from '@features/auth';
import Event from '@features/event';
import { Feedback } from '@features/feedback';
import Home from '@features/home';
import IdleMatchTimer from '@features/idle-match-timer';
import { useQueryClient } from '@tanstack/react-query';
import { ImageResource } from '@ui/image-resource';
import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

const { ui, queries, hooks } = Home;
const {
	TotalMatchCounter,
	CommunityAnnouncement,
	ReviewSlide,
	TipAnnouncement,
	ProfilePhotoCard,
	InstagramVerificationCard,
} = ui;
const { usePreferenceSelfQuery } = queries;
const { useRedirectPreferences } = hooks;

const { ui: welcomeRewardUI, hooks: welcomeRewardHooks } = WelcomeReward;
const { WelcomeRewardModal } = welcomeRewardUI;
const { useWelcomeReward } = welcomeRewardHooks;

const HomeScreen = () => {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { step } = useStep();
	const { isPreferenceFill, onboardingLoading } = useRedirectPreferences();
	const { data: preferencesSelf, isLoading: isPreferencesSelfLoading } = usePreferenceSelfQuery();
	const { trackEventAction } = Event.hooks.useEventAnalytics('home');
	const { my, profileDetails } = useAuth();
	const queryClient = useQueryClient();
	const { showCollapse } = useLiked();
	const collapse = showCollapse();

	const hasProfileImages = profileDetails?.profileImages && profileDetails.profileImages.length > 0;
	const hasCharacteristics = preferencesSelf && preferencesSelf.length > 0;
	const hasPreferences = isPreferenceFill;
	const showPreferenceGuide = !hasCharacteristics || !hasPreferences;
	const showPhotoGuide = hasCharacteristics && hasPreferences && !hasProfileImages;

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

	// 플로팅 카드 스크롤 기반 표시/숨김
	const [isCardVisible, setIsCardVisible] = useState(true);
	const lastScrollY = useRef(0);

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const currentScrollY = event.nativeEvent.contentOffset.y;
		const scrollDelta = currentScrollY - lastScrollY.current;

		// 스크롤 임계값 (5px 이상 움직여야 반응)
		if (Math.abs(scrollDelta) > 5) {
			if (scrollDelta > 0 && currentScrollY > 50) {
				// 아래로 스크롤 (50px 이상 내려갔을 때만)
				setIsCardVisible(false);
			} else if (scrollDelta < 0) {
				// 위로 스크롤
				setIsCardVisible(true);
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
		trackEventAction('home_view');
		if (!loading && value !== 'true') {
			ensurePushTokenRegistered(showModal);
			setValue('true');
		}
	}, [showModal]);

	// 화면이 포커스될 때마다 데이터 리프레시
	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({
				queryKey: ['notification', 'check-preference-fill', 'latest-matching'],
				refetchType: 'active',
			});
			queryClient.invalidateQueries({
				queryKey: ['my-profile-details'],
			});
		}, [queryClient]),
	);

	const renderMatchingSection = () => {
		const hasProfileImages =
			profileDetails?.profileImages && profileDetails.profileImages.length > 0;
		const hasCharacteristics = preferencesSelf && preferencesSelf.length > 0;
		const hasPreferences = isPreferenceFill;

		const isProfileComplete = hasProfileImages && hasCharacteristics && hasPreferences;
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
					<IdleMatchTimer />
				</View>
			);
		}

		if (isOnboardingInfoComplete && !hasProfileImages) {
			return null;
		}

		return <HomeInfoSection />;
	};

	return (
		<View style={styles.container}>
			{/* <LikeGuideScenario visible={!!visibleLikeGuide} hideModal={() => {}} /> */}
			<WelcomeRewardModal visible={shouldShowReward} onClose={markRewardAsReceived} />
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

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				<View style={{ paddingBottom: 4, marginTop: 2 }}>
					<BannerSlide />
				</View>
				<View style={{ marginTop: 20 }}>
					{collapse ? (
						<LikeCollapse collapse={collapse.data} type={collapse.type} />
					) : (
						<NoneLikeBanner />
					)}
				</View>

				<Show when={showPhotoGuide ?? false}>
					<View style={styles.profilePhotoSection}>
						<ProfilePhotoCard />
						<InstagramVerificationCard />
					</View>
				</Show>

				<View style={styles.feedbackSection}>
					<Show when={showPreferenceGuide}>
						<AnnounceCard
							emoji={ImageResources.DETAILS}
							emojiSize={{ width: 31, height: 28 }}
							text={t('apps.home.announce_card_text')}
							onPress={() => router.navigate('/interest')}
						/>
					</Show>
				</View>

				{renderMatchingSection()}
				<View style={{ marginTop: 20 }}>
					<HistoryCollapse />
				</View>
				<View>
					<CommunityAnnouncement />
					<ReviewSlide />
				</View>
				<View style={styles.tipSection}>
					<TipAnnouncement />
				</View>

				<Feedback.WallaFeedbackBanner />

				<BusinessInfo />

				<View style={styles.versionContainer}>
					<Text style={styles.versionText}>v{Constants.expoConfig?.version}</Text>
				</View>
			</ScrollView>

			{shouldShowFloatingCard && (
				<FloatingSummaryCard
					viewerCount={viewerCount}
					previewImages={previewImages}
					onPress={handleFloatingCardPress}
					isVisible={isCardVisible}
				/>
			)}

			<BottomNavigation />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	matchingSection: {
		marginTop: 14,
	},
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
	profilePhotoSection: {
		marginTop: 14,
	},
	feedbackSection: {
		marginTop: 18,
		flexDirection: 'column',
		gap: 6,
	},
	tipSection: {
		marginVertical: 25,
	},
	versionContainer: {
		alignItems: 'center',
		paddingVertical: 16,
		marginTop: 8,
	},
	versionText: {
		fontSize: 12,
		color: '#9CA3AF',
		fontWeight: '400',
	},
});

export default HomeScreen;
