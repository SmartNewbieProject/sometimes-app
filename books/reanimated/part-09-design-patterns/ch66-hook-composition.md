# Chapter 66: 훅 조합 패턴

여러 훅을 효과적으로 조합하여 재사용 가능한 애니메이션 로직을 만드는 방법을 학습합니다.

## 📌 학습 목표

- 커스텀 애니메이션 훅 설계 원칙
- 훅 조합(Composition) 패턴
- 훅 팩토리와 제네릭 패턴
- 테스트 가능한 훅 구조

## 📖 개념 이해

### 훅 조합의 계층

```
┌─────────────────────────────────────────────────────────┐
│                   Hook Composition Layers                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Level 3: Feature Hooks (비즈니스 로직 포함)            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useMatchingCard, useChatAnimation, useProfile  │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  Level 2: Behavior Hooks (재사용 가능한 동작)           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useSwipeable, useDraggable, useExpandable      │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  Level 1: Primitive Hooks (기본 애니메이션)             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useSpringValue, useFadeIn, useScale            │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  Level 0: Reanimated Core                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useSharedValue, useAnimatedStyle, withSpring   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 조합 패턴

```
┌─────────────────────────────────────────────────────────┐
│                  Composition Patterns                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Merger (병합)                                       │
│     ┌─────────┐                                        │
│     │ Hook A  ├──┐                                     │
│     └─────────┘  │  ┌─────────────┐                   │
│                  ├──┤ Merged Hook │                   │
│     ┌─────────┐  │  └─────────────┘                   │
│     │ Hook B  ├──┘                                     │
│     └─────────┘                                        │
│                                                         │
│  2. Pipeline (파이프라인)                               │
│     ┌────────┐   ┌────────┐   ┌────────┐              │
│     │ Hook A │──▶│ Hook B │──▶│ Hook C │              │
│     └────────┘   └────────┘   └────────┘              │
│                                                         │
│  3. Wrapper (래퍼)                                      │
│     ┌─────────────────────────────┐                    │
│     │   Outer Hook                │                    │
│     │   ┌─────────────────────┐   │                    │
│     │   │    Inner Hook       │   │                    │
│     │   └─────────────────────┘   │                    │
│     └─────────────────────────────┘                    │
│                                                         │
│  4. Conditional (조건부)                                │
│     ┌────────┐                                         │
│     │ Config │──▶ Hook A OR Hook B                    │
│     └────────┘                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: Primitive Hooks (Level 1)

기본 애니메이션 동작을 캡슐화하는 훅:

```typescript
// hooks/primitives/useSpringValue.ts
import { useCallback } from 'react';
import {
  useSharedValue,
  withSpring,
  WithSpringConfig,
  SharedValue,
} from 'react-native-reanimated';

interface SpringValueOptions {
  initial?: number;
  config?: WithSpringConfig;
}

interface SpringValueReturn {
  value: SharedValue<number>;
  set: (target: number) => void;
  reset: () => void;
  spring: (target: number, config?: WithSpringConfig) => void;
}

export function useSpringValue(
  options: SpringValueOptions = {}
): SpringValueReturn {
  const {
    initial = 0,
    config = { damping: 15, stiffness: 150 },
  } = options;

  const value = useSharedValue(initial);

  const set = useCallback((target: number) => {
    value.value = target;
  }, []);

  const reset = useCallback(() => {
    value.value = initial;
  }, [initial]);

  const spring = useCallback(
    (target: number, overrideConfig?: WithSpringConfig) => {
      value.value = withSpring(target, overrideConfig ?? config);
    },
    [config]
  );

  return { value, set, reset, spring };
}

// hooks/primitives/useFadeAnimation.ts
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FadeOptions {
  initialVisible?: boolean;
  duration?: number;
}

export function useFadeAnimation(options: FadeOptions = {}) {
  const { initialVisible = true, duration = 300 } = options;

  const opacity = useSharedValue(initialVisible ? 1 : 0);

  const fadeIn = useCallback(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [duration]);

  const fadeOut = useCallback(() => {
    opacity.value = withTiming(0, {
      duration,
      easing: Easing.in(Easing.ease),
    });
  }, [duration]);

  const toggle = useCallback(() => {
    if (opacity.value > 0.5) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {
    opacity,
    fadeIn,
    fadeOut,
    toggle,
    animatedStyle,
    isVisible: opacity.value > 0.5,
  };
}

// hooks/primitives/useScaleAnimation.ts
export function useScaleAnimation(options: ScaleOptions = {}) {
  const {
    initialScale = 1,
    pressedScale = 0.95,
    springConfig = { damping: 15, stiffness: 200 },
  } = options;

  const scale = useSharedValue(initialScale);

  const scaleDown = useCallback(() => {
    scale.value = withSpring(pressedScale, springConfig);
  }, [pressedScale, springConfig]);

  const scaleUp = useCallback(() => {
    scale.value = withSpring(initialScale, springConfig);
  }, [initialScale, springConfig]);

  const scaleTo = useCallback(
    (target: number) => {
      scale.value = withSpring(target, springConfig);
    },
    [springConfig]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    scaleDown,
    scaleUp,
    scaleTo,
    animatedStyle,
  };
}
```

