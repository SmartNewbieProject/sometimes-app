# Chapter 48: 버튼 피드백 애니메이션

마이크로 인터랙션의 시작점은 버튼입니다. 사용자가 버튼을 탭할 때 즉각적이고 자연스러운 피드백을 제공하면 앱이 살아있다는 느낌을 줍니다. 이 장에서는 다양한 버튼 피드백 패턴을 구현합니다.

## 📌 학습 목표

- 터치 피드백의 UX 원칙 이해
- Scale, Opacity, Color 기반 피드백 구현
- Bounce, Jelly 등 물리 기반 피드백
- 햅틱 피드백과 애니메이션 연동
- 상태별 버튼 애니메이션 (로딩, 성공, 실패)

## 📖 피드백의 UX 원칙

```
사용자 터치 이벤트의 피드백 타이밍
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시간     0ms    50ms   100ms   200ms   300ms   500ms
         ┃      ┃      ┃       ┃       ┃       ┃
터치 시작 ●──────────────────────────────────────▶
         ┃
         ┃ [즉각적 피드백 필요]
         ┃ • 50ms 이내: 즉각적으로 느껴짐
         ┃ • 100ms 이내: 자연스러움
         ┃ • 300ms 이상: 지연됨으로 느껴짐
         ┃
피드백   ┃  ╭────╮
시각적   ┃  │ ○  │ Scale Down (0.95)
         ┃  ╰────╯
         ┃
터치 종료 ┃          ●
         ┃          ┃
복귀     ┃          ┃ ╭────────╮
애니메이션┃          ┃ │ Spring │ Bounce Back
         ┃          ┃ ╰────────╯

핵심 원칙:
1. 즉각성: 터치 시작과 동시에 피드백
2. 연속성: 터치 중 상태 유지
3. 자연스러움: 터치 종료 시 부드러운 복귀
</pre>
```

## 💻 기본 피드백 패턴

### Scale 피드백 (가장 일반적)

```typescript
import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScaleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  scaleDownValue?: number;
}

export function ScaleButton({
  children,
  onPress,
  style,
  scaleDownValue = 0.95,
}: ScaleButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    // 터치 시작: 즉각적인 축소 (timing 사용)
    scale.value = withTiming(scaleDownValue, { duration: 50 });
  };

  const handlePressOut = () => {
    // 터치 종료: 스프링으로 복귀 (자연스러운 바운스)
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7A4AE2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Opacity + Scale 복합 피드백

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function EnhancedButton({
  children,
  onPress,
  variant = 'primary',
}: EnhancedButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.95]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.8]);

    // variant에 따른 추가 효과
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.2, 0.05]);

    return {
      transform: [{ scale }],
      opacity,
      shadowOpacity,
    };
  });

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 80 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });
  };

  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    outline: styles.outlineButton,
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.baseButton, variantStyles[variant], animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#7A4AE2',
  },
  secondaryButton: {
    backgroundColor: '#E2D5FF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7A4AE2',
  },
});
```

## 💻 물리 기반 피드백

### Bounce 피드백 (튀어오르는 효과)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export function BounceButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePress = () => {
    // 눌림 → 튀어오름 → 착지
    scale.value = withSequence(
      // 1. 눌림 (빠르게)
      withTiming(0.9, { duration: 100 }),
      // 2. 튀어오름 (스프링)
      withSpring(1.05, { damping: 8, stiffness: 400 }),
      // 3. 착지 (스프링)
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    translateY.value = withSequence(
      // 눌림과 함께 약간 아래로
      withTiming(4, { duration: 100 }),
      // 튀어오르며 위로
      withSpring(-8, { damping: 8, stiffness: 400 }),
      // 원위치
      withSpring(0, { damping: 15, stiffness: 300 })
    );

    // 애니메이션 완료 후 콜백 실행
    setTimeout(onPress, 50);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.bounceButton, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
```

### Jelly 피드백 (젤리처럼 찌그러지는 효과)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

export function JellyButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  const handlePress = () => {
    // 젤리처럼 찌그러졌다가 복원
    scaleX.value = withSequence(
      // 1. 옆으로 늘어남
      withTiming(1.15, { duration: 100 }),
      // 2. 복원 (오버슈트)
      withSpring(0.9, { damping: 6, stiffness: 400 }),
      // 3. 최종 복원
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    scaleY.value = withSequence(
      // 1. 위아래로 눌림
      withTiming(0.85, { duration: 100 }),
      // 2. 복원 (오버슈트)
      withSpring(1.1, { damping: 6, stiffness: 400 }),
      // 3. 최종 복원
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.jellyButton, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  bounceButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  jellyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
});
```

### Ripple 피드백 (Material Design 스타일)

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, LayoutRectangle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface RippleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  rippleColor?: string;
}

