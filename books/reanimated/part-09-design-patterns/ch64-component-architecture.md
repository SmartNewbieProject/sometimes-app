# Chapter 64: 컴포넌트 아키텍처

애니메이션 컴포넌트를 설계하는 확장 가능하고 유지보수하기 쉬운 아키텍처 패턴을 학습합니다.

## 📌 학습 목표

- 애니메이션 컴포넌트의 계층 구조 설계
- Compound Component 패턴 적용
- Headless 애니메이션 훅 설계
- 관심사 분리와 재사용성 극대화

## 📖 개념 이해

### 애니메이션 컴포넌트 계층

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Compound Components                     ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │ Card.Root   │ │ Modal.Root  │ │ Slider.Root │   ││
│  │  │ Card.Header │ │ Modal.Overlay│ │ Slider.Track│   ││
│  │  │ Card.Body   │ │ Modal.Content│ │ Slider.Thumb│   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │              Animation Primitives                    ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │ AnimatedBox │ │ AnimatedText│ │AnimatedImage│   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │              Headless Hooks                          ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │ useSpring   │ │ useGesture  │ │ useTransition│   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │              Reanimated Core                         ││
│  │  SharedValue, withSpring, Gesture, AnimatedStyle    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 설계 원칙

```
┌─────────────────────────────────────────────────────────┐
│                   설계 원칙                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 단일 책임 원칙 (SRP)                                │
│     ┌──────────────────────────────────────────────┐   │
│     │ Animation Logic    │    Visual Rendering    │   │
│     │ (hooks)            │    (components)        │   │
│     └──────────────────────────────────────────────┘   │
│                                                         │
│  2. 개방-폐쇄 원칙 (OCP)                                │
│     확장에는 열려있고, 수정에는 닫혀있음                 │
│     → Props로 커스터마이징, 내부 로직 변경 없음          │
│                                                         │
│  3. 의존성 역전 원칙 (DIP)                              │
│     상위 모듈이 하위 모듈에 의존하지 않음               │
│     → Headless hooks로 추상화                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: Headless Animation Hook

UI 없이 애니메이션 로직만 제공하는 훅:

```typescript
// hooks/useAnimatedPressable.ts
import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

// 설정 타입 정의
interface PressableConfig {
  // 스케일 설정
  scale?: {
    pressed: number;
    default?: number;
  };
  // 투명도 설정
  opacity?: {
    pressed: number;
    default?: number;
  };
  // 스프링 설정
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
  // 콜백
  onPressStart?: () => void;
  onPressEnd?: () => void;
  onPress?: () => void;
  // 비활성화
  disabled?: boolean;
}

// 반환 타입 정의
interface AnimatedPressableReturn {
  // 제스처 핸들러
  gesture: ReturnType<typeof Gesture.Tap>;
  // 애니메이션 스타일
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  // 상태값
  isPressed: Readonly<{ value: boolean }>;
  // 제어 함수
  press: () => void;
  release: () => void;
}

export function useAnimatedPressable(
  config: PressableConfig = {}
): AnimatedPressableReturn {
  const {
    scale = { pressed: 0.95, default: 1 },
    opacity = { pressed: 0.8, default: 1 },
    springConfig = { damping: 15, stiffness: 150 },
    onPressStart,
    onPressEnd,
    onPress,
    disabled = false,
  } = config;

  // 상태 관리
  const progress = useSharedValue(0);
  const isPressed = useSharedValue(false);

  // 프로그래밍 방식 제어
  const press = useCallback(() => {
    'worklet';
    if (disabled) return;
    progress.value = withSpring(1, springConfig);
    isPressed.value = true;
  }, [disabled, springConfig]);

  const release = useCallback(() => {
    'worklet';
    progress.value = withSpring(0, springConfig);
    isPressed.value = false;
  }, [springConfig]);

  // 제스처 설정
  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      progress.value = withSpring(1, springConfig);
      isPressed.value = true;
      if (onPressStart) {
        runOnJS(onPressStart)();
      }
    })
    .onFinalize((_, success) => {
      progress.value = withSpring(0, springConfig);
      isPressed.value = false;
      if (onPressEnd) {
        runOnJS(onPressEnd)();
      }
      if (success && onPress) {
        runOnJS(onPress)();
      }
    });

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [scale.default ?? 1, scale.pressed],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        progress.value,
        [0, 1],
        [opacity.default ?? 1, opacity.pressed],
        Extrapolation.CLAMP
      ),
    };
  });

  return {
    gesture,
    animatedStyle,
    isPressed: { get value() { return isPressed.value; } },
    press,
    release,
  };
}
```

### 예제 2: Animation Primitive Component

기본 애니메이션 컴포넌트 시스템:

```typescript
// components/AnimatedBox.tsx
import React, { forwardRef } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  AnimatedStyleProp,
} from 'react-native-reanimated';