### 예제 2: Behavior Hooks (Level 2)

재사용 가능한 동작을 구현하는 훅:

```typescript
// hooks/behaviors/usePressable.ts
import { useSpringValue } from '../primitives/useSpringValue';
import { useFadeAnimation } from '../primitives/useFadeAnimation';
import { useScaleAnimation } from '../primitives/useScaleAnimation';

interface PressableOptions {
  scale?: {
    pressed: number;
    default?: number;
  };
  opacity?: {
    pressed: number;
    default?: number;
  };
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export function usePressable(options: PressableOptions = {}) {
  const {
    scale: scaleOptions = { pressed: 0.95, default: 1 },
    opacity: opacityOptions = { pressed: 0.8, default: 1 },
    onPress,
    onLongPress,
    disabled = false,
  } = options;

  // Primitive 훅 조합
  const scaleAnim = useScaleAnimation({
    initialScale: scaleOptions.default,
    pressedScale: scaleOptions.pressed,
  });

  const opacityAnim = useFadeAnimation({
    initialVisible: true,
  });

  // 조합된 동작
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scaleAnim.scaleDown();
    opacityAnim.opacity.value = withSpring(opacityOptions.pressed);
  }, [disabled, opacityOptions.pressed]);

  const handlePressOut = useCallback(() => {
    scaleAnim.scaleUp();
    opacityAnim.opacity.value = withSpring(opacityOptions.default ?? 1);
  }, [opacityOptions.default]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress?.();
  }, [disabled, onPress]);

  const handleLongPress = useCallback(() => {
    if (disabled) return;
    onLongPress?.();
  }, [disabled, onLongPress]);

  // 제스처 구성
  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(handlePressIn)
    .onFinalize((_, success) => {
      handlePressOut();
      if (success) {
        runOnJS(handlePress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  // 조합된 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.scale.value }],
    opacity: opacityAnim.opacity.value,
  }));

  return {
    gesture: Gesture.Race(gesture, longPressGesture),
    animatedStyle,
    handlePressIn,
    handlePressOut,
    handlePress,
    isDisabled: disabled,
  };
}

// hooks/behaviors/useSwipeable.ts
interface SwipeableOptions {
  threshold?: number;
  directions?: ('left' | 'right' | 'up' | 'down')[];
  onSwipe?: (direction: string) => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  rubberBanding?: boolean;
}

export function useSwipeable(options: SwipeableOptions = {}) {
  const {
    threshold = 100,
    directions = ['left', 'right'],
    onSwipe,
    onSwipeStart,
    onSwipeEnd,
    rubberBanding = true,
  } = options;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const springConfig = { damping: 20, stiffness: 200 };

  // 러버밴딩 효과
  const applyRubberBanding = (value: number, max: number) => {
    'worklet';
    if (!rubberBanding) return value;
    const overflow = Math.abs(value) - max;
    if (overflow <= 0) return value;
    const sign = value > 0 ? 1 : -1;
    return sign * (max + Math.sqrt(overflow) * 10);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      if (onSwipeStart) {
        runOnJS(onSwipeStart)();
      }
    })
    .onUpdate((event) => {
      const canSwipeX =
        directions.includes('left') || directions.includes('right');
      const canSwipeY =
        directions.includes('up') || directions.includes('down');

      if (canSwipeX) {
        translateX.value = applyRubberBanding(
          event.translationX,
          threshold * 1.5
        );
      }
      if (canSwipeY) {
        translateY.value = applyRubberBanding(
          event.translationY,
          threshold * 1.5
        );
      }
    })
    .onEnd((event) => {
      isDragging.value = false;

      let swipeDirection: string | null = null;

      // 스와이프 방향 감지
      if (Math.abs(event.translationX) > threshold) {
        swipeDirection = event.translationX > 0 ? 'right' : 'left';
      } else if (Math.abs(event.translationY) > threshold) {
        swipeDirection = event.translationY > 0 ? 'down' : 'up';
      }

      // 유효한 방향인지 확인
      if (swipeDirection && directions.includes(swipeDirection as any)) {
        if (onSwipe) {
          runOnJS(onSwipe)(swipeDirection);
        }
      }

      // 원위치로 복귀
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, springConfig);

      if (onSwipeEnd) {
        runOnJS(onSwipeEnd)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // 프로그래밍 방식 스와이프
  const swipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const distance = threshold * 3;

    switch (direction) {
      case 'left':
        translateX.value = withSpring(-distance);
        break;
      case 'right':
        translateX.value = withSpring(distance);
        break;
      case 'up':
        translateY.value = withSpring(-distance);
        break;
      case 'down':
        translateY.value = withSpring(distance);
        break;
    }

    if (onSwipe) {
      onSwipe(direction);
    }
  }, [threshold, onSwipe]);

  const reset = useCallback(() => {
    translateX.value = withSpring(0, springConfig);
    translateY.value = withSpring(0, springConfig);
  }, []);

  return {
    gesture,
    animatedStyle,
    translateX,
    translateY,
    isDragging,
    swipe,
    reset,
  };
}

// hooks/behaviors/useExpandable.ts
interface ExpandableOptions {
  initialExpanded?: boolean;
  animationType?: 'spring' | 'timing';
  duration?: number;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function useExpandable(options: ExpandableOptions = {}) {
  const {
    initialExpanded = false,
    animationType = 'spring',
    duration = 300,
    onExpand,
    onCollapse,
  } = options;

  const progress = useSharedValue(initialExpanded ? 1 : 0);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const animate = useCallback(
    (target: number) => {
      if (animationType === 'spring') {
        progress.value = withSpring(target, { damping: 15 });
      } else {
        progress.value = withTiming(target, { duration });
      }
    },
    [animationType, duration]
  );

  const expand = useCallback(() => {
    animate(1);
    setIsExpanded(true);
    onExpand?.();
  }, [animate, onExpand]);

  const collapse = useCallback(() => {
    animate(0);
    setIsExpanded(false);
    onCollapse?.();
  }, [animate, onCollapse]);

  const toggle = useCallback(() => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [isExpanded, expand, collapse]);

  // 높이 보간을 위한 헬퍼
  const interpolateHeight = useCallback(
    (collapsedHeight: number, expandedHeight: number) => {
      return useDerivedValue(() =>
        interpolate(progress.value, [0, 1], [collapsedHeight, expandedHeight])
      );
    },
    []
  );

  return {
    progress,
    isExpanded,
    expand,
    collapse,
    toggle,
    interpolateHeight,
  };
}
```

