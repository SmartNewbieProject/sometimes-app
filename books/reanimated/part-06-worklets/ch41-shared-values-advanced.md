# Chapter 41: Shared Values 심화

Reanimated의 핵심 데이터 구조인 Shared Values를 깊이 탐구합니다. 단순한 숫자부터 복잡한 객체까지, 스레드 간 안전한 데이터 공유의 모든 것을 알아봅니다.

## 📌 학습 목표

- Shared Values의 내부 동작 원리 이해
- 다양한 타입의 Shared Values 활용
- 파생 값(Derived Values)과 반응형 패턴
- 성능 최적화와 메모리 관리
- 복잡한 상태 동기화 패턴

## 📖 Shared Values 동작 원리

### 아키텍처 이해

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Value Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐       ┌────────────────────┐            │
│  │   JS Thread        │       │    UI Thread       │            │
│  │                    │       │                    │            │
│  │  ┌──────────────┐  │       │  ┌──────────────┐  │            │
│  │  │ SharedValue  │◄─┼───────┼──│ SharedValue  │  │            │
│  │  │  .value      │  │ 동기화 │  │  .value      │  │            │
│  │  │  (proxy)     │──┼───────┼─►│  (actual)    │  │            │
│  │  └──────────────┘  │       │  └──────────────┘  │            │
│  │                    │       │         │          │            │
│  └────────────────────┘       │         ▼          │            │
│                               │  ┌──────────────┐  │            │
│                               │  │ Animated     │  │            │
│                               │  │ Component    │  │            │
│                               │  └──────────────┘  │            │
│                               └────────────────────┘            │
│                                                                  │
│  특징:                                                           │
│  • 두 스레드에서 동시 접근 가능                                   │
│  • UI 스레드 변경이 즉시 반영                                    │
│  • JS 스레드 변경은 다음 프레임에 반영                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 기본 Shared Value 생성

```typescript
import { useSharedValue } from 'react-native-reanimated';

function Component() {
  // 숫자
  const progress = useSharedValue(0);

  // 문자열
  const status = useSharedValue('idle');

  // 불리언
  const isActive = useSharedValue(false);

  // 객체
  const position = useSharedValue({ x: 0, y: 0 });

  // 배열
  const points = useSharedValue([0, 0, 0]);

  // null/undefined
  const optional = useSharedValue<number | null>(null);
}
```

### 값 읽기/쓰기

```typescript
function Component() {
  const value = useSharedValue(0);

  // JS 스레드에서 읽기/쓰기
  const handlePress = () => {
    console.log('Current:', value.value); // 읽기
    value.value = 100; // 쓰기
  };

  // 워크릿에서 읽기/쓰기
  const animatedStyle = useAnimatedStyle(() => {
    const current = value.value; // 읽기 (UI 스레드)

    return {
      opacity: current / 100,
    };
  });

  // 워크릿에서 수정
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      value.value = event.translationX; // 쓰기 (UI 스레드)
    },
  });
}
```

## 💻 다양한 타입 활용

### 객체 타입 Shared Values

```typescript
interface AnimationState {
  phase: 'idle' | 'animating' | 'completed';
  progress: number;
  velocity: number;
  target: { x: number; y: number };
}

function useComplexAnimation() {
  const state = useSharedValue<AnimationState>({
    phase: 'idle',
    progress: 0,
    velocity: 0,
    target: { x: 0, y: 0 },
  });

  // 객체 전체 교체
  const reset = () => {
    state.value = {
      phase: 'idle',
      progress: 0,
      velocity: 0,
      target: { x: 0, y: 0 },
    };
  };

  // 워크릿에서 부분 업데이트
  const updateProgress = () => {
    'worklet';
    // 불변성 유지 - 새 객체 생성
    state.value = {
      ...state.value,
      progress: state.value.progress + 0.01,
      phase: 'animating',
    };
  };

  // 스타일에서 사용
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: state.value.progress,
      transform: [
        { translateX: state.value.target.x * state.value.progress },
        { translateY: state.value.target.y * state.value.progress },
      ],
    };
  });

  return { state, reset, animatedStyle };
}
```

### 배열 타입 Shared Values