interface RippleData {
  x: number;
  y: number;
  id: number;
}

export function RippleButton({
  children,
  onPress,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
}: RippleButtonProps) {
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const rippleIdRef = React.useRef(0);

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    const ripple: RippleData = {
      x: locationX,
      y: locationY,
      id: rippleIdRef.current++,
    };

    setRipples((prev) => [...prev, ripple]);

    // 애니메이션 완료 후 리플 제거
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);

    onPress();
  };

  const maxRadius = layout
    ? Math.sqrt(layout.width ** 2 + layout.height ** 2)
    : 100;

  return (
    <View style={styles.rippleContainer}>
      <Pressable
        onPress={handlePress}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
        style={styles.rippleButton}
      >
        {/* 리플 레이어 */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {ripples.map((ripple) => (
            <Ripple
              key={ripple.id}
              x={ripple.x}
              y={ripple.y}
              maxRadius={maxRadius}
              color={rippleColor}
            />
          ))}
        </View>

        {children}
      </Pressable>
    </View>
  );
}

function Ripple({
  x,
  y,
  maxRadius,
  color,
}: {
  x: number;
  y: number;
  maxRadius: number;
  color: string;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withTiming(1, { duration: 500 });
    opacity.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - maxRadius,
    top: y - maxRadius,
    width: maxRadius * 2,
    height: maxRadius * 2,
    borderRadius: maxRadius,
    backgroundColor: color,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  rippleButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
});
```

## 💻 햅틱 피드백 연동

### 햅틱과 애니메이션 동기화

```typescript
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  hapticType?: HapticType;
}

const triggerHaptic = (type: HapticType) => {
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
};

