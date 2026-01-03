# Chapter 44: 커스텀 애니메이션 엔진

Reanimated의 내장 애니메이션을 넘어 완전히 새로운 애니메이션 패턴을 구현합니다. 커스텀 이징 함수, 나만의 애니메이션 드라이버, 그리고 복잡한 모션 시스템을 만드는 방법을 배웁니다.

## 📌 학습 목표

- 커스텀 이징 함수 작성법
- 베지어 곡선 기반 이징 구현
- 물리 기반 애니메이션 시스템 구축
- 키프레임 애니메이션 엔진
- 애니메이션 합성과 블렌딩

## 📖 애니메이션 엔진의 구조

### 내장 애니메이션의 동작 원리

```
┌─────────────────────────────────────────────────────────────────┐
│                  Animation Engine Structure                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  withTiming / withSpring 내부 동작:                             │
│                                                                  │
│  1. 애니메이션 정의                                              │
│     ┌─────────────┐                                             │
│     │ Animation   │ ← 시작값, 목표값, 설정                       │
│     │ Definition  │                                             │
│     └──────┬──────┘                                             │
│            │                                                    │
│  2. 프레임 업데이트 (UI 스레드)                                  │
│            ▼                                                    │
│     ┌─────────────┐                                             │
│     │  onFrame()  │ ← 매 프레임 호출                            │
│     │             │   └ 진행률 계산                             │
│     │             │   └ 이징 적용                               │
│     │             │   └ 현재값 계산                             │
│     └──────┬──────┘                                             │
│            │                                                    │
│  3. 값 적용                                                      │
│            ▼                                                    │
│     ┌─────────────┐                                             │
│     │SharedValue  │ ← 계산된 값 할당                            │
│     │  .value     │                                             │
│     └─────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 커스텀 애니메이션 기본 구조

```typescript
import { withTiming, Easing, SharedValue } from 'react-native-reanimated';

// 커스텀 애니메이션 팩토리 패턴
function customAnimation(
  toValue: number,
  config?: { duration?: number }
): (value: number) => number {
  'worklet';

  const startValue = 0; // 실제로는 현재 값에서 시작
  const duration = config?.duration ?? 300;
  let startTime: number | null = null;

  return (timestamp: number) => {
    'worklet';

    if (startTime === null) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 커스텀 이징 적용
    const easedProgress = customEasing(progress);

    // 보간
    const currentValue = startValue + (toValue - startValue) * easedProgress;

    return currentValue;
  };
}

