import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

type Props = {
	preferenceCount: number;
	onPress: () => void;
};

export const OnboardingNudgeBanner = ({ preferenceCount, onPress }: Props) => {
	const { t } = useTranslation();
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(20)).current;

	const progressPercent = preferenceCount === 0 ? 35 : 65;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 500,
				delay: 500,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 500,
				delay: 500,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY]);

	return (
		<Animated.View style={{ opacity, transform: [{ translateY }] }}>
			<Pressable style={styles.container} onPress={onPress}>
				<View style={styles.labelRow}>
					<Text size="13" weight="bold" textColor="inverse">
						{t('features.global-matching.onboarding_nudge_label')}
					</Text>
					<View style={styles.badge}>
						<Text size="11" weight="bold" style={styles.badgeText}>
							{t('features.global-matching.onboarding_nudge_badge')}
						</Text>
					</View>
				</View>

				<Text size="12" textColor="inverse" style={styles.description}>
					{t('features.global-matching.onboarding_nudge_text')}
				</Text>

				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
					</View>
					<Text size="11" weight="bold" style={styles.progressText}>
						{progressPercent}%
					</Text>
				</View>

				<View style={styles.button}>
					<Text size="13" weight="bold" style={styles.buttonText}>
						{t('features.global-matching.onboarding_nudge_btn')} →
					</Text>
				</View>
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'rgba(122, 74, 226, 0.15)',
		borderWidth: 1,
		borderColor: 'rgba(122, 74, 226, 0.3)',
		borderRadius: 14,
		padding: 14,
		gap: 8,
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	badge: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 6,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	badgeText: {
		color: '#FFFFFF',
	},
	description: {
		opacity: 0.85,
		lineHeight: 18,
	},
	progressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	progressBar: {
		flex: 1,
		height: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 3,
	},
	progressText: {
		color: semanticColors.brand.primaryLight,
	},
	button: {
		backgroundColor: 'rgba(122, 74, 226, 0.3)',
		borderRadius: 10,
		paddingVertical: 10,
		alignItems: 'center',
	},
	buttonText: {
		color: '#FFFFFF',
	},
});
