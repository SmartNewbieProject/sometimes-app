import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	StatusBar,
	Platform,
	ActivityIndicator,
	Pressable,
	Linking,
	ScrollView,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useCardNewsDetail, useCardNewsReward } from '@/src/features/card-news/queries';
import {
	useCardNewsAnalytics,
	CARD_NEWS_NAVIGATION_METHODS,
	CARD_NEWS_EXIT_METHODS,
	CARD_NEWS_ENTRY_SOURCES,
} from '@/src/features/card-news';
import { useToast } from '@/src/shared/hooks/use-toast';
import type { CardSection } from '@/src/features/card-news/types';
import { useTranslation } from 'react-i18next';

const URL_REGEX = /(https?:\/\/[^\s<\]]+)/g;
const ANIMATION_DURATION = 300;

const handleOpenUrl = (url: string) => {
	Linking.openURL(url).catch(() => {});
};

const renderTextWithLinks = (text: string, baseStyle: object) => {
	const parts = text.split(URL_REGEX);

	return parts.map((part, idx) => {
		if (URL_REGEX.test(part)) {
			URL_REGEX.lastIndex = 0;
			return (
				<Text key={idx} style={[baseStyle, styles.linkText]} onPress={() => handleOpenUrl(part)}>
					{part}
				</Text>
			);
		}
		return part;
	});
};

const renderHtmlContent = (html: string) => {
	const lines = html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n')
		.replace(/<p>/gi, '')
		.split('\n')
		.filter((line) => line.trim());

	return lines
		.map((line, index) => {
			const isBold = /<(strong|b)>/.test(line);
			const cleanLine = line
				.replace(/<[^>]*>/g, '')
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.trim();

			if (!cleanLine) return null;

			const textStyle = isBold ? styles.cardBodyBold : styles.cardBodyLine;

			return (
				<Text key={index} style={textStyle}>
					{renderTextWithLinks(cleanLine, textStyle)}
				</Text>
			);
		})
		.filter(Boolean);
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 428);
const MAX_IMAGE_HEIGHT = 475;

