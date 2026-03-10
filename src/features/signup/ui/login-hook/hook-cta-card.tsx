import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { RegionStats } from '../../constants/mock-region-stats';
import type { SelectedUniv } from '../../hooks/use-login-hook-state';

interface HookCtaCardProps {
	onPress: () => void;
}

export function HookCtaCard({ onPress }: HookCtaCardProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15, stiffness: 300 });
	};

	return (
		<Animated.View style={animatedStyle}>
			<Pressable
				style={styles.banner}
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
			>
				<View style={styles.bannerContent}>
					<Text style={styles.text}>
						내 대학교는 <Text style={styles.textBold}>몇 명의 커플이 있을까?</Text>
					</Text>
				</View>
				<Text style={styles.arrow}>›</Text>
			</Pressable>
		</Animated.View>
	);
}

interface ResultBadgeProps {
	univ: SelectedUniv;
	regionStats: RegionStats;
	onReset: () => void;
}

export function ResultBadge({ univ, regionStats, onReset }: ResultBadgeProps) {
	return (
		<View style={resultStyles.container}>
			<View style={resultStyles.badge}>
				<Text style={resultStyles.badgeText}>{univ.name}</Text>
				<Pressable onPress={onReset} hitSlop={8}>
					<Text style={resultStyles.closeText}>✕</Text>
				</Pressable>
			</View>
			<Text style={resultStyles.weeklyText}>최근 7일간 +{regionStats.weeklyNew}쌍 새로 매칭</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'stretch',
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: semanticColors.brand.primaryLight,
		backgroundColor: semanticColors.surface.secondary,
	},
	bannerContent: {
		flex: 1,
	},
	text: {
		fontSize: 14,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.primary,
		lineHeight: 20,
	},
	textBold: {
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.brand.primary,
	},
	arrow: {
		fontSize: 20,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.primary,
		marginLeft: 8,
	},
});

const resultStyles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingVertical: 4,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: semanticColors.surface.tertiary,
		borderRadius: 20,
		paddingVertical: 8,
		paddingLeft: 16,
		paddingRight: 12,
		gap: 8,
		borderWidth: 1,
		borderColor: semanticColors.brand.primaryLight,
	},
	badgeText: {
		fontSize: 14,
		fontFamily: 'Pretendard-SemiBold',
		color: semanticColors.brand.primary,
	},
	closeText: {
		fontSize: 14,
		color: semanticColors.text.muted,
	},
	weeklyText: {
		fontSize: 12,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.muted,
		marginTop: 8,
	},
});
