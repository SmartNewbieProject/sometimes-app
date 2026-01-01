# Chapter 55: 슬라이더와 선택기

값을 선택하는 UI는 정확성과 직관성이 중요합니다. 범위 슬라이더, 별점 선택기, 색상 선택기 등 다양한 선택 컴포넌트를 애니메이션과 함께 구현합니다.

## 📌 학습 목표

- 커스텀 슬라이더 구현
- 범위(Range) 슬라이더
- 별점 및 이모지 선택기
- 스텝 슬라이더와 눈금 표시
- 색상 선택기 (Hue, Saturation)
- 시간/날짜 선택 UI

## 📖 슬라이더 인터랙션 원칙

```
슬라이더 인터랙션 흐름
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

정적 상태:
╭─────────────────────────────────────────────╮
│ ───────────●───────────────────────         │
│ 0         50                       100      │
╰─────────────────────────────────────────────╯

드래그 중:
╭─────────────────────────────────────────────╮
│ ═══════════════════◉══════                  │ ← 트랙 강조
│           [75] ← 값 표시                    │ ← 툴팁
╰─────────────────────────────────────────────╯

피드백 요소:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 노브 크기 변화
   ○ (정상) → ◎ (터치) → ○ (릴리즈)

2. 트랙 색상 변화
   선택 영역: 브랜드 컬러
   비선택 영역: 회색

3. 햅틱 피드백
   • 스텝 변경 시 Light
   • 최소/최대 도달 시 Warning

4. 값 레이블
   드래그 중에만 표시, 노브 위에 위치
```

## 💻 기본 슬라이더

### 단일 값 슬라이더

```typescript
import React from 'react';
import { StyleSheet, View, Text, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  trackColor?: string;
  activeColor?: string;
}

const TRACK_HEIGHT = 6;
const KNOB_SIZE = 24;

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  trackColor = '#E0E0E0',
  activeColor = '#7A4AE2',
}: SliderProps) {
  const [trackLayout, setTrackLayout] = React.useState<LayoutRectangle | null>(null);

  const translateX = useSharedValue(0);
  const knobScale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);
  const isActive = useSharedValue(false);

  // 값을 위치로 변환
  const valueToPosition = (val: number) => {
    if (!trackLayout) return 0;
    const percentage = (val - min) / (max - min);
    return percentage * trackLayout.width;
  };

  // 위치를 값으로 변환
  const positionToValue = (pos: number) => {
    if (!trackLayout) return min;
    const percentage = clamp(pos / trackLayout.width, 0, 1);
    const rawValue = min + percentage * (max - min);

    // step 적용
    if (step > 0) {
      return Math.round(rawValue / step) * step;
    }
    return rawValue;
  };

  React.useEffect(() => {
    if (trackLayout) {
      translateX.value = withSpring(valueToPosition(value), {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [value, trackLayout]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleValueChange = (newValue: number) => {
    onValueChange(newValue);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
      knobScale.value = withSpring(1.2, { damping: 10 });
      tooltipOpacity.value = withTiming(1, { duration: 150 });
    })
    .onUpdate((event) => {
      if (!trackLayout) return;

      const newPosition = clamp(
        event.x,
        0,
        trackLayout.width
      );
      translateX.value = newPosition;

      const newValue = positionToValue(newPosition);
      if (newValue !== value) {
        runOnJS(triggerHaptic)();
        runOnJS(handleValueChange)(newValue);
      }
    })
    .onEnd(() => {
      isActive.value = false;
      knobScale.value = withSpring(1, { damping: 15 });
      tooltipOpacity.value = withTiming(0, { duration: 150 });

      // 가장 가까운 step으로 스냅
      const snappedValue = positionToValue(translateX.value);
      translateX.value = withSpring(valueToPosition(snappedValue), {
        damping: 15,
        stiffness: 200,
      });
    });

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - KNOB_SIZE / 2 },
      { scale: knobScale.value },
    ],
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [
      { translateX: translateX.value - 20 },
      { translateY: -40 },
      { scale: tooltipOpacity.value },
    ],
  }));

  return (
    <View style={sliderStyles.container}>
      <GestureDetector gesture={panGesture}>
        <View
          style={sliderStyles.trackContainer}
          onLayout={(e) => setTrackLayout(e.nativeEvent.layout)}
        >
          {/* 비활성 트랙 */}
          <View style={[sliderStyles.track, { backgroundColor: trackColor }]} />

          {/* 활성 트랙 */}
          <Animated.View
            style={[
              sliderStyles.activeTrack,
              { backgroundColor: activeColor },
              activeTrackStyle,
            ]}
          />

          {/* 노브 */}
          <Animated.View style={[sliderStyles.knob, knobStyle]}>
            <View style={sliderStyles.knobInner} />
          </Animated.View>

          {/* 툴팁 */}
          {showValue && (
            <Animated.View style={[sliderStyles.tooltip, tooltipStyle]}>
              <Text style={sliderStyles.tooltipText}>{value}</Text>
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      {/* 레이블 */}
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.label}>{min}</Text>
        <Text style={sliderStyles.label}>{max}</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7A4AE2',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
});
```

