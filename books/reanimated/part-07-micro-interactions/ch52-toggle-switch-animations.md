# Chapter 52: 토글과 스위치 애니메이션

온/오프 상태를 전환하는 UI는 앱 곳곳에서 사용됩니다. iOS 스타일 스위치부터 체크박스, 라디오 버튼, 세그먼트 컨트롤까지 다양한 토글 컴포넌트의 애니메이션을 구현합니다.

## 📌 학습 목표

- iOS/Android 스타일 스위치 구현
- 애니메이션 체크박스와 라디오 버튼
- 세그먼트 컨트롤 전환 효과
- 다크 모드 토글과 테마 스위치
- 슬라이드 토글과 멀티 옵션 선택기

## 📖 토글 UX 원칙

```
토글 상태 전환의 핵심 요소
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

상태 표현:
╭────────────────────────────────────────────╮
│ OFF                           ON           │
│ ╭───────╮                   ╭───────╮      │
│ │ ○────│────────────────────│────○ │      │
│ ╰───────╯                   ╰───────╯      │
│ 회색 트랙                    컬러 트랙      │
│ 왼쪽 노브                    오른쪽 노브    │
╰────────────────────────────────────────────╯

전환 애니메이션:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 노브 이동 (Primary)
   ○ ───────────────────▶ ○
   스프링 애니메이션 (탄성 있게)

2. 배경색 전환 (Secondary)
   ████████░░░░░░░░░░░░ → ░░░░░░░░░░████████
   부드러운 색상 보간

3. 노브 크기 변화 (Tertiary)
   ○ → ◯ → ○
   누를 때 살짝 늘어남

4. 햅틱 피드백 (Touch)
   상태 전환 시 Light Impact
```

## 💻 iOS 스타일 스위치

### 기본 스위치

```typescript
import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

const SWITCH_WIDTH = 51;
const SWITCH_HEIGHT = 31;
const KNOB_SIZE = 27;
const KNOB_MARGIN = 2;

export function Switch({
  value,
  onValueChange,
  disabled = false,
  activeColor = '#34C759',
  inactiveColor = '#E9E9EA',
}: SwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);
  const isPressed = useSharedValue(false);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic();
    onValueChange(!value);
  };

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );

    return {
      backgroundColor,
      opacity: disabled ? 0.5 : 1,
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [KNOB_MARGIN, SWITCH_WIDTH - KNOB_SIZE - KNOB_MARGIN]
    );

    // 눌렀을 때 약간 늘어남
    const scaleX = isPressed.value
      ? interpolate(progress.value, [0, 0.5, 1], [1.1, 1.15, 1.1])
      : 1;

    return {
      transform: [
        { translateX },
        { scaleX },
      ],
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => (isPressed.value = true)}
      onPressOut={() => (isPressed.value = false)}
      disabled={disabled}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

### 아이콘 스위치

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface IconSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconOff: string;
  iconOn: string;
}

export function IconSwitch({
  value,
  onValueChange,
  iconOff = '🌙',
  iconOn = '☀️',
}: IconSwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#1A1A2E', '#87CEEB']
    );

    return { backgroundColor };
  });

  const knobStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [4, 56 - 28 - 4]
    );

    const rotate = interpolate(progress.value, [0, 1], [0, 360]);

    return {
      transform: [
        { translateX },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const offIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
    transform: [
      { scale: interpolate(progress.value, [0, 0.5], [1, 0.5]) },
    ],
  }));

  const onIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
    transform: [
      { scale: interpolate(progress.value, [0.5, 1], [0.5, 1]) },
    ],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[iconStyles.track, trackStyle]}>
        <Animated.View style={[iconStyles.knob, knobStyle]}>
          <Animated.Text style={[iconStyles.icon, offIconStyle]}>
            {iconOff}
          </Animated.Text>
          <Animated.Text style={[iconStyles.icon, iconStyles.iconAbsolute, onIconStyle]}>
            {iconOn}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const iconStyles = StyleSheet.create({
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  knob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 16,
  },
  iconAbsolute: {
    position: 'absolute',
  },
});
```

## 💻 체크박스 애니메이션

### SVG 체크마크 체크박스

```typescript
import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  size?: number;
  color?: string;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  size = 24,
  color = '#7A4AE2',
}: CheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  const checkPath = 'M5 12l4 4 10-10';
  const pathLength = 22;

  React.useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [checked]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 바운스 효과
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 8, stiffness: 400 })
    );

    onToggle(!checked);
  };

  const boxProps = useAnimatedProps(() => {
    const fillOpacity = progress.value;
    const stroke = interpolateColor(
      progress.value,
      [0, 1],
      ['#CCCCCC', color]
    );

    return {
      fill: color,
      fillOpacity,
      stroke,
    };
  });

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={checkboxStyles.container}>
      <Animated.View style={containerStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* 박스 */}
          <AnimatedRect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="4"
            strokeWidth="2"
            animatedProps={boxProps}
          />

          {/* 체크마크 */}
          <AnimatedPath
            d={checkPath}
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={pathLength}
            animatedProps={checkProps}
          />
        </Svg>
      </Animated.View>

      {label && <Text style={checkboxStyles.label}>{label}</Text>}
    </Pressable>
  );
}

const checkboxStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    color: '#333333',
  },
});
```