```typescript
interface Point {
  x: number;
  y: number;
  id: string;
}

function useMultiTouch() {
  const touches = useSharedValue<Point[]>([]);

  const gestureHandler = Gesture.Pan()
    .onStart((event) => {
      // 새 터치 추가
      touches.value = [
        ...touches.value,
        {
          x: event.x,
          y: event.y,
          id: `touch-${Date.now()}`,
        },
      ];
    })
    .onUpdate((event) => {
      // 마지막 터치 업데이트
      const updated = [...touches.value];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          x: event.x,
          y: event.y,
        };
      }
      touches.value = updated;
    })
    .onEnd(() => {
      // 마지막 터치 제거
      touches.value = touches.value.slice(0, -1);
    });

  // 각 터치 포인트 렌더링
  const renderTouches = () => {
    return touches.value.map((touch, index) => (
      <TouchIndicator key={touch.id} touch={touch} index={index} />
    ));
  };

  return { gestureHandler, touches, renderTouches };
}

function TouchIndicator({
  touch,
  index,
}: {
  touch: Point;
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: touch.x - 25,
    top: touch.y - 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
  }));

  return <Animated.View style={animatedStyle} />;
}
```

### 함수를 포함한 Shared Values

```typescript
// ⚠️ 함수는 직접 저장 불가 - 대안 패턴
type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

function useConfigurableAnimation() {
  const easingType = useSharedValue<EasingFunction>('easeOut');
  const progress = useSharedValue(0);

  // 워크릿에서 이징 적용
  const applyEasing = (t: number): number => {
    'worklet';

    switch (easingType.value) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const easedProgress = applyEasing(progress.value);

    return {
      transform: [{ translateX: easedProgress * 200 }],
    };
  });

  return { easingType, progress, animatedStyle };
}
```

## 💻 useDerivedValue 심화

### 기본 파생 값

```typescript
import { useDerivedValue } from 'react-native-reanimated';

function Component() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // 두 값에서 파생
  const distance = useDerivedValue(() => {
    return Math.sqrt(x.value ** 2 + y.value ** 2);
  });

  // 조건부 파생
  const status = useDerivedValue(() => {
    if (distance.value < 50) return 'close';
    if (distance.value < 100) return 'medium';
    return 'far';
  });

  // 변환 파생
  const normalized = useDerivedValue(() => {
    const d = distance.value;
    if (d === 0) return { x: 0, y: 0 };
    return {
      x: x.value / d,
      y: y.value / d,
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: distance.value < 100 ? 1 : 0.5,
    backgroundColor: status.value === 'close' ? 'green' : 'red',
  }));
}
```

### 체인 파생 값

```typescript
function useChainedDerivations() {
  const rawValue = useSharedValue(0);

  // 1단계: 범위 제한
  const clamped = useDerivedValue(() => {
    return Math.max(0, Math.min(100, rawValue.value));
  });

  // 2단계: 정규화
  const normalized = useDerivedValue(() => {
    return clamped.value / 100;
  });

  // 3단계: 이징 적용
  const eased = useDerivedValue(() => {
    const t = normalized.value;
    return t * t * (3 - 2 * t); // smoothstep
  });

  // 4단계: 최종 스케일
  const scale = useDerivedValue(() => {
    return 0.5 + eased.value * 0.5;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: eased.value,
  }));

  return { rawValue, animatedStyle };
}
```

### 여러 소스 결합

```typescript
function useMultiSourceDerivation() {
  const scrollY = useSharedValue(0);
  const gestureX = useSharedValue(0);
  const isPressed = useSharedValue(false);
  const config = useSharedValue({
    sensitivity: 1,
    threshold: 100,
  });

  // 모든 소스를 결합한 복합 파생 값
  const complexState = useDerivedValue(() => {
    const scrollProgress = Math.min(1, scrollY.value / 300);
    const gestureInfluence = gestureX.value * config.value.sensitivity;
    const pressMultiplier = isPressed.value ? 1.2 : 1;

    const combinedValue = (scrollProgress * 100 + gestureInfluence) * pressMultiplier;

    return {
      value: combinedValue,
      isActive: combinedValue > config.value.threshold,
      phase: combinedValue < 30 ? 'start' : combinedValue < 70 ? 'middle' : 'end',
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: complexState.value.isActive ? 1 : 0.5,
    transform: [
      { translateY: -complexState.value.value * 0.5 },
      { scale: complexState.value.isActive ? 1.1 : 1 },
    ],
  }));

  return {
    scrollY,
    gestureX,
    isPressed,
    config,
    complexState,
    animatedStyle,
  };
}
```

