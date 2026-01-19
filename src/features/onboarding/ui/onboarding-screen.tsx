import { useMyInfoReferrer } from '@/src/features/my-info/hooks';
import colors from '@/src/shared/constants/colors';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
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
import { SlideWelcome } from './slide-welcome';

const ALL_SLIDES = [
	{ component: SlideWelcome, id: 'welcome' },
	{ component: SlideMatchingTime, id: 'matchingTime' },
	{ component: SlideLikeGuide, id: 'likeGuide' },
	{ component: SlideCta, id: 'cta' },
];

interface OnboardingScreenProps {
	source?: string;
}

export const OnboardingScreen = ({ source }: OnboardingScreenProps) => {
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [containerWidth, setContainerWidth] = useState(0);
	const translateX = useSharedValue(0);
	const { saveOnboardingComplete } = useOnboardingStorage();

	const activeSlides = useMemo(() => {
		return ALL_SLIDES;
	}, []);

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
		if (isTransitioning || containerWidth === 0) return;

		if (currentIndex === totalSlides - 1) {
			handleComplete();
			return;
		}

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
		await saveOnboardingComplete();
		if (source === 'login') {
			router.replace('/auth/login');
			return;
		}
		if (source === 'signup') {
			useMyInfoReferrer.getState().setReferrer('signup');
			router.replace('/my-info');
			return;
		}
		router.replace('/home');
	};

	const handleSkip = async () => {
		if (source === 'login') {
			router.replace('/auth/login');
			return;
		}
		await saveOnboardingComplete();
		if (source === 'signup') {
			useMyInfoReferrer.getState().setReferrer('signup');
			router.replace('/my-info');
			return;
		}
		router.replace('/home');
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ProgressBar currentIndex={currentIndex} totalSlides={totalSlides} />

			{currentIndex !== totalSlides - 1 && <SkipButton onSkip={handleSkip} />}

			<View style={styles.slidesOuterContainer} onLayout={handleLayout}>
				<Animated.View style={[styles.slidesContainer, animatedStyle]}>
					{activeSlides.map(({ component: SlideComponent }, index) => (
						<View
							key={index}
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