// 애니메이션 프리셋 정의
const ANIMATION_PRESETS = {
  spring: {
    damping: 15,
    stiffness: 150,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
  },
  springStiff: {
    damping: 20,
    stiffness: 300,
  },
  timing: {
    duration: 300,
  },
  timingFast: {
    duration: 150,
  },
  timingSlow: {
    duration: 500,
  },
} as const;

type AnimationPreset = keyof typeof ANIMATION_PRESETS;

interface AnimatedBoxProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
  // 진입 애니메이션
  entering?: {
    type: 'fadeIn' | 'slideIn' | 'scaleIn' | 'none';
    direction?: 'left' | 'right' | 'up' | 'down';
    preset?: AnimationPreset;
    delay?: number;
  };
  // 종료 애니메이션
  exiting?: {
    type: 'fadeOut' | 'slideOut' | 'scaleOut' | 'none';
    direction?: 'left' | 'right' | 'up' | 'down';
    preset?: AnimationPreset;
  };
  // 공통 설정
  testID?: string;
}

export const AnimatedBox = forwardRef<Animated.View, AnimatedBoxProps>(
  function AnimatedBox(
    {
      children,
      style,
      animatedStyle: externalAnimatedStyle,
      entering = { type: 'none' },
      exiting = { type: 'none' },
      testID,
    },
    ref
  ) {
    const opacity = useSharedValue(entering.type !== 'none' ? 0 : 1);
    const translateX = useSharedValue(
      entering.type === 'slideIn'
        ? entering.direction === 'left'
          ? -100
          : entering.direction === 'right'
          ? 100
          : 0
        : 0
    );
    const translateY = useSharedValue(
      entering.type === 'slideIn'
        ? entering.direction === 'up'
          ? 100
          : entering.direction === 'down'
          ? -100
          : 0
        : 0
    );
    const scale = useSharedValue(entering.type === 'scaleIn' ? 0.5 : 1);

    // 진입 애니메이션 실행
    React.useEffect(() => {
      const preset = entering.preset ?? 'spring';
      const config = ANIMATION_PRESETS[preset];
      const delay = entering.delay ?? 0;

      const animate = () => {
        const animateFn = preset.startsWith('spring')
          ? (v: number) => withSpring(v, config as any)
          : (v: number) => withTiming(v, config as any);

        if (entering.type !== 'none') {
          opacity.value = animateFn(1);
        }
        if (entering.type === 'slideIn') {
          translateX.value = animateFn(0);
          translateY.value = animateFn(0);
        }
        if (entering.type === 'scaleIn') {
          scale.value = animateFn(1);
        }
      };

      if (delay > 0) {
        const timer = setTimeout(animate, delay);
        return () => clearTimeout(timer);
      } else {
        animate();
      }
    }, []);

    const internalAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <Animated.View
        ref={ref}
        style={[style, internalAnimatedStyle, externalAnimatedStyle]}
        testID={testID}
      >
        {children}
      </Animated.View>
    );
  }
);

// 편의 컴포넌트
export const FadeInBox: React.FC<
  Omit<AnimatedBoxProps, 'entering'> & { delay?: number }
> = ({ delay, ...props }) => (
  <AnimatedBox
    {...props}
    entering={{ type: 'fadeIn', preset: 'timing', delay }}
  />
);

export const SlideInBox: React.FC<
  Omit<AnimatedBoxProps, 'entering'> & {
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
  }
> = ({ direction = 'up', delay, ...props }) => (
  <AnimatedBox
    {...props}
    entering={{ type: 'slideIn', direction, preset: 'spring', delay }}
  />
);

export const ScaleInBox: React.FC<
  Omit<AnimatedBoxProps, 'entering'> & { delay?: number }
> = ({ delay, ...props }) => (
  <AnimatedBox
    {...props}
    entering={{ type: 'scaleIn', preset: 'springBouncy', delay }}
  />
);
```

### 예제 3: Compound Component Pattern

여러 하위 컴포넌트로 구성된 복합 컴포넌트:

```typescript
// components/AnimatedCard/index.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

// Context 타입
interface CardContextType {
  // 공유 상태
  isExpanded: SharedValue<number>;
  isPressed: SharedValue<number>;
  // 설정
  config: CardConfig;
  // 제어 함수
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
}

interface CardConfig {
  expandedHeight: number;
  collapsedHeight: number;
  springConfig: { damping: number; stiffness: number };
}

const CardContext = createContext<CardContextType | null>(null);

function useCardContext() {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('Card components must be used within Card.Root');
  }
  return context;
}

// Root Component
interface CardRootProps {
  children: React.ReactNode;
  expandedHeight?: number;
  collapsedHeight?: number;
  defaultExpanded?: boolean;
  style?: ViewStyle;
}

