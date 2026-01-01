# Chapter 74: 플랫폼별 이슈

iOS와 Android 간의 애니메이션 동작 차이를 이해하고 일관된 사용자 경험을 제공하는 방법을 학습합니다.

## 📌 학습 목표

- iOS와 Android의 렌더링 차이 이해
- 플랫폼별 성능 특성 파악
- 크로스 플랫폼 호환 코드 작성
- 플랫폼 특화 최적화 기법

## 📖 개념 이해

### 플랫폼별 렌더링 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                   iOS Architecture                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  JavaScript ──→ JSI ──→ Worklets                            │
│                           ↓                                  │
│  ┌─────────────────────────────────────────┐                │
│  │        Core Animation (CALayer)          │                │
│  │  - 60fps native                          │                │
│  │  - Implicit animations                   │                │
│  │  - GPU-accelerated transforms            │                │
│  └─────────────────────────────────────────┘                │
│                           ↓                                  │
│  ┌─────────────────────────────────────────┐                │
│  │              Metal / GPU                 │                │
│  │  - Hardware-accelerated compositing      │                │
│  │  - Optimized for Apple Silicon           │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Android Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  JavaScript ──→ JSI ──→ Worklets                            │
│                           ↓                                  │
│  ┌─────────────────────────────────────────┐                │
│  │          View System (Android View)      │                │
│  │  - RenderThread for animations           │                │
│  │  - Hardware layers                       │                │
│  │  - Display lists                         │                │
│  └─────────────────────────────────────────┘                │
│                           ↓                                  │
│  ┌─────────────────────────────────────────┐                │
│  │            Skia / OpenGL / Vulkan        │                │
│  │  - Device-dependent performance          │                │
│  │  - Fragmentation issues                  │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 주요 차이점

```
┌─────────────────────────────────────────────────────────────┐
│                    Platform Differences                      │
├───────────────────┬─────────────────┬───────────────────────┤
│      Feature      │      iOS        │       Android         │
├───────────────────┼─────────────────┼───────────────────────┤
│ Shadow            │ Native shadow   │ elevation prop        │
│                   │ (shadowColor,   │ (limited styling)     │
│                   │  shadowOffset)  │                       │
├───────────────────┼─────────────────┼───────────────────────┤
│ Border Radius     │ Any combination │ All corners must      │
│                   │ supported       │ match for elevation   │
├───────────────────┼─────────────────┼───────────────────────┤
│ Transform Origin  │ Not adjustable  │ Not adjustable        │
│                   │ (center default)│ (center default)      │
├───────────────────┼─────────────────┼───────────────────────┤
│ Backdrop Filter   │ Supported       │ Limited support       │
│ (blur)            │ (UIBlurEffect)  │ (experimental)        │
├───────────────────┼─────────────────┼───────────────────────┤
│ Safe Area         │ Dynamic Island, │ Status bar, nav bar   │
│                   │ notch, home bar │ (varies by device)    │
├───────────────────┼─────────────────┼───────────────────────┤
│ Touch Latency     │ ~16ms           │ ~32-48ms (varies)     │
├───────────────────┼─────────────────┼───────────────────────┤
│ Haptic Feedback   │ Taptic Engine   │ VibrationEffect       │
│                   │ (precise)       │ (device-dependent)    │
├───────────────────┼─────────────────┼───────────────────────┤
│ Scroll Bounce     │ Native bounce   │ OverScroll glow       │
│                   │                 │ (or custom)           │
└───────────────────┴─────────────────┴───────────────────────┘
```

## 💻 코드 예제

### 예제 1: 플랫폼별 그림자 처리