### 원형 체크박스

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

export function CircleCheckbox({
  checked,
  onToggle,
  size = 28,
  color = '#7A4AE2',
}: {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  size?: number;
  color?: string;
}) {
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 10,
      stiffness: 150,
    });
  }, [checked]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withSpring(1, { damping: 8 })
    );
    onToggle(!checked);
  };

  const outerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#CCCCCC', color]
    );
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', color]
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  const innerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0, 1]) },
    ],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
          },
          outerStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: (size * 0.4) / 2,
              backgroundColor: 'white',
            },
            innerStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
```

## 💻 라디오 버튼

### 기본 라디오 버튼

```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  color?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  color = '#7A4AE2',
}: RadioGroupProps) {
  return (
    <View style={radioStyles.container}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onSelect={() => onChange(option.value)}
          color={color}
        />
      ))}
    </View>
  );
}

function RadioButton({
  option,
  isSelected,
  onSelect,
  color,
}: {
  option: RadioOption;
  isSelected: boolean;
  onSelect: () => void;
  color: string;
}) {
  const progress = useSharedValue(isSelected ? 1 : 0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [isSelected]);

  const handlePress = () => {
    if (!isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSequence(
        withTiming(0.9, { duration: 50 }),
        withSpring(1, { damping: 10 })
      );
      onSelect();
    }
  };

  const outerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#CCCCCC', color]
    );

    return {
      borderColor,
      transform: [{ scale: scale.value }],
    };
  });

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable onPress={handlePress} style={radioStyles.option}>
      <Animated.View style={[radioStyles.outer, outerStyle]}>
        <Animated.View
          style={[radioStyles.inner, { backgroundColor: color }, innerStyle]}
        />
      </Animated.View>
      <Text style={radioStyles.label}>{option.label}</Text>
    </Pressable>
  );
}

