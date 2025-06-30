import { cn } from '@/src/shared/libs/cn';
import { Text } from '@/src/shared/ui';
import React, { useState, useRef, useEffect } from 'react';
import {
	Animated,
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	ScrollView,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from 'react-native';

interface SlideProps {
	children: React.ReactNode[];
	className?: string;
	indicatorClassName?: string;
	activeIndicatorClassName?: string;
	indicatorContainerClassName?: string;
	autoPlay?: boolean;
	autoPlayInterval?: number;
	showIndicator?: boolean;
	indicatorPosition?: 'top' | 'bottom';
	indicatorType?: 'dot' | 'line' | 'number';
	onSlideChange?: (index: number) => void;
	onScrollStateChange?: (isScrolling: boolean) => void; // 스크롤 상태 변경 콜백 추가
	animationType?: 'slide' | 'fade' | 'slide-fade';
	animationDuration?: number;
	loop?: boolean; // 무한 루프 활성화 여부
}

export function Slide({
	children,
	className = '',
	indicatorClassName = '',
	activeIndicatorClassName = '',
	indicatorContainerClassName = '',
	autoPlay = false,
	autoPlayInterval = 3000,
	showIndicator = true,
	indicatorPosition = 'bottom',
	indicatorType = 'dot',
	onSlideChange,
	onScrollStateChange,
	animationType = 'slide-fade',
	animationDuration = 300,
	loop = false, // 기본값은 false
}: SlideProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [previousIndex, setPreviousIndex] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);
	const [isScrolling, setIsScrolling] = useState(false); // 스크롤 중인지 여부를 추적
	const scrollViewRef = useRef<ScrollView>(null);
	const totalSlides = React.Children.count(children);

	// 화면 너비 정보 가져오기 (앱에서도 안정적으로 동작)
	const { width: windowWidth } = useWindowDimensions();

	// 컨테이너 너비 설정 (레이아웃 이벤트와 화면 너비 모두 고려)
	const handleLayout = (event: LayoutChangeEvent) => {
		const { width } = event.nativeEvent.layout;
		setContainerWidth(width);
	};

	// 화면 너비가 변경될 때 컨테이너 너비도 업데이트
	useEffect(() => {
		if (containerWidth === 0) {
			setContainerWidth(windowWidth);
		}
	}, [windowWidth]);

	// Animation values
	const slideAnimation = useRef(new Animated.Value(0)).current;
	const fadeAnimation = useRef(new Animated.Value(1)).current;

	// 스크롤 타이머 ref
	const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		if (containerWidth === 0) return;

		// 스크롤 시작 시 상태 업데이트
		if (!isScrolling) {
			setIsScrolling(true);
			// 스크롤 상태 변경 콜백 호출
			onScrollStateChange?.(true);
		}

		// 이전 타이머가 있으면 취소
		if (scrollTimerRef.current) {
			clearTimeout(scrollTimerRef.current);
		}

		// 스크롤이 끝난 후 일정 시간이 지나면 스크롤 상태 초기화
		scrollTimerRef.current = setTimeout(() => {
			setIsScrolling(false);
			// 스크롤 상태 변경 콜백 호출
			onScrollStateChange?.(false);
			scrollTimerRef.current = null;
		}, 500); // 스크롤이 끝난 후 0.5초 후에 상태 초기화

		const contentOffsetX = event.nativeEvent.contentOffset.x;
		let newIndex = Math.round(contentOffsetX / containerWidth);

		// 한 번에 한 장씩만 이동하도록 제한
		if (Math.abs(newIndex - activeIndex) > 1) {
			// 이전 인덱스와 현재 인덱스의 차이가 1보다 크면 한 장씩만 이동하도록 제한
			newIndex = activeIndex + (newIndex > activeIndex ? 1 : -1);
			// 스크롤 위치 조정
			scrollViewRef.current?.scrollTo({
				x: newIndex * containerWidth,
				animated: true,
			});
		}

		if (newIndex !== activeIndex) {
			setPreviousIndex(activeIndex);
			setActiveIndex(newIndex);
			onSlideChange?.(newIndex);
		}
	};

	useEffect(() => {
		if (previousIndex !== activeIndex && containerWidth > 0) {
			// Reset animations
			slideAnimation.setValue(previousIndex < activeIndex ? containerWidth : -containerWidth);
			fadeAnimation.setValue(0);

			// Start animations
			Animated.parallel([
				Animated.timing(slideAnimation, {
					toValue: 0,
					duration: animationDuration,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnimation, {
					toValue: 1,
					duration: animationDuration,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [activeIndex, previousIndex, animationDuration, containerWidth]);

	const scrollToIndex = (index: number) => {
		if (scrollViewRef.current && containerWidth > 0) {
			let targetIndex = index;

			// 무한 루프 처리
			if (loop && totalSlides > 1) {
				// 인덱스가 범위를 벗어나면 조정
				if (index >= totalSlides) {
					targetIndex = 0;
				} else if (index < 0) {
					targetIndex = totalSlides - 1;
				}
			} else {
				// 루프가 아닌 경우 범위 제한
				targetIndex = Math.max(0, Math.min(index, totalSlides - 1));
			}

			scrollViewRef.current.scrollTo({
				x: targetIndex * containerWidth,
				animated: true,
			});
		}
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (autoPlay && totalSlides > 1) {
			interval = setInterval(() => {
				const nextIndex = (activeIndex + 1) % totalSlides;
				scrollToIndex(nextIndex);
			}, autoPlayInterval);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [activeIndex, autoPlay, autoPlayInterval, totalSlides]);

	const renderIndicator = () => {
		switch (indicatorType) {
			case 'number':
				return (
					<View
						className={cn('px-2 py-1 bg-primaryPurple rounded-full', indicatorContainerClassName)}
					>
						<Text size="sm" textColor="white">
							{activeIndex + 1} / {totalSlides}
						</Text>
					</View>
				);

			case 'line':
				return (
					<View
						className={cn(
							'flex-row items-center justify-center gap-1',
							indicatorContainerClassName,
						)}
					>
						{Array.from({ length: totalSlides }).map((_, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => scrollToIndex(index)}
								className={cn(
									'h-1 rounded-full',
									index === activeIndex
										? cn('bg-primaryPurple w-6', activeIndicatorClassName)
										: cn('bg-lightPurple w-3', indicatorClassName),
								)}
							/>
						))}
					</View>
				);
			default:
				return (
					<View
						className={cn(
							'flex-row items-center justify-center gap-2',
							indicatorContainerClassName,
						)}
					>
						{Array.from({ length: totalSlides }).map((_, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => scrollToIndex(index)}
								className={cn(
									'w-2 h-2 rounded-full',
									index === activeIndex
										? cn('bg-primaryPurple', activeIndicatorClassName)
										: cn('bg-lightPurple', indicatorClassName),
								)}
							/>
						))}
					</View>
				);
		}
	};

	// Create animated slide styles based on animation type
	const getAnimatedStyles = (index: number) => {
		if (index !== activeIndex) return {};

		switch (animationType) {
			case 'fade':
				return {
					opacity: fadeAnimation,
				};
			case 'slide':
				return {
					transform: [{ translateX: slideAnimation }],
				};
			default:
				return {
					opacity: fadeAnimation,
					transform: [{ translateX: slideAnimation }],
				};
		}
	};

	return (
		<View className={cn('relative flex flex-col', className)} onLayout={handleLayout}>
			{showIndicator && indicatorPosition === 'top' && (
				<View className="absolute top-4 z-10 w-full items-center">{renderIndicator()}</View>
			)}

			{containerWidth > 0 ? (
				<ScrollView
					ref={scrollViewRef}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onScroll={handleScroll}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {
						setIsScrolling(true);
						onScrollStateChange?.(true);
					}}
					onScrollEndDrag={() => {
						// 스크롤이 끝난 후 일정 시간이 지나면 스크롤 상태 초기화
						setTimeout(() => {
							setIsScrolling(false);
							onScrollStateChange?.(false);
						}, 300);
					}}
					style={{ width: containerWidth }}
					contentContainerStyle={{ width: containerWidth * totalSlides }}
				>
					{React.Children.map(children, (child, index) => {
						const wrappedChild = (
							<View style={{ width: '100%', maxWidth: containerWidth }}>{child}</View>
						);

						return (
							<Animated.View
								key={index}
								style={[{ width: containerWidth }, getAnimatedStyles(index)]}
							>
								{wrappedChild}
							</Animated.View>
						);
					})}
				</ScrollView>
			) : null}

			{showIndicator && indicatorPosition === 'bottom' && (
				<View className="pt-2 w-full items-center">{renderIndicator()}</View>
			)}
		</View>
	);
}
