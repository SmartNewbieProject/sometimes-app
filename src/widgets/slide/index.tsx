import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import { cn } from '@/src/shared/libs/cn';
import { Text } from '@/src/shared/ui';

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
  animationType?: 'slide' | 'fade' | 'slide-fade';
  animationDuration?: number;
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
  animationType = 'slide-fade',
  animationDuration = 300,
}: SlideProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const totalSlides = React.Children.count(children);

  // Use container width instead of window width
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;

    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / containerWidth);

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
      scrollViewRef.current.scrollTo({
        x: index * containerWidth,
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
          <View className={cn(
            "px-2 py-1 bg-primaryPurple rounded-full",
            indicatorContainerClassName
          )}>
            <Text size="sm" textColor="white">
              {activeIndex + 1} / {totalSlides}
            </Text>
          </View>
        );

      case 'line':
        return (
          <View className={cn(
            "flex-row items-center justify-center gap-1",
            indicatorContainerClassName
          )}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                className={cn(
                  "h-1 rounded-full",
                  index === activeIndex
                    ? cn("bg-primaryPurple w-6", activeIndicatorClassName)
                    : cn("bg-lightPurple w-3", indicatorClassName)
                )}
              />
            ))}
          </View>
        );

      case 'dot':
      default:
        return (
          <View className={cn(
            "flex-row items-center justify-center gap-2",
            indicatorContainerClassName
          )}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index === activeIndex
                    ? cn("bg-primaryPurple", activeIndicatorClassName)
                    : cn("bg-lightPurple", indicatorClassName)
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
      case 'slide-fade':
      default:
        return {
          opacity: fadeAnimation,
          transform: [{ translateX: slideAnimation }],
        };
    }
  };

  return (
    <View
      className={cn("relative flex flex-col", className)}
      onLayout={handleLayout}
    >
      {showIndicator && indicatorPosition === 'top' && (
        <View className="absolute top-4 z-10 w-full items-center">
          {renderIndicator()}
        </View>
      )}

      {containerWidth > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: containerWidth }}
          contentContainerStyle={{ width: containerWidth * totalSlides }}
        >
          {React.Children.map(children, (child, index) => {
            const wrappedChild = (
              <View style={{ width: '100%', maxWidth: containerWidth }}>
                {child}
              </View>
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
        <View className="pt-2 w-full items-center">
          {renderIndicator()}
        </View>
      )}
    </View>
  );
}
