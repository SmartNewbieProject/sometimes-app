import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { dayUtils } from '@/src/shared/libs';
import { Text } from '@/src/shared/ui';
import StopwatchIcon from '@assets/icons/Stopwatch.svg';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	Easing as ReanimatedEasing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { calculateTime } from '../services/calculate-time';
import type { MatchDetailsV31 } from '../types-v31';
import { CategoryBadge } from './category-badge';

type PeekSheetProps = {
	secondary: MatchDetailsV31;
	containerStyle?: ViewStyle;
	slideFrom?: 'bottom' | 'top';
	onDismiss?: () => void;
	isVisible?: boolean;
};

export const PeekSheet = ({
	secondary,
	containerStyle,
	slideFrom = 'bottom',
	onDismiss,
	isVisible = true,
}: PeekSheetProps) => {
	const { t } = useTranslation();
	const initialY = slideFrom === 'top' ? -40 : 40;
	const translateY = useSharedValue(initialY);
	const opacity = useSharedValue(0);
	const mounted = useSharedValue(false);

	// 입장 애니메이션
	useEffect(() => {
		translateY.value = withTiming(0, { duration: 300 }, () => {
			mounted.value = true;
		});
		opacity.value = withTiming(1, { duration: 250 });
	}, [translateY, opacity, mounted]);

	// 스크롤 기반 표시/숨김
	useEffect(() => {
		if (!mounted.value) return;

		const hideY = slideFrom === 'top' ? -120 : 120;
		translateY.value = withTiming(isVisible ? 0 : hideY, {
			duration: 300,
			easing: isVisible
				? ReanimatedEasing.out(ReanimatedEasing.cubic)
				: ReanimatedEasing.in(ReanimatedEasing.cubic),
		});
		opacity.value = withTiming(isVisible ? 1 : 0, { duration: 300 });
	}, [isVisible, translateY, opacity, mounted, slideFrom]);

	// 아래로 스와이프해서 닫기
	const panGesture = Gesture.Pan()
		.activeOffsetY([0, 10]) // 위로는 안 움직임, 아래로 10px 이상일 때 활성화
		.onUpdate((event) => {
			if (event.translationY > 0) {
				translateY.value = event.translationY;
				opacity.value = Math.max(0, 1 - event.translationY / 160);
			}
		})
		.onEnd((event) => {
			const shouldDismiss = event.translationY > 80 || event.velocityY > 500;
			if (shouldDismiss) {
				translateY.value = withTiming(300, { duration: 260 });
				opacity.value = withTiming(0, { duration: 200 }, () => {
					if (onDismiss) runOnJS(onDismiss)();
				});
			} else {
				// 임계값 미달 → 원위치
				translateY.value = withTiming(0, { duration: 220 });
				opacity.value = withTiming(1, { duration: 220 });
			}
		});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	const isOpen = secondary.type === 'open' || secondary.type === 'rematching';
	const isWaiting = secondary.type === 'waiting';

	const handlePress = () => {
		if (isOpen && secondary.id) {
			router.navigate({
				pathname: '/partner/view/[id]',
				params: { id: secondary.id, redirectTo: encodeURIComponent('/home') },
			});
		}
	};

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={[styles.container, containerStyle, animatedStyle]}>
				{/* Glassmorphism: blur layer */}
				{Platform.OS === 'web' ? (
					<View
						style={[
							StyleSheet.absoluteFillObject,
							styles.glassBackgroundWeb,
							// @ts-ignore
							{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' },
						]}
					/>
				) : (
					<BlurView
						intensity={60}
						tint="light"
						style={[StyleSheet.absoluteFillObject, styles.glassBackground]}
					/>
				)}

				{/* Glassmorphism: brand purple tint */}
				<View style={styles.brandTint} />

				{/* Glassmorphism: top highlight gradient */}
				<LinearGradient
					colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={styles.innerHighlight}
				/>

				{/* Glassmorphism: inner border glow */}
				<View style={styles.innerBorder} />

				{/* Content */}
				<View style={styles.handle} />
				<View style={styles.content}>
					{isOpen ? (
						<OpenContent secondary={secondary} onPress={handlePress} />
					) : isWaiting ? (
						<WaitingContent secondary={secondary} />
					) : null}
				</View>
			</Animated.View>
		</GestureDetector>
	);
};