### 범위 슬라이더

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  onValuesChange: (min: number, max: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function RangeSlider({
  minValue,
  maxValue,
  onValuesChange,
  min = 0,
  max = 100,
  step = 1,
}: RangeSliderProps) {
  const [trackLayout, setTrackLayout] = React.useState<LayoutRectangle | null>(null);

  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const activeKnob = useSharedValue<'min' | 'max' | null>(null);
  const minScale = useSharedValue(1);
  const maxScale = useSharedValue(1);

  const valueToPosition = (val: number) => {
    if (!trackLayout) return 0;
    return ((val - min) / (max - min)) * trackLayout.width;
  };

  const positionToValue = (pos: number) => {
    if (!trackLayout) return min;
    const percentage = clamp(pos / trackLayout.width, 0, 1);
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  React.useEffect(() => {
    if (trackLayout) {
      minX.value = withSpring(valueToPosition(minValue));
      maxX.value = withSpring(valueToPosition(maxValue));
    }
  }, [minValue, maxValue, trackLayout]);

  const minGesture = Gesture.Pan()
    .onBegin(() => {
      activeKnob.value = 'min';
      minScale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      if (!trackLayout) return;
      const newX = clamp(event.x, 0, maxX.value - KNOB_SIZE);
      minX.value = newX;

      const newValue = positionToValue(newX);
      if (newValue !== minValue) {
        runOnJS(onValuesChange)(newValue, maxValue);
      }
    })
    .onEnd(() => {
      activeKnob.value = null;
      minScale.value = withSpring(1);
    });

  const maxGesture = Gesture.Pan()
    .onBegin(() => {
      activeKnob.value = 'max';
      maxScale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      if (!trackLayout) return;
      const newX = clamp(event.x, minX.value + KNOB_SIZE, trackLayout.width);
      maxX.value = newX;

      const newValue = positionToValue(newX);
      if (newValue !== maxValue) {
        runOnJS(onValuesChange)(minValue, newValue);
      }
    })
    .onEnd(() => {
      activeKnob.value = null;
      maxScale.value = withSpring(1);
    });

  const rangeStyle = useAnimatedStyle(() => ({
    left: minX.value,
    width: maxX.value - minX.value,
  }));

  const minKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: minX.value - KNOB_SIZE / 2 },
      { scale: minScale.value },
    ],
  }));

  const maxKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: maxX.value - KNOB_SIZE / 2 },
      { scale: maxScale.value },
    ],
  }));

  return (
    <View style={rangeStyles.container}>
      <View
        style={rangeStyles.trackContainer}
        onLayout={(e) => setTrackLayout(e.nativeEvent.layout)}
      >
        {/* 비활성 트랙 */}
        <View style={rangeStyles.track} />

        {/* 활성 범위 */}
        <Animated.View style={[rangeStyles.activeRange, rangeStyle]} />

        {/* 최소값 노브 */}
        <GestureDetector gesture={minGesture}>
          <Animated.View style={[rangeStyles.knob, minKnobStyle]} />
        </GestureDetector>

        {/* 최대값 노브 */}
        <GestureDetector gesture={maxGesture}>
          <Animated.View style={[rangeStyles.knob, maxKnobStyle]} />
        </GestureDetector>
      </View>

      {/* 값 표시 */}
      <View style={rangeStyles.valuesContainer}>
        <Text style={rangeStyles.valueText}>{minValue}</Text>
        <Text style={rangeStyles.separator}>-</Text>
        <Text style={rangeStyles.valueText}>{maxValue}</Text>
      </View>
    </View>
  );
}

const rangeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  activeRange: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#7A4AE2',
    borderRadius: 3,
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A4AE2',
  },
  separator: {
    fontSize: 16,
    color: '#888',
    marginHorizontal: 8,
  },
});
```

## 💻 별점 선택기

### 기본 별점

```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
  size?: number;
  allowHalf?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  maxStars = 5,
  size = 40,
  allowHalf = false,
}: StarRatingProps) {
  return (
    <View style={starStyles.container}>
      {Array.from({ length: maxStars }).map((_, index) => (
        <Star
          key={index}
          index={index}
          rating={rating}
          size={size}
          allowHalf={allowHalf}
          onPress={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRatingChange(value);
          }}
        />
      ))}
    </View>
  );
}