```typescript
// src/utils/platform/shadows.ts
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface ShadowConfig {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
}

// 플랫폼별 그림자 스타일 생성
export function createShadowStyle(config: ShadowConfig): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: config.color,
      shadowOffset: config.offset,
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
    };
  }

  // Android
  return {
    elevation: config.elevation,
    // Android에서 shadowColor는 elevation과 함께만 동작
    shadowColor: config.color,
  };
}

// 애니메이션 그림자 훅
export function useAnimatedShadow(
  intensity: Animated.SharedValue<number>,
  baseConfig: Partial<ShadowConfig> = {}
) {
  const config: ShadowConfig = {
    color: '#000000',
    offset: { width: 0, height: 2 },
    opacity: 0.15,
    radius: 4,
    elevation: 4,
    ...baseConfig,
  };

  if (Platform.OS === 'ios') {
    return useAnimatedStyle(() => ({
      shadowColor: config.color,
      shadowOffset: {
        width: config.offset.width * intensity.value,
        height: config.offset.height * intensity.value,
      },
      shadowOpacity: config.opacity * intensity.value,
      shadowRadius: config.radius * intensity.value,
    }));
  }

  // Android: elevation 애니메이션
  return useAnimatedStyle(() => ({
    elevation: config.elevation * intensity.value,
    shadowColor: config.color,
  }));
}

// 프레스 효과가 있는 카드 (플랫폼 최적화)
export function PressableCardWithShadow({ children, onPress }) {
  const pressed = useSharedValue(0);

  const shadowStyle = useAnimatedShadow(
    useDerivedValue(() => 1 - pressed.value * 0.5),
    { radius: 8, elevation: 8 }
  );

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

  const gesture = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      pressed.value = withSpring(1);
    })
    .onFinalize(() => {
      'worklet';
      pressed.value = withSpring(0);
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, shadowStyle, scaleStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Android 그림자 대안: SVG 그림자
export function AndroidShadowFallback({
  width,
  height,
  borderRadius,
  shadowColor = '#000',
  shadowOpacity = 0.15,
  shadowRadius = 10,
  children,
}) {
  if (Platform.OS === 'ios') {
    return children;
  }

  const Svg = require('react-native-svg').Svg;
  const Defs = require('react-native-svg').Defs;
  const Filter = require('react-native-svg').Filter;
  const FeGaussianBlur = require('react-native-svg').FeGaussianBlur;
  const Rect = require('react-native-svg').Rect;

  return (
    <View>
      <Svg
        width={width + shadowRadius * 2}
        height={height + shadowRadius * 2}
        style={{
          position: 'absolute',
          left: -shadowRadius,
          top: -shadowRadius,
        }}
      >
        <Defs>
          <Filter id="shadow">
            <FeGaussianBlur stdDeviation={shadowRadius / 2} />
          </Filter>
        </Defs>
        <Rect
          x={shadowRadius}
          y={shadowRadius}
          width={width}
          height={height}
          rx={borderRadius}
          fill={shadowColor}
          opacity={shadowOpacity}
          filter="url(#shadow)"
        />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
});
```

### 예제 2: 스크롤 바운스 처리