function CardRoot({
  children,
  expandedHeight = 300,
  collapsedHeight = 100,
  defaultExpanded = false,
  style,
}: CardRootProps) {
  const isExpanded = useSharedValue(defaultExpanded ? 1 : 0);
  const isPressed = useSharedValue(0);

  const config: CardConfig = useMemo(
    () => ({
      expandedHeight,
      collapsedHeight,
      springConfig: { damping: 15, stiffness: 150 },
    }),
    [expandedHeight, collapsedHeight]
  );

  const expand = () => {
    isExpanded.value = withSpring(1, config.springConfig);
  };

  const collapse = () => {
    isExpanded.value = withSpring(0, config.springConfig);
  };

  const toggle = () => {
    isExpanded.value = withSpring(
      isExpanded.value > 0.5 ? 0 : 1,
      config.springConfig
    );
  };

  const contextValue = useMemo(
    () => ({
      isExpanded,
      isPressed,
      config,
      expand,
      collapse,
      toggle,
    }),
    [config]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      isExpanded.value,
      [0, 1],
      [collapsedHeight, expandedHeight]
    ),
    transform: [
      {
        scale: interpolate(isPressed.value, [0, 1], [1, 0.98]),
      },
    ],
  }));

  return (
    <CardContext.Provider value={contextValue}>
      <Animated.View style={[styles.root, style, animatedStyle]}>
        {children}
      </Animated.View>
    </CardContext.Provider>
  );
}

// Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

function CardHeader({ children, style, onPress }: CardHeaderProps) {
  const { isPressed, toggle } = useCardContext();

  const gesture = Gesture.Tap()
    .onBegin(() => {
      isPressed.value = withSpring(1);
    })
    .onFinalize(() => {
      isPressed.value = withSpring(0);
      if (onPress) {
        onPress();
      } else {
        toggle();
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.header, style]}>{children}</View>
    </GestureDetector>
  );
}

// Content Component (확장 시에만 표시)
interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function CardContent({ children, style }: CardContentProps) {
  const { isExpanded } = useCardContext();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isExpanded.value,
    transform: [
      {
        translateY: interpolate(isExpanded.value, [0, 1], [20, 0]),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.content, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// Trigger Component (확장/축소 트리거)
interface CardTriggerProps {
  children: (props: { isExpanded: boolean }) => React.ReactNode;
}

function CardTrigger({ children }: CardTriggerProps) {
  const { isExpanded, toggle } = useCardContext();

  // 파생 상태 사용
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    // 단순화된 상태 동기화
    const checkExpanded = () => {
      setExpanded(isExpanded.value > 0.5);
    };

    const interval = setInterval(checkExpanded, 100);
    return () => clearInterval(interval);
  }, []);

  const gesture = Gesture.Tap().onEnd(() => toggle());

  return (
    <GestureDetector gesture={gesture}>
      <View>{children({ isExpanded: expanded })}</View>
    </GestureDetector>
  );
}

// Icon Component (확장 상태에 따라 회전)
interface CardIconProps {
  size?: number;
  color?: string;
}

function CardIcon({ size = 24, color = '#666' }: CardIconProps) {
  const { isExpanded } = useCardContext();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(isExpanded.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: size, color }}>▼</Text>
    </Animated.View>
  );
}

// Export
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Trigger: CardTrigger,
  Icon: CardIcon,
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});
```

### 예제 4: Factory Pattern for Animations

애니메이션 생성 팩토리:

```typescript
// factories/createAnimatedComponent.tsx
import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

// 애니메이션 옵션 타입
interface AnimationOptions {
  type: 'spring' | 'timing';
  config?: WithSpringConfig | WithTimingConfig;
}

// 애니메이션 속성 매핑
interface AnimatableProperty {
  property: keyof ViewStyle;
  from: number;
  to: number;
}

// 팩토리 설정
interface CreateAnimatedOptions {
  name: string;
  properties: AnimatableProperty[];
  defaultAnimation?: AnimationOptions;
  triggers?: {
    mount?: boolean;
    hover?: boolean;
    press?: boolean;
  };
}