function customEasing(t: number): number {
  'worklet';
  // 커스텀 이징 로직
  return t * t * (3 - 2 * t); // smoothstep
}
```

## 💻 커스텀 이징 함수

### 수학적 이징 함수

```typescript
// 이징 함수 라이브러리
export const CustomEasings = {
  // 기본 이징
  linear: (t: number) => {
    'worklet';
    return t;
  },

  // 2차 이징
  easeInQuad: (t: number) => {
    'worklet';
    return t * t;
  },

  easeOutQuad: (t: number) => {
    'worklet';
    return t * (2 - t);
  },

  easeInOutQuad: (t: number) => {
    'worklet';
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  // 3차 이징
  easeInCubic: (t: number) => {
    'worklet';
    return t * t * t;
  },

  easeOutCubic: (t: number) => {
    'worklet';
    return 1 - Math.pow(1 - t, 3);
  },

  easeInOutCubic: (t: number) => {
    'worklet';
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // 지수 이징
  easeInExpo: (t: number) => {
    'worklet';
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
  },

  easeOutExpo: (t: number) => {
    'worklet';
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  // 탄성 이징
  easeOutElastic: (t: number) => {
    'worklet';
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  easeInElastic: (t: number) => {
    'worklet';
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  // 바운스 이징
  easeOutBounce: (t: number) => {
    'worklet';
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  easeInBounce: (t: number) => {
    'worklet';
    return 1 - CustomEasings.easeOutBounce(1 - t);
  },

  // Back 이징 (오버슈트)
  easeInBack: (t: number) => {
    'worklet';
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  easeOutBack: (t: number) => {
    'worklet';
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};
```

### 베지어 곡선 이징

```typescript
// 3차 베지어 곡선 이징 (CSS transition-timing-function 호환)
function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  'worklet';

  // Newton-Raphson 방법으로 t에 해당하는 x 찾기
  const sampleCurveX = (t: number) => {
    return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t + 3 * x1 * t;
  };

  const sampleCurveY = (t: number) => {
    return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t + 3 * y1 * t;
  };

  const sampleCurveDerivativeX = (t: number) => {
    return (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;
  };

  const solveCurveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const currentX = sampleCurveX(t) - x;
      if (Math.abs(currentX) < 0.0001) return t;

      const derivative = sampleCurveDerivativeX(t);
      if (Math.abs(derivative) < 0.0001) break;

      t -= currentX / derivative;
    }
    return t;
  };

  return (progress: number) => {
    'worklet';
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    const t = solveCurveX(progress);
    return sampleCurveY(t);
  };
}

// CSS 이징 프리셋
export const CSSEasings = {
  ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
  easeIn: cubicBezier(0.42, 0.0, 1.0, 1.0),
  easeOut: cubicBezier(0.0, 0.0, 0.58, 1.0),
  easeInOut: cubicBezier(0.42, 0.0, 0.58, 1.0),

  // 머티리얼 디자인 이징
  standard: cubicBezier(0.4, 0.0, 0.2, 1.0),
  decelerate: cubicBezier(0.0, 0.0, 0.2, 1.0),
  accelerate: cubicBezier(0.4, 0.0, 1.0, 1.0),
};
```

### 커스텀 이징 적용

```typescript
import { withTiming, Easing } from 'react-native-reanimated';

function useCustomEasing() {
  const position = useSharedValue(0);

  const animateWithCustomEasing = (toValue: number) => {
    // 방법 1: Easing.bezier 사용
    position.value = withTiming(toValue, {
      duration: 500,
      easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // 백 이징
    });
  };

  const animateWithWorkletEasing = (toValue: number) => {
    // 방법 2: 커스텀 워크릿 사용 (useFrameCallback)
    const startValue = position.value;
    const startTime = Date.now();
    const duration = 500;

    // useFrameCallback에서 매 프레임 계산
    runOnUI(() => {
      'worklet';
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = CustomEasings.easeOutElastic(progress);

      position.value = startValue + (toValue - startValue) * eased;
    })();
  };

  return { position, animateWithCustomEasing, animateWithWorkletEasing };
}
```

## 💻 물리 기반 애니메이션 시스템

### 스프링 시뮬레이션 엔진

```typescript
interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  initialVelocity?: number;
}

interface SpringState {
  position: number;
  velocity: number;
}

// 스프링 애니메이션 드라이버
function createSpringDriver(
  target: number,
  config: SpringConfig
) {
  'worklet';

  const { mass, stiffness, damping, initialVelocity = 0 } = config;

  // 임계 감쇠 계산
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const dampingRatio = damping / criticalDamping;

  return {
    // 현재 상태에서 다음 상태 계산
    step: (state: SpringState, dt: number): SpringState => {
      'worklet';

      const displacement = state.position - target;

      // 스프링 힘
      const springForce = -stiffness * displacement;
      // 감쇠 힘
      const dampingForce = -damping * state.velocity;
      // 가속도
      const acceleration = (springForce + dampingForce) / mass;

      // Verlet 적분
      const newVelocity = state.velocity + acceleration * dt;
      const newPosition = state.position + newVelocity * dt;

      return {
        position: newPosition,
        velocity: newVelocity,
      };
    },

    // 애니메이션 완료 여부
    isAtRest: (state: SpringState): boolean => {
      'worklet';
      const restVelocityThreshold = 0.01;
      const restDisplacementThreshold = 0.01;

      const isVelocityRest = Math.abs(state.velocity) < restVelocityThreshold;
      const isDisplacementRest = Math.abs(state.position - target) < restDisplacementThreshold;

      return isVelocityRest && isDisplacementRest;
    },

    // 분석용: 이론적 세틀링 시간
    getSettlingTime: (): number => {
      'worklet';
      if (dampingRatio >= 1) {
        // 과감쇠 또는 임계 감쇠
        return 4 / (damping / mass);
      } else {
        // 미감쇠
        const omega = Math.sqrt(stiffness / mass);
        const dampedFreq = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
        return -Math.log(0.01) / (dampingRatio * omega);
      }
    },
  };
}

// 사용 예
function PhysicsSpringAnimation() {
  const position = useSharedValue(0);
  const velocity = useSharedValue(0);
  const target = useSharedValue(100);

  const springConfig: SpringConfig = {
    mass: 1,
    stiffness: 180,
    damping: 12,
  };

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = Math.min(info.timeSincePreviousFrame / 1000, 0.064);
    const driver = createSpringDriver(target.value, springConfig);

    const currentState: SpringState = {
      position: position.value,
      velocity: velocity.value,
    };

    if (driver.isAtRest(currentState)) return;

    const nextState = driver.step(currentState, dt);
    position.value = nextState.position;
    velocity.value = nextState.velocity;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return <Animated.View style={animatedStyle} />;
}
```

### 중력과 마찰 시스템

```typescript
interface PhysicsConfig {
  gravity: number;
  friction: number;
  bounce: number;
  bounds?: { min: number; max: number };
}

function createPhysicsEngine(config: PhysicsConfig) {
  'worklet';

  const { gravity, friction, bounce, bounds } = config;

  return {
    step: (
      position: number,
      velocity: number,
      dt: number
    ): { position: number; velocity: number } => {
      'worklet';

      // 중력 적용
      let newVelocity = velocity + gravity * dt;

      // 마찰 적용
      newVelocity *= Math.pow(friction, dt * 60);

      // 위치 업데이트
      let newPosition = position + newVelocity * dt;

      // 경계 충돌
      if (bounds) {
        if (newPosition < bounds.min) {
          newPosition = bounds.min;
          newVelocity = -newVelocity * bounce;
        } else if (newPosition > bounds.max) {
          newPosition = bounds.max;
          newVelocity = -newVelocity * bounce;
        }
      }

      return { position: newPosition, velocity: newVelocity };
    },
  };
}

// 드래그 후 관성 + 바운스
function InertialDrag() {
  const y = useSharedValue(0);
  const vy = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const physicsEngine = createPhysicsEngine({
    gravity: 0,
    friction: 0.98,
    bounce: 0.5,
    bounds: { min: 0, max: SCREEN_HEIGHT - 100 },
  });

  useFrameCallback((info) => {
    if (isDragging.value || !info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;
    const result = physicsEngine.step(y.value, vy.value, dt);

    y.value = result.position;
    vy.value = result.velocity;

    // 정지 조건
    if (Math.abs(vy.value) < 0.1) {
      vy.value = 0;
    }
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      y.value = event.absoluteY;
      vy.value = event.velocityY / 1000;
    })
    .onEnd((event) => {
      isDragging.value = false;
      vy.value = event.velocityY / 1000;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

## 💻 키프레임 애니메이션 시스템

### 키프레임 정의와 보간

```typescript
interface Keyframe<T> {
  time: number;    // 0-1 진행률
  value: T;
  easing?: (t: number) => number;
}

interface KeyframeAnimation<T> {
  keyframes: Keyframe<T>[];
  duration: number;
}

// 키프레임 보간기
function interpolateKeyframes<T extends number | { [key: string]: number }>(
  keyframes: Keyframe<T>[],
  progress: number
): T {
  'worklet';

  // 현재 진행률에 해당하는 키프레임 구간 찾기
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
  }

  // 구간 내 진행률
  const segmentDuration = nextKeyframe.time - prevKeyframe.time;
  const segmentProgress = segmentDuration > 0
    ? (progress - prevKeyframe.time) / segmentDuration
    : 0;

  // 이징 적용
  const easedProgress = prevKeyframe.easing
    ? prevKeyframe.easing(segmentProgress)
    : segmentProgress;

  // 값 보간
  if (typeof prevKeyframe.value === 'number') {
    return (prevKeyframe.value +
      (nextKeyframe.value as number - prevKeyframe.value) * easedProgress) as T;
  }

  // 객체 보간
  const result: { [key: string]: number } = {};
  for (const key in prevKeyframe.value) {
    const from = (prevKeyframe.value as { [key: string]: number })[key];
    const to = (nextKeyframe.value as { [key: string]: number })[key];
    result[key] = from + (to - from) * easedProgress;
  }
  return result as T;
}

// 키프레임 애니메이션 훅
function useKeyframeAnimation<T extends number | { [key: string]: number }>(
  animation: KeyframeAnimation<T>
) {
  const progress = useSharedValue(0);
  const isPlaying = useSharedValue(false);
  const startTime = useSharedValue(0);

  const currentValue = useDerivedValue(() => {
    return interpolateKeyframes(animation.keyframes, progress.value);
  });

  useFrameCallback((info) => {
    if (!isPlaying.value) return;

    const elapsed = info.timeSinceFirstFrame - startTime.value;
    const newProgress = Math.min(elapsed / animation.duration, 1);

    progress.value = newProgress;

    if (newProgress >= 1) {
      isPlaying.value = false;
    }
  });

  const play = () => {
    runOnUI((currentTime: number) => {
      'worklet';
      startTime.value = currentTime;
      progress.value = 0;
      isPlaying.value = true;
    })(Date.now());
  };

  const pause = () => {
    isPlaying.value = false;
  };

  const reset = () => {
    isPlaying.value = false;
    progress.value = 0;
  };

  return { currentValue, progress, play, pause, reset };
}

// 사용 예: 복잡한 키프레임 애니메이션
function KeyframeExample() {
  const animation: KeyframeAnimation<{ x: number; y: number; scale: number; rotation: number }> = {
    duration: 2000,
    keyframes: [
      { time: 0, value: { x: 0, y: 0, scale: 1, rotation: 0 } },
      { time: 0.25, value: { x: 100, y: -50, scale: 1.2, rotation: 45 }, easing: CustomEasings.easeOutQuad },
      { time: 0.5, value: { x: 200, y: 0, scale: 1, rotation: 90 }, easing: CustomEasings.easeInOutQuad },
      { time: 0.75, value: { x: 100, y: 50, scale: 0.8, rotation: 135 }, easing: CustomEasings.easeOutQuad },
      { time: 1, value: { x: 0, y: 0, scale: 1, rotation: 180 }, easing: CustomEasings.easeOutBounce },
    ],
  };

  const { currentValue, play, reset } = useKeyframeAnimation(animation);

  const animatedStyle = useAnimatedStyle(() => {
    const { x, y, scale, rotation } = currentValue.value;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  return (
    <View>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Button title="Play" onPress={play} />
      <Button title="Reset" onPress={reset} />
    </View>
  );
}
```

### CSS 키프레임 호환 시스템

```typescript
// CSS @keyframes 스타일 정의
type CSSKeyframes = {
  [percentage: string]: {
    [property: string]: number | string;
  };
};

function parseCSSKeyframes(keyframes: CSSKeyframes): Keyframe<any>[] {
  'worklet';

  const result: Keyframe<any>[] = [];

  for (const percentage in keyframes) {
    const time = percentage === 'from'
      ? 0
      : percentage === 'to'
      ? 1
      : parseFloat(percentage) / 100;

    result.push({
      time,
      value: keyframes[percentage],
    });
  }

  return result.sort((a, b) => a.time - b.time);
}

// CSS 스타일 키프레임
function useCSSKeyframeAnimation(cssKeyframes: CSSKeyframes, duration: number) {
  const keyframes = useMemo(() => parseCSSKeyframes(cssKeyframes), [cssKeyframes]);

  return useKeyframeAnimation({
    keyframes,
    duration,
  });
}

// 사용
function CSSStyleAnimation() {
  const fadeInUp: CSSKeyframes = {
    from: { opacity: 0, translateY: 20 },
    '50%': { opacity: 0.5, translateY: 10 },
    to: { opacity: 1, translateY: 0 },
  };

  const { currentValue, play } = useCSSKeyframeAnimation(fadeInUp, 500);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: currentValue.value.opacity ?? 1,
    transform: [{ translateY: currentValue.value.translateY ?? 0 }],
  }));

  return <Animated.View style={animatedStyle} />;
}
```

## 💻 애니메이션 합성과 블렌딩

### 다중 애니메이션 합성

```typescript
interface AnimationLayer {
  weight: SharedValue<number>;
  value: SharedValue<number>;
}

function useAnimationBlending(layers: AnimationLayer[]) {
  const blendedValue = useDerivedValue(() => {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const layer of layers) {
      totalWeight += layer.weight.value;
      weightedSum += layer.value.value * layer.weight.value;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  });

  return blendedValue;
}

// 사용 예: 제스처와 자동 애니메이션 블렌딩
function GestureAnimationBlend() {
  // 자동 애니메이션 레이어
  const autoX = useSharedValue(0);
  const autoWeight = useSharedValue(1);

  // 제스처 레이어
  const gestureX = useSharedValue(0);
  const gestureWeight = useSharedValue(0);

  // 블렌딩
  const blendedX = useAnimationBlending([
    { value: autoX, weight: autoWeight },
    { value: gestureX, weight: gestureWeight },
  ]);

  // 자동 애니메이션
  useEffect(() => {
    autoX.value = withRepeat(
      withTiming(200, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // 제스처
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 제스처 시작: 제스처 레이어 활성화
      gestureWeight.value = withTiming(1, { duration: 100 });
      autoWeight.value = withTiming(0, { duration: 100 });
    })
    .onUpdate((event) => {
      gestureX.value = event.absoluteX;
    })
    .onEnd(() => {
      // 제스처 종료: 자동 애니메이션으로 복귀
      gestureWeight.value = withTiming(0, { duration: 300 });
      autoWeight.value = withTiming(1, { duration: 300 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: blendedX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### 애니메이션 스테이트 머신

```typescript
type AnimationState = 'idle' | 'entering' | 'active' | 'exiting';

interface StateAnimations {
  [state: string]: {
    values: { [property: string]: number };
    transition?: { duration: number; easing: (t: number) => number };
  };
}

function useAnimationStateMachine(states: StateAnimations) {
  const currentState = useSharedValue<AnimationState>('idle');
  const transitionProgress = useSharedValue(1);
  const previousValues = useSharedValue(states.idle.values);
  const currentValues = useSharedValue(states.idle.values);

  const setState = (newState: AnimationState) => {
    runOnUI((state: AnimationState) => {
      'worklet';

      const prevState = currentState.value;
      if (prevState === state) return;

      // 현재 값 저장
      previousValues.value = { ...currentValues.value };

      // 새 상태로 전환
      currentState.value = state;

      const transition = states[state].transition ?? { duration: 300, easing: CustomEasings.easeOutQuad };

      transitionProgress.value = 0;
      transitionProgress.value = withTiming(1, { duration: transition.duration });
    })(newState);
  };

  // 보간된 값 계산
  const interpolatedValues = useDerivedValue(() => {
    const targetValues = states[currentState.value].values;
    const result: { [key: string]: number } = {};

    for (const key in targetValues) {
      const from = previousValues.value[key] ?? targetValues[key];
      const to = targetValues[key];
      result[key] = from + (to - from) * transitionProgress.value;
    }

    return result;
  });

  return { currentState, interpolatedValues, setState };
}

// 사용
function StateMachineExample() {
  const states: StateAnimations = {
    idle: {
      values: { scale: 1, opacity: 0.5, rotation: 0 },
    },
    entering: {
      values: { scale: 0.8, opacity: 0, rotation: -10 },
      transition: { duration: 200, easing: CustomEasings.easeOutQuad },
    },
    active: {
      values: { scale: 1.1, opacity: 1, rotation: 0 },
      transition: { duration: 300, easing: CustomEasings.easeOutBack },
    },
    exiting: {
      values: { scale: 0.9, opacity: 0, rotation: 10 },
      transition: { duration: 200, easing: CustomEasings.easeInQuad },
    },
  };

  const { interpolatedValues, setState } = useAnimationStateMachine(states);

  const animatedStyle = useAnimatedStyle(() => {
    const { scale, opacity, rotation } = interpolatedValues.value;
    return {
      opacity,
      transform: [{ scale }, { rotate: `${rotation}deg` }],
    };
  });

  return (
    <View>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Button title="Enter" onPress={() => setState('entering')} />
      <Button title="Active" onPress={() => setState('active')} />
      <Button title="Exit" onPress={() => setState('exiting')} />
    </View>
  );
}
```

## 📱 sometimes-app 적용 사례

### 매칭 카드 등장 애니메이션

```typescript
// src/features/matching/ui/card-entrance-animation.ts
interface CardEntranceConfig {
  index: number;
  total: number;
}

export function useCardEntranceAnimation({ index, total }: CardEntranceConfig) {
  const progress = useSharedValue(0);

  // 캐스케이드 딜레이 계산
  const delay = index * 80;

  // 커스텀 이징: 오버슈트 후 안착
  const customEntrance = (t: number) => {
    'worklet';

    // 3단계 이징
    if (t < 0.6) {
      // 빠르게 올라옴
      const phase1 = t / 0.6;
      return CustomEasings.easeOutQuad(phase1) * 1.15;
    } else if (t < 0.8) {
      // 살짝 오버슈트
      return 1.15;
    } else {
      // 안착
      const phase3 = (t - 0.8) / 0.2;
      return 1.15 - 0.15 * CustomEasings.easeInOutQuad(phase3);
    }
  };

  const enter = () => {
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration: 600 }));
  };

  const animatedStyle = useAnimatedStyle(() => {
    const easedProgress = customEntrance(progress.value);

    const translateY = interpolate(
      easedProgress,
      [0, 1],
      [300, 0]
    );

    const scale = interpolate(
      easedProgress,
      [0, 0.5, 1],
      [0.8, 1.05, 1]
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.3],
      [0, 1],
      'clamp'
    );

    const rotateZ = interpolate(
      easedProgress,
      [0, 0.5, 1],
      [-5, 2, 0]
    );

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
        { rotate: `${rotateZ}deg` },
      ],
    };
  });

  return { animatedStyle, enter };
}
```

### 좋아요 버튼 하트 터짐 효과

```typescript
// src/features/like/hooks/use-heart-explosion.ts
export function useHeartExplosion() {
  const phase = useSharedValue<'idle' | 'expanding' | 'contracting'>('idle');
  const progress = useSharedValue(0);

  // 복잡한 다단계 이징
  const heartEasing = (t: number, currentPhase: string) => {
    'worklet';

    if (currentPhase === 'expanding') {
      // 빠르게 커지면서 오버슈트
      return CustomEasings.easeOutBack(t);
    } else {
      // 부드럽게 원래 크기로
      return CustomEasings.easeInOutQuad(t);
    }
  };

  const trigger = () => {
    runOnUI(() => {
      'worklet';

      // 1단계: 확장
      phase.value = 'expanding';
      progress.value = 0;
      progress.value = withTiming(1, { duration: 200 }, (finished) => {
        if (finished) {
          // 2단계: 수축
          phase.value = 'contracting';
          progress.value = 0;
          progress.value = withTiming(1, { duration: 300 }, () => {
            phase.value = 'idle';
          });
        }
      });
    })();
  };

  const heartStyle = useAnimatedStyle(() => {
    let scale = 1;

    if (phase.value === 'expanding') {
      scale = 1 + heartEasing(progress.value, 'expanding') * 0.5;
    } else if (phase.value === 'contracting') {
      scale = 1.5 - heartEasing(progress.value, 'contracting') * 0.5;
    }

    return {
      transform: [{ scale }],
    };
  });

  // 파티클 방출
  const particles = useDerivedValue(() => {
    if (phase.value !== 'expanding') return [];

    const count = 8;
    const result = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = progress.value * 60;
      const particleScale = 1 - progress.value;

      result.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: particleScale,
        opacity: 1 - progress.value,
      });
    }

    return result;
  });

  return { trigger, heartStyle, particles };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 이징 함수 범위 오류

```typescript
// ❌ 0-1 범위 벗어남
const badEasing = (t: number) => {
  'worklet';
  return t * 2; // t=1일 때 2 반환
};

// ✅ 항상 0-1 범위 유지
const goodEasing = (t: number) => {
  'worklet';
  const raw = t * 2 - 0.5;
  return Math.max(0, Math.min(1, raw));
};
```

### 2. 물리 시뮬레이션 발산

```typescript
// ❌ dt가 클 때 시뮬레이션 불안정
const badStep = (dt: number) => {
  velocity += gravity * dt; // dt가 크면 발산
};

// ✅ dt 제한 + 서브스텝
const goodStep = (dt: number) => {
  const maxDt = 0.016; // 16ms 최대
  const steps = Math.ceil(dt / maxDt);
  const subDt = dt / steps;

  for (let i = 0; i < steps; i++) {
    velocity += gravity * subDt;
    position += velocity * subDt;
  }
};
```

## 💡 성능 최적화 팁

### 1. 이징 함수 캐싱

```typescript
// 자주 사용하는 베지어 곡선은 미리 계산
const cachedBezier = (() => {
  const samples: number[] = [];
  const bezier = cubicBezier(0.4, 0, 0.2, 1);

  for (let i = 0; i <= 100; i++) {
    samples[i] = bezier(i / 100);
  }

  return (t: number) => {
    'worklet';
    const index = Math.round(t * 100);
    return samples[Math.min(100, Math.max(0, index))];
  };
})();
```

### 2. 키프레임 전처리

```typescript
// 런타임 대신 빌드 타임에 계산
const preprocessedKeyframes = useMemo(() => {
  return keyframes.map((kf, i, arr) => ({
    ...kf,
    // 다음 키프레임까지의 시간 미리 계산
    nextTime: arr[i + 1]?.time ?? 1,
    duration: (arr[i + 1]?.time ?? 1) - kf.time,
  }));
}, [keyframes]);
```

## 🏋️ 연습 문제

### 과제 1: 커스텀 스프링
감쇠비를 조절할 수 있는 커스텀 스프링 애니메이션을 구현하세요.

### 과제 2: 경로 따라가기
베지어 곡선 경로를 따라 움직이는 애니메이션을 만드세요.

### 과제 3: 모프 애니메이션
여러 형태 사이를 부드럽게 전환하는 모프 애니메이션을 구현하세요.

## 📚 이 장에서 배운 내용

1. **커스텀 이징**: 수학적 이징 함수와 베지어 곡선
2. **물리 시뮬레이션**: 스프링, 중력, 마찰 시스템
3. **키프레임**: 다단계 애니메이션 보간
4. **애니메이션 합성**: 블렌딩과 스테이트 머신
5. **성능 최적화**: 캐싱과 전처리

## 다음 장 예고

**Chapter 45: 고급 제스처 워크릿**에서는 복잡한 제스처 인식과 처리를 위한 워크릿 기법을 배웁니다. 멀티 터치, 커스텀 제스처 인식기, 제스처 조합을 마스터합니다.