function Star({
  index,
  rating,
  size,
  allowHalf,
  onPress,
}: {
  index: number;
  rating: number;
  size: number;
  allowHalf: boolean;
  onPress: (value: number) => void;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const isFilled = rating > index;
  const isHalfFilled = allowHalf && rating > index && rating < index + 1;

  const handlePress = () => {
    // 바운스 + 회전 효과
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 400 })
    );

    rotation.value = withSequence(
      withTiming(-15, { duration: 50 }),
      withTiming(15, { duration: 100 }),
      withSpring(0, { damping: 10 })
    );

    // 현재 별이 채워져 있으면 이전 값, 아니면 현재 값
    const newRating = isFilled && rating === index + 1 ? index : index + 1;
    onPress(newRating);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Text style={{ fontSize: size }}>
          {isHalfFilled ? '⭐️' : isFilled ? '⭐' : '☆'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const starStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
});
```

### 이모지 선택기

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface EmojiPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  emojis?: string[];
}

const DEFAULT_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'];

export function EmojiPicker({
  value,
  onValueChange,
  emojis = DEFAULT_EMOJIS,
}: EmojiPickerProps) {
  return (
    <View style={emojiStyles.container}>
      <View style={emojiStyles.emojiRow}>
        {emojis.map((emoji, index) => (
          <EmojiOption
            key={index}
            emoji={emoji}
            index={index}
            isSelected={value === index}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onValueChange(index);
            }}
          />
        ))}
      </View>

      {/* 선택 인디케이터 */}
      <SelectionIndicator
        selectedIndex={value}
        totalCount={emojis.length}
      />
    </View>
  );
}

function EmojiOption({
  emoji,
  index,
  isSelected,
  onPress,
}: {
  emoji: string;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isSelected ? 1 : 0.5);

  React.useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 400 }),
        withSpring(1.1, { damping: 10, stiffness: 300 })
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(0.5, { duration: 200 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[emojiStyles.emojiContainer, animatedStyle]}>
        <Text style={emojiStyles.emoji}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SelectionIndicator({
  selectedIndex,
  totalCount,
}: {
  selectedIndex: number;
  totalCount: number;
}) {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withSpring(selectedIndex * 60, {
      damping: 15,
      stiffness: 150,
    });
  }, [selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={emojiStyles.indicatorTrack}>
      <Animated.View style={[emojiStyles.indicator, indicatorStyle]} />
    </View>
  );
}

const emojiStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  indicatorTrack: {
    marginTop: 12,
    width: 48 * 5 + 12 * 4,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  indicator: {
    width: 48,
    height: 4,
    backgroundColor: '#7A4AE2',
    borderRadius: 2,
  },
});
```

## 💻 스텝 슬라이더

### 눈금 표시 슬라이더

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface StepSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  steps: number[];
  labels?: string[];
}