// 팩토리 함수
export function createAnimatedComponent<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: CreateAnimatedOptions
) {
  const {
    name,
    properties,
    defaultAnimation = { type: 'spring', config: { damping: 15 } },
    triggers = { mount: true },
  } = options;

  // HOC 컴포넌트
  const AnimatedComponent = React.forwardRef<any, P & { animate?: boolean }>(
    function AnimatedWrapper({ animate = true, ...props }, ref) {
      // 각 속성에 대한 SharedValue 생성
      const values: Record<string, SharedValue<number>> = {};

      properties.forEach((prop) => {
        values[prop.property as string] = useSharedValue(prop.from);
      });

      // 마운트 시 애니메이션
      React.useEffect(() => {
        if (animate && triggers.mount) {
          properties.forEach((prop) => {
            const value = values[prop.property as string];
            if (defaultAnimation.type === 'spring') {
              value.value = withSpring(
                prop.to,
                defaultAnimation.config as WithSpringConfig
              );
            } else {
              value.value = withTiming(
                prop.to,
                defaultAnimation.config as WithTimingConfig
              );
            }
          });
        }
      }, [animate]);

      // 애니메이션 스타일 생성
      const animatedStyle = useAnimatedStyle(() => {
        const style: Record<string, any> = {};

        properties.forEach((prop) => {
          const value = values[prop.property as string].value;

          if (prop.property === 'scale' || prop.property === 'rotate') {
            if (!style.transform) style.transform = [];
            if (prop.property === 'scale') {
              style.transform.push({ scale: value });
            } else {
              style.transform.push({ rotate: `${value}deg` });
            }
          } else {
            style[prop.property] = value;
          }
        });

        return style;
      });

      return (
        <Animated.View style={animatedStyle}>
          <WrappedComponent ref={ref} {...(props as P)} />
        </Animated.View>
      );
    }
  );

  AnimatedComponent.displayName = `Animated${name}`;

  return AnimatedComponent;
}

// 사용 예시
// const AnimatedCard = createAnimatedComponent(Card, {
//   name: 'Card',
//   properties: [
//     { property: 'opacity', from: 0, to: 1 },
//     { property: 'scale', from: 0.9, to: 1 },
//   ],
// });
```

### 예제 5: Render Props Pattern

렌더 프롭 패턴을 활용한 유연한 애니메이션:

```typescript
// components/AnimationController.tsx
import React from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

// 제어 API 타입
interface AnimationAPI {
  // 상태
  progress: SharedValue<number>;
  isAnimating: boolean;

  // 기본 제어
  play: (options?: PlayOptions) => void;
  reverse: (options?: PlayOptions) => void;
  reset: () => void;
  pause: () => void;

  // 고급 제어
  setProgress: (value: number, animated?: boolean) => void;

  // 스타일 생성
  interpolateStyle: <T>(
    outputRange: [T, T],
    property?: string
  ) => T;
}

interface PlayOptions {
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

interface AnimationControllerProps {
  children: (api: AnimationAPI) => React.ReactNode;
  autoPlay?: boolean;
  loop?: boolean;
  initialProgress?: number;
}

export function AnimationController({
  children,
  autoPlay = false,
  loop = false,
  initialProgress = 0,
}: AnimationControllerProps) {
  const progress = useSharedValue(initialProgress);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const play = React.useCallback(
    (options: PlayOptions = {}) => {
      const { duration = 300, delay = 0, onComplete } = options;

      setIsAnimating(true);

      const animation = withTiming(1, { duration }, (finished) => {
        if (finished) {
          if (loop) {
            progress.value = 0;
            runOnJS(play)(options);
          } else {
            runOnJS(setIsAnimating)(false);
            if (onComplete) {
              runOnJS(onComplete)();
            }
          }
        }
      });

      if (delay > 0) {
        progress.value = withDelay(delay, animation);
      } else {
        progress.value = animation;
      }
    },
    [loop]
  );

  const reverse = React.useCallback(
    (options: PlayOptions = {}) => {
      const { duration = 300, delay = 0, onComplete } = options;

      setIsAnimating(true);

      const animation = withTiming(0, { duration }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimating)(false);
          if (onComplete) {
            runOnJS(onComplete)();
          }
        }
      });

      if (delay > 0) {
        progress.value = withDelay(delay, animation);
      } else {
        progress.value = animation;
      }
    },
    []
  );

  const reset = React.useCallback(() => {
    progress.value = 0;
    setIsAnimating(false);
  }, []);

  const pause = React.useCallback(() => {
    // 현재 값으로 고정
    progress.value = progress.value;
    setIsAnimating(false);
  }, []);

  const setProgress = React.useCallback(
    (value: number, animated = false) => {
      if (animated) {
        progress.value = withSpring(value);
      } else {
        progress.value = value;
      }
    },
    []
  );

  const interpolateStyle = React.useCallback(
    <T,>(outputRange: [T, T], property?: string): T => {
      // 간단한 보간 로직 (실제로는 useAnimatedStyle 내에서 사용)
      const p = progress.value;
      if (typeof outputRange[0] === 'number') {
        return (outputRange[0] + (outputRange[1] as number - outputRange[0] as number) * p) as T;
      }
      return p > 0.5 ? outputRange[1] : outputRange[0];
    },
    []
  );

  // 자동 재생
  React.useEffect(() => {
    if (autoPlay) {
      play();
    }
  }, [autoPlay]);

  const api: AnimationAPI = {
    progress,
    isAnimating,
    play,
    reverse,
    reset,
    pause,
    setProgress,
    interpolateStyle,
  };

  return <>{children(api)}</>;
}