export default function CardNewsDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [hasClaimedReward, setHasClaimedReward] = useState(false);
	const { emitToast } = useToast();
	const analytics = useCardNewsAnalytics();
	const { t } = useTranslation();

	const { data: cardNews, isLoading, error } = useCardNewsDetail(id ?? '', !!id);
	const { mutate: claimReward, isPending: isClaimingReward } = useCardNewsReward();

	const sections = cardNews?.sections ?? [];
	const totalCards = sections.length;
	const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);

	const entrySourceRef = useRef<
		(typeof CARD_NEWS_ENTRY_SOURCES)[keyof typeof CARD_NEWS_ENTRY_SOURCES]
	>(CARD_NEWS_ENTRY_SOURCES.DEEP_LINK);
	const hasTrackedEntryRef = useRef(false);
	const hasTrackedCompletionRef = useRef(false);

	const translateX = useSharedValue(0);
	const currentIndexShared = useSharedValue(0);

	useEffect(() => {
		setCurrentIndex(0);
		setHasClaimedReward(false);
		hasTrackedEntryRef.current = false;
		hasTrackedCompletionRef.current = false;
		translateX.value = 0;
		currentIndexShared.value = 0;
	}, [id, translateX, currentIndexShared]);

	useEffect(() => {
		if (cardNews && !hasTrackedEntryRef.current) {
			hasTrackedEntryRef.current = true;
			analytics.trackDetailEntered(
				cardNews.id,
				cardNews.title,
				cardNews.sections.length,
				entrySourceRef.current,
			);
		}
	}, [cardNews, analytics]);

	const handleClaimReward = useCallback(() => {
		if (!id || hasClaimedReward || isClaimingReward) return;

		claimReward(id, {
			onSuccess: (response) => {
				setHasClaimedReward(true);
				if (response.success && response.reward) {
					emitToast(
						`구슬 ${response.reward.gems}개 획득!`,
						<View
							style={{
								width: 24,
								height: 24,
								borderRadius: 12,
								backgroundColor: semanticColors.brand.primary,
							}}
						/>,
					);
				} else if (response.alreadyRewarded) {
					emitToast(t('features.card-news.viewer.reward_already'), undefined);
				}
			},
			onError: () => {
				emitToast(t('features.card-news.viewer.reward_error'), undefined);
			},
		});
	}, [id, hasClaimedReward, isClaimingReward, claimReward, emitToast, t]);

	const goToIndex = useCallback(
		(
			index: number,
			animated = true,
			navigationMethod?: (typeof CARD_NEWS_NAVIGATION_METHODS)[keyof typeof CARD_NEWS_NAVIGATION_METHODS],
		) => {
			const clampedIndex = Math.max(0, Math.min(index, totalCards - 1));

			if (navigationMethod) {
				analytics.trackCardNavigated(clampedIndex, navigationMethod);
			}

			if (animated) {
				translateX.value = withTiming(-clampedIndex * CONTAINER_WIDTH, {
					duration: ANIMATION_DURATION,
					easing: Easing.out(Easing.cubic),
				});
			} else {
				translateX.value = -clampedIndex * CONTAINER_WIDTH;
			}

			currentIndexShared.value = clampedIndex;
			setCurrentIndex(clampedIndex);

			if (clampedIndex === totalCards - 1 && !hasTrackedCompletionRef.current) {
				hasTrackedCompletionRef.current = true;
				analytics.trackCompleted();
			}
		},
		[totalCards, analytics, translateX, currentIndexShared],
	);

	const handleClose = useCallback(() => {
		if (!hasTrackedCompletionRef.current && analytics.hasActiveSession()) {
			analytics.trackExited(CARD_NEWS_EXIT_METHODS.BACK_BUTTON);
		}

		if (router.canGoBack()) {
			router.back();
		} else {
			router.push('/community');
		}
	}, [analytics]);

	const panGesture = useMemo(() => {
		return Gesture.Pan()
			.activeOffsetX([-10, 10])
			.failOffsetY([-20, 20])
			.onUpdate((event) => {
				'worklet';
				const baseX = -currentIndexShared.value * CONTAINER_WIDTH;
				translateX.value = baseX + event.translationX;
			})
			.onEnd((event) => {
				'worklet';
				const threshold = CONTAINER_WIDTH * 0.2;
				const velocityThreshold = 500;

				let nextIndex = currentIndexShared.value;

				const movedEnough = Math.abs(event.translationX) > threshold;
				const flicked = Math.abs(event.velocityX) > velocityThreshold;

				if (movedEnough || flicked) {
					const direction =
						event.translationX !== 0 ? Math.sign(event.translationX) : Math.sign(event.velocityX);

					nextIndex = currentIndexShared.value + (direction > 0 ? -1 : 1);
				}

				nextIndex = Math.max(0, Math.min(nextIndex, totalCards - 1));
				runOnJS(goToIndex)(nextIndex, true, CARD_NEWS_NAVIGATION_METHODS.SWIPE);
			});
	}, [totalCards, translateX, currentIndexShared, goToIndex]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const renderCard = useCallback(
		(section: CardSection, index: number) => (
			<View key={section.order} style={styles.cardContainer}>
				<ScrollView
					style={styles.cardScrollView}
					contentContainerStyle={styles.cardScrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.cardPadding}>
						<View style={styles.cardImageArea}>
							{section.imageUrl ? (
								<Image
									source={{ uri: section.imageUrl }}
									style={styles.cardImage}
									contentFit="cover"
								/>
							) : (
								<View style={styles.cardImagePlaceholder}>
									<Text style={styles.placeholderEmoji}>📰</Text>
								</View>
							)}
						</View>

						<View style={styles.cardTextArea}>
							<Text style={styles.cardTitle}>{section.title}</Text>
							<View style={styles.cardBodyContainer}>{renderHtmlContent(section.content)}</View>
						</View>
					</View>
				</ScrollView>
			</View>
		),
		[],
	);

	if (!id) {
		return (
			<View style={styles.wrapper}>
				<View style={styles.container}>
					<StatusBar barStyle="dark-content" />
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{t('features.card-news.detail.invalid_link')}</Text>
						<Pressable onPress={handleClose} style={styles.errorButton}>
							<Text style={styles.errorButtonText}>
								{t('features.card-news.detail.back_button')}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.wrapper}>
				<View style={styles.container}>
					<StatusBar barStyle="dark-content" />
					<View style={[styles.header, { paddingTop: insets.top + 16 }]}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={handleClose}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Text style={styles.backIcon}>←</Text>
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{t('features.card-news.detail.header_title')}</Text>
						<View style={styles.headerSpacer} />
					</View>
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{t('features.card-news.detail.load_error')}</Text>
						<Pressable onPress={handleClose} style={styles.errorButton}>
							<Text style={styles.errorButtonText}>
								{t('features.card-news.detail.back_button')}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		);
	}

	if (isLoading) {
		return (
			<View style={styles.wrapper}>
				<View style={styles.container}>
					<StatusBar barStyle="dark-content" />
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={semanticColors.brand.primary} size="large" />
					</View>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<StatusBar barStyle="dark-content" />

				<View style={[styles.header, { paddingTop: insets.top + 16 }]}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={handleClose}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Text style={styles.backIcon}>←</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>새로운 소식</Text>
					<View style={styles.headerSpacer} />
				</View>

				<View style={styles.carouselContainer}>
					{totalCards > 1 && (
						<View style={styles.indicatorContainer}>
							<View style={styles.dotsWrapper}>
								{sortedSections.map((_, index) => (
									<Pressable
										key={`dot-${index}`}
										onPress={() => goToIndex(index, true)}
										hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
									>
										<View style={[styles.dot, index === currentIndex && styles.dotActive]} />
									</Pressable>
								))}
							</View>

							{totalCards - currentIndex - 1 > 0 && (
								<View style={styles.remainingBadge}>
									<Text style={styles.remainingText}>
										{t('features.card-news.viewer.cards_remaining', {
											count: totalCards - currentIndex - 1,
										})}
									</Text>
								</View>
							)}
						</View>
					)}

					<GestureDetector gesture={panGesture}>
						<Animated.View
							style={[styles.carouselTrack, { width: CONTAINER_WIDTH * totalCards }, animatedStyle]}
						>
							{sortedSections.map((section, index) => renderCard(section, index))}
						</Animated.View>
					</GestureDetector>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		width: '100%',
		maxWidth: 428,
		backgroundColor: '#FFFFFF',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	errorText: {
		fontSize: 16,
		fontWeight: '600',
		color: semanticColors.text.primary,
		marginBottom: 20,
		textAlign: 'center',
	},
	errorButton: {
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	errorButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 16,
		backgroundColor: semanticColors.surface.background,
		borderBottomWidth: 1,
		borderBottomColor: '#E4E2E2',
		zIndex: 10,
	},
	backButton: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backIcon: {
		fontSize: 24,
		color: semanticColors.text.primary,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: semanticColors.text.primary,
	},
	headerSpacer: {
		width: 24,
	},
	carouselContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	carouselTrack: {
		flex: 1,
		flexDirection: 'row',
	},
	indicatorContainer: {
		position: 'absolute',
		top: 8,
		left: 16,
		right: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		zIndex: 10,
		pointerEvents: 'box-none',
	},
	dotsWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		pointerEvents: 'auto',
	},
	remainingBadge: {
		backgroundColor: 'rgba(122, 74, 226, 0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		pointerEvents: 'none',
	},
	remainingText: {
		fontSize: 13,
		fontWeight: '600',
		color: semanticColors.brand.primary,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#E2D5FF',
	},
	dotActive: {
		width: 28,
		height: 10,
		borderRadius: 5,
		backgroundColor: semanticColors.brand.primary,
	},
	cardContainer: {
		width: CONTAINER_WIDTH,
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	cardScrollView: {
		flex: 1,
		paddingTop: 48,
	},
	cardScrollContent: {
		flexGrow: 1,
	},
	cardPadding: {
		paddingHorizontal: 20,
	},
	cardImageArea: {
		width: '100%',
		aspectRatio: 4 / 5,
		maxHeight: MAX_IMAGE_HEIGHT,
		backgroundColor: '#F7F3FF',
		borderRadius: 16,
		overflow: 'hidden',
	},
	cardImage: {
		width: '100%',
		height: '100%',
	},
	cardImagePlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: '#F7F3FF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	placeholderEmoji: {
		fontSize: 60,
	},
	cardTextArea: {
		marginTop: 24,
		paddingBottom: 40,
	},
	cardTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: semanticColors.text.primary,
		marginBottom: 16,
		lineHeight: 32,
	},
	cardBodyContainer: {
		gap: 8,
	},
	cardBodyLine: {
		fontSize: 16,
		lineHeight: 24,
		color: '#333333',
	},
	cardBodyBold: {
		fontWeight: '700',
		color: semanticColors.text.primary,
	},
	linkText: {
		color: semanticColors.brand.primary,
		textDecorationLine: 'underline',
	},
});
