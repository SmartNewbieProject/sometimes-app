import { Text } from "../text";
import { throttle } from "lodash";
import {
  type GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type LayoutChangeEvent,
  View,
} from "react-native";

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
  touchAreaHeight?: number;
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
}: StepSliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [draggingValue, setDraggingValue] = useState<number | null>(
    defaultValue
  );
  const [isDragging, setIsDragging] = useState(false);

  // [5] sliderX를 비동기 measure 대신 ref로 관리, handleDragStart 시점에 동기 계산
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderWidthRef = useRef(0);
  const sliderXRef = useRef(0);
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

  // [5] measure 결과를 ref에 저장 — state 업데이트 없으므로 panResponder 재생성 없음
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const adjusted = Platform.OS === "web" ? width - 10 : width;
    setSliderWidth(adjusted);
    sliderWidthRef.current = adjusted;

    if (sliderRef.current) {
      sliderRef.current.measure((x, y, w, h, pageX) => {
        sliderXRef.current = pageX;
      });
    }
  }, []);

  // [5] sliderX를 ref에서 읽도록 변경 — sliderWidth/sliderX 의존성 제거
  const calculateValueFromTouch = useCallback(
    (pageX: number) => {
      if (!sliderWidthRef.current || !sliderXRef.current) return null;

      const relativeX = pageX - sliderXRef.current;
      const clampedX = Math.max(0, Math.min(sliderWidthRef.current, relativeX));
      const percentage = clampedX / sliderWidthRef.current;
      const rawValue = min + percentage * (max - min);

      return rawValue;
    },
    [min, max]
  );

  const handleDragStart = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX } = event.nativeEvent;
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setIsDragging(true);
        setDraggingValue(newValue);
        handleValueChange(newValue);
      }
    },
    [calculateValueFromTouch, handleValueChange]
  );

  // [2] 드래그 중에도 handleValueChange 호출 → tooltip 실시간 갱신
  const throttledDragMove = useMemo(() => {
    return throttle((pageX: number) => {
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setDraggingValue(newValue);
        handleValueChange(newValue);
      }
    }, 16);
  }, [calculateValueFromTouch, handleValueChange]);

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
  }, [draggingValue, handleValueChange, throttledDragMove]);

  // [5] sliderWidth/sliderX 의존성 제거 → panResponder 불필요한 재생성 방지
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false, // [3] Start 단계에서는 캡처 안 함
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderGrant: handleDragStart,
      onPanResponderMove: handleDragMove,
      onPanResponderRelease: handleDragEnd,
      onPanResponderTerminate: handleDragEnd,
      onPanResponderTerminationRequest: () => true,
    });
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  useEffect(() => {
    return () => {
      throttledDragMove.cancel();
    };
  }, [throttledDragMove]);

  // [1] 접근성: 현재 선택된 옵션 라벨
  const currentOption = options?.[value - min];
  const accessibilityLabel = currentOption?.label ?? String(value);

  return (
    <View style={[styles.container, style]}>
      {/* Labels */}
      {options && sliderWidth > 0 && (
        <View pointerEvents="none" style={styles.labelsContainer}>
          {options.map((label, index) => {
            const totalSteps = options.length - 1;
            const left = (index / totalSteps) * sliderWidth;
            const middleIndex = Math.floor(options.length / 2);
            const shouldShowLabel =
              index === 0 ||
              index === totalSteps ||
              (showMiddle && options.length % 2 === 1 && index === middleIndex);

            if (shouldShowLabel) {
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

            return <React.Fragment key={label.value} />;
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
            {...panResponder.panHandlers}
            accessible={true}
            accessibilityRole="adjustable"
            accessibilityLabel={accessibilityLabel}
            accessibilityValue={{ min, max, now: snapToStep(value) }}
            accessibilityHint="좌우로 밀어서 값을 변경하세요"
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
                      key={label.value}
                      style={[
                        styles.stepDot,
                        {
                          left: left,
                        },
                      ]}
                    />
                  );
                })
              ) : (
                <></>
              )}
            </View>
            {/* Thumb — track 바깥에 배치해 track의 overflow 클리핑 방지 */}
            <View
              style={[
                styles.thumbContainer,
                {
                  left: `${percentage}%`,
                  transform: [{ translateX: -16 }, { translateY: -16 }],
                  top: "50%",
                },
              ]}
            >
              <View style={styles.thumb} />
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
    top: 1, // (trackHeight - dotHeight) / 2 = (12 - 10) / 2 = 1
    width: 10,
    height: 10,
    backgroundColor: semanticColors.surface.other,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbContainer: {
    position: "absolute",
    zIndex: 30,
    width: 32,
    height: 32,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 9999,
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