### 예제 3: Hook Merger Pattern

여러 훅을 하나로 병합:

```typescript
// hooks/composers/mergeHooks.ts
import { useAnimatedStyle } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

type AnimatedStyleHook = {
  animatedStyle: StyleProp<ViewStyle>;
};

type GestureHook = {
  gesture: ReturnType<typeof Gesture.Pan | typeof Gesture.Tap>;
};

// 여러 애니메이션 스타일 병합
export function useMergedAnimatedStyle(
  ...hooks: AnimatedStyleHook[]
): StyleProp<ViewStyle> {
  return useAnimatedStyle(() => {
    const mergedStyle: Record<string, any> = {};
    const transforms: any[] = [];

    hooks.forEach((hook) => {
      // 각 훅의 애니메이션 스타일 값 추출
      // 실제로는 훅 내부의 SharedValue를 직접 접근해야 함
    });

    if (transforms.length > 0) {
      mergedStyle.transform = transforms;
    }

    return mergedStyle;
  });
}

// 실용적인 병합 훅
interface MergedInteractionOptions {
  pressable?: boolean;
  swipeable?: boolean;
  expandable?: boolean;
  // 각 옵션의 설정
  pressableConfig?: PressableOptions;
  swipeableConfig?: SwipeableOptions;
  expandableConfig?: ExpandableOptions;
}

export function useMergedInteraction(options: MergedInteractionOptions) {
  const {
    pressable = false,
    swipeable = false,
    expandable = false,
    pressableConfig,
    swipeableConfig,
    expandableConfig,
  } = options;

  // 조건부로 훅 사용
  const pressableHook = pressable
    ? usePressable(pressableConfig)
    : null;

  const swipeableHook = swipeable
    ? useSwipeable(swipeableConfig)
    : null;

  const expandableHook = expandable
    ? useExpandable(expandableConfig)
    : null;

  // 제스처 조합
  const gestures: ReturnType<typeof Gesture.Pan>[] = [];
  if (pressableHook) gestures.push(pressableHook.gesture);
  if (swipeableHook) gestures.push(swipeableHook.gesture);

  const composedGesture =
    gestures.length > 0
      ? Gesture.Simultaneous(...gestures)
      : Gesture.Tap(); // 빈 제스처

  // 스타일 조합
  const animatedStyle = useAnimatedStyle(() => {
    const style: Record<string, any> = {};
    const transforms: any[] = [];

    if (pressableHook) {
      // pressable 스타일 추가
      transforms.push({ scale: pressableHook.scale.value });
      style.opacity = pressableHook.opacity.value;
    }

    if (swipeableHook) {
      transforms.push({ translateX: swipeableHook.translateX.value });
      transforms.push({ translateY: swipeableHook.translateY.value });
    }

    if (transforms.length > 0) {
      style.transform = transforms;
    }

    return style;
  });

  return {
    gesture: composedGesture,
    animatedStyle,
    pressable: pressableHook,
    swipeable: swipeableHook,
    expandable: expandableHook,
  };
}
```