export function HapticButton({
  children,
  onPress,
  hapticType = 'medium',
}: HapticButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    // 햅틱과 애니메이션 동시 실행
    triggerHaptic('light');
    scale.value = withTiming(0.95, { duration: 50 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    // 액션 실행 시 주요 햅틱
    triggerHaptic(hapticType);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.hapticButton, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

// 워크릿에서 햅틱 트리거 (제스처와 함께 사용)
export function useHapticWorklet() {
  const triggerHapticFromWorklet = (type: HapticType) => {
    'worklet';
    runOnJS(triggerHaptic)(type);
  };

  return { triggerHapticFromWorklet };
}
```

### 연속 햅틱 피드백

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

export function ContinuousHapticButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const lastHapticProgress = useSharedValue(0);

  const triggerProgressHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    height: 4,
    backgroundColor: '#7A4AE2',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: 2,
  }));

  const longPressGesture = Gesture.LongPress()
    .minDuration(1000)
    .onBegin(() => {
      scale.value = withTiming(0.95, { duration: 100 });
      progress.value = withTiming(1, { duration: 1000 });
    })
    .onStart(() => {
      // 롱프레스 완료
      runOnJS(Haptics.notificationAsync)(
        Haptics.NotificationFeedbackType.Success
      );
      runOnJS(onPress)();
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      progress.value = withTiming(0, { duration: 200 });
    });

  // 프레임 콜백으로 진행도에 따른 햅틱
  useFrameCallback(() => {
    // 매 20% 진행마다 햅틱
    const currentStep = Math.floor(progress.value * 5);
    const lastStep = Math.floor(lastHapticProgress.value * 5);

    if (currentStep > lastStep && currentStep > 0) {
      runOnJS(triggerProgressHaptic)();
    }

    lastHapticProgress.value = progress.value;
  });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={[styles.longPressButton, animatedStyle]}>
        <Animated.View style={progressStyle} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

## 💻 상태별 버튼 애니메이션

### 로딩 상태 버튼

```typescript
import React from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface StatefulButtonProps {
  state: ButtonState;
  onPress: () => void;
  idleText: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

export function StatefulButton({
  state,
  onPress,
  idleText,
  loadingText = '처리 중...',
  successText = '완료!',
  errorText = '오류 발생',
}: StatefulButtonProps) {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const shake = useSharedValue(0);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 300 });
        cancelAnimation(pulse);
        pulse.value = 1;
        break;

      case 'loading':
        colorProgress.value = withTiming(0.5, { duration: 300 });
        // 펄스 애니메이션
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 500 }),
            withTiming(0.98, { duration: 500 })
          ),
          -1,
          true
        );
        break;

      case 'success':
        colorProgress.value = withTiming(1, { duration: 300 });
        cancelAnimation(pulse);
        // 성공 바운스
        scale.value = withSequence(
          withSpring(1.1, { damping: 8 }),
          withSpring(1, { damping: 10 })
        );
        break;

      case 'error':
        colorProgress.value = withTiming(2, { duration: 300 });
        cancelAnimation(pulse);
        // 에러 흔들기
        shake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withRepeat(
            withSequence(
              withTiming(10, { duration: 100 }),
              withTiming(-10, { duration: 100 })
            ),
            2
          ),
          withTiming(0, { duration: 50 })
        );
        break;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 0.5, 1, 2],
      ['#7A4AE2', '#9E7AE8', '#4CAF50', '#F44336']
    );

    return {
      transform: [
        { scale: scale.value * pulse.value },
        { translateX: shake.value },
      ],
      backgroundColor,
    };
  });

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.buttonText}>{loadingText}</Text>
          </>
        );
      case 'success':
        return (
          <>
            <Text style={styles.icon}>✓</Text>
            <Text style={styles.buttonText}>{successText}</Text>
          </>
        );
      case 'error':
        return (
          <>
            <Text style={styles.icon}>✕</Text>
            <Text style={styles.buttonText}>{errorText}</Text>
          </>
        );
      default:
        return <Text style={styles.buttonText}>{idleText}</Text>;
    }
  };

  return (
    <AnimatedPressable
      onPress={state === 'idle' ? onPress : undefined}
      disabled={state !== 'idle'}
      style={[styles.statefulButton, animatedStyle]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  statefulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 토글 버튼

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface ToggleButtonProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { width: 44, height: 24, knobSize: 20 },
  medium: { width: 56, height: 32, knobSize: 28 },
  large: { width: 68, height: 40, knobSize: 36 },
};

export function ToggleButton({
  isOn,
  onToggle,
  size = 'medium',
}: ToggleButtonProps) {
  const progress = useSharedValue(isOn ? 1 : 0);
  const { width, height, knobSize } = SIZES[size];
  const padding = (height - knobSize) / 2;

  React.useEffect(() => {
    progress.value = withSpring(isOn ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isOn]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#E0E0E0', '#7A4AE2']
    );

    return { backgroundColor };
  });

  const knobStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [padding, width - knobSize - padding]
    );

    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.1, 1]
    );

    return {
      transform: [
        { translateX },
        { scale },
      ],
    };
  });

  const handlePress = () => {
    onToggle(!isOn);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius: height / 2,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
```

## 📱 sometimes-app 적용 사례

### 매칭 액션 버튼

```typescript
// src/features/matching/ui/MatchActionButtons.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface MatchActionButtonsProps {
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}

