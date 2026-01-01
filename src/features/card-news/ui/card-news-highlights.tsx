/**
 * 카드뉴스 하이라이트 캐러셀
 * 홈 화면 상단에 표시되는 최신 카드뉴스 3개
 * - 3초 간격 자동 슬라이드
 * - 무한 캐러셀 (마지막 → 첫 번째 자연스러운 전환)
 * - 터치 시 자동 슬라이드 일시 중지
 * - Reanimated 기반 네이티브 스레드 애니메이션으로 60fps 성능 보장
 */
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	StyleSheet,
	Dimensions,
	type LayoutChangeEvent,
} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
	Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useCardNewsHighlights } from '../queries';
import { useCardNewsAnalytics } from '../hooks';
import type { CardNewsHighlight } from '../types';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;
const AUTO_SLIDE_INTERVAL = 3000;
const ANIMATION_DURATION = 300;

type Props = {
	onPressItem: (item: CardNewsHighlight) => void;
};

export function CardNewsHighlights({ onPressItem }: Props) {
	const { t } = useTranslation();
	const { data: highlights, isLoading, isError } = useCardNewsHighlights();
	const analytics = useCardNewsAnalytics();
	const initialWidth = SCREEN_WIDTH - 32;
	const [containerWidth, setContainerWidth] = useState(initialWidth);
	const [displayIndex, setDisplayIndex] = useState(0);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
	const wasAutoScrolledRef = useRef(true);

	const itemCount = highlights?.length ?? 0;
	const extendedLength = itemCount <= 1 ? itemCount : itemCount + 2;

	const extendedHighlights = useMemo(() => {
		if (!highlights || highlights.length === 0) return [];
		if (highlights.length === 1) return highlights;
		return [highlights[highlights.length - 1], ...highlights, highlights[0]];
	}, [highlights]);

	const translateX = useSharedValue(itemCount > 1 ? -initialWidth : 0);
	const currentIndex = useSharedValue(itemCount > 1 ? 1 : 0);
	const isAnimating = useSharedValue(false);

	const getRealIndex = useCallback(
		(extendedIndex: number) => {
			if (itemCount <= 1) return 0;
			if (extendedIndex === 0) return itemCount - 1;
			if (extendedIndex === extendedLength - 1) return 0;
			return extendedIndex - 1;
		},
		[itemCount, extendedLength],
	);

	const updateDisplayIndex = useCallback(
		(extendedIndex: number) => {
			const realIdx = getRealIndex(extendedIndex);
			setDisplayIndex(realIdx);
		},
		[getRealIndex],
	);

	const handleLayout = useCallback(
		(e: LayoutChangeEvent) => {
			const newWidth = e.nativeEvent.layout.width;
			setContainerWidth(newWidth);
			if (!isLayoutReady) {
				if (itemCount > 1) {
					translateX.value = -newWidth;
					currentIndex.value = 1;
				}
				setIsLayoutReady(true);
			}
		},
		[isLayoutReady, itemCount, translateX, currentIndex],
	);

	const stopAutoSlide = useCallback(() => {
		if (autoSlideTimer.current) {
			clearInterval(autoSlideTimer.current);
			autoSlideTimer.current = null;
		}
	}, []);

	const animateToIndex = useCallback(
		(index: number, width: number, animated = true) => {
			'worklet';
			const targetX = -index * width;
			if (animated) {
				translateX.value = withTiming(targetX, {
					duration: ANIMATION_DURATION,
					easing: Easing.out(Easing.cubic),
				});
			} else {
				translateX.value = targetX;
			}
		},
		[translateX],
	);

	const goToIndex = useCallback(
		(index: number, animated = true) => {
			if (itemCount <= 1) {
				currentIndex.value = 0;
				animateToIndex(0, containerWidth, animated);
				updateDisplayIndex(0);
				return;
			}

			const maxIndex = extendedLength - 1;

			if (index <= 0) {
				currentIndex.value = 0;
				animateToIndex(0, containerWidth, animated);
				updateDisplayIndex(0);

				setTimeout(
					() => {
						const jumpIndex = extendedLength - 2;
						currentIndex.value = jumpIndex;
						translateX.value = -jumpIndex * containerWidth;
					},
					animated ? ANIMATION_DURATION : 0,
				);
			} else if (index >= maxIndex) {
				currentIndex.value = maxIndex;
				animateToIndex(maxIndex, containerWidth, animated);
				updateDisplayIndex(maxIndex);

				setTimeout(
					() => {
						currentIndex.value = 1;
						translateX.value = -containerWidth;
					},
					animated ? ANIMATION_DURATION : 0,
				);
			} else {
				currentIndex.value = index;
				animateToIndex(index, containerWidth, animated);
				updateDisplayIndex(index);
			}
		},
		[
			itemCount,
			extendedLength,
			containerWidth,
			animateToIndex,
			updateDisplayIndex,
			currentIndex,
			translateX,
		],
	);

	const startAutoSlide = useCallback(() => {
		stopAutoSlide();
		if (itemCount <= 1) return;

		autoSlideTimer.current = setInterval(() => {
			if (isAnimating.value) return;

			wasAutoScrolledRef.current = true;
			const nextIndex = currentIndex.value + 1;
			goToIndex(nextIndex, true);
		}, AUTO_SLIDE_INTERVAL);
	}, [itemCount, goToIndex, stopAutoSlide, currentIndex, isAnimating]);

	useEffect(() => {
		if (itemCount > 1 && isLayoutReady) {
			updateDisplayIndex(1);
		}
	}, [itemCount, isLayoutReady, updateDisplayIndex]);

	useEffect(() => {
		if (itemCount > 1) {
			startAutoSlide();
		}
		return () => stopAutoSlide();
	}, [itemCount, startAutoSlide, stopAutoSlide]);

	const handleItemPress = useCallback(
		(item: CardNewsHighlight, index: number) => {
			const realIndex = getRealIndex(index);
			analytics.trackHighlightClicked(item.id, item.title, realIndex, wasAutoScrolledRef.current);
			onPressItem(item);
		},
		[analytics, getRealIndex, onPressItem],
	);

	const panGesture = useMemo(() => {
		const cWidth = containerWidth;
		const maxIdx = extendedLength - 1;

		return Gesture.Pan()
			.activeOffsetX([-10, 10])
			.failOffsetY([-20, 20])
			.onStart(() => {
				'worklet';
				isAnimating.value = true;
				runOnJS(stopAutoSlide)();
			})
			.onUpdate((event) => {
				'worklet';
				const baseX = -currentIndex.value * cWidth;
				translateX.value = baseX + event.translationX;
			})
			.onEnd((event) => {
				'worklet';
				const threshold = cWidth * 0.2;
				const velocityThreshold = 500;

				let nextIndex = currentIndex.value;

				const movedEnough = Math.abs(event.translationX) > threshold;
				const flicked = Math.abs(event.velocityX) > velocityThreshold;

				if (movedEnough || flicked) {
					const direction =
						event.translationX !== 0 ? Math.sign(event.translationX) : Math.sign(event.velocityX);

					nextIndex = currentIndex.value + (direction > 0 ? -1 : 1);
				}

				runOnJS(goToIndex)(nextIndex, true);
			})
			.onFinalize(() => {
				'worklet';
				isAnimating.value = false;
				runOnJS(startAutoSlide)();
			});
	}, [
		containerWidth,
		extendedLength,
		translateX,
		currentIndex,
		isAnimating,
		goToIndex,
		stopAutoSlide,
		startAutoSlide,
	]);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const hasData = highlights && highlights.length > 0;

	if (!hasData && isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator color={semanticColors.brand.primary} />
			</View>
		);
	}

	if (isError || !hasData) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyEmoji}>✨</Text>
				<Text style={styles.emptyTitle}>{t('features.card-news.highlights.empty_title')}</Text>
				<Text style={styles.emptyDescription}>
					{t('features.card-news.highlights.empty_description')}
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text weight="bold" style={styles.sectionTitle}>
					{t('features.card-news.highlights.section_title')}
				</Text>
			</View>

			<View onLayout={handleLayout} style={styles.carouselContainer}>
				<GestureDetector gesture={panGesture}>
					<Animated.View
						style={[
							styles.carouselTrack,
							{ width: containerWidth * extendedHighlights.length },
							animatedContainerStyle,
							!isLayoutReady && styles.hiddenBeforeLayout,
						]}
					>
						{extendedHighlights.map((item, index) => (
							<TouchableOpacity
								key={`${item.id}-${index}`}
								activeOpacity={0.9}
								onPress={() => handleItemPress(item, index)}
								style={[styles.cardWrapper, { width: containerWidth }]}
							>
								<View style={styles.card}>
									<Image
										source={{ uri: item.backgroundImage.url }}
										style={StyleSheet.absoluteFillObject}
										contentFit="cover"
										recyclingKey={`card-${item.id}`}
									/>
									<LinearGradient
										colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
										locations={[0, 0.4, 1]}
										style={StyleSheet.absoluteFillObject}
									/>
									<View style={styles.cardContent}>
										<Text style={styles.cardTitle} numberOfLines={2}>
											{item.title}
										</Text>
										<Text style={styles.cardDescription} numberOfLines={2}>
											{item.description}
										</Text>
										<View style={styles.ctaButton}>
											<Text style={styles.ctaText}>
												{t('features.card-news.highlights.cta_button')}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</Animated.View>
				</GestureDetector>
			</View>

			<View style={styles.paginationContainer}>
				{highlights.map((_, index) => (
					<Animated.View
						key={index}
						style={[styles.paginationDot, index === displayIndex && styles.paginationDotActive]}
					/>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	loadingContainer: {
		height: 280,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		height: 200,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(247, 243, 255, 0.5)',
		marginHorizontal: 16,
		marginBottom: 24,
		borderRadius: 20,
		paddingHorizontal: 32,
	},
	emptyEmoji: {
		fontSize: 48,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: semanticColors.brand.primary,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyDescription: {
		fontSize: 14,
		color: semanticColors.text.secondary,
		textAlign: 'center',
		lineHeight: 20,
	},
	header: {
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: semanticColors.text.primary,
	},
	carouselContainer: {
		overflow: 'hidden',
		marginHorizontal: 16,
	},
	carouselTrack: {
		flexDirection: 'row',
	},
	hiddenBeforeLayout: {
		opacity: 0,
	},
	cardWrapper: {
		paddingRight: 8,
	},
	card: {
		height: 280,
		borderRadius: 20,
		overflow: 'hidden',
		backgroundColor: semanticColors.brand.primary,
	},
	cardContent: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 24,
	},
	cardTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#FFFFFF',
		lineHeight: 32,
		marginBottom: 8,
	},
	cardDescription: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.95)',
		lineHeight: 20,
		marginBottom: 16,
	},
	ctaButton: {
		alignSelf: 'flex-start',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	ctaText: {
		color: semanticColors.brand.primary,
		fontSize: 13,
		fontWeight: '600',
	},
	paginationContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 12,
		gap: 6,
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#D9D9D9',
	},
	paginationDotActive: {
		width: 36,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 10,
	},
});