## 💻 useAnimatedReaction 활용

### 값 변화 감지

```typescript
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';

function useValueWatcher() {
  const value = useSharedValue(0);
  const [jsValue, setJsValue] = useState(0);

  // 값이 변할 때마다 JS 스레드에 동기화
  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setJsValue)(current);
      }
    }
  );

  return { value, jsValue };
}
```

### 임계값 감지

```typescript
function useThresholdDetector(
  value: SharedValue<number>,
  threshold: number,
  onCross: (direction: 'up' | 'down') => void
) {
  const wasAbove = useSharedValue(value.value > threshold);

  useAnimatedReaction(
    () => value.value > threshold,
    (isAbove, wasAbovePrev) => {
      if (isAbove !== wasAbovePrev) {
        runOnJS(onCross)(isAbove ? 'up' : 'down');
      }
    }
  );
}

// 사용
function ScrollIndicator() {
  const scrollY = useSharedValue(0);

  useThresholdDetector(scrollY, 100, (direction) => {
    console.log(`Crossed 100px going ${direction}`);

    if (direction === 'down') {
      // 헤더 숨기기
    } else {
      // 헤더 보이기
    }
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return <Animated.ScrollView onScroll={scrollHandler} />;
}
```

### 복잡한 상태 전이

```typescript
type AnimationPhase = 'idle' | 'entering' | 'active' | 'exiting';

function usePhaseTransitions() {
  const phase = useSharedValue<AnimationPhase>('idle');
  const progress = useSharedValue(0);

  // 상태 전이 로직
  useAnimatedReaction(
    () => ({ phase: phase.value, progress: progress.value }),
    (current, previous) => {
      // entering → active (진입 완료)
      if (current.phase === 'entering' && current.progress >= 1) {
        phase.value = 'active';
        progress.value = 0;
      }

      // exiting → idle (퇴장 완료)
      if (current.phase === 'exiting' && current.progress >= 1) {
        phase.value = 'idle';
        progress.value = 0;
      }

      // 로깅
      if (current.phase !== previous?.phase) {
        runOnJS(console.log)(`Phase changed: ${previous?.phase} → ${current.phase}`);
      }
    }
  );

  const enter = () => {
    phase.value = 'entering';
    progress.value = withTiming(1, { duration: 300 });
  };

  const exit = () => {
    phase.value = 'exiting';
    progress.value = withTiming(1, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 0;
    let scale = 0.8;

    switch (phase.value) {
      case 'idle':
        opacity = 0;
        scale = 0.8;
        break;
      case 'entering':
        opacity = progress.value;
        scale = 0.8 + progress.value * 0.2;
        break;
      case 'active':
        opacity = 1;
        scale = 1;
        break;
      case 'exiting':
        opacity = 1 - progress.value;
        scale = 1 - progress.value * 0.2;
        break;
    }

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return { phase, enter, exit, animatedStyle };
}
```

## 💻 성능 최적화 패턴

### 불필요한 업데이트 방지

```typescript
// ❌ 매 프레임 객체 재생성
const badStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: position.value.x }, // position 객체 전체 비교
      { translateY: position.value.y },
    ],
  };
});

// ✅ 개별 값으로 분리
const x = useSharedValue(0);
const y = useSharedValue(0);

const goodStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: x.value },
      { translateY: y.value },
    ],
  };
});
```

### 조건부 계산 최소화

```typescript
// ❌ 항상 모든 계산 수행
const expensiveStyle = useAnimatedStyle(() => {
  const scale = calculateExpensiveScale(progress.value);
  const rotation = calculateExpensiveRotation(progress.value);
  const color = calculateExpensiveColor(progress.value);

  // 보이지 않을 때도 계산
  return {
    opacity: isVisible.value ? 1 : 0,
    transform: [{ scale }, { rotate: `${rotation}deg` }],
    backgroundColor: color,
  };
});

// ✅ 조건부 계산
const efficientStyle = useAnimatedStyle(() => {
  if (!isVisible.value) {
    return { opacity: 0 };
  }

  // 보일 때만 계산
  const scale = calculateExpensiveScale(progress.value);
  const rotation = calculateExpensiveRotation(progress.value);
  const color = calculateExpensiveColor(progress.value);

  return {
    opacity: 1,
    transform: [{ scale }, { rotate: `${rotation}deg` }],
    backgroundColor: color,
  };
});
```