export function MatchActionButtons({
  onLike,
  onPass,
  onSuperLike,
  disabled = false,
}: MatchActionButtonsProps) {
  return (
    <View style={styles.container}>
      <PassButton onPress={onPass} disabled={disabled} />
      <SuperLikeButton onPress={onSuperLike} disabled={disabled} />
      <LikeButton onPress={onLike} disabled={disabled} />
    </View>
  );
}

// 좋아요 버튼 (하트가 커지며 펄스)
function LikeButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const containerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      backgroundColor.value,
      [0, 1],
      ['#FFE5E5', '#FF6B6B']
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bg,
    };
  });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withTiming(0.9, { duration: 100 });
      backgroundColor.value = withTiming(1, { duration: 100 });
    })
    .onEnd(() => {
      runOnJS(triggerHaptic)();

      // 하트 펄스 애니메이션
      heartScale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 400 }),
        withSpring(1, { damping: 6, stiffness: 300 })
      );

      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      backgroundColor.value = withTiming(0, { duration: 300 });

      runOnJS(onPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      backgroundColor.value = withTiming(0, { duration: 200 });
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.actionButton, styles.likeButton, containerStyle]}>
        <Animated.Text style={[styles.buttonIcon, heartStyle]}>
          ❤️
        </Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

// 패스 버튼 (X 회전)
function PassButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withTiming(0.9, { duration: 100 });
    })
    .onEnd(() => {
      runOnJS(triggerHaptic)();

      // X 회전 애니메이션
      rotation.value = withSequence(
        withTiming(90, { duration: 150 }),
        withSpring(0, { damping: 10, stiffness: 300 })
      );

      scale.value = withSpring(1);
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.actionButton, styles.passButton, animatedStyle]}>
        <Text style={styles.buttonIcon}>✕</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// 슈퍼좋아요 버튼 (별 반짝임)
function SuperLikeButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const starScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: 100,
    backgroundColor: '#00BFFF',
    opacity: glowOpacity.value,
  }));

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withTiming(0.85, { duration: 100 });
    })
    .onEnd(() => {
      runOnJS(triggerHaptic)();

      // 글로우 효과
      glowOpacity.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );

      // 별 펄스
      starScale.value = withSequence(
        withSpring(1.5, { damping: 4, stiffness: 500 }),
        withSpring(1, { damping: 8, stiffness: 300 })
      );

      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.actionButton, styles.superLikeButton, containerStyle]}>
        <Animated.View style={glowStyle} />
        <Animated.Text style={[styles.buttonIcon, starStyle]}>
          ⭐
        </Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  likeButton: {
    backgroundColor: '#FFE5E5',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  passButton: {
    backgroundColor: '#F5F5F5',
  },
  superLikeButton: {
    backgroundColor: '#E5F9FF',
    overflow: 'hidden',
  },
  buttonIcon: {
    fontSize: 28,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 피드백이 너무 느림

```typescript
// ❌ 잘못된 예: 피드백이 지연됨
const handlePressIn = () => {
  scale.value = withSpring(0.95); // 스프링은 시작이 느림
};

// ✅ 올바른 예: 즉각적인 피드백
const handlePressIn = () => {
  scale.value = withTiming(0.95, { duration: 50 }); // 빠른 timing
};

const handlePressOut = () => {
  scale.value = withSpring(1); // 복귀는 스프링 OK
};
```

### 2. 연속 탭 시 애니메이션 꼬임

```typescript
// ❌ 잘못된 예: 애니메이션 취소 없이 새로 시작
const handlePress = () => {
  scale.value = withSequence(
    withTiming(0.9),
    withSpring(1.1),
    withSpring(1)
  );
};

// ✅ 올바른 예: 현재 애니메이션 취소 후 시작
import { cancelAnimation } from 'react-native-reanimated';

const handlePress = () => {
  cancelAnimation(scale);
  scale.value = 1; // 초기값으로 리셋

  scale.value = withSequence(
    withTiming(0.9, { duration: 50 }),
    withSpring(1.1, { damping: 8 }),
    withSpring(1, { damping: 10 })
  );
};
```

### 3. 햅틱이 UI 스레드를 차단

```typescript
// ❌ 잘못된 예: 워크릿에서 직접 호출
const gesture = Gesture.Tap().onEnd(() => {
  'worklet';
  Haptics.impactAsync(); // 에러! JS 함수
});

// ✅ 올바른 예: runOnJS로 호출
const triggerHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

const gesture = Gesture.Tap().onEnd(() => {
  'worklet';
  runOnJS(triggerHaptic)();
});
```

### 4. disabled 상태에서도 애니메이션 실행

```typescript
// ❌ 잘못된 예: disabled 무시
const handlePressIn = () => {
  scale.value = withTiming(0.95);
};

// ✅ 올바른 예: disabled 체크
const handlePressIn = () => {
  if (disabled) return;
  scale.value = withTiming(0.95, { duration: 50 });
};

// 또는 Gesture에서 처리
const tap = Gesture.Tap()
  .enabled(!disabled)
  .onEnd(() => { /* ... */ });
```

## 💡 성능 최적화 팁

### 1. 애니메이션 컴포넌트 메모이제이션

```typescript
// 버튼 자체를 메모이제이션
export const MemoizedButton = React.memo(ScaleButton, (prev, next) => {
  return prev.disabled === next.disabled;
});

// 스타일 객체 메모이제이션
const useButtonStyles = (variant: string) => {
  return React.useMemo(() => ({
    container: [styles.base, styles[variant]],
  }), [variant]);
};
```

### 2. SharedValue 재사용

```typescript
// ❌ 매 렌더링마다 새 SharedValue
function Button() {
  const scale = useSharedValue(1); // 매번 생성
  // ...
}

// ✅ 컴포넌트 레벨에서 한 번만 생성
function Button() {
  const scaleRef = React.useRef(useSharedValue(1));
  const scale = scaleRef.current;
  // ...
}
```

### 3. 조건부 애니메이션 최적화

```typescript
// 애니메이션 비용이 높은 경우 조건부 실행
const [reduceMotion, setReduceMotion] = React.useState(false);

React.useEffect(() => {
  // 시스템 설정 확인
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

const handlePress = () => {
  if (reduceMotion) {
    // 단순한 피드백만
    scale.value = withTiming(0.98, { duration: 50 });
    scale.value = withTiming(1, { duration: 50 });
  } else {
    // 풀 애니메이션
    scale.value = withSequence(
      withTiming(0.9),
      withSpring(1.1),
      withSpring(1)
    );
  }
};
```

## 🏋️ 연습 문제

### 문제 1: 3D 버튼 효과
버튼을 누를 때 3D로 눌리는 듯한 효과를 구현하세요.
힌트: perspective, rotateX 사용

### 문제 2: 물결 효과 버튼
버튼을 누를 때 물결이 중앙에서 퍼져나가는 효과를 구현하세요.
ripple과 다르게 터치 위치와 무관하게 중앙에서 시작합니다.

### 문제 3: 로딩 → 체크마크 변환
버튼 내 로딩 스피너가 완료 시 체크마크로 부드럽게 변환되는 애니메이션을 구현하세요.

## 📚 이 장에서 배운 내용

1. **UX 원칙**: 50ms 이내 피드백, 자연스러운 복귀
2. **기본 패턴**: Scale, Opacity, Color 기반 피드백
3. **물리 효과**: Bounce, Jelly, Ripple 효과
4. **햅틱 연동**: 터치와 진동 동기화
5. **상태 버튼**: 로딩, 성공, 실패 상태 표현
6. **성능**: 메모이제이션, 접근성 고려

## 다음 장 예고

**Chapter 49: 로딩 상태 애니메이션**에서는 사용자가 기다리는 동안 지루하지 않게 만드는 로딩 인디케이터를 만듭니다. Skeleton, Shimmer, 프로그레스 바 등 다양한 로딩 UI를 구현합니다.
