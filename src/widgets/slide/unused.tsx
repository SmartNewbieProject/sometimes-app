import { Text } from "@/src/shared/ui";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  SetStateAction,
} from "react";
import {
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface SlideProps {
  children: React.ReactNode[];
  className?: string;
  indicatorClassName?: string;
  activeIndicatorClassName?: string;
  indicatorContainerClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicator?: boolean;
  indicatorPosition?: "top" | "bottom";
  indicatorType?: "dot" | "line" | "number";
  onSlideChange?: (index: number) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  animationDuration?: number;
}

export function Slide({
  children,
  className = "",
  indicatorClassName = "",
  activeIndicatorClassName = "",
  indicatorContainerClassName = "",
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicator = true,
  indicatorPosition = "bottom",
  indicatorType = "dot",
  onSlideChange,
  onScrollStateChange,
  animationDuration = 300,
}: SlideProps) {
  const loop = false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = React.Children.count(children);

  const { width: windowWidth } = useWindowDimensions();

  const dragStartX = useRef(0);
  const currentVirtualIndex = useRef(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);

    if (loop && totalSlides > 1) {
      translateX.setValue(-width);
      currentVirtualIndex.current = 1;
    } else {
      translateX.setValue(0);
      currentVirtualIndex.current = 0;
    }
  };

  useEffect(() => {
    if (containerWidth === 0) {
      setContainerWidth(windowWidth);
    }
  }, [windowWidth]);

  // 슬라이드 이동 함수 - 현재 실제 위치 기준으로 계산
  const moveToSlide = useCallback(
    (targetIndex: number, animated = true, direction?: "next" | "prev") => {
      if (containerWidth === 0) return;

      let targetVirtualIndex: number;

      if (loop && totalSlides > 1) {
        if (
          direction === "next" &&
          activeIndex === totalSlides - 1 &&
          targetIndex === 0
        ) {
          // 마지막에서 첫번째로: 현재 위치에서 +1
          targetVirtualIndex = currentVirtualIndex.current + 1;
        } else if (
          direction === "prev" &&
          activeIndex === 0 &&
          targetIndex === totalSlides - 1
        ) {
          // 첫번째에서 마지막으로: 현재 위치에서 -1
          targetVirtualIndex = currentVirtualIndex.current - 1;
        } else {
          // 일반적인 경우: 현재 위치에서 상대적 이동
          const diff = targetIndex - activeIndex;
          targetVirtualIndex = currentVirtualIndex.current + diff;
        }
      } else {
        targetVirtualIndex = targetIndex;
      }

      const targetX = -targetVirtualIndex * containerWidth;

      if (animated) {
        Animated.timing(translateX, {
          toValue: targetX,
          duration: animationDuration,
          useNativeDriver: true,
        }).start(() => {
          // 애니메이션 완료 후 위치 업데이트
          currentVirtualIndex.current = targetVirtualIndex;

          // 경계 점프 처리
          if (loop && totalSlides > 1) {
            if (targetVirtualIndex === 0) {
              // 가짜 마지막에서 진짜 마지막으로
              const newVirtualIndex = totalSlides;
              const newX = -newVirtualIndex * containerWidth;
              translateX.setValue(newX);
              currentVirtualIndex.current = newVirtualIndex;
            } else if (targetVirtualIndex === totalSlides + 1) {
              // 가짜 첫번째에서 진짜 첫번째로
              const newVirtualIndex = 1;
              const newX = -newVirtualIndex * containerWidth;
              translateX.setValue(newX);
              currentVirtualIndex.current = newVirtualIndex;
            }
          }
        });
      } else {
        translateX.setValue(targetX);
        currentVirtualIndex.current = targetVirtualIndex;
      }
    },
    [
      containerWidth,
      loop,
      totalSlides,
      animationDuration,
      translateX,
      activeIndex,
    ]
  );

  // PanResponder 설정
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },

    onPanResponderGrant: () => {
      setIsScrolling(true);

      onScrollStateChange?.(true);

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      dragStartX.current = (translateX as any)._value;

      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
        autoPlayTimer.current = null;
      }
    },

    onPanResponderMove: (_, gestureState) => {
      if (containerWidth === 0) return;

      const newX = dragStartX.current + gestureState.dx;
      translateX.setValue(newX);
    },

    onPanResponderRelease: (_, gestureState) => {
      if (containerWidth === 0) return;

      const threshold = containerWidth * 0.3;
      const velocity = gestureState.vx;

      let newIndex = activeIndex;
      let direction: "next" | "prev" | undefined;

      if (gestureState.dx > threshold || velocity > 0.3) {
        direction = "prev";
        if (loop) {
          newIndex = activeIndex === 0 ? totalSlides - 1 : activeIndex - 1;
        } else {
          newIndex = Math.max(0, activeIndex - 1);
        }
      } else if (gestureState.dx < -threshold || velocity < -0.3) {
        direction = "next";
        if (loop) {
          newIndex = activeIndex === totalSlides - 1 ? 0 : activeIndex + 1;
        } else {
          newIndex = Math.min(totalSlides - 1, activeIndex + 1);
        }
      }

      setActiveIndex(newIndex);
      onSlideChange?.(newIndex);
      moveToSlide(newIndex, true, direction);

      setTimeout(() => {
        setIsScrolling(false);
        onScrollStateChange?.(false);
      }, animationDuration + 50);
    },
  });

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        let direction: "next" | "prev" | undefined;
        if (loop) {
          if (activeIndex === totalSlides - 1 && index === 0) {
            direction = "next";
          } else if (activeIndex === 0 && index === totalSlides - 1) {
            direction = "prev";
          }
        }

        setActiveIndex(index);
        onSlideChange?.(index);
        moveToSlide(index, true, direction);
      }
    },
    [totalSlides, onSlideChange, moveToSlide, activeIndex, loop]
  );

  useEffect(() => {
    if (autoPlay && totalSlides > 1 && !isScrolling) {
      autoPlayTimer.current = setTimeout(() => {
        const nextIndex = loop
          ? (activeIndex + 1) % totalSlides
          : Math.min(totalSlides - 1, activeIndex + 1);

        if (
          nextIndex !== activeIndex ||
          (loop && activeIndex === totalSlides - 1)
        ) {
          const direction =
            loop && activeIndex === totalSlides - 1 && nextIndex === 0
              ? "next"
              : undefined;

          setActiveIndex(nextIndex);
          onSlideChange?.(nextIndex);
          moveToSlide(nextIndex, true, direction);
        }
      }, autoPlayInterval) as unknown as NodeJS.Timeout;
    }

    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, [
    activeIndex,
    autoPlay,
    autoPlayInterval,
    totalSlides,
    isScrolling,
    loop,
    onSlideChange,
    moveToSlide,
  ]);

  const renderSlides = () => {
    const childrenArray = React.Children.toArray(children);

    if (loop && totalSlides > 1) {
      return [
        childrenArray[totalSlides - 1],
        ...childrenArray,
        childrenArray[0],
      ];
    }
    return childrenArray;
  };

  const slides = renderSlides();
  const slideWidth = containerWidth * slides.length;

  const renderIndicator = () => {
    switch (indicatorType) {
      case "number":
        return (
          <View
            className={cn(
              "px-2 py-1 bg-primaryPurple rounded-full",
              indicatorContainerClassName
            )}
          >
            <Text size="sm" textColor="white">
              {activeIndex + 1} / {totalSlides}
            </Text>
          </View>
        );

      case "line":
        return (
          <View
            className={cn(
              "flex-row items-center justify-center gap-1",
              indicatorContainerClassName
            )}
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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

      case "dot":
        return (
          <View
            className={cn(
              "flex-row items-center justify-center gap-2",
              indicatorContainerClassName
            )}
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
      default:
        return null;
    }
  };

  return (
    <View
      className={cn("relative flex flex-col", className)}
      onLayout={handleLayout}
    >
      {showIndicator && indicatorPosition === "top" && (
        <View className="absolute top-4 z-10 w-full items-center">
          {renderIndicator()}
        </View>
      )}

      {containerWidth > 0 && (
        <View
          style={{ width: containerWidth, overflow: "hidden" }}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={{
              flexDirection: "row",
              width: slideWidth,
              transform: [{ translateX }],
            }}
          >
            {slides.map((child, index) => (
              <View
                key={`slide-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  index
                }`}
                style={{ width: containerWidth, overflow: "hidden" }}
              >
                {child}
              </View>
            ))}
          </Animated.View>
        </View>
      )}

      {showIndicator && indicatorPosition === "bottom" && (
        <View className="pt-3 w-full items-center">{renderIndicator()}</View>
      )}
    </View>
  );
}
