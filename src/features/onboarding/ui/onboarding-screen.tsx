import colors from '@/src/shared/constants/colors';
import {
	checkNotificationPermissionStatus,
	registerForPushNotificationsAsync,
} from '@/src/shared/libs/notifications';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, type LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationButtons } from '../components/navigation-buttons';
import { ProgressBar } from '../components/progress-bar';
import { SkipButton } from '../components/skip-button';
import { useOnboardingStorage } from '../hooks/use-onboarding-storage';
import { SlideCta } from './slide-cta';
import { SlideLikeGuide } from './slide-like-guide';
import { SlideMatchingTime } from './slide-matching-time';
import { SlideNotification } from './slide-notification';
import { SlideWelcome } from './slide-welcome';

const ALL_SLIDES = [
	{ component: SlideWelcome, id: 'welcome' },
	{ component: SlideMatchingTime, id: 'matchingTime' },
	{ component: SlideLikeGuide, id: 'likeGuide' },
	{ component: SlideCta, id: 'cta' },
	{ component: SlideNotification, id: 'notification' },
];

interface OnboardingScreenProps {
	source?: string;
}

export const OnboardingScreen = ({ source }: OnboardingScreenProps) => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [containerWidth, setContainerWidth] = useState(0);
	const translateX = useSharedValue(0);
	const { saveOnboardingComplete } = useOnboardingStorage();
	const beforeRemoveUnsubRef = useRef<(() => void) | null>(null);

	// source=login/signup일 때 뒤로가기(하드웨어/제스처) 인터셉트
	useEffect(() => {
		if (source !== 'login' && source !== 'signup') return;

		// iOS 스와이프 제스처 뒤로가기 인터셉트
		// unsubscribe를 먼저 호출 후 navigate해야 무한루프 방지
		const unsubscribe = navigation.addListener('beforeRemove', (e: { preventDefault: () => void }) => {
			e.preventDefault();
			if (source === 'login') {
				unsubscribe();
				beforeRemoveUnsubRef.current = null;
				router.replace('/auth/login');
			}
			// source=signup: 뒤로가기 차단만 (회원가입 스택으로 돌아가지 않도록)
		});
		beforeRemoveUnsubRef.current = unsubscribe;

		// Android 하드웨어 뒤로가기 인터셉트
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			if (source === 'login') {
				router.replace('/auth/login');
			}
			return true; // signup/login 모두 차단
		});

		return () => {
			unsubscribe();
			beforeRemoveUnsubRef.current = null;
			backHandler.remove();
		};
	}, [source, navigation]);

	const activeSlides = useMemo(() => {
		const hideNotification = Platform.OS === 'web' || source === 'login';
		return hideNotification
			? ALL_SLIDES.filter((s) => s.id !== 'notification')
			: ALL_SLIDES;
	}, [source]);

	const totalSlides = activeSlides.length;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const handleLayout = (event: LayoutChangeEvent) => {
		const { width } = event.nativeEvent.layout;
		if (width > 0) {
			setContainerWidth(width);
		}
	};

	const goToNextSlide = useCallback(() => {
		if (isTransitioning) return;

		if (currentIndex === totalSlides - 1) {
			handleComplete();
			return;
		}

		if (containerWidth === 0) return;

		setIsTransitioning(true);
		const nextIndex = currentIndex + 1;

		translateX.value = withTiming(-nextIndex * containerWidth, {
			duration: 300,
			easing: Easing.out(Easing.cubic),
		});

		setCurrentIndex(nextIndex);

		setTimeout(() => {
			setIsTransitioning(false);
		}, 320);
	}, [currentIndex, isTransitioning, translateX, containerWidth, totalSlides]);

	const handleComplete = async () => {
		console.log('[Onboarding] handleComplete called, source:', source);
		await saveOnboardingComplete();

		if (source === 'login') {
			router.replace('/auth/login');
			return;
		}

		// 신규 가입 플로우: 알림 권한 요청 후 홈 이동
		// - undetermined: OS 팝업 표시 (사용자가 방금 본 notification 슬라이드가 맥락 제공)
		// - granted: Samsung 선제 팝업 등으로 이미 허용됨, 토큰만 등록
		// - denied: 무시하고 홈으로 이동 (홈에서 fallback 모달 대신 수락률 낮아 스킵)
		if (Platform.OS !== 'web') {
			const status = await checkNotificationPermissionStatus();
			if (status !== 'denied') {
				registerForPushNotificationsAsync().catch(() => {});
			}
		}

		// signup 뒤로가기 차단 리스너 해제 후 홈 이동 (해제 안 하면 replace가 beforeRemove에 막힘)
		if (beforeRemoveUnsubRef.current) {
			beforeRemoveUnsubRef.current();
			beforeRemoveUnsubRef.current = null;
		}

		if (Platform.OS === 'web') {
			window.location.replace('/home');
		} else {
			router.replace('/home');
		}
	};

	const handleSkip = async () => {
		if (source === 'login') {
			router.replace('/auth/login');
			return;
		}
		await saveOnboardingComplete();
		router.replace('/home');
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ProgressBar currentIndex={currentIndex} totalSlides={totalSlides} />

			{currentIndex !== totalSlides - 1 && <SkipButton onSkip={handleSkip} />}

			<View style={styles.slidesOuterContainer} onLayout={handleLayout}>
				<Animated.View style={[styles.slidesContainer, animatedStyle]}>
					{activeSlides.map(({ component: SlideComponent, id }, index) => (
						<View
							key={id}
							style={[styles.slideWrapper, containerWidth > 0 && { width: containerWidth }]}
						>
							{Math.abs(index - currentIndex) <= 1 ? (
								<SlideComponent isActive={index === currentIndex} index={index} source={source} />
							) : null}
						</View>
					))}
				</Animated.View>
			</View>

			<NavigationButtons
				currentIndex={currentIndex}
				totalSlides={totalSlides}
				onNext={goToNextSlide}
				isTransitioning={isTransitioning}
				source={source}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
		overflow: 'hidden',
	},
	slidesOuterContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	slidesContainer: {
		flexDirection: 'row',
		height: '100%',
	},
	slideWrapper: {
		height: '100%',
	},
});