```typescript
// src/utils/platform/scroll.ts
import { Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// iOS 스타일 바운스를 Android에서 구현
export function useCustomBounce(contentHeight: number) {
  const scrollY = useSharedValue(0);
  const overscrollY = useSharedValue(0);
  const isOverscrolling = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const maxScroll = contentHeight - SCREEN_HEIGHT;

      // 위쪽 오버스크롤
      if (y < 0) {
        if (Platform.OS === 'android') {
          overscrollY.value = y * 0.5; // 저항감 적용
          isOverscrolling.value = true;
        }
      }
      // 아래쪽 오버스크롤
      else if (y > maxScroll) {
        if (Platform.OS === 'android') {
          overscrollY.value = (y - maxScroll) * 0.5;
          isOverscrolling.value = true;
        }
      }
      else {
        isOverscrolling.value = false;
        overscrollY.value = 0;
      }

      scrollY.value = y;
    },
    onEndDrag: () => {
      if (Platform.OS === 'android' && isOverscrolling.value) {
        overscrollY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
  });

  const bounceStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return {}; // iOS는 네이티브 바운스 사용
    }

    return {
      transform: [{ translateY: -overscrollY.value }],
    };
  });

  return {
    scrollHandler,
    bounceStyle,
    scrollY,
  };
}

// Pull-to-refresh with platform-specific behavior
export function usePlatformRefresh(onRefresh: () => Promise<void>) {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const progress = useSharedValue(0);

  const TRIGGER_THRESHOLD = Platform.select({ ios: 80, android: 100 })!;
  const MAX_PULL = Platform.select({ ios: 120, android: 140 })!;

  const panGesture = Gesture.Pan()
    .activeOffsetY([0, 10])
    .onUpdate((event) => {
      'worklet';
      if (!isRefreshing.value && event.translationY > 0) {
        // iOS: 선형적인 저항
        // Android: 더 강한 저항
        const resistance = Platform.OS === 'ios' ? 0.5 : 0.3;
        translateY.value = Math.min(event.translationY * resistance, MAX_PULL);
        progress.value = translateY.value / TRIGGER_THRESHOLD;
      }
    })
    .onEnd(() => {
      'worklet';
      if (translateY.value >= TRIGGER_THRESHOLD) {
        isRefreshing.value = true;
        translateY.value = withSpring(TRIGGER_THRESHOLD);
        runOnJS(onRefresh)().finally(() => {
          isRefreshing.value = false;
          translateY.value = withSpring(0);
          progress.value = withTiming(0);
        });
      } else {
        translateY.value = withSpring(0);
        progress.value = withTiming(0);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // 플랫폼별 인디케이터 스타일
  const indicatorStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return {
        opacity: progress.value,
        transform: [
          { scale: interpolate(progress.value, [0, 1], [0.5, 1]) },
          { rotate: `${progress.value * 360}deg` },
        ],
      };
    }

    // Android Material style
    return {
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]),
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.8, 1]) },
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, 720], Extrapolation.CLAMP)}deg`,
        },
      ],
    };
  });

  return {
    panGesture,
    containerStyle,
    indicatorStyle,
    isRefreshing,
  };
}
```

### 예제 3: 블러 효과 대응

```typescript
// src/utils/platform/blur.ts
import { Platform, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface BlurConfig {
  intensity: number;
  tint?: 'light' | 'dark' | 'default';
}

// iOS BlurView 래퍼
let BlurView: React.ComponentType<any> | null = null;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch {
  BlurView = null;
}

export function CrossPlatformBlur({
  intensity = 10,
  tint = 'default',
  children,
  style,
}: BlurConfig & { children?: React.ReactNode; style?: any }) {
  if (Platform.OS === 'ios' && BlurView) {
    return (
      <BlurView
        style={[StyleSheet.absoluteFill, style]}
        blurType={tint}
        blurAmount={intensity}
      >
        {children}
      </BlurView>
    );
  }

  // Android 대안: 반투명 배경
  const backgroundColor =
    tint === 'light'
      ? `rgba(255, 255, 255, ${0.7 + intensity * 0.02})`
      : tint === 'dark'
      ? `rgba(0, 0, 0, ${0.7 + intensity * 0.02})`
      : `rgba(128, 128, 128, ${0.5 + intensity * 0.03})`;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor }, style]}>
      {children}
    </View>
  );
}

// 애니메이션 블러 오버레이
export function AnimatedBlurOverlay({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(0);
  const blurIntensity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
    blurIntensity.value = withTiming(visible ? 20 : 0, { duration: 300 });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value > 0 ? 'auto' : 'none',
  }));

  // iOS: 네이티브 블러 애니메이션
  const iosBlurStyle = useAnimatedStyle(() => ({
    opacity: blurIntensity.value / 20,
  }));

  // Android: 배경 어둡게
  const androidOverlayStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${interpolate(
      blurIntensity.value,
      [0, 20],
      [0, 0.5]
    )})`,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
      {Platform.OS === 'ios' && BlurView ? (
        <Animated.View style={[StyleSheet.absoluteFill, iosBlurStyle]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[StyleSheet.absoluteFill, androidOverlayStyle]}
        />
      )}

      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {children}
    </Animated.View>
  );
}

// Glassmorphism 효과
export function GlassmorphicCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  if (Platform.OS === 'ios' && BlurView) {
    return (
      <BlurView
        style={[styles.glassCard, style]}
        blurType="xlight"
        blurAmount={10}
      >
        <View style={styles.glassCardInner}>{children}</View>
      </BlurView>
    );
  }

  // Android 대안
  return (
    <View style={[styles.glassCardAndroid, style]}>
      <View style={styles.glassCardInner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassCardAndroid: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Android에서 그림자 효과
    elevation: 8,
    shadowColor: '#000',
  },
  glassCardInner: {
    padding: 16,
  },
});
```

### 예제 4: 햅틱 피드백 통합

