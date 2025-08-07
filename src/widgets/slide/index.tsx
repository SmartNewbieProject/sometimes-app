import colors from "@/src/shared/constants/colors";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";

interface SlideProps {
  children: React.ReactNode[] | React.ReactNode;
  className?: string;
  indicatorClassName?: string;
  activeIndicatorClassName?: string;
  indicatorContainerClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  contentContainerClassName?: string;
  showIndicator?: boolean;
  indicatorPosition?: "top" | "bottom";
  onSlideChange?: (index: number) => void;
  animationDuration?: number;
}

function Slider({
  children,
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicator = true,
  indicatorPosition = "bottom",
  onSlideChange,
  animationDuration = 500,
  indicatorClassName,
  contentContainerClassName,
  activeIndicatorClassName,
  indicatorContainerClassName,
  className,
}: SlideProps) {
  const arrayChildren = Array.isArray(children) ? children : [children];
  const array = [
    arrayChildren[arrayChildren.length - 1],
    ...arrayChildren,
    arrayChildren[0],
  ];

  const [focusIndex, setFocusIndex] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const pendingRef = useRef(true);
  useEffect(() => {
    if (containerWidth > 0) {
      bannerAnim.setValue(-containerWidth);
    }
  }, [containerWidth]);

  useEffect(() => {
    if (!autoPlay || containerWidth === 0) return;

    const interval = setInterval(() => {
      moveToIndex(focusIndex + 1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [focusIndex, autoPlay, autoPlayInterval, containerWidth]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (!pendingRef.current || containerWidth === 0) return;

      const toRight = gestureState.dx < -80;
      const toLeft = gestureState.dx > 80;

      if (toRight) {
        moveToIndex(focusIndex + 1);
      } else if (toLeft) {
        moveToIndex(focusIndex - 1);
      }
    },
  });
  const moveToIndex = (nextIndex: number) => {
    if (containerWidth === 0) return;

    pendingRef.current = false;

    Animated.timing(bannerAnim, {
      toValue: -nextIndex * containerWidth,
      useNativeDriver: true,
      duration: animationDuration,
    }).start(({ finished }) => {
      if (!finished) return;

      let finalIndex = nextIndex;

      if (nextIndex === array.length - 1) {
        finalIndex = 1;
        bannerAnim.setValue(-containerWidth);
      } else if (nextIndex === 0) {
        finalIndex = array.length - 2;
        bannerAnim.setValue(-finalIndex * containerWidth);
      }

      setFocusIndex(finalIndex);
      pendingRef.current = true;
      onSlideChange?.(finalIndex - 1);
    });
  };

  const onButtonNavigation = (index: number) => {
    moveToIndex(index + 1);
  };

  return (
    <View
      className={className}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        setContainerWidth(width);
      }}
      style={{
        width: "100%",
      }}
    >
      <View style={{ width: containerWidth, overflow: "hidden" }}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            flexDirection: "row",
            transform: [{ translateX: bannerAnim }],
          }}
        >
          {array.map((child, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                width: containerWidth,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {child}
            </View>
          ))}
        </Animated.View>
      </View>

      {showIndicator && (
        <View
          style={[
            {
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              position: "absolute",
              [indicatorPosition]: -16,
              width: "100%",
            },
          ]}
          className={indicatorContainerClassName}
        >
          {arrayChildren.map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Pressable key={index} onPress={() => onButtonNavigation(index)}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 8,
                  backgroundColor:
                    focusIndex === index + 1 ? "#7A4AE2" : colors.lightPurple,
                }}
                className={
                  focusIndex === index + 1
                    ? activeIndicatorClassName
                    : indicatorClassName
                }
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default Slider;
