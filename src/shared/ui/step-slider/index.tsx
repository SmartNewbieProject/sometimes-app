import { cn } from "@/src/shared/libs/cn";
import { Text } from "@/src/shared/ui";
import { throttle } from "lodash";
import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  Platform,
 View , type LayoutChangeEvent } from "react-native";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { semanticColors } from "@/src/shared/constants/colors";

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
  className?: string;
  showSelectedValue?: boolean;
  touchAreaHeight?: number; // 터치 영역 높이 (기본값: 44)
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
  className,
  touchAreaHeight = 48, // 터치 영역 높이
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

  // 값을 step에 맞게 정렬하는 함수
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

  // 레이아웃 변경 시 슬라이더 위치와 크기 측정
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(Platform.OS === "web" ? width - 10 : width);

    // 슬라이더의 절대 위치 측정
    if (sliderRef.current) {
      sliderRef.current.measure((x, y, width, height, pageX, pageY) => {
        setSliderX(pageX);
      });
    }
  }, []);

  // 터치 좌표에서 값을 계산하는 함수 (pageX 사용)
  const calculateValueFromTouch = useCallback(
    (pageX: number) => {
      if (!sliderWidth || !sliderX) return null;

      // 슬라이더 상대 위치 계산
      const relativeX = pageX - sliderX;

      const clampedX = Math.max(0, Math.min(sliderWidth, relativeX));
      const percentage = clampedX / sliderWidth;
      const rawValue = min + percentage * (max - min);

      return rawValue;
    },
    [sliderWidth, sliderX, min, max]
  );

  // 드래그 시작 핸들러 - 클릭한 위치부터 시작
  const handleDragStart = useCallback(
    (event: GestureResponderEvent) => {
      const pageX = event.nativeEvent.pageX;
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setIsDragging(true);
        setDraggingValue(newValue);

        // 즉시 값 업데이트 (클릭한 위치로 바로 이동)
        handleValueChange(newValue);
      }
    },
    [calculateValueFromTouch, handleValueChange]
  );

  // 스로틀된 드래그 중 핸들러
  const throttledDragMove = useMemo(() => {
    return throttle((pageX: number) => {
      const newValue = calculateValueFromTouch(pageX);

      if (newValue !== null) {
        setDraggingValue(newValue);
      }
    }, 16);
  }, [calculateValueFromTouch]);

  // 드래그 중 핸들러
  const handleDragMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!isDragging) return;

      const pageX = event.nativeEvent.pageX;
      throttledDragMove(pageX);
    },
    [isDragging, throttledDragMove]
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    throttledDragMove.cancel();
    if (draggingValue !== null) {
      handleValueChange(draggingValue);
    }
    setIsDragging(false);
    setDraggingValue(null);
  }, [draggingValue, handleValueChange, throttledDragMove]);

  // panResponder를 메모화
  const panResponder = useMemo(() => {
    if (!sliderWidth || !sliderX) return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleDragStart,
      onPanResponderMove: handleDragMove,
      onPanResponderRelease: handleDragEnd,
      onPanResponderTerminate: handleDragEnd,
    });
  }, [sliderWidth, sliderX, handleDragStart, handleDragMove, handleDragEnd]);

  // 컴포넌트 언마운트 시 스로틀 정리
  useEffect(() => {
    return () => {
      throttledDragMove.cancel();
    };
  }, [throttledDragMove]);

  return (
    <View className={cn("w-full ", className)}>
      {/* Labels */}
      {options && sliderWidth > 0 && (
        <View
          pointerEvents="none"
          className="absolute top-[-16px] left-0 w-full flex-row justify-between px-2"
        >
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
                  <Text size="13" numberofLine={1} textColor="dark">
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
      <View className="flex-row justify-between items-center">
        {/* Slider track */}
        <View className="flex-1 mx-2 justify-center">
          {/* 확장된 터치 영역 */}
          <View
            ref={sliderRef}
            onLayout={handleLayout}
            {...(panResponder?.panHandlers ?? {})}
            className="w-full bg-transparent"
            style={{
              height: touchAreaHeight,
              justifyContent: "center",
              // 디버깅을 위해 배경색 추가 (나중에 제거)
              // backgroundColor: 'rgba(255, 0, 0, 0.1)'
            }}
          >
            {/* 실제 슬라이더 트랙 */}
            <View
              className="w-full h-3 bg-surface-tertiary rounded-full"
              style={{ backgroundColor: semanticColors.surface.tertiary }}
            >
              {/* Active track */}
              <View
                className="absolute z-20 top-0 left-0 h-full bg-primaryPurple rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: semanticColors.brand.primary
                }}
              />
              {/* pointer */}
              {options ? (
                options?.map((label, index) => {
                  const totalSteps = options.length - 1;
                  const left = (index / totalSteps) * sliderWidth;
                  return (
                    <View
                      key={label.label}
                      className="absolute z-10  w-[10px] h-[10px] bg-surface-other rounded-full -mt-2.5 items-center justify-center"
                      style={{
                        top: Platform.OS === "web" ? 11 : 9,
                        left:
                          options[0].label === label.label
                            ? left
                            : options.at(-1)?.label === label.label
                            ? left
                            : left,
                        backgroundColor: semanticColors.surface.other
                      }}
                    />
                  );
                })
              ) : (
                <></>
              )}
              {/* Thumb */}
              <View
                className="absolute z-30 top-0 w-8 h-8 bg-primaryPurple rounded-full -mt-2.5 items-center justify-center"
                style={{
                  left: `${percentage}%`,
                  transform: [{ translateX: -16 }],
                  backgroundColor: semanticColors.brand.primary
                }}
              >
                <View
                  className="w-[30px] h-[30px] rounded-full bg-primaryPurple drop-shadow-[0px,4px,8px,rgba(0,0,0,0.17)]"
                  style={{ backgroundColor: semanticColors.brand.primary }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