### 값 변경 디바운싱

```typescript
function useDebouncedValue(
  source: SharedValue<number>,
  delay: number
) {
  const debounced = useSharedValue(source.value);
  const timeout = useSharedValue<number | null>(null);

  useAnimatedReaction(
    () => source.value,
    (current) => {
      // 기존 타임아웃 취소
      if (timeout.value !== null) {
        cancelAnimation(debounced);
      }

      // 새 디바운스 설정
      debounced.value = withDelay(delay, withTiming(current, { duration: 0 }));
    }
  );

  return debounced;
}
```

### 메모이제이션 패턴

```typescript
function useAnimatedMemo<T>(
  factory: () => T,
  dependencies: SharedValue<any>[]
): SharedValue<T> {
  const cached = useSharedValue<T>(factory());
  const lastDeps = useSharedValue<any[]>(dependencies.map(d => d.value));

  useAnimatedReaction(
    () => dependencies.map(d => d.value),
    (current, previous) => {
      // 의존성 변경 체크
      let changed = false;
      for (let i = 0; i < current.length; i++) {
        if (current[i] !== previous?.[i]) {
          changed = true;
          break;
        }
      }

      if (changed) {
        cached.value = factory();
      }
    }
  );

  return cached;
}

// 사용
function Component() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const distance = useAnimatedMemo(
    () => {
      'worklet';
      return Math.sqrt(x.value ** 2 + y.value ** 2);
    },
    [x, y]
  );
}
```

## 💻 고급 패턴

### 상태 머신 구현

```typescript
type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 'START' | 'SUCCESS' | 'FAILURE' | 'RESET';

interface StateMachine {
  current: SharedValue<State>;
  send: (event: Event) => void;
}

function useAnimatedStateMachine(initial: State): StateMachine {
  const current = useSharedValue<State>(initial);

  const transitions: Record<State, Partial<Record<Event, State>>> = {
    idle: { START: 'loading' },
    loading: { SUCCESS: 'success', FAILURE: 'error' },
    success: { RESET: 'idle' },
    error: { RESET: 'idle', START: 'loading' },
  };

  const send = (event: Event) => {
    const nextState = transitions[current.value][event];
    if (nextState) {
      current.value = nextState;
    }
  };

  return { current, send };
}

// 사용
function LoadingButton() {
  const machine = useAnimatedStateMachine('idle');

  const buttonStyle = useAnimatedStyle(() => {
    const state = machine.current.value;

    return {
      backgroundColor:
        state === 'loading' ? '#9CA3AF' :
        state === 'success' ? '#10B981' :
        state === 'error' ? '#EF4444' : '#7A4AE2',
      opacity: state === 'loading' ? 0.7 : 1,
    };
  });

  const handlePress = async () => {
    machine.send('START');
    try {
      await apiCall();
      machine.send('SUCCESS');
    } catch {
      machine.send('FAILURE');
    }
  };

  return (
    <Animated.View style={buttonStyle}>
      <StateIndicator state={machine.current} />
    </Animated.View>
  );
}
```

### 옵저버 패턴

```typescript
type Observer<T> = (value: T) => void;

function createSharedObservable<T>(initial: T) {
  const value = useSharedValue(initial);
  const observers: Observer<T>[] = [];

  const subscribe = (observer: Observer<T>) => {
    observers.push(observer);
    return () => {
      const index = observers.indexOf(observer);
      if (index > -1) observers.splice(index, 1);
    };
  };

  const set = (newValue: T) => {
    value.value = newValue;
  };

  useAnimatedReaction(
    () => value.value,
    (current) => {
      observers.forEach(observer => {
        runOnJS(observer)(current);
      });
    }
  );

  return { value, subscribe, set };
}
```

### 히스토리 추적