### 예제 4: Hook Factory Pattern

설정 기반 훅 생성:

```typescript
// hooks/factories/createAnimationHook.ts
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  WithSpringConfig,
  WithTimingConfig,
  SharedValue,
} from 'react-native-reanimated';

// 애니메이션 속성 타입
type AnimatableProperty =
  | 'opacity'
  | 'scale'
  | 'translateX'
  | 'translateY'
  | 'rotate'
  | 'backgroundColor';

interface PropertyConfig {
  initial: number | string;
  animationType: 'spring' | 'timing';
  springConfig?: WithSpringConfig;
  timingConfig?: WithTimingConfig;
}

interface AnimationHookConfig {
  properties: Partial<Record<AnimatableProperty, PropertyConfig>>;
}

// 팩토리 함수
export function createAnimationHook<T extends AnimationHookConfig>(
  config: T
) {
  return function useCreatedAnimation() {
    // 각 속성에 대한 SharedValue 생성
    const values = {} as Record<
      keyof T['properties'],
      SharedValue<number>
    >;

    Object.entries(config.properties).forEach(([key, propConfig]) => {
      const initial =
        typeof propConfig.initial === 'number' ? propConfig.initial : 0;
      values[key as keyof T['properties']] = useSharedValue(initial);
    });

    // 애니메이션 함수 생성
    const animateTo = useCallback(
      (property: keyof T['properties'], target: number) => {
        const propConfig = config.properties[property as AnimatableProperty];
        if (!propConfig) return;

        const value = values[property];
        if (propConfig.animationType === 'spring') {
          value.value = withSpring(target, propConfig.springConfig);
        } else {
          value.value = withTiming(target, propConfig.timingConfig);
        }
      },
      []
    );

    // 모든 속성 동시 애니메이션
    const animateAll = useCallback(
      (targets: Partial<Record<keyof T['properties'], number>>) => {
        Object.entries(targets).forEach(([key, target]) => {
          animateTo(key as keyof T['properties'], target as number);
        });
      },
      [animateTo]
    );

    // 리셋
    const reset = useCallback(() => {
      Object.entries(config.properties).forEach(([key, propConfig]) => {
        const initial =
          typeof propConfig.initial === 'number' ? propConfig.initial : 0;
        values[key as keyof T['properties']].value = initial;
      });
    }, []);

    // 애니메이션 스타일
    const animatedStyle = useAnimatedStyle(() => {
      const style: Record<string, any> = {};
      const transforms: any[] = [];

      Object.entries(config.properties).forEach(([key, _]) => {
        const value = values[key as keyof T['properties']].value;

        switch (key) {
          case 'opacity':
            style.opacity = value;
            break;
          case 'scale':
            transforms.push({ scale: value });
            break;
          case 'translateX':
            transforms.push({ translateX: value });
            break;
          case 'translateY':
            transforms.push({ translateY: value });
            break;
          case 'rotate':
            transforms.push({ rotate: `${value}deg` });
            break;
        }
      });

      if (transforms.length > 0) {
        style.transform = transforms;
      }

      return style;
    });

    return {
      values,
      animateTo,
      animateAll,
      reset,
      animatedStyle,
    };
  };
}

// 사용 예시
const useFadeScaleAnimation = createAnimationHook({
  properties: {
    opacity: {
      initial: 0,
      animationType: 'timing',
      timingConfig: { duration: 300 },
    },
    scale: {
      initial: 0.8,
      animationType: 'spring',
      springConfig: { damping: 15 },
    },
  },
});

// 프리셋 훅 팩토리
export const AnimationPresets = {
  fadeIn: createAnimationHook({
    properties: {
      opacity: { initial: 0, animationType: 'timing' },
    },
  }),

  scaleIn: createAnimationHook({
    properties: {
      scale: { initial: 0, animationType: 'spring' },
      opacity: { initial: 0, animationType: 'timing' },
    },
  }),

  slideUp: createAnimationHook({
    properties: {
      translateY: { initial: 50, animationType: 'spring' },
      opacity: { initial: 0, animationType: 'timing' },
    },
  }),

  bounce: createAnimationHook({
    properties: {
      scale: {
        initial: 1,
        animationType: 'spring',
        springConfig: { damping: 8, stiffness: 200 },
      },
    },
  }),
};
```