```typescript
// src/utils/platform/haptics.ts
import { Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

type HapticType =
  | 'impact-light'
  | 'impact-medium'
  | 'impact-heavy'
  | 'selection'
  | 'notification-success'
  | 'notification-warning'
  | 'notification-error';

let ReactNativeHapticFeedback: any = null;
try {
  ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
} catch {
  ReactNativeHapticFeedback = null;
}

// iOS Haptic 매핑
const iosHapticMap: Record<HapticType, string> = {
  'impact-light': 'impactLight',
  'impact-medium': 'impactMedium',
  'impact-heavy': 'impactHeavy',
  'selection': 'selection',
  'notification-success': 'notificationSuccess',
  'notification-warning': 'notificationWarning',
  'notification-error': 'notificationError',
};

// Android Haptic 매핑 (간소화됨)
const androidHapticMap: Record<HapticType, string> = {
  'impact-light': 'keyboardTap',
  'impact-medium': 'virtualKey',
  'impact-heavy': 'longPress',
  'selection': 'keyboardTap',
  'notification-success': 'virtualKey',
  'notification-warning': 'virtualKey',
  'notification-error': 'longPress',
};

export function triggerHaptic(type: HapticType) {
  if (!ReactNativeHapticFeedback) return;

  const hapticType = Platform.select({
    ios: iosHapticMap[type],
    android: androidHapticMap[type],
  });

  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  ReactNativeHapticFeedback.trigger(hapticType, options);
}

// 임계값 기반 햅틱 피드백 훅
export function useThresholdHaptic(
  value: Animated.SharedValue<number>,
  threshold: number,
  type: HapticType = 'selection'
) {
  const lastTriggered = useSharedValue(false);

  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      if (previous === null) return;

      const crossedUp = previous < threshold && current >= threshold;
      const crossedDown = previous >= threshold && current < threshold;

      if ((crossedUp || crossedDown) && !lastTriggered.value) {
        lastTriggered.value = true;
        runOnJS(triggerHaptic)(type);

        // 디바운스
        setTimeout(() => {
          lastTriggered.value = false;
        }, 100);
      }
    }
  );
}

// 스와이프 방향 햅틱
export function useSwipeHaptic(
  translateX: Animated.SharedValue<number>,
  threshold: number = 100
) {
  const lastDirection = useSharedValue<'left' | 'right' | null>(null);

  useAnimatedReaction(
    () => translateX.value,
    (current) => {
      if (current > threshold && lastDirection.value !== 'right') {
        lastDirection.value = 'right';
        runOnJS(triggerHaptic)('impact-light');
      } else if (current < -threshold && lastDirection.value !== 'left') {
        lastDirection.value = 'left';
        runOnJS(triggerHaptic)('impact-light');
      } else if (Math.abs(current) < threshold * 0.5) {
        lastDirection.value = null;
      }
    }
  );
}

// 연속 진동 (드래그 중)
export function useDragHaptic(
  isActive: Animated.SharedValue<boolean>,
  interval: number = 50
) {
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const check = () => {
      if (isActive.value) {
        triggerHaptic('selection');
      }
    };

    intervalId = setInterval(check, interval);

    return () => clearInterval(intervalId);
  }, [interval]);
}

// 플랫폼별 피드백 강도 조절
export function getHapticIntensity(
  baseIntensity: number,
  platform: 'ios' | 'android' = Platform.OS as any
): HapticType {
  if (platform === 'ios') {
    if (baseIntensity < 0.3) return 'impact-light';
    if (baseIntensity < 0.7) return 'impact-medium';
    return 'impact-heavy';
  }

  // Android는 덜 세밀함
  if (baseIntensity < 0.5) return 'impact-light';
  return 'impact-heavy';
}
```

### 예제 5: 키보드 처리

