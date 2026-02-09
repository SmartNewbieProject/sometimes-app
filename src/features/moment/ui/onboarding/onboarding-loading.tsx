import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
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

export const OnboardingLoading = () => {
	const { t } = useTranslation();
	const { emitToast } = useToast();
	const { getAnswersArray } = useMomentOnboarding();
	const submitMutation = useSubmitOnboardingMutation();

	const hasSubmitted = useRef(false);

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

			{/* 하트 파티클 장식 */}
			<View style={styles.heartParticle}>
				<Text size="14" style={{ opacity: 0.7, color: '#E2D5FF' }}>
					{'♥'}
				</Text>
			</View>

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
	heartParticle: {
		position: 'absolute',
		top: '30%',
		right: '20%',
	},
});