### 예제 5: Pipeline Pattern

훅을 순차적으로 연결:

```typescript
// hooks/composers/usePipeline.ts
import { useCallback, useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

// 파이프라인 스테이지 타입
interface PipelineStage<TInput, TOutput> {
  name: string;
  process: (input: TInput) => TOutput;
}

// 애니메이션 파이프라인 훅
interface AnimationPipelineStage {
  name: string;
  apply: (value: number) => number;
}

export function useAnimationPipeline(
  source: SharedValue<number>,
  stages: AnimationPipelineStage[]
) {
  // 각 스테이지의 결과 값
  const stageResults = useMemo(() => {
    return stages.map(() => useSharedValue(0));
  }, [stages.length]);

  // 파이프라인 실행
  const execute = useCallback(() => {
    'worklet';
    let currentValue = source.value;

    stages.forEach((stage, index) => {
      currentValue = stage.apply(currentValue);
      stageResults[index].value = currentValue;
    });

    return currentValue;
  }, [stages]);

  // 파생 값으로 자동 실행
  const result = useDerivedValue(() => {
    let currentValue = source.value;

    stages.forEach((stage, index) => {
      currentValue = stage.apply(currentValue);
      stageResults[index].value = currentValue;
    });

    return currentValue;
  });

  return {
    result,
    stageResults,
    execute,
  };
}

// 사용 예시: 입력값 정규화 파이프라인
const useNormalizedInput = (rawValue: SharedValue<number>) => {
  return useAnimationPipeline(rawValue, [
    {
      name: 'clamp',
      apply: (v) => Math.max(0, Math.min(1, v)),
    },
    {
      name: 'easeOut',
      apply: (v) => 1 - Math.pow(1 - v, 3),
    },
    {
      name: 'scale',
      apply: (v) => v * 100,
    },
  ]);
};

// 제스처 처리 파이프라인
interface GesturePipelineConfig {
  velocityThreshold?: number;
  damping?: number;
  bounds?: { min: number; max: number };
}

export function useGesturePipeline(config: GesturePipelineConfig = {}) {
  const {
    velocityThreshold = 500,
    damping = 0.95,
    bounds = { min: -Infinity, max: Infinity },
  } = config;

  const position = useSharedValue(0);
  const velocity = useSharedValue(0);

  // 파이프라인 스테이지
  const stages = useMemo(
    () => [
      // 1. 속도 감쇠
      {
        name: 'applyDamping',
        process: (pos: number, vel: number) => ({
          position: pos + vel * 0.016,
          velocity: vel * damping,
        }),
      },
      // 2. 경계 처리
      {
        name: 'applyBounds',
        process: (state: { position: number; velocity: number }) => {
          let { position: pos, velocity: vel } = state;
          if (pos < bounds.min) {
            pos = bounds.min;
            vel = 0;
          } else if (pos > bounds.max) {
            pos = bounds.max;
            vel = 0;
          }
          return { position: pos, velocity: vel };
        },
      },
      // 3. 스냅 결정
      {
        name: 'checkSnap',
        process: (state: { position: number; velocity: number }) => {
          if (Math.abs(state.velocity) < 10) {
            return { ...state, shouldSnap: true };
          }
          return { ...state, shouldSnap: false };
        },
      },
    ],
    [damping, bounds]
  );

  // 제스처 핸들러
  const onGestureUpdate = useCallback((event: { translationX: number }) => {
    position.value = event.translationX;
  }, []);

  const onGestureEnd = useCallback(
    (event: { velocityX: number }) => {
      velocity.value = event.velocityX;

      // 파이프라인 실행 (프레임마다)
      // useFrameCallback에서 처리
    },
    []
  );

  return {
    position,
    velocity,
    onGestureUpdate,
    onGestureEnd,
  };
}
```

## 🎨 sometimes-app 적용 사례

### 매칭 카드 인터랙션 훅