```typescript
// src/utils/platform/keyboard.ts
import { Platform, Keyboard, KeyboardEvent, LayoutAnimation } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface KeyboardState {
  height: Animated.SharedValue<number>;
  isVisible: Animated.SharedValue<boolean>;
}

export function useAnimatedKeyboard(): KeyboardState {
  const height = useSharedValue(0);
  const isVisible = useSharedValue(false);

  useEffect(() => {
    const showEvent = Platform.select({
      ios: 'keyboardWillShow',
      android: 'keyboardDidShow',
    })!;

    const hideEvent = Platform.select({
      ios: 'keyboardWillHide',
      android: 'keyboardDidHide',
    })!;

    const showListener = Keyboard.addListener(
      showEvent as any,
      (e: KeyboardEvent) => {
        const duration = Platform.select({
          ios: e.duration,
          android: 250, // Android는 duration을 제공하지 않음
        })!;

        height.value = withTiming(e.endCoordinates.height, {
          duration,
          easing: Platform.select({
            ios: Easing.bezier(0.17, 0.59, 0.4, 0.77),
            android: Easing.out(Easing.ease),
          }),
        });
        isVisible.value = true;
      }
    );

    const hideListener = Keyboard.addListener(
      hideEvent as any,
      (e: KeyboardEvent) => {
        const duration = Platform.select({
          ios: e.duration,
          android: 200,
        })!;

        height.value = withTiming(0, {
          duration,
          easing: Easing.out(Easing.ease),
        });
        isVisible.value = false;
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { height, isVisible };
}

// 키보드 회피 뷰
export function KeyboardAvoidingAnimatedView({
  children,
  style,
  offset = 0,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  offset?: number;
}) {
  const { height } = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Platform.select({
          ios: -height.value,
          android: 0, // Android는 windowSoftInputMode로 처리
        })!,
      },
    ],
    paddingBottom: Platform.select({
      ios: height.value + offset,
      android: offset,
    })!,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// 입력 필드 포커스 시 스크롤
export function useInputFocusScroll(
  scrollRef: React.RefObject<Animated.ScrollView>,
  inputLayouts: Map<string, { y: number; height: number }>
) {
  const { height: keyboardHeight } = useAnimatedKeyboard();

  const scrollToInput = (inputId: string) => {
    const layout = inputLayouts.get(inputId);
    if (!layout || !scrollRef.current) return;

    // 키보드가 올라온 후 스크롤 위치 계산
    const visibleHeight = Dimensions.get('window').height - keyboardHeight.value;
    const inputBottom = layout.y + layout.height;

    if (inputBottom > visibleHeight) {
      const scrollTo = inputBottom - visibleHeight + 20; // 20px 여유
      scrollRef.current.scrollTo({ y: scrollTo, animated: true });
    }
  };

  return { scrollToInput };
}

// 키보드 툴바
export function KeyboardToolbar({
  onDone,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
}: {
  onDone: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}) {
  const { height, isVisible } = useAnimatedKeyboard();

  const toolbarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: isVisible.value
          ? 0
          : Platform.select({ ios: 50, android: 0 })!,
      },
    ],
    opacity: isVisible.value ? 1 : 0,
  }));

  if (Platform.OS === 'android') {
    // Android는 시스템 키보드 툴바 사용
    return null;
  }

  return (
    <Animated.View style={[styles.toolbar, toolbarStyle]}>
      <View style={styles.toolbarNav}>
        <TouchableOpacity
          onPress={onPrevious}
          disabled={!hasPrevious}
          style={[styles.navButton, !hasPrevious && styles.disabled]}
        >
          <Text>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          disabled={!hasNext}
          style={[styles.navButton, !hasNext && styles.disabled]}
        >
          <Text>▶</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onDone} style={styles.doneButton}>
        <Text style={styles.doneText}>완료</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  toolbarNav: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    padding: 8,
  },
  disabled: {
    opacity: 0.3,
  },
  doneButton: {
    padding: 8,
  },
  doneText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
```

### 예제 6: 네비게이션 전환 최적화