// 사용 예시
/*
<AnimationController autoPlay>
  {({ progress, play, reverse }) => (
    <AnimatedView style={useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ scale: 0.8 + progress.value * 0.2 }],
    }))}>
      <Button onPress={reverse} title="Reverse" />
    </AnimatedView>
  )}
</AnimationController>
*/
```

## 🎨 sometimes-app 적용 사례

### 프로필 카드 컴포넌트 시스템

```typescript
// features/matching/ui/ProfileCard/index.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// Context 타입
interface ProfileCardContextType {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
  liked: SharedValue<number>;
  disliked: SharedValue<number>;
  superLiked: SharedValue<number>;
  config: ProfileCardConfig;
  swipeRight: () => void;
  swipeLeft: () => void;
  swipeUp: () => void;
  reset: () => void;
}

interface ProfileCardConfig {
  rotationFactor: number;
  opacityFactor: number;
  springConfig: { damping: number; stiffness: number };
  onSwipeRight?: (id: string) => void;
  onSwipeLeft?: (id: string) => void;
  onSwipeUp?: (id: string) => void;
}

const ProfileCardContext = createContext<ProfileCardContextType | null>(null);

function useProfileCardContext() {
  const context = useContext(ProfileCardContext);
  if (!context) {
    throw new Error(
      'ProfileCard components must be used within ProfileCard.Root'
    );
  }
  return context;
}

// Root Component
interface ProfileCardRootProps {
  children: React.ReactNode;
  id: string;
  onSwipeRight?: (id: string) => void;
  onSwipeLeft?: (id: string) => void;
  onSwipeUp?: (id: string) => void;
  disabled?: boolean;
}

function ProfileCardRoot({
  children,
  id,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  disabled = false,
}: ProfileCardRootProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const liked = useSharedValue(0);
  const disliked = useSharedValue(0);
  const superLiked = useSharedValue(0);

  const config: ProfileCardConfig = useMemo(
    () => ({
      rotationFactor: 0.1,
      opacityFactor: 0.005,
      springConfig: { damping: 15, stiffness: 150 },
      onSwipeRight,
      onSwipeLeft,
      onSwipeUp,
    }),
    [onSwipeRight, onSwipeLeft, onSwipeUp]
  );

  // 프로그래밍 방식 스와이프
  const swipeRight = () => {
    translateX.value = withSpring(SCREEN_WIDTH * 1.5, config.springConfig);
    rotation.value = withSpring(30, config.springConfig);
    if (onSwipeRight) {
      runOnJS(onSwipeRight)(id);
    }
  };

  const swipeLeft = () => {
    translateX.value = withSpring(-SCREEN_WIDTH * 1.5, config.springConfig);
    rotation.value = withSpring(-30, config.springConfig);
    if (onSwipeLeft) {
      runOnJS(onSwipeLeft)(id);
    }
  };

  const swipeUp = () => {
    translateY.value = withSpring(-SCREEN_WIDTH, config.springConfig);
    if (onSwipeUp) {
      runOnJS(onSwipeUp)(id);
    }
  };

  const reset = () => {
    translateX.value = withSpring(0, config.springConfig);
    translateY.value = withSpring(0, config.springConfig);
    rotation.value = withSpring(0, config.springConfig);
    scale.value = withSpring(1, config.springConfig);
    liked.value = withSpring(0, config.springConfig);
    disliked.value = withSpring(0, config.springConfig);
    superLiked.value = withSpring(0, config.springConfig);
  };

  // 제스처
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX * config.rotationFactor;

      // 스와이프 방향에 따른 오버레이 표시
      if (event.translationX > 0) {
        liked.value = Math.min(event.translationX * config.opacityFactor, 1);
        disliked.value = 0;
      } else {
        disliked.value = Math.min(
          -event.translationX * config.opacityFactor,
          1
        );
        liked.value = 0;
      }

      if (event.translationY < -50) {
        superLiked.value = Math.min(-event.translationY * 0.01, 1);
      } else {
        superLiked.value = 0;
      }
    })
    .onEnd((event) => {
      // 스와이프 완료 판정
      if (event.translationX > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else if (event.translationY < -SWIPE_THRESHOLD) {
        swipeUp();
      } else {
        reset();
      }
    });

  const contextValue = useMemo(
    () => ({
      translateX,
      translateY,
      rotation,
      scale,
      liked,
      disliked,
      superLiked,
      config,
      swipeRight,
      swipeLeft,
      swipeUp,
      reset,
    }),
    [config]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <ProfileCardContext.Provider value={contextValue}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.root, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </ProfileCardContext.Provider>
  );
}