```typescript
function useSharedValueHistory<T>(
  value: SharedValue<T>,
  maxHistory: number = 10
) {
  const history = useSharedValue<T[]>([value.value]);
  const pointer = useSharedValue(0);

  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      if (current !== previous) {
        const newHistory = history.value.slice(0, pointer.value + 1);
        newHistory.push(current);

        // 최대 길이 유지
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        } else {
          pointer.value = newHistory.length - 1;
        }

        history.value = newHistory;
      }
    }
  );

  const undo = () => {
    'worklet';
    if (pointer.value > 0) {
      pointer.value -= 1;
      value.value = history.value[pointer.value];
    }
  };

  const redo = () => {
    'worklet';
    if (pointer.value < history.value.length - 1) {
      pointer.value += 1;
      value.value = history.value[pointer.value];
    }
  };

  const canUndo = useDerivedValue(() => pointer.value > 0);
  const canRedo = useDerivedValue(() => pointer.value < history.value.length - 1);

  return { undo, redo, canUndo, canRedo };
}
```

## 📱 sometimes-app 적용 사례

### 매칭 카드 스와이프 상태 관리

```typescript
// src/features/matching/hooks/use-swipe-state.ts
import { useSharedValue, useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

interface CardState {
  translateX: number;
  translateY: number;
  rotation: number;
  scale: number;
}

interface SwipeDecision {
  direction: 'left' | 'right' | 'up' | null;
  confidence: number;
}

export function useSwipeState(onSwipeComplete: (direction: 'left' | 'right' | 'up') => void) {
  // 기본 제스처 값
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 파생 회전값 (X 이동에 비례)
  const rotation = useDerivedValue(() => {
    return translateX.value * 0.1; // 10도 = 100px
  });

  // 스와이프 결정 로직
  const decision = useDerivedValue<SwipeDecision>(() => {
    const x = translateX.value;
    const y = translateY.value;

    const absX = Math.abs(x);
    const absY = Math.abs(y);

    // 임계값
    const HORIZONTAL_THRESHOLD = 120;
    const VERTICAL_THRESHOLD = 100;

    // 수직 스와이프 (슈퍼라이크)
    if (y < -VERTICAL_THRESHOLD && absY > absX) {
      return {
        direction: 'up',
        confidence: Math.min(1, absY / (VERTICAL_THRESHOLD * 2)),
      };
    }

    // 수평 스와이프
    if (absX > HORIZONTAL_THRESHOLD) {
      return {
        direction: x > 0 ? 'right' : 'left',
        confidence: Math.min(1, absX / (HORIZONTAL_THRESHOLD * 2)),
      };
    }

    return { direction: null, confidence: 0 };
  });

  // 오버레이 표시 상태
  const overlayState = useDerivedValue(() => {
    const d = decision.value;

    return {
      likeOpacity: d.direction === 'right' ? d.confidence : 0,
      nopeOpacity: d.direction === 'left' ? d.confidence : 0,
      superLikeOpacity: d.direction === 'up' ? d.confidence : 0,
    };
  });

  // 스와이프 완료 감지
  useAnimatedReaction(
    () => decision.value,
    (current, previous) => {
      if (current.direction && current.confidence >= 0.8) {
        if (!previous?.direction || previous.confidence < 0.8) {
          // 햅틱 피드백
          runOnJS(triggerHaptic)('medium');
        }
      }
    }
  );

  // 카드 스타일
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // 오버레이 스타일들
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayState.value.likeOpacity,
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayState.value.nopeOpacity,
  }));

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayState.value.superLikeOpacity,
  }));

  // 스와이프 실행
  const executeSwipe = (direction: 'left' | 'right' | 'up') => {
    'worklet';

    const targetX = direction === 'left' ? -500 : direction === 'right' ? 500 : 0;
    const targetY = direction === 'up' ? -600 : 0;

    translateX.value = withSpring(targetX, { damping: 20 }, () => {
      runOnJS(onSwipeComplete)(direction);
    });

    translateY.value = withSpring(targetY, { damping: 20 });
  };

  // 원위치 복귀
  const resetPosition = () => {
    'worklet';
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
  };

  return {
    translateX,
    translateY,
    decision,
    cardStyle,
    likeOverlayStyle,
    nopeOverlayStyle,
    superLikeOverlayStyle,
    executeSwipe,
    resetPosition,
  };
}
```

### 채팅 타이핑 인디케이터