```typescript
// src/utils/platform/navigation.ts
import { Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 플랫폼별 전환 설정
export const transitionConfigs = {
  ios: {
    push: {
      duration: 350,
      // iOS 표준 커브
      easing: Easing.bezier(0.2, 0.9, 0.3, 1),
      overlay: 0.25,
    },
    pop: {
      duration: 350,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1),
      overlay: 0.25,
    },
  },
  android: {
    push: {
      duration: 300,
      // Material Design 커브
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      overlay: 0,
    },
    pop: {
      duration: 250,
      easing: Easing.bezier(0.4, 0.0, 1, 1),
      overlay: 0,
    },
  },
};

// iOS 스타일 슬라이드 전환
export function useIOSSlideTransition() {
  const progress = useSharedValue(0);
  const config = transitionConfigs.ios;

  const enteringStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [SCREEN_WIDTH, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
    // iOS의 미묘한 그림자
    shadowOpacity: interpolate(progress.value, [0, 1], [0, 0.3]),
    shadowRadius: interpolate(progress.value, [0, 1], [0, 10]),
  }));

  const exitingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [0, -SCREEN_WIDTH * config.push.overlay],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const push = () => {
    progress.value = withTiming(1, {
      duration: config.push.duration,
      easing: config.push.easing,
    });
  };

  const pop = () => {
    progress.value = withTiming(0, {
      duration: config.pop.duration,
      easing: config.pop.easing,
    });
  };

  return { progress, enteringStyle, exitingStyle, push, pop };
}

// Android 스타일 슬라이드업 전환
export function useAndroidSlideUpTransition() {
  const progress = useSharedValue(0);
  const config = transitionConfigs.android;

  const enteringStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [50, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: progress.value,
  }));

  const exitingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [1, 0.95],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 1], [1, 1, 0.5]),
  }));

  const push = () => {
    progress.value = withTiming(1, {
      duration: config.push.duration,
      easing: config.push.easing,
    });
  };

  const pop = () => {
    progress.value = withTiming(0, {
      duration: config.pop.duration,
      easing: config.pop.easing,
    });
  };

  return { progress, enteringStyle, exitingStyle, push, pop };
}

// 플랫폼 자동 선택 전환
export function usePlatformTransition() {
  return Platform.select({
    ios: useIOSSlideTransition,
    android: useAndroidSlideUpTransition,
  })!();
}

// Shared Element 전환 (플랫폼 최적화)
export function useSharedElementTransition(
  elementId: string,
  sourceLayout: { x: number; y: number; width: number; height: number },
  targetLayout: { x: number; y: number; width: number; height: number }
) {
  const progress = useSharedValue(0);

  const sharedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [sourceLayout.x, targetLayout.x]
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [sourceLayout.y, targetLayout.y]
    );
    const width = interpolate(
      progress.value,
      [0, 1],
      [sourceLayout.width, targetLayout.width]
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [sourceLayout.height, targetLayout.height]
    );

    return {
      position: 'absolute',
      left: translateX,
      top: translateY,
      width,
      height,
    };
  });

  const transition = (toTarget: boolean) => {
    const config = Platform.select({
      ios: { damping: 20, stiffness: 200 },
      android: { damping: 25, stiffness: 250 },
    })!;

    progress.value = withSpring(toTarget ? 1 : 0, config);
  };

  return { sharedStyle, transition, progress };
}
```

## 🎯 sometimes-app 적용 사례

### 플랫폼별 매칭 카드 최적화