// Image Component
interface ProfileCardImageProps {
  uri: string;
  style?: object;
}

function ProfileCardImage({ uri, style }: ProfileCardImageProps) {
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode="cover"
    />
  );
}

// Info Component
interface ProfileCardInfoProps {
  name: string;
  age: number;
  university: string;
  style?: object;
}

function ProfileCardInfo({
  name,
  age,
  university,
  style,
}: ProfileCardInfoProps) {
  return (
    <View style={[styles.info, style]}>
      <Text style={styles.name}>
        {name}, {age}
      </Text>
      <Text style={styles.university}>{university}</Text>
    </View>
  );
}

// Like Overlay Component
function ProfileCardLikeOverlay() {
  const { liked } = useProfileCardContext();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: liked.value,
    transform: [
      { scale: interpolate(liked.value, [0, 1], [0.5, 1]) },
      { rotate: '-15deg' },
    ],
  }));

  return (
    <Animated.View style={[styles.overlay, styles.likeOverlay, animatedStyle]}>
      <Text style={styles.overlayText}>LIKE</Text>
    </Animated.View>
  );
}

// Nope Overlay Component
function ProfileCardNopeOverlay() {
  const { disliked } = useProfileCardContext();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: disliked.value,
    transform: [
      { scale: interpolate(disliked.value, [0, 1], [0.5, 1]) },
      { rotate: '15deg' },
    ],
  }));

  return (
    <Animated.View style={[styles.overlay, styles.nopeOverlay, animatedStyle]}>
      <Text style={styles.overlayText}>NOPE</Text>
    </Animated.View>
  );
}

// Super Like Overlay Component
function ProfileCardSuperLikeOverlay() {
  const { superLiked } = useProfileCardContext();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: superLiked.value,
    transform: [{ scale: interpolate(superLiked.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <Animated.View
      style={[styles.overlay, styles.superLikeOverlay, animatedStyle]}
    >
      <Text style={styles.overlayText}>SUPER LIKE</Text>
    </Animated.View>
  );
}

// Action Buttons Component
interface ProfileCardActionsProps {
  style?: object;
}

function ProfileCardActions({ style }: ProfileCardActionsProps) {
  const { swipeLeft, swipeRight, swipeUp } = useProfileCardContext();

  return (
    <View style={[styles.actions, style]}>
      <ActionButton
        icon="✕"
        color="#FF6B6B"
        onPress={swipeLeft}
      />
      <ActionButton
        icon="★"
        color="#6C63FF"
        onPress={swipeUp}
        size="small"
      />
      <ActionButton
        icon="♥"
        color="#4ECDC4"
        onPress={swipeRight}
      />
    </View>
  );
}

// Action Button Helper
interface ActionButtonProps {
  icon: string;
  color: string;
  onPress: () => void;
  size?: 'small' | 'normal';
}

function ActionButton({
  icon,
  color,
  onPress,
  size = 'normal',
}: ActionButtonProps) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.actionButton,
          size === 'small' && styles.actionButtonSmall,
          { borderColor: color },
          animatedStyle,
        ]}
      >
        <Text style={[styles.actionIcon, { color }]}>{icon}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// Export
export const ProfileCard = {
  Root: ProfileCardRoot,
  Image: ProfileCardImage,
  Info: ProfileCardInfo,
  LikeOverlay: ProfileCardLikeOverlay,
  NopeOverlay: ProfileCardNopeOverlay,
  SuperLikeOverlay: ProfileCardSuperLikeOverlay,
  Actions: ProfileCardActions,
};