const radioStyles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  outer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    color: '#333333',
  },
});
```

### 카드 스타일 라디오

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

interface CardRadioGroupProps {
  options: { value: string; label: string; description?: string; icon?: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function CardRadioGroup({
  options,
  value,
  onChange,
}: CardRadioGroupProps) {
  return (
    <View style={cardRadioStyles.container}>
      {options.map((option) => (
        <CardRadioButton
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

function CardRadioButton({
  option,
  isSelected,
  onSelect,
}: {
  option: { value: string; label: string; description?: string; icon?: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const progress = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isSelected]);

  const cardStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#E0E0E0', '#7A4AE2']
    );
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', '#F8F4FF']
    );
    const shadowOpacity = interpolate(progress.value, [0, 1], [0.05, 0.15]);

    return {
      borderColor,
      backgroundColor,
      borderWidth: isSelected ? 2 : 1,
      shadowOpacity,
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable onPress={onSelect}>
      <Animated.View style={[cardRadioStyles.card, cardStyle]}>
        {option.icon && (
          <Text style={cardRadioStyles.icon}>{option.icon}</Text>
        )}

        <View style={cardRadioStyles.content}>
          <Text style={cardRadioStyles.label}>{option.label}</Text>
          {option.description && (
            <Text style={cardRadioStyles.description}>
              {option.description}
            </Text>
          )}
        </View>

        <Animated.View style={[cardRadioStyles.check, checkStyle]}>
          <Text style={cardRadioStyles.checkIcon}>✓</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const cardRadioStyles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  description: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

## 💻 세그먼트 컨트롤

### iOS 스타일 세그먼트

```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable, LayoutRectangle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  const [segmentLayouts, setSegmentLayouts] = React.useState<LayoutRectangle[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  React.useEffect(() => {
    if (segmentLayouts[selectedIndex]) {
      const layout = segmentLayouts[selectedIndex];
      indicatorX.value = withSpring(layout.x, { damping: 15, stiffness: 150 });
      indicatorWidth.value = withSpring(layout.width, { damping: 15, stiffness: 150 });
    }
  }, [selectedIndex, segmentLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(index);
    }
  };

  return (
    <View style={segmentStyles.container}>
      {/* 배경 인디케이터 */}
      <Animated.View style={[segmentStyles.indicator, indicatorStyle]} />

      {/* 세그먼트 버튼들 */}
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          style={segmentStyles.segment}
          onPress={() => handlePress(index)}
          onLayout={(e) => {
            const layouts = [...segmentLayouts];
            layouts[index] = e.nativeEvent.layout;
            setSegmentLayouts(layouts);
          }}
        >
          <Text
            style={[
              segmentStyles.segmentText,
              selectedIndex === index && segmentStyles.selectedText,
            ]}
          >
            {segment}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const segmentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: 'white',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  selectedText: {
    color: '#000000',
  },
});
```

### 언더라인 탭

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface TabBarProps {
  tabs: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function UnderlineTabBar({
  tabs,
  selectedIndex,
  onChange,
}: TabBarProps) {
  const [tabLayouts, setTabLayouts] = React.useState<LayoutRectangle[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  React.useEffect(() => {
    if (tabLayouts[selectedIndex]) {
      const layout = tabLayouts[selectedIndex];
      indicatorX.value = withSpring(layout.x, { damping: 20, stiffness: 200 });
      indicatorWidth.value = withSpring(layout.width, { damping: 20, stiffness: 200 });
    }
  }, [selectedIndex, tabLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabsRow}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={tabStyles.tab}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(index);
            }}
            onLayout={(e) => {
              const layouts = [...tabLayouts];
              layouts[index] = e.nativeEvent.layout;
              setTabLayouts(layouts);
            }}
          >
            <TabLabel
              text={tab}
              isSelected={selectedIndex === index}
            />
          </Pressable>
        ))}
      </View>

      {/* 언더라인 인디케이터 */}
      <View style={tabStyles.indicatorTrack}>
        <Animated.View style={[tabStyles.indicator, indicatorStyle]} />
      </View>
    </View>
  );
}

function TabLabel({
  text,
  isSelected,
}: {
  text: string;
  isSelected: boolean;
}) {
  const scale = useSharedValue(1);
  const color = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, { damping: 15 });
    color.value = withSpring(isSelected ? 1 : 0, { damping: 15 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      color.value,
      [0, 1],
      ['#888888', '#7A4AE2']
    );

    return {
      transform: [{ scale: scale.value }],
      color: textColor,
    };
  });

  return (
    <Animated.Text style={[tabStyles.tabText, animatedStyle]}>
      {text}
    </Animated.Text>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  indicatorTrack: {
    height: 3,
    backgroundColor: '#F0F0F0',
  },
  indicator: {
    height: 3,
    backgroundColor: '#7A4AE2',
    borderRadius: 1.5,
  },
});
```

## 📱 sometimes-app 적용 사례

### 설정 토글 목록

```typescript
// src/features/setting/ui/SettingsToggles.tsx
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';

interface SettingItem {
  key: string;
  title: string;
  description?: string;
  icon: string;
  value: boolean;
}

interface SettingsTogglesProps {
  settings: SettingItem[];
  onToggle: (key: string, value: boolean) => void;
}

export function SettingsToggles({
  settings,
  onToggle,
}: SettingsTogglesProps) {
  return (
    <ScrollView style={settingStyles.container}>
      <View style={settingStyles.section}>
        <Text style={settingStyles.sectionTitle}>알림 설정</Text>

        {settings.map((setting, index) => (
          <SettingToggleItem
            key={setting.key}
            setting={setting}
            onToggle={(value) => onToggle(setting.key, value)}
            index={index}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SettingToggleItem({
  setting,
  onToggle,
  index,
}: {
  setting: SettingItem;
  onToggle: (value: boolean) => void;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withSpring(1, { delay: index * 50 });
    translateY.value = withSpring(0, { delay: index * 50, damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[settingStyles.item, animatedStyle]}
      layout={Layout.springify()}
    >
      <View style={settingStyles.iconContainer}>
        <Text style={settingStyles.icon}>{setting.icon}</Text>
      </View>

      <View style={settingStyles.content}>
        <Text style={settingStyles.title}>{setting.title}</Text>
        {setting.description && (
          <Text style={settingStyles.description}>
            {setting.description}
          </Text>
        )}
      </View>

      <Switch
        value={setting.value}
        onValueChange={onToggle}
        activeColor="#7A4AE2"
      />
    </Animated.View>
  );
}

const settingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  description: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
});
```

### 필터 선택 세그먼트