export function StepSlider({
  value,
  onValueChange,
  steps,
  labels,
}: StepSliderProps) {
  const [trackLayout, setTrackLayout] = React.useState<LayoutRectangle | null>(null);
  const translateX = useSharedValue(0);
  const knobScale = useSharedValue(1);

  const currentIndex = steps.indexOf(value);
  const stepWidth = trackLayout ? trackLayout.width / (steps.length - 1) : 0;

  React.useEffect(() => {
    if (trackLayout && currentIndex >= 0) {
      translateX.value = withSpring(currentIndex * stepWidth, {
        damping: 15,
        stiffness: 200,
      });
    }
  }, [currentIndex, trackLayout]);

  const handleStepPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onValueChange(steps[index]);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      knobScale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      if (!trackLayout) return;

      const x = clamp(event.x, 0, trackLayout.width);
      const nearestIndex = Math.round(x / stepWidth);
      translateX.value = nearestIndex * stepWidth;

      if (nearestIndex !== currentIndex) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onValueChange)(steps[nearestIndex]);
      }
    })
    .onEnd(() => {
      knobScale.value = withSpring(1);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - KNOB_SIZE / 2 },
      { scale: knobScale.value },
    ],
  }));

  return (
    <View style={stepStyles.container}>
      <GestureDetector gesture={panGesture}>
        <View
          style={stepStyles.trackContainer}
          onLayout={(e) => setTrackLayout(e.nativeEvent.layout)}
        >
          {/* 트랙 */}
          <View style={stepStyles.track} />

          {/* 눈금 및 레이블 */}
          {steps.map((step, index) => (
            <Pressable
              key={index}
              style={[
                stepStyles.stepContainer,
                { left: trackLayout ? index * stepWidth - 15 : 0 },
              ]}
              onPress={() => handleStepPress(index)}
            >
              <View
                style={[
                  stepStyles.tick,
                  index <= currentIndex && stepStyles.activeTick,
                ]}
              />
              {labels && (
                <Text
                  style={[
                    stepStyles.tickLabel,
                    index === currentIndex && stepStyles.activeLabel,
                  ]}
                >
                  {labels[index]}
                </Text>
              )}
            </Pressable>
          ))}

          {/* 활성 트랙 */}
          <Animated.View
            style={[
              stepStyles.activeTrack,
              { width: translateX },
            ]}
          />

          {/* 노브 */}
          <Animated.View style={[stepStyles.knob, knobStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  trackContainer: {
    height: 60,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#7A4AE2',
    borderRadius: 2,
  },
  stepContainer: {
    position: 'absolute',
    width: 30,
    alignItems: 'center',
    top: 8,
  },
  tick: {
    width: 3,
    height: 12,
    backgroundColor: '#CCCCCC',
    borderRadius: 1.5,
  },
  activeTick: {
    backgroundColor: '#7A4AE2',
  },
  tickLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888888',
  },
  activeLabel: {
    color: '#7A4AE2',
    fontWeight: '600',
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
```

## 💻 색상 선택기

### Hue 슬라이더

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface HueSliderProps {
  hue: number; // 0-360
  onHueChange: (hue: number) => void;
}

export function HueSlider({ hue, onHueChange }: HueSliderProps) {
  const [trackLayout, setTrackLayout] = React.useState<LayoutRectangle | null>(null);
  const translateX = useSharedValue(0);
  const knobScale = useSharedValue(1);

  React.useEffect(() => {
    if (trackLayout) {
      translateX.value = withSpring((hue / 360) * trackLayout.width, {
        damping: 15,
      });
    }
  }, [hue, trackLayout]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      knobScale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      if (!trackLayout) return;
      const x = clamp(event.x, 0, trackLayout.width);
      translateX.value = x;
      const newHue = Math.round((x / trackLayout.width) * 360);
      runOnJS(onHueChange)(newHue);
    })
    .onEnd(() => {
      knobScale.value = withSpring(1);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - 14 },
      { scale: knobScale.value },
    ],
    backgroundColor: `hsl(${hue}, 100%, 50%)`,
  }));

  return (
    <View style={hueStyles.container}>
      <GestureDetector gesture={panGesture}>
        <View
          style={hueStyles.trackContainer}
          onLayout={(e) => setTrackLayout(e.nativeEvent.layout)}
        >
          <LinearGradient
            colors={[
              '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
              '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
              '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={hueStyles.gradient}
          />

          <Animated.View style={[hueStyles.knob, knobStyle]}>
            <View style={hueStyles.knobInner} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const hueStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
  },
  gradient: {
    height: 12,
    borderRadius: 6,
  },
  knob: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});
```

## 📱 sometimes-app 적용 사례

### 나이 범위 선택기

```typescript
// src/features/matching/ui/AgeRangeSelector.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface AgeRangeSelectorProps {
  minAge: number;
  maxAge: number;
  onAgeRangeChange: (min: number, max: number) => void;
}

const MIN_AGE = 20;
const MAX_AGE = 40;

export function AgeRangeSelector({
  minAge,
  maxAge,
  onAgeRangeChange,
}: AgeRangeSelectorProps) {
  return (
    <View style={ageStyles.container}>
      <View style={ageStyles.header}>
        <Text style={ageStyles.title}>나이 범위</Text>
        <Text style={ageStyles.value}>
          {minAge}세 ~ {maxAge}세
        </Text>
      </View>

      <RangeSlider
        minValue={minAge}
        maxValue={maxAge}
        onValuesChange={onAgeRangeChange}
        min={MIN_AGE}
        max={MAX_AGE}
        step={1}
      />

      {/* 추천 범위 버튼 */}
      <View style={ageStyles.presets}>
        <PresetButton
          label="±2세"
          onPress={() => {
            const mid = Math.round((minAge + maxAge) / 2);
            onAgeRangeChange(mid - 2, mid + 2);
          }}
        />
        <PresetButton
          label="±5세"
          onPress={() => {
            const mid = Math.round((minAge + maxAge) / 2);
            onAgeRangeChange(
              Math.max(mid - 5, MIN_AGE),
              Math.min(mid + 5, MAX_AGE)
            );
          }}
        />
        <PresetButton
          label="전체"
          onPress={() => onAgeRangeChange(MIN_AGE, MAX_AGE)}
        />
      </View>
    </View>
  );
}

function PresetButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
    >
      <Animated.View style={[ageStyles.preset, animatedStyle]}>
        <Text style={ageStyles.presetText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const ageStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A4AE2',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  presetText: {
    fontSize: 14,
    color: '#666666',
  },
});
```

### 별점 리뷰 입력

```typescript
// src/features/review/ui/RatingInput.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
}

const RATING_LABELS = ['별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'];

export function RatingInput({
  rating,
  onRatingChange,
  label = '만족도',
}: RatingInputProps) {
  const labelOpacity = useSharedValue(0);
  const labelScale = useSharedValue(0.8);

  React.useEffect(() => {
    if (rating > 0) {
      labelOpacity.value = withTiming(1, { duration: 200 });
      labelScale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [rating]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ scale: labelScale.value }],
  }));

  return (
    <View style={ratingInputStyles.container}>
      <Text style={ratingInputStyles.label}>{label}</Text>

      <StarRating
        rating={rating}
        onRatingChange={onRatingChange}
        size={44}
      />

      {rating > 0 && (
        <Animated.Text style={[ratingInputStyles.ratingLabel, labelStyle]}>
          {RATING_LABELS[rating - 1]}
        </Animated.Text>
      )}
    </View>
  );
}

const ratingInputStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7A4AE2',
    marginTop: 16,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 값이 범위를 벗어남

```typescript
// ❌ 잘못된 예: 범위 체크 없음
const handleChange = (value: number) => {
  onValueChange(value);
};

// ✅ 올바른 예: 범위 클램핑
const handleChange = (value: number) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  onValueChange(clampedValue);
};
```

### 2. 스텝 반올림 오류

```typescript
// ❌ 잘못된 예: 부동소수점 오류
const steppedValue = Math.round(rawValue / step) * step;
// 예: step=0.1일 때 0.30000000000000004

// ✅ 올바른 예: 고정 소수점 처리
const decimals = step.toString().split('.')[1]?.length || 0;
const steppedValue = parseFloat(
  (Math.round(rawValue / step) * step).toFixed(decimals)
);
```

### 3. 제스처 충돌

```typescript
// ❌ 잘못된 예: 스크롤과 슬라이더 제스처 충돌
<ScrollView>
  <Slider /> // 슬라이더 드래그 시 스크롤됨
</ScrollView>

// ✅ 올바른 예: 수평/수직 제스처 분리
const panGesture = Gesture.Pan()
  .activeOffsetX([-10, 10]) // 수평 10px 이상 움직여야 활성화
  .failOffsetY([-5, 5]);    // 수직 5px 이상 움직이면 실패
```

## 💡 성능 최적화 팁

### 1. 값 업데이트 스로틀링

```typescript
const throttledUpdate = useThrottle((value: number) => {
  onValueChange(value);
}, 16); // 60fps

const handleUpdate = (value: number) => {
  // 애니메이션은 즉시
  translateX.value = valueToPosition(value);
  // 콜백은 스로틀
  throttledUpdate(value);
};
```

### 2. 눈금 메모이제이션

```typescript
const ticks = React.useMemo(() =>
  steps.map((step, index) => ({
    position: index * stepWidth,
    label: labels?.[index],
    isActive: index <= currentIndex,
  })),
  [steps, stepWidth, currentIndex, labels]
);
```

## 🏋️ 연습 문제

### 문제 1: 온도 슬라이더
온도를 선택하는 슬라이더를 구현하세요. 파란색(추움) → 빨간색(더움) 그라디언트를 사용합니다.

### 문제 2: 수량 선택기
+/- 버튼과 슬라이더를 결합한 수량 선택기를 구현하세요.

### 문제 3: 시간 범위 선택기
시작/종료 시간을 선택하는 범위 슬라이더를 구현하세요. 시간 형식(HH:MM)으로 표시합니다.

## 📚 이 장에서 배운 내용

1. **기본 슬라이더**: 단일 값, 툴팁, 햅틱 피드백
2. **범위 슬라이더**: 두 개의 노브, 최소/최대 값
3. **별점 선택기**: 바운스 효과, 반별 지원
4. **이모지 선택기**: 감정 표현 UI
5. **스텝 슬라이더**: 눈금 표시, 스냅
6. **색상 선택기**: Hue 슬라이더

## 다음 파트 예고

**Part 8: 성능 최적화**에서는 Reanimated 애니메이션의 성능을 극대화하는 방법을 배웁니다. 메모리 관리, 렌더링 최적화, 프로파일링 기법 등을 다룹니다.