// 사용 예시 컴포넌트
export function MatchingScreen() {
  const handleSwipeRight = (id: string) => {
    console.log('Liked:', id);
  };

  const handleSwipeLeft = (id: string) => {
    console.log('Noped:', id);
  };

  const handleSwipeUp = (id: string) => {
    console.log('Super Liked:', id);
  };

  return (
    <ProfileCard.Root
      id="user-123"
      onSwipeRight={handleSwipeRight}
      onSwipeLeft={handleSwipeLeft}
      onSwipeUp={handleSwipeUp}
    >
      <ProfileCard.Image uri="https://example.com/photo.jpg" />
      <ProfileCard.LikeOverlay />
      <ProfileCard.NopeOverlay />
      <ProfileCard.SuperLikeOverlay />
      <ProfileCard.Info name="김민지" age={24} university="서울대학교" />
      <ProfileCard.Actions />
    </ProfileCard.Root>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  university: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  overlay: {
    position: 'absolute',
    top: 40,
    padding: 8,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderRadius: 8,
  },
  likeOverlay: {
    right: 20,
    borderColor: '#4ECDC4',
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#FF6B6B',
  },
  superLikeOverlay: {
    alignSelf: 'center',
    top: '40%',
    borderColor: '#6C63FF',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  actionIcon: {
    fontSize: 24,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: Context 없이 하위 컴포넌트 사용

```typescript
// ❌ 잘못된 사용 - Context Provider 없이 사용
function BrokenCard() {
  return (
    <View>
      <Card.Header>Header</Card.Header> {/* Error! */}
      <Card.Content>Content</Card.Content>
    </View>
  );
}

// ✅ 올바른 사용 - Root 내에서 사용
function WorkingCard() {
  return (
    <Card.Root>
      <Card.Header>Header</Card.Header>
      <Card.Content>Content</Card.Content>
    </Card.Root>
  );
}
```

### 실수 2: SharedValue 직접 참조

```typescript
// ❌ 잘못된 방식 - render 함수에서 직접 읽기
function BadComponent() {
  const { progress } = useAnimationContext();

  // 이렇게 하면 업데이트 안 됨!
  return <Text>Progress: {progress.value}</Text>;
}

// ✅ 올바른 방식 - useAnimatedProps 또는 상태 동기화
function GoodComponent() {
  const { progress } = useAnimationContext();
  const [displayValue, setDisplayValue] = React.useState(0);

  // useAnimatedReaction으로 동기화
  useAnimatedReaction(
    () => progress.value,
    (value) => {
      runOnJS(setDisplayValue)(Math.round(value * 100));
    }
  );

  return <Text>Progress: {displayValue}%</Text>;
}
```

### 실수 3: 과도한 Context 분할

```typescript
// ❌ 너무 세분화된 Context
const ScaleContext = createContext(null);
const OpacityContext = createContext(null);
const RotationContext = createContext(null);
const TranslateXContext = createContext(null);
// ... 관리가 어려워짐

// ✅ 적절한 그룹화
const AnimationContext = createContext<{
  transform: SharedValue<TransformValue>;
  style: SharedValue<StyleValue>;
  controls: AnimationControls;
} | null>(null);
```

## 💡 아키텍처 설계 팁

### 1. 계층별 책임 분리

```typescript
// 1. Hooks Layer - 순수 로직
const useCardSwipe = (config) => {
  // 애니메이션 로직만, UI 없음
  return { gesture, animatedStyle, swipe, reset };
};

// 2. Primitive Layer - 기본 컴포넌트
const AnimatedCard = ({ children, animatedStyle }) => (
  <Animated.View style={animatedStyle}>{children}</Animated.View>
);

// 3. Compound Layer - 조합 컴포넌트
const ProfileCard = {
  Root: ...,
  Image: ...,
  Info: ...,
};

// 4. Feature Layer - 비즈니스 로직 포함
const MatchingCard = ({ user, onMatch }) => {
  const swipe = useCardSwipe({ ... });
  return <ProfileCard.Root {...swipe}><...</ProfileCard.Root>;
};
```

### 2. 타입 안전성 확보

```typescript
// 제네릭을 활용한 타입 안전한 팩토리
function createAnimatedList<T extends { id: string }>(
  ItemComponent: React.ComponentType<{ item: T; index: number }>
) {
  return function AnimatedList({
    data,
    keyExtractor = (item) => item.id,
  }: {
    data: T[];
    keyExtractor?: (item: T) => string;
  }) {
    return (
      <>
        {data.map((item, index) => (
          <SlideInBox key={keyExtractor(item)} delay={index * 100}>
            <ItemComponent item={item} index={index} />
          </SlideInBox>
        ))}
      </>
    );
  };
}

// 타입 추론 자동
const UserList = createAnimatedList<User>(UserCard);
```

### 3. 테스트 용이한 구조

```typescript
// 테스트 가능한 훅 설계
export function useSwipeAnimation(config: SwipeConfig) {
  // 모든 상태와 함수가 반환됨
  return {
    // 상태 (테스트에서 검증 가능)
    translateX,
    isComplete,

    // 함수 (테스트에서 호출 가능)
    swipe,
    reset,

    // 스타일 (스냅샷 테스트 가능)
    animatedStyle,

    // 제스처 (모킹 가능)
    gesture,
  };
}

// 테스트 예시
test('swipe right should trigger completion', () => {
  const { result } = renderHook(() => useSwipeAnimation(config));

  act(() => {
    result.current.swipe('right');
  });

  expect(result.current.isComplete.value).toBe(true);
});
```

## 🏋️ 연습 문제

### 문제 1: Accordion 컴포넌트 설계

Compound Component 패턴으로 아코디언 컴포넌트를 설계하세요:

```typescript
// 목표 API:
<Accordion.Root allowMultiple>
  <Accordion.Item id="1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item id="2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Content>Content 2</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

<details>
<summary>정답 보기</summary>

```typescript
import React, { createContext, useContext, useMemo, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';

// Root Context
interface AccordionContextType {
  expandedItems: string[];
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// Item Context
interface AccordionItemContextType {
  id: string;
  isExpanded: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextType | null>(null);

// Root
interface AccordionRootProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

function AccordionRoot({
  children,
  allowMultiple = false,
  defaultExpanded = [],
}: AccordionRootProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });
  };

  return (
    <AccordionContext.Provider
      value={{ expandedItems, toggleItem, allowMultiple }}
    >
      {children}
    </AccordionContext.Provider>
  );
}

// Item
interface AccordionItemProps {
  children: React.ReactNode;
  id: string;
}

function AccordionItem({ children, id }: AccordionItemProps) {
  const { expandedItems } = useContext(AccordionContext)!;
  const isExpanded = expandedItems.includes(id);

  return (
    <AccordionItemContext.Provider value={{ id, isExpanded }}>
      {children}
    </AccordionItemContext.Provider>
  );
}

// Trigger
interface AccordionTriggerProps {
  children: React.ReactNode;
}

function AccordionTrigger({ children }: AccordionTriggerProps) {
  const { toggleItem } = useContext(AccordionContext)!;
  const { id, isExpanded } = useContext(AccordionItemContext)!;

  const rotation = useSharedValue(isExpanded ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 1 : 0);
  }, [isExpanded]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={() => toggleItem(id)}
      style={styles.trigger}
    >
      {children}
      <Animated.Text style={iconStyle}>▼</Animated.Text>
    </TouchableOpacity>
  );
}

// Content
interface AccordionContentProps {
  children: React.ReactNode;
}

function AccordionContent({ children }: AccordionContentProps) {
  const { isExpanded } = useContext(AccordionItemContext)!;
  const height = useSharedValue(isExpanded ? 1 : 0);

  React.useEffect(() => {
    height.value = withSpring(isExpanded ? 1 : 0);
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value === 0 ? 0 : 'auto',
    opacity: height.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
```

</details>

### 문제 2: Headless Drag Hook 구현

드래그 앤 드롭 기능을 제공하는 headless 훅을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface DragConfig {
  axis?: 'x' | 'y' | 'both';
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  snapPoints?: { x?: number[]; y?: number[] };
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function useDrag(config: DragConfig = {}) {
  const {
    axis = 'both',
    bounds,
    snapPoints,
    onDragStart,
    onDragEnd,
  } = config;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const clamp = (value: number, min?: number, max?: number) => {
    'worklet';
    let result = value;
    if (min !== undefined) result = Math.max(result, min);
    if (max !== undefined) result = Math.min(result, max);
    return result;
  };

  const findClosestSnapPoint = (value: number, points?: number[]) => {
    'worklet';
    if (!points || points.length === 0) return value;
    return points.reduce((closest, point) =>
      Math.abs(point - value) < Math.abs(closest - value) ? point : closest
    );
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      if (axis === 'x' || axis === 'both') {
        translateX.value = clamp(
          event.translationX,
          bounds?.minX,
          bounds?.maxX
        );
      }
      if (axis === 'y' || axis === 'both') {
        translateY.value = clamp(
          event.translationY,
          bounds?.minY,
          bounds?.maxY
        );
      }
    })
    .onEnd(() => {
      isDragging.value = false;

      // Snap to points
      if (snapPoints?.x) {
        translateX.value = withSpring(
          findClosestSnapPoint(translateX.value, snapPoints.x)
        );
      }
      if (snapPoints?.y) {
        translateY.value = withSpring(
          findClosestSnapPoint(translateY.value, snapPoints.y)
        );
      }

      if (onDragEnd) {
        runOnJS(onDragEnd)({
          x: translateX.value,
          y: translateY.value,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const reset = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const setPosition = (x: number, y: number, animated = true) => {
    if (animated) {
      translateX.value = withSpring(x);
      translateY.value = withSpring(y);
    } else {
      translateX.value = x;
      translateY.value = y;
    }
  };

  return {
    gesture,
    animatedStyle,
    isDragging,
    position: { x: translateX, y: translateY },
    reset,
    setPosition,
  };
}
```

</details>

## 📚 이 장에서 배운 내용

1. **계층 구조 설계**: Headless Hooks → Primitives → Compound Components
2. **Compound Component 패턴**: Context를 활용한 상태 공유
3. **Factory 패턴**: 재사용 가능한 애니메이션 컴포넌트 생성
4. **Render Props**: 유연한 애니메이션 제어 API
5. **관심사 분리**: 애니메이션 로직과 UI의 명확한 분리

## 다음 장 예고

**Chapter 65: 상태 관리 패턴**에서는 애니메이션과 앱 상태를 효율적으로 연동하는 패턴을 배웁니다. Zustand, Context, 그리고 Reanimated의 SharedValue를 조합하는 전략을 다룹니다.