```typescript
// src/features/matching/ui/FilterSegments.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface FilterSegmentsProps {
  ageRange: '20s' | '30s' | 'all';
  onAgeRangeChange: (range: '20s' | '30s' | 'all') => void;
  distance: 'near' | 'mid' | 'far';
  onDistanceChange: (distance: 'near' | 'mid' | 'far') => void;
}

export function FilterSegments({
  ageRange,
  onAgeRangeChange,
  distance,
  onDistanceChange,
}: FilterSegmentsProps) {
  const ageSegments = ['20대', '30대', '전체'];
  const ageValues: ('20s' | '30s' | 'all')[] = ['20s', '30s', 'all'];

  const distanceSegments = ['가까운', '보통', '먼'];
  const distanceValues: ('near' | 'mid' | 'far')[] = ['near', 'mid', 'far'];

  return (
    <View style={filterStyles.container}>
      <View style={filterStyles.filterGroup}>
        <Text style={filterStyles.label}>연령대</Text>
        <SegmentedControl
          segments={ageSegments}
          selectedIndex={ageValues.indexOf(ageRange)}
          onChange={(index) => onAgeRangeChange(ageValues[index])}
        />
      </View>

      <View style={filterStyles.filterGroup}>
        <Text style={filterStyles.label}>거리</Text>
        <SegmentedControl
          segments={distanceSegments}
          selectedIndex={distanceValues.indexOf(distance)}
          onChange={(index) => onDistanceChange(distanceValues[index])}
        />
      </View>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  filterGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 토글 상태와 UI 불일치

```typescript
// ❌ 잘못된 예: 로컬 상태와 prop 분리
function Switch({ value, onValueChange }) {
  const [localValue, setLocalValue] = useState(value);

  const handlePress = () => {
    setLocalValue(!localValue); // UI만 변경
    onValueChange(!localValue); // 실제 상태 변경
  };
}

// ✅ 올바른 예: prop 값을 직접 사용
function Switch({ value, onValueChange }) {
  // value가 변경되면 애니메이션도 자동 업데이트
  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0);
  }, [value]);

  const handlePress = () => {
    onValueChange(!value);
  };
}
```

### 2. 다중 선택 시 애니메이션 충돌

```typescript
// ❌ 잘못된 예: 각 항목이 독립적으로 레이아웃 애니메이션
{items.map(item => (
  <Animated.View layout={Layout.springify()}>
    <Checkbox checked={selected.includes(item.id)} />
  </Animated.View>
))}

// ✅ 올바른 예: 컨테이너 레벨에서 레이아웃 관리
<Animated.View layout={Layout.springify()}>
  {items.map(item => (
    <Checkbox
      key={item.id}
      checked={selected.includes(item.id)}
    />
  ))}
</Animated.View>
```

### 3. 세그먼트 레이아웃 측정 타이밍

```typescript
// ❌ 잘못된 예: 첫 렌더에서 레이아웃이 없음
const indicatorStyle = useAnimatedStyle(() => ({
  left: segmentLayouts[selectedIndex]?.x || 0, // undefined일 수 있음
}));

// ✅ 올바른 예: 레이아웃 준비 확인
const indicatorStyle = useAnimatedStyle(() => {
  if (!segmentLayouts[selectedIndex]) {
    return { opacity: 0 }; // 레이아웃 전에는 숨김
  }

  return {
    opacity: 1,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  };
});
```

## 💡 성능 최적화 팁

### 1. 토글 컴포넌트 메모이제이션

```typescript
export const MemoizedSwitch = React.memo(Switch, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled
  );
});
```

### 2. 레이아웃 측정 최적화

```typescript
// 레이아웃 측정을 한 번만 수행
const [measured, setMeasured] = useState(false);
const layouts = useRef<LayoutRectangle[]>([]);

const handleLayout = (index: number, layout: LayoutRectangle) => {
  if (!measured) {
    layouts.current[index] = layout;
    if (layouts.current.length === segments.length) {
      setMeasured(true);
    }
  }
};
```

## 🏋️ 연습 문제

### 문제 1: 멀티 토글
한 줄에 여러 옵션을 선택할 수 있는 토글 그룹을 구현하세요 (예: "월 화 수 목 금 토 일" 선택).

### 문제 2: 슬라이드 토글
좌우로 슬라이드해서 상태를 변경하는 토글을 구현하세요. 드래그 중간에 놓으면 가까운 상태로 스냅됩니다.

### 문제 3: 3단계 스위치
OFF → MEDIUM → HIGH 3단계로 전환되는 스위치를 구현하세요.

## 📚 이 장에서 배운 내용

1. **스위치**: iOS 스타일, 아이콘 스위치
2. **체크박스**: SVG 체크마크, 원형 체크박스
3. **라디오 버튼**: 기본, 카드 스타일
4. **세그먼트**: 슬라이딩 인디케이터, 언더라인 탭
5. **애니메이션**: 스프링 전환, 색상 보간
6. **햅틱**: 상태 전환 시 촉각 피드백

## 다음 장 예고

**Chapter 53: 알림 배지와 인디케이터**에서는 새로운 알림을 알려주는 배지, 읽지 않은 메시지 카운터, 온라인 상태 표시 등 상태 인디케이터 애니메이션을 구현합니다.
