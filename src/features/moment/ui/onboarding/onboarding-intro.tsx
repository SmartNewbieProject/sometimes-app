import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import type React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { DimensionValue } from 'react-native';
import { AccessibilityInfo, Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useOnboardingQuestionsQuery, useSkipOnboardingMutation } from '../../queries/onboarding';
import { IntroFeatures } from './components';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

// ============================================
// Floating Particle
// ============================================
interface ParticleProps {
	emoji: string;
	size: number;
	color: string;
	top: DimensionValue;
	left: DimensionValue;
	delay: number;
	duration: number;
}

const FloatingParticle = ({ emoji, size, color, top, left, delay, duration }: ParticleProps) => {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(0);

	useEffect(() => {
		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
			if (!reduceMotion) {
				translateY.value = withDelay(
					delay,
					withRepeat(
						withSequence(
							withTiming(-12, { duration, easing: Easing.inOut(Easing.ease) }),
							withTiming(12, { duration, easing: Easing.inOut(Easing.ease) }),
						),
						-1,
						true,
					),
				);
			}
		});
	}, [delay, duration, translateY, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	return (
		<Animated.Text style={[styles.particle, { top, left, fontSize: size, color }, animatedStyle]}>
			{emoji}
		</Animated.Text>
	);
};

const PARTICLES: ParticleProps[] = [
	{
		emoji: '\u2665',
		size: 18,
		color: '#FF6B9D',
		top: '15%',
		left: '10%',
		delay: 0,
		duration: 3000,
	},
	{
		emoji: '\u2726',
		size: 14,
		color: '#FFD700',
		top: '12%',
		left: '80%',
		delay: 400,
		duration: 3500,
	},
	{
		emoji: '\u2665',
		size: 12,
		color: '#E2D5FF',
		top: '28%',
		left: '85%',
		delay: 800,
		duration: 4000,
	},
	{
		emoji: '\u2726',
		size: 16,
		color: '#FF6B9D',
		top: '22%',
		left: '5%',
		delay: 1200,
		duration: 3200,
	},
	{
		emoji: '\u2665',
		size: 10,
		color: '#FFD700',
		top: '35%',
		left: '75%',
		delay: 600,
		duration: 3800,
	},
	{
		emoji: '\u2726',
		size: 13,
		color: '#E2D5FF',
		top: '8%',
		left: '45%',
		delay: 1000,
		duration: 4200,
	},
];

// ============================================
// Stagger Fade-in
// ============================================
const StaggerFadeIn = ({
	children,
	delay,
	style,
}: { children: React.ReactNode; delay: number; style?: object }) => {
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(20);

	useEffect(() => {
		opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
		translateY.value = withDelay(
			delay,
			withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
		);
	}, [delay, opacity, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

// ============================================
// Shimmer Button
// ============================================
const ShimmerButton = ({
	onPress,
	children,
}: { onPress: () => void; children: React.ReactNode }) => {
	const shimmerX = useSharedValue(-width);

	useEffect(() => {
		shimmerX.value = withRepeat(
			withSequence(
				withTiming(width, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
				withDelay(1500, withTiming(-width, { duration: 0 })),
			),
			-1,
		);
	}, [shimmerX]);

	const shimmerStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shimmerX.value }],
	}));

	return (
		<Button variant="primary" size="lg" onPress={onPress} style={styles.startButton}>
			{children}
			<Animated.View style={[styles.shimmerOverlay, shimmerStyle]} pointerEvents="none">
				<LinearGradient
					colors={['transparent', 'rgba(212, 187, 255, 0.4)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</Button>
	);
};

// ============================================
// Main Component
// ============================================
export const OnboardingIntro = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { data: questionsData } = useOnboardingQuestionsQuery();
	const skipMutation = useSkipOnboardingMutation();

	const questionCount = questionsData?.questions?.length ?? 0;

	const features = [
		t(MOMENT_ONBOARDING_KEYS.intro.feature1, { count: questionCount }),
		t(MOMENT_ONBOARDING_KEYS.intro.feature2),
		t(MOMENT_ONBOARDING_KEYS.intro.feature3),
	];

	const handleStart = () => {
		router.push('/moment/onboarding/questions');
	};

	const handleSkip = async () => {
		try {
			await skipMutation.mutateAsync();
		} catch {}
		router.replace('/moment');
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#E8DEFF']}
				locations={[0, 0.6, 1]}
				style={styles.gradient}
			/>

			{/* Floating Particles */}
			{PARTICLES.map((p) => (
				<FloatingParticle key={`${p.emoji}-${p.delay}`} {...p} />
			))}

			{/* Skip Button */}
			<View style={[styles.skipContainer, { top: insets.top + 12 }]}>
				<Pressable
					onPress={handleSkip}
					hitSlop={12}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel={t(MOMENT_ONBOARDING_KEYS.intro.skipButton)}
				>
					<Text size="14" weight="medium" style={{ color: '#767676' }}>
						{t(MOMENT_ONBOARDING_KEYS.intro.skipButton)}
					</Text>
				</Pressable>
			</View>

			<View style={[styles.content, { paddingTop: insets.top + 40 }]}>
				<StaggerFadeIn delay={0} style={styles.imageContainer}>
					<Image
						source={require('@/assets/images/moment/miho-mailbox.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
				</StaggerFadeIn>

				<StaggerFadeIn delay={200} style={styles.textContainer}>
					<Text size="24" weight="bold" textColor="black" style={styles.title}>
						{t(MOMENT_ONBOARDING_KEYS.intro.title)}
					</Text>
				</StaggerFadeIn>

				<StaggerFadeIn delay={350} style={styles.subtitleContainer}>
					<Text size="15" weight="normal" textColor="gray" style={styles.subtitle}>
						{t(MOMENT_ONBOARDING_KEYS.intro.subtitle)}
					</Text>
				</StaggerFadeIn>

				<StaggerFadeIn delay={500} style={styles.featuresContainer}>
					<IntroFeatures features={features} />
				</StaggerFadeIn>
			</View>

			<StaggerFadeIn
				delay={650}
				style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}
			>
				<ShimmerButton onPress={handleStart}>
					<View style={styles.buttonContent}>
						<Sparkles size={18} color="#FFFFFF" />
						<Text size="16" weight="semibold" textColor="white">
							{t(MOMENT_ONBOARDING_KEYS.intro.startButton)}
						</Text>
					</View>
				</ShimmerButton>
			</StaggerFadeIn>
		</View>
	);
};

const characterSize = width * 0.45;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	particle: {
		position: 'absolute',
		zIndex: 1,
	},
	skipContainer: {
		position: 'absolute',
		right: 20,
		zIndex: 10,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	imageContainer: {
		alignItems: 'center',
		marginBottom: 24,
		overflow: 'hidden',
	},
	characterImage: {
		width: characterSize,
		height: characterSize,
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 8,
	},
	subtitleContainer: {
		alignItems: 'center',
		marginBottom: 32,
	},
	title: {
		textAlign: 'center',
	},
	subtitle: {
		textAlign: 'center',
	},
	featuresContainer: {
		marginTop: 8,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	startButton: {
		width: '100%',
		overflow: 'hidden',
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	shimmerOverlay: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 80,
	},
});