```typescript
// src/features/matching/utils/platform-optimized-card.tsx
import { Platform, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { createShadowStyle } from '@/utils/platform/shadows';
import { triggerHaptic, useSwipeHaptic } from '@/utils/platform/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PlatformOptimizedMatchingCard({
  user,
  onSwipe,
}: {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 플랫폼별 햅틱 설정
  useSwipeHaptic(translateX, 80);

  // 플랫폼별 그림자 설정
  const shadowConfig = Platform.select({
    ios: {
      color: '#000',
      offset: { width: 0, height: 4 },
      opacity: 0.15,
      radius: 12,
      elevation: 0,
    },
    android: {
      color: '#000',
      offset: { width: 0, height: 0 },
      opacity: 0,
      radius: 0,
      elevation: 8,
    },
  })!;

  const cardShadow = createShadowStyle(shadowConfig);

  // 플랫폼별 스프링 설정
  const springConfig = Platform.select({
    ios: { damping: 15, stiffness: 150, mass: 1 },
    android: { damping: 18, stiffness: 180, mass: 0.8 }, // Android는 더 빠르게
  })!;

  const cardStyle = useAnimatedStyle(() => {
    // iOS: 부드러운 회전
    // Android: 약간 더 직접적인 이동
    const rotation = Platform.select({
      ios: interpolate(translateX.value, [-200, 0, 200], [-15, 0, 15]),
      android: interpolate(translateX.value, [-200, 0, 200], [-10, 0, 10]),
    })!;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // 플랫폼별 오버레이 스타일
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, 50, 100],
      [0, 0, 1]
    );

    // iOS: 그라데이션 같은 느낌
    // Android: Material ripple 같은 느낌
    if (Platform.OS === 'ios') {
      return {
        opacity,
        backgroundColor:
          translateX.value > 0
            ? `rgba(76, 175, 80, ${opacity * 0.6})`
            : `rgba(244, 67, 54, ${opacity * 0.6})`,
      };
    }

    return {
      opacity,
      backgroundColor:
        translateX.value > 0
          ? `rgba(76, 175, 80, ${opacity * 0.8})`
          : `rgba(244, 67, 54, ${opacity * 0.8})`,
    };
  });

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    triggerHaptic(direction === 'right' ? 'notification-success' : 'impact-medium');
    onSwipe(direction);
  };

  return (
    <Animated.View style={[styles.card, cardShadow, cardStyle]}>
      <ProfileContent user={user} />
      <Animated.View style={[styles.overlay, overlayStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    aspectRatio: 0.7,
    borderRadius: Platform.select({ ios: 20, android: 16 }),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Platform.select({ ios: 20, android: 16 }),
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 플랫폼 체크 없이 그림자 적용

```typescript
// ❌ 잘못된 방법 - Android에서 작동 안 함
const style = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
};

// ✅ 올바른 방법 - 플랫폼별 처리
const style = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
    shadowColor: '#000', // Android 9+에서 색상 적용
  },
});
```

### 실수 2: 키보드 타이밍 무시

```typescript
// ❌ 잘못된 방법 - Android에서 끊김
Keyboard.addListener('keyboardWillShow', handleShow);

// ✅ 올바른 방법 - 플랫폼별 이벤트
const showEvent = Platform.select({
  ios: 'keyboardWillShow',
  android: 'keyboardDidShow',
});
Keyboard.addListener(showEvent, handleShow);
```

## 💡 팁

### 팁 1: 개발 중 플랫폼 전환 테스트

```typescript
// 강제 플랫폼 오버라이드 (개발용)
const DEV_PLATFORM_OVERRIDE = null; // 'ios' | 'android' | null

export const currentPlatform = __DEV__ && DEV_PLATFORM_OVERRIDE
  ? DEV_PLATFORM_OVERRIDE
  : Platform.OS;
```

### 팁 2: 플랫폼별 상수 중앙화

```typescript
// constants/platform.ts
export const PLATFORM_CONSTANTS = Platform.select({
  ios: {
    TOUCH_SLOP: 10,
    ANIMATION_DURATION: 300,
    SPRING_DAMPING: 15,
  },
  android: {
    TOUCH_SLOP: 15,
    ANIMATION_DURATION: 250,
    SPRING_DAMPING: 18,
  },
})!;
```

## 🏋️ 연습 문제

### 문제 1: 플랫폼별 바텀시트 구현

iOS는 스냅 포인트, Android는 모달 스타일의 바텀시트를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
function PlatformBottomSheet({ children }) {
  if (Platform.OS === 'ios') {
    return <IOSSnapBottomSheet>{children}</IOSSnapBottomSheet>;
  }
  return <AndroidModalBottomSheet>{children}</AndroidModalBottomSheet>;
}

function IOSSnapBottomSheet({ children }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const snapPoints = [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.8];
  // ... iOS 스냅 로직
}

function AndroidModalBottomSheet({ children }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  // ... Android 모달 로직 (전체 또는 닫힘만)
}
```
</details>

## 📚 이 장에서 배운 내용

1. **렌더링 차이**: Core Animation vs Android View System
2. **그림자 처리**: iOS shadowX vs Android elevation
3. **스크롤 바운스**: 네이티브 vs 커스텀 구현
4. **블러 효과**: UIBlurEffect vs 반투명 대안
5. **햅틱 피드백**: Taptic Engine vs Vibration

## 다음 장 예고

**Chapter 75: 메모리 관리**에서는 애니메이션으로 인한 메모리 누수를 방지하고 효율적으로 리소스를 관리하는 방법을 다룹니다.
