import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DimensionValue } from 'react-native';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	withDelay,
} from 'react-native-reanimated';

import { useToast } from '@/src/shared/hooks/use-toast';
import { Text } from '@/src/shared/ui';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import { useSubmitOnboardingMutation } from '../../queries/onboarding';
import { MOMENT_ONBOARDING_KEYS } from './keys';

// ============================================
// Bouncing Dot
// ============================================
const BouncingDot = ({ delay }: { delay: number }) => {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		translateY.value = withDelay(
			delay,
			withRepeat(
				withSequence(withTiming(-8, { duration: 400 }), withTiming(0, { duration: 400 })),
				-1,
			),
		);
		opacity.value = withDelay(
			delay,
			withRepeat(
				withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })),
				-1,
			),
		);
	}, [delay, translateY, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	return <Animated.View style={[styles.dot, animatedStyle]} />;
};

// ============================================
// Floating Particle (Intro와 동일 패턴)
// ============================================
interface ParticleConfig {
	emoji: string;
	size: number;
	color: string;
	top: DimensionValue;
	left: DimensionValue;
	delay: number;
	duration: number;
}

const FloatingParticle = ({ emoji, size, color, top, left, delay, duration }: ParticleConfig) => {
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

const PARTICLES: ParticleConfig[] = [
	{
		emoji: '\u2665',
		size: 18,
		color: '#FF6B9D',
		top: '18%',
		left: '12%',
		delay: 0,
		duration: 3000,
	},
	{
		emoji: '\u2726',
		size: 14,
		color: '#FFD700',
		top: '15%',
		left: '78%',
		delay: 400,
		duration: 3500,
	},
	{
		emoji: '\u2665',
		size: 12,
		color: '#E2D5FF',
		top: '70%',
		left: '82%',
		delay: 800,
		duration: 4000,
	},
	{
		emoji: '\u2726',
		size: 16,
		color: '#FF6B9D',
		top: '65%',
		left: '8%',
		delay: 1200,
		duration: 3200,
	},
	{
		emoji: '\u2665',
		size: 10,
		color: '#FFD700',
		top: '25%',
		left: '88%',
		delay: 600,
		duration: 3800,
	},
	{
		emoji: '\u2726',
		size: 13,
		color: '#E2D5FF',
		top: '75%',
		left: '45%',
		delay: 1000,
		duration: 4200,
	},
];

// ============================================
// Main Component
// ============================================
export const OnboardingLoading = () => {
	const { t } = useTranslation();
	const { emitToast } = useToast();
	const { getAnswersArray } = useMomentOnboarding();
	const submitMutation = useSubmitOnboardingMutation();

	const hasSubmitted = useRef(false);

	useEffect(() => {
		AccessibilityInfo.announceForAccessibility(t(MOMENT_ONBOARDING_KEYS.loading.message));
	}, [t]);

	useEffect(() => {
		if (hasSubmitted.current) return;
		hasSubmitted.current = true;

		const submit = async () => {
			const answersArray = getAnswersArray();
			try {
				const result = await submitMutation.mutateAsync({ answers: answersArray });
				if (result.success) {
					router.replace({
						pathname: '/moment/onboarding/result',
						params: { reportData: JSON.stringify(result.report) },
					});
				}
			} catch (_error) {
				emitToast('답변 제출에 실패했습니다');
				router.back();
			}
		};
		submit();
	}, [getAnswersArray, submitMutation, emitToast]);

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#E8DEFF']}
				locations={[0, 0.5, 1]}
				style={styles.gradient}
			/>

			{/* Floating Particles */}
			{PARTICLES.map((p) => (
				<FloatingParticle key={`${p.emoji}-${p.delay}`} {...p} />
			))}

			<View style={styles.content}>
				<Text size="18" weight="semibold" style={styles.message}>
					{t(MOMENT_ONBOARDING_KEYS.loading.message)}
				</Text>

				<View style={styles.dotsContainer}>
					<BouncingDot delay={0} />
					<BouncingDot delay={150} />
					<BouncingDot delay={300} />
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	particle: {
		position: 'absolute',
		zIndex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	message: {
		color: '#49386E',
		marginBottom: 24,
	},
	dotsContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#7A4AE2',
	},
});
