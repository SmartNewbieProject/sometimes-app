import React, { useEffect, useRef } from 'react';
import {
	Platform,
	StyleSheet,
	View,
	Animated as RNAnimated,
	Easing as RNEasing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	withSequence,
	withRepeat,
	runOnJS,
	Easing,
	interpolate,
	Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '@/src/shared/ui';
import SometimeLogo from '@assets/images/sometime-brand-logo.svg';
import SlideArrow from '@assets/icons/slide-arrow-icon.svg';

export interface SlideToAboutProps {
	onAction: () => void;
	threshold?: number;
}

const CONTAINER_HEIGHT = 50;
const PADDING = 8;
const CONTAINER_BG_COLOR = '#FFFFFF';
const UNLOCK_THRESHOLD = 0.7;
const HANDLE_SIZE = CONTAINER_HEIGHT - PADDING * 2;

export const SlideToAbout: React.FC<SlideToAboutProps> = ({
	onAction,
	threshold = UNLOCK_THRESHOLD,
}) => {
	const { t } = useTranslation();
	const containerWidthShared = useSharedValue(0);
	const translateX = useSharedValue(0);
	const pulseScale = useSharedValue(1);
	const arrowTranslateX = useSharedValue(0);
	const isUnlocking = useSharedValue(false);

	// 웹용 드래그 상태
	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);

	// 웹용 화살표 애니메이션 (RN Animated API 사용)
	const webArrowTranslateX = useRef(new RNAnimated.Value(0)).current;

	// JS 레이어용 containerWidth (웹 핸들러에서 사용)
	const [containerWidth, setContainerWidth] = React.useState(0);
	const maxDrag = containerWidth - HANDLE_SIZE - PADDING * 2;

	// Pulse animation for handle
	useEffect(() => {
		pulseScale.value = withSequence(
			withTiming(1.1, { duration: 800, easing: Easing.ease }),
			withTiming(1, { duration: 800, easing: Easing.ease }),
		);
	}, []);

	// Arrow left-right animation
	useEffect(() => {
		if (Platform.OS === 'web') {
			// 웹에서는 RN Animated API 사용
			const animation = RNAnimated.loop(
				RNAnimated.sequence([
					RNAnimated.timing(webArrowTranslateX, {
						toValue: 6,
						duration: 600,
						easing: RNEasing.out(RNEasing.ease),
						useNativeDriver: true,
					}),
					RNAnimated.timing(webArrowTranslateX, {
						toValue: 0,
						duration: 600,
						easing: RNEasing.in(RNEasing.ease),
						useNativeDriver: true,
					}),
				]),
			);
			animation.start();
			return () => animation.stop();
		}
		arrowTranslateX.value = -6;
		arrowTranslateX.value = withRepeat(
			withTiming(6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, []);

	const handleUnlockSuccess = () => {
		if (Platform.OS !== 'web') {
			try {
				const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
				impactAsync(ImpactFeedbackStyle.Medium);
			} catch (error) {}
		}
		onAction();
	};

	// 웹용 드래그 핸들러
	const handleWebPointerDown = (event: any) => {
		if (Platform.OS !== 'web') return;
		if (isUnlocking.value) return;

		isDraggingRef.current = true;
		startXRef.current = event.nativeEvent.pageX || event.nativeEvent.clientX;
		event.preventDefault();
	};

	const handleWebPointerMove = (event: any) => {
		if (Platform.OS !== 'web') return;
		if (!isDraggingRef.current || isUnlocking.value) return;

		const currentX = event.nativeEvent.pageX || event.nativeEvent.clientX;
		const deltaX = currentX - startXRef.current;
		const newX = Math.max(0, Math.min(deltaX, maxDrag));
		translateX.value = newX;
	};

	const handleWebPointerUp = () => {
		if (Platform.OS !== 'web') return;
		if (!isDraggingRef.current || isUnlocking.value) return;

		isDraggingRef.current = false;
		const progress = translateX.value / maxDrag;

		if (progress >= threshold) {
			isUnlocking.value = true;
			translateX.value = withTiming(maxDrag, {
				duration: 200,
				easing: Easing.out(Easing.cubic),
			});
			handleUnlockSuccess();
		} else {
			translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
		}
	};

	// 웹에서 드래그 중 페이지를 벗어났을 때
	useEffect(() => {
		if (Platform.OS !== 'web') return;

		const handleGlobalPointerUp = () => {
			if (isDraggingRef.current) {
				handleWebPointerUp();
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('pointerup', handleGlobalPointerUp);
			window.addEventListener('mouseup', handleGlobalPointerUp);
			return () => {
				window.removeEventListener('pointerup', handleGlobalPointerUp);
				window.removeEventListener('mouseup', handleGlobalPointerUp);
			};
		}
	}, [maxDrag, threshold]);

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			'worklet';
			if (isUnlocking.value) return;
			const currentMaxDrag = containerWidthShared.value - HANDLE_SIZE - PADDING * 2;
			if (currentMaxDrag <= 0) return;
			const newX = Math.max(0, Math.min(event.translationX, currentMaxDrag));
			translateX.value = newX;
		})
		.onEnd(() => {
			'worklet';
			if (isUnlocking.value) return;
			const currentMaxDrag = containerWidthShared.value - HANDLE_SIZE - PADDING * 2;
			if (currentMaxDrag <= 0) return;

			const progress = translateX.value / currentMaxDrag;

			if (progress >= threshold) {
				isUnlocking.value = true;
				translateX.value = withTiming(currentMaxDrag, {
					duration: 200,
					easing: Easing.out(Easing.cubic),
				});
				runOnJS(handleUnlockSuccess)();
			} else {
				translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
			}
		});

	const handleAnimatedStyle = useAnimatedStyle(() => {
		const scale = isUnlocking.value ? 1 : pulseScale.value;
		return {
			transform: [
				{ translateX: translateX.value },
				{ scale: interpolate(scale, [1, 1.1], [1, 1.05], Extrapolate.CLAMP) },
			],
		};
	});

	const arrowAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: isUnlocking.value ? 0 : arrowTranslateX.value }],
		};
	});

	const textContainerAnimatedStyle = useAnimatedStyle(() => {
		const currentMaxDrag = containerWidthShared.value - HANDLE_SIZE - PADDING * 2;
		const progress = currentMaxDrag > 0 ? translateX.value / currentMaxDrag : 0;
		return {
			opacity: 1 - progress * 1.5,
		};
	});

	return (
		<View
			style={[
				styles.wrapper,
				{
					height: CONTAINER_HEIGHT,
					borderRadius: CONTAINER_HEIGHT / 2,
				},
			]}
			onLayout={(event) => {
				const { width } = event.nativeEvent.layout;
				setContainerWidth(width);
				containerWidthShared.value = width;
			}}
		>
			{/* Background Container */}
			<View
				style={[
					styles.container,
					{
						height: CONTAINER_HEIGHT,
						borderRadius: CONTAINER_HEIGHT / 2,
					},
				]}
			/>

			{/* Text Layer */}
			<Animated.View
				style={[styles.textContainer, { height: CONTAINER_HEIGHT }, textContainerAnimatedStyle]}
			>
				<View style={styles.textContent}>
					<Text size="16" weight="black" textColor="black" style={styles.aboutText}>
						ABOUT{' '}
					</Text>
					<View style={styles.logoContainer}>
						<SometimeLogo width={80} height={11} />
					</View>
				</View>
			</Animated.View>

			{/* Handle */}
			{Platform.OS === 'web' ? (
				<Animated.View
					style={[
						styles.handleWrapper,
						{
							left: PADDING,
							top: PADDING,
							width: HANDLE_SIZE,
							height: HANDLE_SIZE,
						},
						handleAnimatedStyle,
					]}
					onPointerDown={handleWebPointerDown}
					onPointerMove={handleWebPointerMove}
					onPointerUp={handleWebPointerUp}
					{...({
						onMouseDown: handleWebPointerDown,
						onMouseMove: handleWebPointerMove,
						onMouseUp: handleWebPointerUp,
					} as any)}
				>
					<View
						style={[
							styles.handle,
							{
								width: HANDLE_SIZE,
								height: HANDLE_SIZE,
								borderRadius: HANDLE_SIZE / 2,
							},
						]}
					>
						<RNAnimated.View
							style={{
								transform: [{ translateX: webArrowTranslateX }],
							}}
						>
							<SlideArrow width={20} height={20} />
						</RNAnimated.View>
					</View>
				</Animated.View>
			) : (
				<GestureDetector gesture={panGesture}>
					<Animated.View
						style={[
							styles.handleWrapper,
							{
								left: PADDING,
								top: PADDING,
								width: HANDLE_SIZE,
								height: HANDLE_SIZE,
							},
							handleAnimatedStyle,
						]}
					>
						<View
							style={[
								styles.handle,
								{
									width: HANDLE_SIZE,
									height: HANDLE_SIZE,
									borderRadius: HANDLE_SIZE / 2,
								},
							]}
						>
							<Animated.View
								style={[
									(Platform.OS as string) !== 'web' ? arrowAnimatedStyle : undefined,
									(Platform.OS as string) === 'web' ? styles.arrowWeb : undefined,
								]}
							>
								<SlideArrow width={20} height={20} />
							</Animated.View>
						</View>
					</Animated.View>
				</GestureDetector>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		position: 'relative',
	},
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: CONTAINER_BG_COLOR,
		borderWidth: 2,
		borderColor: '#7A4AE226',
		...Platform.select({
			ios: {
				shadowColor: '#7A4AE2',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
			web: {
				boxShadow: '0 2px 8px rgba(122, 74, 226, 0.1)',
			} as any,
		}),
	},
	textContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	aboutText: {
		fontFamily: 'Pretendard-Black',
	},
	logoContainer: {
		width: 80,
		height: 11,
		justifyContent: 'center',
		alignItems: 'center',
	},
	handleWrapper: {
		position: 'absolute',
		...Platform.select({
			web: {
				touchAction: 'none',
				userSelect: 'none',
				WebkitUserSelect: 'none',
				MozUserSelect: 'none',
				msUserSelect: 'none',
			} as any,
			default: {},
		}),
	},
	handle: {
		backgroundColor: '#7A4AE2',
		justifyContent: 'center',
		alignItems: 'center',
		...Platform.select({
			ios: {
				shadowColor: '#7A4AE2',
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.4,
				shadowRadius: 10,
			},
			android: {
				elevation: 8,
			},
			web: {
				boxShadow: '0 4px 10px rgba(122, 74, 226, 0.4)',
				cursor: 'grab',
			},
		}),
	},
	arrowWeb: Platform.select({
		web: {
			animationName: 'arrowSlide',
			animationDuration: '1.6s',
			animationIterationCount: 'infinite',
			animationTimingFunction: 'ease-in-out',
		} as any,
		default: {},
	}),
});