```typescript
// features/matching/hooks/useMatchingCard.ts
import { usePressable } from '@/hooks/behaviors/usePressable';
import { useSwipeable } from '@/hooks/behaviors/useSwipeable';
import { useSpringValue } from '@/hooks/primitives/useSpringValue';

interface MatchingCardOptions {
  profileId: string;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike: (id: string) => void;
  onProfileTap: (id: string) => void;
}

export function useMatchingCard(options: MatchingCardOptions) {
  const { profileId, onLike, onPass, onSuperLike, onProfileTap } = options;

  // 기본 상호작용 조합
  const swipeable = useSwipeable({
    directions: ['left', 'right', 'up'],
    threshold: 120,
    onSwipe: (direction) => {
      switch (direction) {
        case 'right':
          onLike(profileId);
          break;
        case 'left':
          onPass(profileId);
          break;
        case 'up':
          onSuperLike(profileId);
          break;
      }
    },
  });

  const pressable = usePressable({
    scale: { pressed: 0.98 },
    opacity: { pressed: 0.95 },
    onPress: () => onProfileTap(profileId),
  });

  // 추가 애니메이션 상태
  const likeOpacity = useSpringValue({ initial: 0 });
  const passOpacity = useSpringValue({ initial: 0 });
  const superLikeOpacity = useSpringValue({ initial: 0 });
  const cardRotation = useSpringValue({ initial: 0 });

  // 스와이프 진행도에 따른 오버레이 업데이트
  useAnimatedReaction(
    () => ({
      x: swipeable.translateX.value,
      y: swipeable.translateY.value,
    }),
    ({ x, y }) => {
      // 좌우 스와이프에 따른 오버레이
      if (x > 0) {
        likeOpacity.value.value = Math.min(x / 100, 1);
        passOpacity.value.value = 0;
      } else if (x < 0) {
        passOpacity.value.value = Math.min(-x / 100, 1);
        likeOpacity.value.value = 0;
      } else {
        likeOpacity.value.value = 0;
        passOpacity.value.value = 0;
      }

      // 위로 스와이프
      if (y < -50) {
        superLikeOpacity.value.value = Math.min(-y / 100, 1);
      } else {
        superLikeOpacity.value.value = 0;
      }

      // 카드 회전
      cardRotation.value.value = x * 0.1;
    }
  );

  // 통합 스타일
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: swipeable.translateX.value },
      { translateY: swipeable.translateY.value },
      { rotate: `${cardRotation.value.value}deg` },
      { scale: pressable.scale?.value ?? 1 },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value.value,
    transform: [
      { scale: interpolate(likeOpacity.value.value, [0, 1], [0.5, 1]) },
    ],
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: passOpacity.value.value,
    transform: [
      { scale: interpolate(passOpacity.value.value, [0, 1], [0.5, 1]) },
    ],
  }));

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: superLikeOpacity.value.value,
    transform: [
      { scale: interpolate(superLikeOpacity.value.value, [0, 1], [0.5, 1]) },
    ],
  }));

  // 통합 제스처
  const gesture = Gesture.Simultaneous(
    swipeable.gesture,
    pressable.gesture
  );

  // 프로그래밍 방식 액션
  const like = useCallback(() => {
    swipeable.swipe('right');
  }, [swipeable]);

  const pass = useCallback(() => {
    swipeable.swipe('left');
  }, [swipeable]);

  const superLike = useCallback(() => {
    swipeable.swipe('up');
  }, [swipeable]);

  const reset = useCallback(() => {
    swipeable.reset();
    likeOpacity.reset();
    passOpacity.reset();
    superLikeOpacity.reset();
    cardRotation.reset();
  }, [swipeable]);

  return {
    // 제스처
    gesture,

    // 스타일
    cardAnimatedStyle,
    likeOverlayStyle,
    passOverlayStyle,
    superLikeOverlayStyle,

    // 액션
    like,
    pass,
    superLike,
    reset,

    // 상태
    isDragging: swipeable.isDragging,
  };
}

// 사용 예시
function MatchingCard({ profile, onLike, onPass, onSuperLike, onTap }) {
  const card = useMatchingCard({
    profileId: profile.id,
    onLike,
    onPass,
    onSuperLike,
    onProfileTap: onTap,
  });

  return (
    <GestureDetector gesture={card.gesture}>
      <Animated.View style={[styles.card, card.cardAnimatedStyle]}>
        <Image source={{ uri: profile.photo }} style={styles.photo} />

        {/* Like Overlay */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, card.likeOverlayStyle]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        {/* Pass Overlay */}
        <Animated.View style={[styles.overlay, styles.passOverlay, card.passOverlayStyle]}>
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

        {/* Super Like Overlay */}
        <Animated.View style={[styles.overlay, styles.superLikeOverlay, card.superLikeOverlayStyle]}>
          <Text style={styles.overlayText}>SUPER LIKE</Text>
        </Animated.View>

        <ProfileInfo profile={profile} />
      </Animated.View>
    </GestureDetector>
  );
}

// 채팅 입력 애니메이션 훅
// features/chat/hooks/useChatInputAnimation.ts
export function useChatInputAnimation() {
  const focusAnim = useFadeAnimation({ initialVisible: false });
  const expandAnim = useExpandable();
  const sendButtonScale = useScaleAnimation({ pressedScale: 0.9 });

  const [isFocused, setIsFocused] = useState(false);
  const [hasText, setHasText] = useState(false);

  // 포커스 상태에 따른 애니메이션
  useEffect(() => {
    if (isFocused) {
      focusAnim.fadeIn();
      expandAnim.expand();
    } else if (!hasText) {
      focusAnim.fadeOut();
      expandAnim.collapse();
    }
  }, [isFocused, hasText]);

  // 전송 버튼 애니메이션
  const sendButtonStyle = useAnimatedStyle(() => ({
    opacity: hasText ? 1 : 0.5,
    transform: [{ scale: sendButtonScale.scale.value }],
  }));

  // 입력 컨테이너 스타일
  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnim.opacity.value,
      [0, 1],
      ['#E5E5E5', '#7C4DFF']
    ),
    borderWidth: interpolate(focusAnim.opacity.value, [0, 1], [1, 2]),
  }));

  return {
    setIsFocused,
    setHasText,
    sendButtonStyle,
    containerStyle,
    sendButtonGesture: sendButtonScale.gesture,
    isExpanded: expandAnim.isExpanded,
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 훅 규칙 위반

```typescript
// ❌ 잘못된 방식 - 조건부 훅 호출
function BadComponent({ shouldAnimate }) {
  if (shouldAnimate) {
    const anim = useSpringValue(); // 조건부 호출 금지!
  }
}

