import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Text } from '@/src/shared/ui';
/**
 * 플로팅 요약 카드
 * 홈 화면에서 "나를 본 사람" 요약 정보 표시
 * Web: React Native 기본 Animated API
 * Native: react-native-reanimated (성능 최적화)
 * Glassmorphism: expo-blur + transparency + inner glow
 */
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { OverlappingAvatars } from './overlapping-avatars';

interface FloatingSummaryCardProps {
	viewerCount: number;
	previewImages: string[];
	onPress: () => void;
	isVisible?: boolean;
}

function FloatingSummaryCardContent({
	viewerCount,
	previewImages,
	onPress,
}: FloatingSummaryCardProps) {
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={styles.container}
			activeOpacity={0.8}
			onPress={onPress}
			accessibilityLabel={t(PROFILE_VIEWER_KEYS.floatingSummaryCardAccessibilityLabel, {
				count: viewerCount,
			})}
			accessibilityRole="button"
		>
			{/* Glassmorphism: Blur layer */}
			{Platform.OS === 'web' ? (
				<View
					style={[
						styles.glassBackgroundWeb,
						// @ts-ignore - Web only CSS properties
						{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' },
					]}
				/>
			) : (
				<BlurView intensity={50} tint="light" style={styles.glassBackground} />
			)}

			{/* Glassmorphism: Inner highlight gradient (light reflection) */}
			<LinearGradient
				colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 0.5 }}
				style={styles.innerHighlight}
			/>

			{/* Glassmorphism: Inner border glow */}
			<View style={styles.innerBorder} />

			{/* Content */}
			<View style={styles.contentWrapper}>
				<OverlappingAvatars
					images={previewImages}
					size={40}
					overlap={16}
					maxCount={3}
					totalCount={viewerCount}
				/>

				<View style={styles.textContainer}>
					<Text size="14" weight="semibold" style={styles.viewerText} numberOfLines={1}>
						{t(PROFILE_VIEWER_KEYS.floatingSummaryCardViewerCountPrefix)}
						<Text size="14" weight="bold" textColor="purple">
							{viewerCount}
						</Text>
						{t(PROFILE_VIEWER_KEYS.floatingSummaryCardViewerCountSuffix)}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

function FloatingSummaryCardWeb({ isVisible = true, ...props }: FloatingSummaryCardProps) {
	const translateY = useRef(new Animated.Value(100)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	const [mounted, setMounted] = useState(false);

	// 마운트 애니메이션
	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: 0,
				duration: 500,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}),
		]).start(() => setMounted(true));
	}, [translateY, opacity]);

	// 스크롤 기반 표시/숨김 애니메이션
	useEffect(() => {
		if (!mounted) return;

		Animated.parallel([
			Animated.timing(translateY, {
				toValue: isVisible ? 0 : 120,
				duration: 300,
				easing: isVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: isVisible ? 1 : 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();
	}, [isVisible, mounted, translateY, opacity]);

	return (
		<Animated.View
			style={[
				styles.animatedWrapper,
				{
					transform: [{ translateY }],
					opacity,
				},
			]}
		>
			<FloatingSummaryCardContent {...props} />
		</Animated.View>
	);
}

let FloatingSummaryCardNative: React.ComponentType<FloatingSummaryCardProps> | null = null;

if (Platform.OS !== 'web') {
	const Reanimated = require('react-native-reanimated');
	const { useSharedValue, useAnimatedStyle, withTiming, Easing: ReanimatedEasing } = Reanimated;

	FloatingSummaryCardNative = function FloatingSummaryCardNativeImpl({
		isVisible = true,
		...props
	}: FloatingSummaryCardProps) {
		const translateY = useSharedValue(100);
		const opacity = useSharedValue(0);
		const mounted = useSharedValue(false);

		// 마운트 애니메이션
		useEffect(() => {
			translateY.value = withTiming(
				0,
				{
					duration: 500,
					easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
				},
				() => {
					mounted.value = true;
				},
			);
			opacity.value = withTiming(1, { duration: 500 });
		}, [translateY, opacity, mounted]);

		// 스크롤 기반 표시/숨김 애니메이션
		useEffect(() => {
			if (!mounted.value) return;

			translateY.value = withTiming(isVisible ? 0 : 120, {
				duration: 300,
				easing: isVisible
					? ReanimatedEasing.out(ReanimatedEasing.cubic)
					: ReanimatedEasing.in(ReanimatedEasing.cubic),
			});
			opacity.value = withTiming(isVisible ? 1 : 0, { duration: 300 });
		}, [isVisible, translateY, opacity, mounted]);

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateY: translateY.value }],
			opacity: opacity.value,
		}));

		return (
			<Reanimated.default.View style={[styles.animatedWrapper, animatedStyle]}>
				<FloatingSummaryCardContent {...props} />
			</Reanimated.default.View>
		);
	};
}

export const FloatingSummaryCard = (props: FloatingSummaryCardProps) => {
	if (Platform.OS === 'web') {
		return <FloatingSummaryCardWeb {...props} />;
	}

	if (FloatingSummaryCardNative) {
		return <FloatingSummaryCardNative {...props} />;
	}

	return <FloatingSummaryCardWeb {...props} />;
};

const styles = StyleSheet.create({
	animatedWrapper: {
		position: 'absolute',
		bottom: 92,
		left: 20,
		right: 20,
	},
	container: {
		height: 56,
		borderRadius: 28,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.5)', // 반투명 흰색 테두리
		overflow: 'hidden',

		// 더 강한 그림자로 떠있는 느낌
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 12,
	},
	glassBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.82)', // 18% 투명
	},
	glassBackgroundWeb: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.82)',
	},
	innerHighlight: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '50%',
		borderTopLeftRadius: 27,
		borderTopRightRadius: 27,
	},
	innerBorder: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 27,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.4)', // 내부 흰색 테두리
	},
	contentWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 10,
		gap: 12,
	},
	textContainer: {
		flex: 1,
	},
	viewerText: {
		color: semanticColors.text.primary,
	},
});
