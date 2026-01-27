import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useTimer } from '@/src/shared/hooks/use-timer';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Text } from '@/src/shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PROFILE_VIEWER_KEYS as QUERY_KEYS } from '../queries/keys';
import type { GetViewersResponse, NextFreeUnlock } from '../type';

interface FreeUnlockFabProps {
	nextFreeUnlock: NextFreeUnlock | null;
	onPress: () => void;
	isVisible?: boolean;
}

const formatTime = (totalSeconds: number): string => {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const pad = (n: number) => n.toString().padStart(2, '0');

	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

function FreeUnlockFabContent({
	nextFreeUnlock,
	onPress,
	seconds,
	canUnlockNow,
}: FreeUnlockFabProps & { seconds: number; canUnlockNow: boolean }) {
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={styles.container}
			activeOpacity={0.8}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={
				canUnlockNow
					? t(PROFILE_VIEWER_KEYS.freeUnlockFabAvailable)
					: t(PROFILE_VIEWER_KEYS.freeUnlockFabCountdown)
			}
		>
			{/* Glassmorphism: Blur layer */}
			{Platform.OS === 'web' ? (
				<View style={styles.glassBackgroundWeb} />
			) : (
				<BlurView intensity={50} tint="light" style={styles.glassBackground} />
			)}

			{/* Glassmorphism: Inner highlight gradient */}
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
				{canUnlockNow ? (
					<View style={styles.textContainer}>
						<Text size="14" weight="bold" textColor="purple">
							{t(PROFILE_VIEWER_KEYS.freeUnlockFabAvailableTitle)}
						</Text>
						<Text size="12" weight="medium" style={styles.subtitleText}>
							{t(PROFILE_VIEWER_KEYS.freeUnlockFabAvailableSubtitle)}
						</Text>
					</View>
				) : (
					<View style={styles.textContainer}>
						<Text size="14" weight="semibold" style={styles.mainText}>
							{t(PROFILE_VIEWER_KEYS.freeUnlockFabCountdownPrefix)}
							<Text size="14" weight="bold" textColor="purple">
								{formatTime(seconds)}
							</Text>
						</Text>
						<Text size="12" weight="medium" style={styles.subtitleText}>
							{t(PROFILE_VIEWER_KEYS.freeUnlockFabGemHint)}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
}

function FreeUnlockFabWeb({
	nextFreeUnlock,
	onPress,
	seconds,
	canUnlockNow,
	isVisible = true,
}: FreeUnlockFabProps & { seconds: number; canUnlockNow: boolean }) {
	const translateY = useRef(new Animated.Value(100)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	const mounted = useRef(false);

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
		]).start(() => {
			mounted.current = true;
		});
	}, [translateY, opacity]);

	// 스크롤 기반 표시/숨김 애니메이션
	useEffect(() => {
		if (!mounted.current) return;

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
	}, [isVisible, translateY, opacity]);

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
			<FreeUnlockFabContent
				nextFreeUnlock={nextFreeUnlock}
				onPress={onPress}
				seconds={seconds}
				canUnlockNow={canUnlockNow}
			/>
		</Animated.View>
	);
}

let FreeUnlockFabNative: React.ComponentType<
	FreeUnlockFabProps & { seconds: number; canUnlockNow: boolean }
> | null = null;

if (Platform.OS !== 'web') {
	const Reanimated = require('react-native-reanimated');
	const { useSharedValue, useAnimatedStyle, withTiming, Easing: ReanimatedEasing } = Reanimated;

	FreeUnlockFabNative = function FreeUnlockFabNativeImpl({
		nextFreeUnlock,
		onPress,
		seconds,
		canUnlockNow,
		isVisible = true,
	}: FreeUnlockFabProps & { seconds: number; canUnlockNow: boolean }) {
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
				<FreeUnlockFabContent
					nextFreeUnlock={nextFreeUnlock}
					onPress={onPress}
					seconds={seconds}
					canUnlockNow={canUnlockNow}
				/>
			</Reanimated.default.View>
		);
	};
}

export const FreeUnlockFab = ({
	nextFreeUnlock,
	onPress,
	isVisible = true,
}: FreeUnlockFabProps) => {
	const queryClient = useQueryClient();

	// 타이머 완료 시 캐시 업데이트
	const handleTimerComplete = useCallback(() => {
		queryClient.setQueriesData<GetViewersResponse>({ queryKey: QUERY_KEYS.lists() }, (oldData) => {
			if (!oldData?.nextFreeUnlock) return oldData;
			return {
				...oldData,
				nextFreeUnlock: {
					...oldData.nextFreeUnlock,
					canUnlockFreeNow: true,
				},
			};
		});
	}, [queryClient]);

	const { seconds } = useTimer(nextFreeUnlock?.freeUnlockAt, {
		autoStart: !nextFreeUnlock?.canUnlockFreeNow && !!nextFreeUnlock?.freeUnlockAt,
		onComplete: handleTimerComplete,
	});

	const canUnlockNow = nextFreeUnlock?.canUnlockFreeNow || seconds === 0;

	if (!nextFreeUnlock) {
		return null;
	}

	const props = { nextFreeUnlock, onPress, seconds, canUnlockNow, isVisible };

	if (Platform.OS === 'web') {
		return <FreeUnlockFabWeb {...props} />;
	}

	if (FreeUnlockFabNative) {
		return <FreeUnlockFabNative {...props} />;
	}

	return <FreeUnlockFabWeb {...props} />;
};

const styles = StyleSheet.create({
	animatedWrapper: {
		position: 'absolute',
		bottom: 12, // BottomNavigation + 8px gap
		left: 20,
		right: 20,
	},
	container: {
		height: 64,
		borderRadius: 32,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.5)',
		overflow: 'hidden',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 12,
	},
	glassBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.82)',
	},
	glassBackgroundWeb: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.82)',
		// @ts-ignore - Web only property
		backdropFilter: 'blur(40px)',
		WebkitBackdropFilter: 'blur(40px)',
	},
	innerHighlight: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '50%',
		borderTopLeftRadius: 31,
		borderTopRightRadius: 31,
	},
	innerBorder: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 31,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.4)',
	},
	contentWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	textContainer: {
		alignItems: 'center',
	},
	mainText: {
		color: semanticColors.text.primary,
	},
	subtitleText: {
		color: semanticColors.text.muted,
		marginTop: 2,
	},
});