// ✅ 올바른 방식 - 항상 호출하고 조건부로 사용
function GoodComponent({ shouldAnimate }) {
  const anim = useSpringValue();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shouldAnimate ? anim.value.value : 1,
  }));
}
```

### 실수 2: 과도한 추상화

```typescript
// ❌ 너무 많은 레이어
const useButton = () => {
  const layer1 = useBaseInteraction();
  const layer2 = useLayer2(layer1);
  const layer3 = useLayer3(layer2);
  const layer4 = useLayer4(layer3);
  // 복잡하고 디버깅 어려움

  return layer4;
};

// ✅ 적절한 레이어링
const useButton = () => {
  const pressable = usePressable();
  const ripple = useRippleEffect();

  return useMemo(
    () => ({
      ...pressable,
      rippleStyle: ripple.style,
    }),
    [pressable, ripple]
  );
};
```

### 실수 3: 메모이제이션 누락

```typescript
// ❌ 매 렌더마다 새 객체 생성
function BadHook() {
  const config = { damping: 15 }; // 매번 새 객체

  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withSpring(1, config);
  }, [config]); // config가 매번 바뀜!
}

// ✅ 메모이제이션 사용
function GoodHook() {
  const config = useMemo(() => ({ damping: 15 }), []);

  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withSpring(1, config);
  }, []); // 한 번만 실행
}
```

## 💡 훅 조합 팁

### 1. 단일 책임 유지

```typescript
// 좋은 설계: 각 훅이 하나의 책임
const opacity = useFadeAnimation();
const scale = useScaleAnimation();
const drag = useDraggable();

// 조합해서 사용
const combinedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value.value,
  transform: [
    { scale: scale.value.value },
    { translateX: drag.x.value },
  ],
}));
```

### 2. 타입 안전성 확보

```typescript
// 제네릭을 활용한 타입 안전 조합
function useTypedPipeline<T>(
  stages: Array<(input: T) => T>,
  initial: T
) {
  const value = useSharedValue(initial);

  const process = useCallback((input: T): T => {
    return stages.reduce((acc, stage) => stage(acc), input);
  }, [stages]);

  return { value, process };
}
```

### 3. 테스트 용이성

```typescript
// 의존성 주입으로 테스트 용이하게
interface AnimationDeps {
  springFn?: typeof withSpring;
  timingFn?: typeof withTiming;
}

function useTestableAnimation(deps: AnimationDeps = {}) {
  const { springFn = withSpring, timingFn = withTiming } = deps;

  // 테스트에서 mock 가능
  const animate = (v: SharedValue<number>, target: number) => {
    v.value = springFn(target);
  };

  return { animate };
}
```

## 🏋️ 연습 문제

### 문제 1: 토글 스위치 훅 조합

`usePressable`과 `useSwipeable`을 조합하여 토글 스위치 훅을 만드세요.

<details>
<summary>정답 보기</summary>

```typescript
interface ToggleSwitchOptions {
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
  trackWidth?: number;
}

