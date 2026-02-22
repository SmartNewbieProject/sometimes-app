import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

type Props = {
	onPress: () => void;
};

export const OnboardingNudgeBanner = ({ onPress }: Props) => {
	const { t } = useTranslation();
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(12)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 400,
				delay: 400,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 400,
				delay: 400,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY]);

	return (
		<Animated.View style={{ opacity, transform: [{ translateY }] }}>
			<Pressable style={styles.container} onPress={onPress}>
				<View style={styles.info}>
					<View style={styles.titleRow}>
						<View style={styles.badge}>
							<Text size="10" weight="bold" style={styles.badgeText}>
								{t('features.global-matching.onboarding_nudge_badge')}
							</Text>
						</View>
						<Text size="13" weight="bold" style={styles.title}>
							{t('features.global-matching.onboarding_nudge_label')}
						</Text>
					</View>
					<Text size="11" style={styles.description}>
						{t('features.global-matching.onboarding_nudge_desc_short')}
					</Text>
				</View>
				<Text size="18" weight="bold" style={styles.arrow}>
					›
				</Text>
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 14,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.08,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	info: {
		flex: 1,
		gap: 2,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	title: {
		color: '#1A1A1A',
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
		color: '#888888',
	},
	arrow: {
		color: semanticColors.brand.primary,
	},
});