```typescript
// src/features/chat/hooks/use-typing-indicator.ts
export function useTypingIndicator() {
  const isTyping = useSharedValue(false);
  const progress = useSharedValue(0);

  // 타이핑 상태에 따른 애니메이션
  useAnimatedReaction(
    () => isTyping.value,
    (typing) => {
      if (typing) {
        // 반복 애니메이션 시작
        progress.value = 0;
        progress.value = withRepeat(
          withTiming(1, { duration: 1200 }),
          -1,
          false
        );
      } else {
        cancelAnimation(progress);
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  );

  // 각 점의 스타일 (3개)
  const dotStyles = [0, 1, 2].map((index) =>
    useAnimatedStyle(() => {
      const delay = index * 0.2;
      const adjustedProgress = (progress.value - delay + 1) % 1;

      const y = Math.sin(adjustedProgress * Math.PI) * -8;
      const opacity = 0.3 + Math.sin(adjustedProgress * Math.PI) * 0.7;

      return {
        transform: [{ translateY: y }],
        opacity,
      };
    })
  );

  const containerStyle = useAnimatedStyle(() => ({
    opacity: isTyping.value ? 1 : 0,
    transform: [
      { scale: isTyping.value ? 1 : 0.8 },
    ],
  }));

  return {
    isTyping,
    dotStyles,
    containerStyle,
    setTyping: (value: boolean) => {
      isTyping.value = value;
    },
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 객체 참조 비교 문제

```typescript
// ❌ 객체 전체가 항상 새로 생성되어 불필요한 업데이트
const position = useSharedValue({ x: 0, y: 0 });

useAnimatedReaction(
  () => position.value, // 객체 참조 비교
  (current, previous) => {
    // 값이 같아도 항상 트리거됨
  }
);

// ✅ 특정 필드만 비교
useAnimatedReaction(
  () => ({ x: position.value.x, y: position.value.y }),
  (current, previous) => {
    if (current.x !== previous?.x || current.y !== previous?.y) {
      // 실제로 변경된 경우만 처리
    }
  }
);
```

### 2. 순환 의존성

```typescript
// ❌ 순환 참조로 무한 루프
const a = useSharedValue(0);
const b = useDerivedValue(() => a.value + 1);

useAnimatedReaction(
  () => b.value,
  (value) => {
    a.value = value; // b가 변하면 a가 변하고, a가 변하면 b가 변함
  }
);

// ✅ 명확한 단방향 흐름
const source = useSharedValue(0);
const derived = useDerivedValue(() => source.value * 2);
// derived는 source에만 의존, source는 외부에서만 변경
```

## 💡 성능 최적화 팁

### 1. Shared Value 개수 최소화

```typescript
// ❌ 너무 많은 개별 값
const x = useSharedValue(0);
const y = useSharedValue(0);
const scale = useSharedValue(1);
const rotation = useSharedValue(0);
const opacity = useSharedValue(1);
// ... 더 많은 값들

// ✅ 관련 값을 객체로 그룹화
const transform = useSharedValue({
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
});

const appearance = useSharedValue({
  opacity: 1,
  backgroundColor: '#FFF',
});
```

### 2. 파생 값 캐싱

```typescript
// ❌ 매번 계산
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: calculateComplexX(input.value) },
      { translateY: calculateComplexY(input.value) },
    ],
  };
});

// ✅ useDerivedValue로 캐싱
const calculatedX = useDerivedValue(() => calculateComplexX(input.value));
const calculatedY = useDerivedValue(() => calculateComplexY(input.value));

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: calculatedX.value },
    { translateY: calculatedY.value },
  ],
}));
```

## 🏋️ 연습 문제

### 과제 1: 다중 값 동기화
여러 Shared Values를 동기화하는 커스텀 훅을 구현하세요.

### 과제 2: 상태 영속성
Shared Value의 상태를 AsyncStorage에 저장하고 복원하는 기능을 구현하세요.

### 과제 3: 값 보간 히스토리
시간에 따른 값 변화를 기록하고 재생하는 시스템을 만드세요.

## 📚 이 장에서 배운 내용

1. **Shared Value 내부 구조**: 두 스레드 간 동기화 메커니즘
2. **다양한 타입**: 객체, 배열, 조건부 타입 활용
3. **파생 값**: useDerivedValue로 계산 값 생성
4. **반응형 패턴**: useAnimatedReaction으로 변화 감지
5. **고급 패턴**: 상태 머신, 옵저버, 히스토리 추적

## 다음 장 예고

**Chapter 42: useFrameCallback과 시간 기반 애니메이션**에서는 프레임 단위로 실행되는 콜백을 활용해 물리 시뮬레이션, 게임 루프, 실시간 효과를 구현합니다.