export function useToggleSwitch(options: ToggleSwitchOptions = {}) {
  const {
    initialValue = false,
    onToggle,
    trackWidth = 50,
  } = options;

  const [isOn, setIsOn] = useState(initialValue);
  const thumbPosition = useSharedValue(initialValue ? trackWidth - 24 : 2);

  // 눌림 효과
  const pressable = usePressable({
    scale: { pressed: 0.95 },
  });

  // 스와이프
  const swipeable = useSwipeable({
    directions: ['left', 'right'],
    threshold: 20,
    onSwipe: (direction) => {
      const newValue = direction === 'right';
      if (newValue !== isOn) {
        setIsOn(newValue);
        onToggle?.(newValue);
      }
    },
  });

  // 토글 함수
  const toggle = useCallback(() => {
    const newValue = !isOn;
    setIsOn(newValue);
    thumbPosition.value = withSpring(newValue ? trackWidth - 24 : 2);
    onToggle?.(newValue);
  }, [isOn, trackWidth, onToggle]);

  // 값 변경 시 애니메이션
  useEffect(() => {
    thumbPosition.value = withSpring(isOn ? trackWidth - 24 : 2);
  }, [isOn, trackWidth]);

  // 탭 제스처
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(toggle)();
  });

  // 조합된 제스처
  const gesture = Gesture.Race(tapGesture, swipeable.gesture);

  // 트랙 스타일
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      thumbPosition.value,
      [2, trackWidth - 24],
      ['#E5E5E5', '#4CAF50']
    ),
  }));

  // 썸 스타일
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: thumbPosition.value },
      { scale: pressable.scale?.value ?? 1 },
    ],
  }));

  return {
    isOn,
    toggle,
    gesture,
    trackStyle,
    thumbStyle,
  };
}
```

</details>

### 문제 2: 캐러셀 훅

여러 primitive 훅을 조합하여 캐러셀(슬라이더) 훅을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
interface CarouselOptions {
  itemCount: number;
  itemWidth: number;
  gap?: number;
  initialIndex?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
}

export function useCarousel(options: CarouselOptions) {
  const {
    itemCount,
    itemWidth,
    gap = 16,
    initialIndex = 0,
    loop = false,
    onIndexChange,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(-initialIndex * (itemWidth + gap));

  // 스와이프
  const swipeable = useSwipeable({
    directions: ['left', 'right'],
    threshold: itemWidth * 0.3,
    rubberBanding: !loop,
    onSwipe: (direction) => {
      let newIndex = currentIndex;

      if (direction === 'left') {
        newIndex = Math.min(currentIndex + 1, itemCount - 1);
      } else if (direction === 'right') {
        newIndex = Math.max(currentIndex - 1, 0);
      }

      if (loop) {
        if (direction === 'left' && currentIndex === itemCount - 1) {
          newIndex = 0;
        } else if (direction === 'right' && currentIndex === 0) {
          newIndex = itemCount - 1;
        }
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        onIndexChange?.(newIndex);
      }
    },
  });

  // 인덱스 변경 시 애니메이션
  useEffect(() => {
    translateX.value = withSpring(
      -currentIndex * (itemWidth + gap),
      { damping: 20 }
    );
  }, [currentIndex, itemWidth, gap]);

  // 네비게이션 함수
  const goTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
    setCurrentIndex(clampedIndex);
    onIndexChange?.(clampedIndex);
  }, [itemCount, onIndexChange]);

  const next = useCallback(() => {
    let newIndex = currentIndex + 1;
    if (loop && newIndex >= itemCount) {
      newIndex = 0;
    }
    goTo(newIndex);
  }, [currentIndex, itemCount, loop, goTo]);

  const prev = useCallback(() => {
    let newIndex = currentIndex - 1;
    if (loop && newIndex < 0) {
      newIndex = itemCount - 1;
    }
    goTo(newIndex);
  }, [currentIndex, itemCount, loop, goTo]);

  // 컨테이너 스타일
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + swipeable.translateX.value },
    ],
  }));

  // 페이지 인디케이터
  const getIndicatorStyle = useCallback(
    (index: number) => {
      return useAnimatedStyle(() => {
        const isActive = index === currentIndex;
        return {
          width: withSpring(isActive ? 24 : 8),
          opacity: withSpring(isActive ? 1 : 0.5),
        };
      });
    },
    [currentIndex]
  );

  return {
    currentIndex,
    gesture: swipeable.gesture,
    containerStyle,
    goTo,
    next,
    prev,
    getIndicatorStyle,
  };
}
```

</details>

## 📚 이 장에서 배운 내용

1. **훅 계층 구조**: Primitive → Behavior → Feature 레이어
2. **조합 패턴**: Merger, Pipeline, Wrapper, Conditional
3. **Hook Factory**: 설정 기반 훅 생성
4. **테스트 가능한 구조**: 의존성 주입과 모킹

## 다음 장 예고

**Chapter 67: 테스트 전략**에서는 애니메이션 코드를 효과적으로 테스트하는 방법을 배웁니다. Jest, React Native Testing Library, 그리고 E2E 테스트 전략을 다룹니다.
