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
  const realCount = arrayChildren.length;
  const isSingle = realCount <= 1;

  const array = isSingle
    ? [...arrayChildren]
    : [arrayChildren[realCount - 1], ...arrayChildren, arrayChildren[0]];

  const initialFocus = isSingle ? 0 : 1;
  const [focusIndex, setFocusIndex] = useState<number>(initialFocus);
  const focusRef = useRef<number>(initialFocus);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const pendingRef = useRef<boolean>(true);
  const autoPlayRef = useRef<NodeJS.Timer | number | null>(null);

  useEffect(() => {
    focusRef.current = focusIndex;
  }, [focusIndex]);

  useEffect(() => {
    if (containerWidth > 0) {
      bannerAnim.setValue(-focusIndex * containerWidth);
      pendingRef.current = true;
    }
  }, [containerWidth, bannerAnim, focusIndex]);

  useEffect(() => {
    if (!autoPlay || containerWidth === 0 || isSingle) return;
    if (autoPlayRef.current) {
      if (typeof autoPlayRef.current === "number")
        clearInterval(autoPlayRef.current);
      else clearInterval(autoPlayRef.current as NodeJS.Timer);
    }
    const id = setInterval(() => {
      moveToIndex(focusRef.current + 1);
    }, autoPlayInterval);
    autoPlayRef.current = id;
    return () => {
      if (id) clearInterval(id);
      autoPlayRef.current = null;
    };
  }, [autoPlay, autoPlayInterval, containerWidth, isSingle]);

  const clampIndex = (idx: number) => {
    return Math.max(0, Math.min(idx, array.length - 1));
  };

  const moveToIndex = (nextIndexRaw: number) => {
    if (containerWidth === 0 || !pendingRef.current) return;
    pendingRef.current = false;
    const nextIndex = clampIndex(nextIndexRaw);
    Animated.timing(bannerAnim, {
      toValue: -nextIndex * containerWidth,
      useNativeDriver: true,
      duration: animationDuration,
    }).start(({ finished }) => {
      if (!finished) {
        pendingRef.current = true;
        return;
      }
      let finalIndex = nextIndex;
      if (!isSingle && nextIndex === array.length - 1) {
        finalIndex = 1;
        bannerAnim.setValue(-finalIndex * containerWidth);
      } else if (!isSingle && nextIndex === 0) {
        finalIndex = array.length - 2;
        bannerAnim.setValue(-finalIndex * containerWidth);
      }
      setFocusIndex(finalIndex);
      pendingRef.current = true;
      onSlideChange?.(isSingle ? 0 : finalIndex - 1);
    });
  };

  const onButtonNavigation = (index: number) => {
    if (isSingle) return;
    moveToIndex(index + 1);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isSingle,
    onMoveShouldSetPanResponder: (_e, gestureState) => {
      if (isSingle) return false;
      return (
        Math.abs(gestureState.dx) > 10 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      );
    },
    onPanResponderGrant: () => {},
    onPanResponderMove: () => {},
    onPanResponderRelease: (_e, gestureState) => {
      if (containerWidth === 0 || !pendingRef.current) return;
      const dx = gestureState.dx;
      const threshold = Math.max(60, containerWidth * 0.12);
      const isNext = dx < -threshold;
      const isPrev = dx > threshold;
      if (isNext) {
        moveToIndex(focusRef.current + 1);
      } else if (isPrev) {
        moveToIndex(focusRef.current - 1);
      } else {
        pendingRef.current = false;
        Animated.timing(bannerAnim, {
          toValue: -focusRef.current * containerWidth,
          duration: Math.min(200, animationDuration),
          useNativeDriver: true,
        }).start(() => {
          pendingRef.current = true;
        });
      }
    },
  });

  return (
    <View
      className={className}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w !== containerWidth) {
          setContainerWidth(w);
        }
      }}
      style={{ width: "100%" as ViewStyle["width"] }}
    >
      <View
        style={{ width: containerWidth || 0, overflow: "hidden" }}
        className={contentContainerClassName}
      >
        <Animated.View
          {...(!isSingle ? panResponder.panHandlers : {})}
          style={{
            flexDirection: "row",
            width: (containerWidth || 0) * array.length,
            transform: [{ translateX: bannerAnim }],
          }}
        >
          {array.map((child, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                width: containerWidth || 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {child}
            </View>
          ))}
        </Animated.View>
      </View>

      {showIndicator && realCount > 0 && (
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "center",
              position: "absolute",
              left: 0,
              right: 0,
              [indicatorPosition]: -16,
              paddingHorizontal: 8,
            } as ViewStyle,
          ]}
          className={indicatorContainerClassName}
        >
          {arrayChildren.map((_, index) => (
            <Pressable
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              onPress={() => onButtonNavigation(index)}
              style={{ padding: 6 }}
            >
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