const OpenContent = ({
	secondary,
	onPress,
}: { secondary: MatchDetailsV31; onPress: () => void }) => {
	const { t } = useTranslation();
	const [timeResult, setTimeResult] = useState(() =>
		calculateTime(secondary.endOfView, dayUtils.create()),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeResult(calculateTime(secondary.endOfView, dayUtils.create()));
		}, 60000);
		return () => clearInterval(interval);
	}, [secondary.endOfView]);

	const profileImage =
		secondary.partner?.profileImages?.[0]?.imageUrl || secondary.partner?.profileImages?.[0]?.url;

	return (
		<View style={styles.row}>
			{profileImage ? (
				<Image source={{ uri: profileImage }} style={styles.avatar} />
			) : (
				<View style={[styles.avatar, styles.avatarPlaceholder]} />
			)}

			<View style={styles.info}>
				<View style={styles.infoTop}>
					<Text weight="bold" size="sm" numberOfLines={1}>
						{secondary.partner?.name ?? ''}{' '}
						{t('features.idle-match-timer.ui.peek-sheet.partner_suffix')}
					</Text>
					{secondary.category && <CategoryBadge category={secondary.category} variant="inline" />}
				</View>
				<Text size="xs" textColor="muted">
					{timeResult.delimeter}-{timeResult.value}
				</Text>
			</View>

			<TouchableOpacity style={styles.viewButton} onPress={onPress} activeOpacity={0.7}>
				<Text size="xs" weight="bold" style={styles.viewButtonText}>
					{t('features.idle-match-timer.ui.peek-sheet.view_button')}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const WaitingContent = ({ secondary }: { secondary: MatchDetailsV31 }) => {
	const { t } = useTranslation();
	const [timeResult, setTimeResult] = useState(() =>
		calculateTime(secondary.untilNext, dayUtils.create()),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeResult(calculateTime(secondary.untilNext, dayUtils.create()));
		}, 60000);
		return () => clearInterval(interval);
	}, [secondary.untilNext]);

	const formattedDate = secondary.untilNext
		? dayUtils.create(secondary.untilNext).format('M/D HH:mm')
		: '';

	return (
		<View style={styles.row}>
			<View style={[styles.avatar, styles.waitingAvatar]}>
				<StopwatchIcon width={20} height={20} color="#FFFFFF" />
			</View>

			<View style={styles.info}>
				<Text weight="bold" size="sm">
					{t('features.idle-match-timer.ui.peek-sheet.waiting_title')}
				</Text>
				<Text size="xs" textColor="muted">
					{t('features.idle-match-timer.ui.peek-sheet.waiting_desc', { date: formattedDate })}
				</Text>
			</View>

			<View style={styles.countdownContainer}>
				<Text size="sm" weight="bold" style={styles.countdownText}>
					{timeResult.delimeter}-{timeResult.value}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.6)',
		overflow: 'hidden',
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.12,
		shadowRadius: 20,
		elevation: 12,
	},
	glassBackground: {
		backgroundColor: 'rgba(255, 255, 255, 0.60)',
	},
	glassBackgroundWeb: {
		backgroundColor: 'rgba(255, 255, 255, 0.65)',
	},
	brandTint: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(122, 74, 226, 0.05)',
	},
	innerHighlight: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '55%',
		borderTopLeftRadius: 19,
		borderTopRightRadius: 19,
	},
	innerBorder: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.5)',
	},
	handle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: 'rgba(122, 74, 226, 0.2)',
		alignSelf: 'center',
		marginTop: 10,
	},
	content: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 10,
	},
	avatarPlaceholder: {
		backgroundColor: 'rgba(0, 0, 0, 0.08)',
	},
	waitingAvatar: {
		backgroundColor: semanticColors.brand.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	info: {
		flex: 1,
		gap: 2,
	},
	infoTop: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	viewButton: {
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
	},
	viewButtonText: {
		color: '#FFFFFF',
	},
	countdownContainer: {
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	countdownText: {
		color: semanticColors.brand.primary,
	},
});
