import { Text } from '@/src/shared/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ChallengeProgressProps {
	answeredThisWeek: number;
	canProceed: boolean;
	hasTodayAnswer: boolean;
}

export const ChallengeProgress = ({
	answeredThisWeek,
	canProceed,
	hasTodayAnswer,
}: ChallengeProgressProps) => {
	const { t } = useTranslation();
	const progressAnim = useRef(new Animated.Value(0)).current;

	const total = 5;
	const progressRatio = Math.min(answeredThisWeek / total, 1);

	useEffect(() => {
		Animated.timing(progressAnim, {
			toValue: progressRatio,
			duration: 600,
			useNativeDriver: false,
		}).start();
	}, [progressRatio, progressAnim]);

	const getCTAState = () => {
		if (hasTodayAnswer) {
			return {
				text: t('features.moment.my_moment.challenge_card.today_done'),
				disabled: true,
				style: styles.ctaDisabled,
			};
		}
		if (canProceed) {
			return {
				text: t('features.moment.my_moment.challenge_card.go_answer'),
				disabled: false,
				style: styles.ctaActive,
			};
		}
		return {
			text: t('features.moment.my_moment.challenge_card.waiting'),
			disabled: true,
			style: styles.ctaDisabled,
		};
	};

	const cta = getCTAState();

	const handlePress = () => {
		if (!cta.disabled) {
			router.push('/moment/question-detail');
		}
	};

	return (
		<LinearGradient
			colors={['#9B6DFF', '#7A4AE2', '#6B3FD4']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={styles.container}
		>
			{/* 배경 장식 원 */}
			<View style={styles.decorCircle1} />
			<View style={styles.decorCircle2} />

			{/* 상단: 라벨 + 진행 수 */}
			<View style={styles.header}>
				<Text size="14" weight="semibold" style={styles.titleText}>
					{t('features.moment.my_moment.challenge_card.weekly_challenge')}
				</Text>
				<View style={styles.badge}>
					<Text size="13" weight="bold" style={styles.badgeText}>
						{t('features.moment.my_moment.challenge_card.progress_label', {
							answered: answeredThisWeek,
							total,
						})}
					</Text>
				</View>
			</View>

			{/* 프로그레스바 */}
			<View style={styles.progressTrack}>
				<Animated.View
					style={[
						styles.progressFill,
						{
							width: progressAnim.interpolate({
								inputRange: [0, 1],
								outputRange: ['0%', '100%'],
							}),
						},
					]}
				/>
			</View>

			{/* CTA 버튼 */}
			<TouchableOpacity
				style={[styles.cta, cta.style]}
				onPress={handlePress}
				disabled={cta.disabled}
				activeOpacity={0.85}
			>
				<Text
					size="14"
					weight="semibold"
					style={cta.disabled ? styles.ctaTextDisabled : styles.ctaTextActive}
				>
					{cta.text}
				</Text>
			</TouchableOpacity>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 20,
		marginHorizontal: 20,
		marginBottom: 12,
		marginTop: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		overflow: 'hidden',
		shadowColor: 'rgba(122, 74, 226, 0.4)',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 20,
		elevation: 8,
	},
	decorCircle1: {
		position: 'absolute',
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: 'rgba(255, 255, 255, 0.07)',
		top: -30,
		right: -20,
	},
	decorCircle2: {
		position: 'absolute',
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		bottom: -20,
		left: 10,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	titleText: {
		color: 'rgba(255, 255, 255, 0.9)',
	},
	badge: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	badgeText: {
		color: '#FFFFFF',
	},
	progressTrack: {
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		marginBottom: 16,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
		backgroundColor: '#FFFFFF',
	},
	cta: {
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
	},
	ctaActive: {
		backgroundColor: '#FFFFFF',
	},
	ctaDisabled: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
	ctaTextActive: {
		color: '#7A4AE2',
	},
	ctaTextDisabled: {
		color: 'rgba(255, 255, 255, 0.7)',
	},
});
