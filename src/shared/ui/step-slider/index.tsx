import { Text } from "../text";
import { throttle } from "lodash";
import {
  type GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
 type LayoutChangeEvent, View } from "react-native";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import colors from "@/src/shared/constants/colors";

interface Option {
  label: string;
  value: string;
  imageUrl?: string;
}

interface StepSliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  options?: Option[];
  value?: number;
  showMiddle?: boolean;
  lastLabelLeft?: number;
  firstLabelLeft?: number;
  middleLabelLeft?: number;
  onChange?: (value: number) => void;
  style?: StyleProp<ViewStyle>;
  showSelectedValue?: boolean;
  touchAreaHeight?: number;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export function StepSlider({
  min,
  options,
  max,
  step,
  defaultValue = min,
  firstLabelLeft,
  lastLabelLeft,
  middleLabelLeft,
  value: controlledValue,
  onChange,
  showMiddle = true,
  style,
  touchAreaHeight = 48,
  onTouchStart,
  onTouchEnd,
}: StepSliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [draggingValue, setDraggingValue] = useState<number | null>(
    defaultValue
  );
  const [isDragging, setIsDragging] = useState(false);

  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderX, setSliderX] = useState(0);
  const sliderRef = useRef<View>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const thumbValue = draggingValue ?? value;
  const percentage = ((thumbValue - min) / (max - min)) * 100;

  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  const snapToStep = useCallback(
    (rawValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, rawValue));
      const steps = Math.round((clampedValue - min) / step);
      const steppedValue = min + steps * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  const handleValueChange = useCallback(
    (newValue: number) => {
      const finalValue = snapToStep(newValue);
      if (!isControlled) {
        setInternalValue(finalValue);
      }

      if (onChange) {
        onChange(finalValue);
      }
    },
    [snapToStep, isControlled, onChange]
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(Platform.OS === "web" ? width - 10 : width);

    if (sliderRef.current) {
      sliderRef.current.measure((x, y, width, height, pageX, pageY) => {
        setSliderX(pageX);
      });
    }
  }, []);

  const calculateValueFromTouch = useCallback(
    (pageX: number) => {
      if (!sliderWidth || !sliderX) return null;

      const relativeX = pageX - sliderX;
      const clampedX = Math.max(0, Math.min(sliderWidth, relativeX));
      const percentage = clampedX / sliderWidth;
      const rawValue = min + percentage * (max - min);

      return rawValue;
    },
    [sliderWidth, sliderX, min, max]
  );

  const handleDragStart = useCallback(
    (event: GestureResponderEvent) => {
      onTouchStart?.();
      const pageX = event.nativeEvent.pageX;
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setIsDragging(true);
        setDraggingValue(newValue);
        handleValueChange(newValue);
      }
    },
    [calculateValueFromTouch, handleValueChange, onTouchStart]
  );

  const throttledDragMove = useMemo(() => {
    return throttle((pageX: number) => {
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setDraggingValue(newValue);
      }
    }, 16);
  }, [calculateValueFromTouch]);

  const handleDragMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!isDragging) return;

      const pageX = event.nativeEvent.pageX;
      throttledDragMove(pageX);
    },
    [isDragging, throttledDragMove]
  );

  const handleDragEnd = useCallback(() => {
    throttledDragMove.cancel();
    if (draggingValue !== null) {
      handleValueChange(draggingValue);
    }
    setIsDragging(false);
    setDraggingValue(null);
    onTouchEnd?.();
  }, [draggingValue, handleValueChange, throttledDragMove, onTouchEnd]);

  const panResponder = useMemo(() => {
    if (!sliderWidth || !sliderX) return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // 터치 시작부터 적극적으로 제스처를 캡처하여 스크롤 방지
        // 수평 이동이 감지되거나, 초기 터치 시점에는 무조건 캡처
        const hasHorizontalMovement = Math.abs(gestureState.dx) > 2;
        const hasMinimalMovement = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return hasHorizontalMovement || hasMinimalMovement;
      },
      onPanResponderGrant: handleDragStart,
      onPanResponderMove: handleDragMove,
      onPanResponderRelease: handleDragEnd,
      onPanResponderTerminate: handleDragEnd,
      onPanResponderTerminationRequest: () => false,
    });
  }, [sliderWidth, sliderX, handleDragStart, handleDragMove, handleDragEnd]);

  useEffect(() => {
    return () => {
      throttledDragMove.cancel();
    };
  }, [throttledDragMove]);

  return (
    <View style={[styles.container, style]}>
      {/* Labels */}
      {options && sliderWidth > 0 && (
        <View pointerEvents="none" style={styles.labelsContainer}>
          {options.map((label, index) => {
            const totalSteps = options.length - 1;
            const left = (index / totalSteps) * sliderWidth;
            if (
              index === 0 ||
              index === totalSteps ||
              (showMiddle &&
                options.length % 2 === 1 &&
                index !== Math.ceil(options.length / 2))
            ) {
              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    left:
                      options[0].label === label.label
                        ? left + (firstLabelLeft ?? 5)
                        : options.at(-1)?.label === label.label
                        ? left + (lastLabelLeft ?? -15)
                        : left + (middleLabelLeft ?? -30),
                  }}
                >
                  <Text size="13" numberOfLines={1} textColor="dark">
                    {label.label}
                  </Text>
                </View>
              );
            }

            return <React.Fragment key={label.label} />;
          })}
        </View>
      )}

      {/* Slider container */}
      <View style={styles.sliderContainer}>
        {/* Slider track */}
        <View style={styles.trackContainer}>
          {/* 확장된 터치 영역 */}
          <View
            ref={sliderRef}
            onLayout={handleLayout}
            {...(panResponder?.panHandlers ?? {})}
            style={[styles.touchArea, { height: touchAreaHeight }]}
          >
            {/* 실제 슬라이더 트랙 */}
            <View style={styles.track}>
              {/* Active track */}
              <View
                style={[
                  styles.activeTrack,
                  { width: `${percentage}%` },
                ]}
              />
              {/* pointer */}
              {options ? (
                options?.map((label, index) => {
                  const totalSteps = options.length - 1;
                  const left = (index / totalSteps) * sliderWidth;
                  return (
                    <View
                      key={label.label}
                      style={[
                        styles.stepDot,
                        {
                          top: Platform.OS === "web" ? 11 : 9,
                          left: left,
                        },
                      ]}
                    />
                  );
                })
              ) : (
                <></>
              )}
              {/* Thumb */}
              <View
                style={[
                  styles.thumbContainer,
                  {
                    left: `${percentage}%`,
                    transform: [{ translateX: -16 }],
                  },
                ]}
              >
                <View style={styles.thumb} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelsContainer: {
    position: "absolute",
    top: -16,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackContainer: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  touchArea: {
    width: "100%",
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  track: {
    width: "100%",
    height: 12,
    backgroundColor: semanticColors.surface.tertiary,
    borderRadius: 9999,
  },
  activeTrack: {
    position: "absolute",
    zIndex: 20,
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 9999,
  },
  stepDot: {
    position: "absolute",
    zIndex: 10,
    width: 10,
    height: 10,
    backgroundColor: semanticColors.surface.other,
    borderRadius: 9999,
    marginTop: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbContainer: {
    position: "absolute",
    zIndex: 30,
    top: 0,
    width: 32,
    height: 32,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 9999,
    marginTop: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 9999,
    backgroundColor: semanticColors.brand.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 8,
    elevation: 4,
  },
});
