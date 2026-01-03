# Chapter 77: 타이밍 이슈

애니메이션 타이밍은 사용자 경험의 품질을 결정하는 핵심 요소입니다. 이 장에서는 애니메이션 타이밍 동기화 문제를 진단하고 해결하는 방법을 배웁니다.

## 📌 학습 목표

- 애니메이션 타이밍 동기화 문제 이해
- 시퀀스와 병렬 애니메이션 조율
- 레이스 컨디션 방지 기법
- 지연 처리와 디바운싱

## 📖 타이밍 문제의 원인

```
┌─────────────────────────────────────────────────────────────┐
│                  타이밍 이슈 분류                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 동기화 문제          2. 레이스 컨디션                      │
│  ┌─────────────┐        ┌─────────────┐                    │
│  │ Animation A │        │ Animation A │──┐                 │
│  │    ───────  │        │    ───────  │  │ 동시 완료?      │
│  │ Animation B │        │ Animation B │──┘                 │
│  │  ─────      │ 불일치  │      ───── │                    │
│  └─────────────┘        └─────────────┘                    │
│                                                             │
│  3. 순서 문제            4. 중단 문제                         │
│  ┌─────────────┐        ┌─────────────┐                    │
│  │ 1 → 2 → 3   │        │ ──X         │ 갑작스런 중단       │
│  │ 1 → 3 → 2   │ 역전!  │   └──→ 점프 │                    │
│  └─────────────┘        └─────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제 1: 시퀀스 애니메이션 동기화

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

// ❌ 문제: 콜백 타이밍이 맞지 않음
function BrokenSequence() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const startAnimation = () => {
    // 두 애니메이션이 독립적으로 실행
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 500 });

    // 300ms 후에 실행되지만 scale은 아직 진행 중!
    setTimeout(() => {
      console.log('Animation complete?'); // 실제로는 미완료
    }, 300);
  };

  return null;
}

// ✅ 해결: 통합 시퀀스 관리
function useSequenceAnimation() {
  const progress = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const currentStep = useSharedValue(0);

  const steps = useSharedValue<AnimationStep[]>([]);

  interface AnimationStep {
    target: number;
    duration: number;
    delay?: number;
    onStart?: () => void;
    onComplete?: () => void;
  }

  const runSequence = (
    animationSteps: AnimationStep[],
    onSequenceComplete?: () => void
  ) => {
    'worklet';

    if (isAnimating.value) {
      console.warn('Animation already in progress');
      return;
    }

    isAnimating.value = true;
    currentStep.value = 0;
    steps.value = animationSteps;

    const executeStep = (stepIndex: number) => {
      'worklet';

      if (stepIndex >= animationSteps.length) {
        isAnimating.value = false;
        if (onSequenceComplete) {
          runOnJS(onSequenceComplete)();
        }
        return;
      }

      const step = animationSteps[stepIndex];

      if (step.onStart) {
        runOnJS(step.onStart)();
      }

      const delay = step.delay || 0;

      progress.value = withDelay(
        delay,
        withTiming(step.target, { duration: step.duration }, (finished) => {
          if (finished) {
            currentStep.value = stepIndex + 1;

            if (step.onComplete) {
              runOnJS(step.onComplete)();
            }

            executeStep(stepIndex + 1);
          }
        })
      );
    };

    executeStep(0);
  };

  const cancelSequence = () => {
    'worklet';
    isAnimating.value = false;
    cancelAnimation(progress);
  };

  return {
    progress,
    currentStep,
    isAnimating,
    runSequence,
    cancelSequence,
  };
}

// 사용 예시
function SequencedEntrance() {
  const { progress, currentStep, runSequence } = useSequenceAnimation();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.3], [0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(progress.value, [0, 0.3, 0.6], [50, 0, 0]);
    const scale = interpolate(progress.value, [0.3, 0.6, 1], [0.8, 1, 1], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const startEntrance = () => {
    runSequence([
      { target: 0.3, duration: 200, onStart: () => console.log('Fade in') },
      { target: 0.6, duration: 300, onStart: () => console.log('Scale up') },
      { target: 1.0, duration: 200, onStart: () => console.log('Settle') },
    ], () => {
      console.log('Entrance complete!');
    });
  };

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      <Text>Step: {currentStep.value}</Text>
    </Animated.View>
  );
}
```

## 💻 코드 예제 2: 병렬 애니메이션 동기화

```typescript
import { useCallback, useRef } from 'react';

interface ParallelAnimationConfig {
  animations: {
    value: Animated.SharedValue<number>;
    target: number;
    duration: number;
    easing?: (t: number) => number;
  }[];
  onAllComplete?: () => void;
  onAnyComplete?: (index: number) => void;
}

function useParallelAnimation() {
  const completedCount = useSharedValue(0);
  const totalAnimations = useSharedValue(0);
  const isRunning = useSharedValue(false);

  const runParallel = (config: ParallelAnimationConfig) => {
    'worklet';

    const { animations, onAllComplete, onAnyComplete } = config;

    completedCount.value = 0;
    totalAnimations.value = animations.length;
    isRunning.value = true;

    animations.forEach((anim, index) => {
      anim.value.value = withTiming(
        anim.target,
        {
          duration: anim.duration,
          easing: anim.easing || Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            completedCount.value += 1;

            if (onAnyComplete) {
              runOnJS(onAnyComplete)(index);
            }

            if (completedCount.value === totalAnimations.value) {
              isRunning.value = false;
              if (onAllComplete) {
                runOnJS(onAllComplete)();
              }
            }
          }
        }
      );
    });
  };

  // 가장 긴 애니메이션 기준으로 동기화
  const runParallelSynced = (config: ParallelAnimationConfig) => {
    'worklet';

    const { animations, onAllComplete } = config;
    const maxDuration = Math.max(...animations.map(a => a.duration));

    isRunning.value = true;

    animations.forEach((anim) => {
      // 모든 애니메이션을 같은 duration으로 정규화
      anim.value.value = withTiming(
        anim.target,
        {
          duration: maxDuration,
          easing: anim.easing || Easing.out(Easing.cubic),
        }
      );
    });

    // 단일 완료 콜백
    const primaryAnim = animations[0];
    primaryAnim.value.value = withTiming(
      primaryAnim.target,
      { duration: maxDuration },
      (finished) => {
        if (finished) {
          isRunning.value = false;
          if (onAllComplete) {
            runOnJS(onAllComplete)();
          }
        }
      }
    );
  };

  return {
    completedCount,
    totalAnimations,
    isRunning,
    runParallel,
    runParallelSynced,
  };
}

// 실전 예시: 카드 플립 애니메이션
function CardFlipAnimation() {
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.2);

  const { runParallel, isRunning } = useParallelAnimation();

  const flipCard = () => {
    if (isRunning.value) return;

    runParallel({
      animations: [
        { value: rotateY, target: 180, duration: 600 },
        { value: scale, target: 1.1, duration: 300 },
        { value: shadowOpacity, target: 0.4, duration: 300 },
      ],
      onAnyComplete: (index) => {
        // scale과 shadow는 중간에 복귀
        if (index === 1) {
          scale.value = withTiming(1, { duration: 300 });
        }
        if (index === 2) {
          shadowOpacity.value = withTiming(0.2, { duration: 300 });
        }
      },
      onAllComplete: () => {
        console.log('Flip complete!');
      },
    });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
    backfaceVisibility: 'hidden',
    shadowOpacity: shadowOpacity.value,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value + 180}deg` },
      { scale: scale.value },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
  }));

  return (
    <Pressable onPress={flipCard}>
      <Animated.View style={[styles.card, frontStyle]}>
        <Text>Front</Text>
      </Animated.View>
      <Animated.View style={[styles.card, backStyle]}>
        <Text>Back</Text>
      </Animated.View>
    </Pressable>
  );
}
```

## 💻 코드 예제 3: 레이스 컨디션 방지

```typescript
// ❌ 문제: 레이스 컨디션 발생
function RaceConditionProblem() {
  const position = useSharedValue(0);

  const moveLeft = () => {
    position.value = withTiming(-100, { duration: 300 });
  };

  const moveRight = () => {
    position.value = withTiming(100, { duration: 300 });
  };

  // 빠르게 연속 호출 시 애니메이션 충돌!
  return (
    <View>
      <Button onPress={moveLeft} title="Left" />
      <Button onPress={moveRight} title="Right" />
    </View>
  );
}

// ✅ 해결: 애니메이션 상태 관리
function useAnimationLock() {
  const isLocked = useSharedValue(false);
  const currentAnimation = useSharedValue<string | null>(null);
  const pendingAnimation = useSharedValue<(() => void) | null>(null);

  const acquireLock = (animationId: string): boolean => {
    'worklet';

    if (isLocked.value) {
      return false;
    }

    isLocked.value = true;
    currentAnimation.value = animationId;
    return true;
  };

  const releaseLock = () => {
    'worklet';

    isLocked.value = false;
    currentAnimation.value = null;

    // 대기 중인 애니메이션 실행
    if (pendingAnimation.value) {
      const pending = pendingAnimation.value;
      pendingAnimation.value = null;
      pending();
    }
  };

  const queueAnimation = (animation: () => void) => {
    'worklet';
    pendingAnimation.value = animation;
  };

  return {
    isLocked,
    currentAnimation,
    acquireLock,
    releaseLock,
    queueAnimation,
  };
}

// 개선된 버전
function SafeAnimationController() {
  const position = useSharedValue(0);
  const { isLocked, acquireLock, releaseLock, queueAnimation } = useAnimationLock();

  const animateTo = (target: number, id: string) => {
    'worklet';

    const execute = () => {
      'worklet';

      if (!acquireLock(id)) {
        // 락 획득 실패 시 대기열에 추가
        queueAnimation(() => animateTo(target, id));
        return;
      }

      position.value = withTiming(target, { duration: 300 }, (finished) => {
        if (finished) {
          releaseLock();
        }
      });
    };

    execute();
  };

  const moveLeft = () => runOnUI(animateTo)(-100, 'moveLeft');
  const moveRight = () => runOnUI(animateTo)(100, 'moveRight');

  return (
    <View>
      <Button onPress={moveLeft} title="Left" disabled={isLocked.value} />
      <Button onPress={moveRight} title="Right" disabled={isLocked.value} />
    </View>
  );
}

// 더 고급: 인터럽트 가능한 애니메이션
function useInterruptibleAnimation<T extends number>(initialValue: T) {
  const value = useSharedValue(initialValue);
  const targetValue = useSharedValue(initialValue);
  const animationId = useSharedValue(0);

  const animateTo = (
    target: T,
    config?: { duration?: number; easing?: (t: number) => number },
    onComplete?: (interrupted: boolean) => void
  ) => {
    'worklet';

    // 새 애니메이션 시작 전 현재 위치 캡처
    const currentPosition = value.value;
    const myId = ++animationId.value;
    targetValue.value = target;

    // 남은 거리 기반으로 duration 계산
    const totalDistance = Math.abs(target - initialValue);
    const remainingDistance = Math.abs(target - currentPosition);
    const ratio = remainingDistance / totalDistance;

    const baseDuration = config?.duration || 300;
    const adjustedDuration = baseDuration * ratio;

    value.value = withTiming(
      target,
      {
        duration: adjustedDuration,
        easing: config?.easing || Easing.out(Easing.cubic),
      },
      (finished) => {
        // 현재 애니메이션이 최신인지 확인
        const wasInterrupted = animationId.value !== myId;

        if (onComplete) {
          runOnJS(onComplete)(wasInterrupted);
        }
      }
    );
  };

  const snapTo = (target: T) => {
    'worklet';
    animationId.value++;
    targetValue.value = target;
    value.value = target;
  };

  return {
    value,
    targetValue,
    animateTo,
    snapTo,
  };
}
```

## 💻 코드 예제 4: 디바운스와 스로틀

```typescript
import { useCallback, useRef } from 'react';

// Worklet-safe 디바운스
function useAnimationDebounce(delay: number = 100) {
  const timeoutId = useSharedValue<number | null>(null);
  const lastCallTime = useSharedValue(0);

  const debounce = (callback: () => void) => {
    'worklet';

    const now = Date.now();

    // 이전 타임아웃 취소
    if (timeoutId.value !== null) {
      // Reanimated에서는 setTimeout 대신 withDelay 사용
      return;
    }

    lastCallTime.value = now;

    // withDelay를 사용한 디바운스 구현
    const dummyValue = useSharedValue(0);
    dummyValue.value = withDelay(
      delay,
      withTiming(1, { duration: 0 }, () => {
        if (Date.now() - lastCallTime.value >= delay) {
          callback();
        }
      })
    );
  };

  return debounce;
}

// 더 실용적인 디바운스 훅
function useDebouncedAnimation() {
  const pendingValue = useSharedValue<number | null>(null);
  const isDebouncing = useSharedValue(false);
  const debounceTimer = useSharedValue(0);

  const debouncedAnimate = (
    targetValue: Animated.SharedValue<number>,
    newValue: number,
    debounceMs: number = 100,
    animationConfig?: { duration?: number }
  ) => {
    'worklet';

    pendingValue.value = newValue;
    debounceTimer.value++;
    const myTimer = debounceTimer.value;

    if (!isDebouncing.value) {
      isDebouncing.value = true;

      // 짧은 딜레이 후 최신 값으로 애니메이션
      const checkValue = useSharedValue(0);
      checkValue.value = withDelay(
        debounceMs,
        withTiming(1, { duration: 0 }, () => {
          if (myTimer === debounceTimer.value && pendingValue.value !== null) {
            targetValue.value = withTiming(
              pendingValue.value,
              { duration: animationConfig?.duration || 200 },
              () => {
                isDebouncing.value = false;
                pendingValue.value = null;
              }
            );
          }
        })
      );
    }
  };

  return { debouncedAnimate, isDebouncing };
}

// 스로틀링된 제스처 핸들러
function useThrottledGesture(throttleMs: number = 16) {
  const lastUpdateTime = useSharedValue(0);

  const throttledUpdate = (
    callback: (value: number) => void,
    value: number
  ) => {
    'worklet';

    const now = Date.now();

    if (now - lastUpdateTime.value >= throttleMs) {
      lastUpdateTime.value = now;
      callback(value);
    }
  };

  return throttledUpdate;
}

// 실전 예시: 스크롤 기반 헤더 애니메이션
function ThrottledScrollHeader() {
  const scrollY = useSharedValue(0);
  const headerTranslate = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const throttledUpdate = useThrottledGesture(16); // 60fps

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const delta = currentY - lastScrollY.value;

      throttledUpdate((d) => {
        // 헤더 숨기기/보이기 로직
        const newTranslate = Math.max(
          -100,
          Math.min(0, headerTranslate.value - d)
        );

        headerTranslate.value = withTiming(newTranslate, {
          duration: 100,
          easing: Easing.out(Easing.quad),
        });
      }, delta);

      lastScrollY.value = currentY;
      scrollY.value = currentY;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text>Header</Text>
      </Animated.View>

      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* Content */}
      </Animated.ScrollView>
    </View>
  );
}
```

## 💻 코드 예제 5: 타이밍 디버거

```typescript
// 애니메이션 타이밍 분석 도구
interface TimingEvent {
  id: string;
  type: 'start' | 'update' | 'complete' | 'cancel';
  timestamp: number;
  value: number;
  duration?: number;
}

function useAnimationTimingDebugger() {
  const events = useSharedValue<TimingEvent[]>([]);
  const startTimes = useSharedValue<Record<string, number>>({});

  const recordStart = (id: string, value: number, expectedDuration: number) => {
    'worklet';

    const now = Date.now();
    startTimes.value = { ...startTimes.value, [id]: now };

    events.value = [
      ...events.value,
      {
        id,
        type: 'start',
        timestamp: now,
        value,
        duration: expectedDuration,
      },
    ];
  };

  const recordUpdate = (id: string, value: number) => {
    'worklet';

    events.value = [
      ...events.value,
      {
        id,
        type: 'update',
        timestamp: Date.now(),
        value,
      },
    ];
  };

  const recordComplete = (id: string, value: number) => {
    'worklet';

    const startTime = startTimes.value[id];
    const actualDuration = startTime ? Date.now() - startTime : 0;

    events.value = [
      ...events.value,
      {
        id,
        type: 'complete',
        timestamp: Date.now(),
        value,
        duration: actualDuration,
      },
    ];
  };

  const getTimeline = () => {
    return events.value;
  };

  const analyzeOverlaps = () => {
    const timeline = events.value;
    const overlaps: { anim1: string; anim2: string; overlapMs: number }[] = [];

    // 시작-완료 쌍 찾기
    const animations = new Map<string, { start: number; end: number }>();

    timeline.forEach(event => {
      if (event.type === 'start') {
        animations.set(event.id, { start: event.timestamp, end: 0 });
      } else if (event.type === 'complete') {
        const anim = animations.get(event.id);
        if (anim) {
          anim.end = event.timestamp;
        }
      }
    });

    // 오버랩 분석
    const animList = Array.from(animations.entries());
    for (let i = 0; i < animList.length; i++) {
      for (let j = i + 1; j < animList.length; j++) {
        const [id1, range1] = animList[i];
        const [id2, range2] = animList[j];

        const overlapStart = Math.max(range1.start, range2.start);
        const overlapEnd = Math.min(range1.end, range2.end);

        if (overlapStart < overlapEnd) {
          overlaps.push({
            anim1: id1,
            anim2: id2,
            overlapMs: overlapEnd - overlapStart,
          });
        }
      }
    }

    return overlaps;
  };

  const reset = () => {
    events.value = [];
    startTimes.value = {};
  };

  return {
    recordStart,
    recordUpdate,
    recordComplete,
    getTimeline,
    analyzeOverlaps,
    reset,
  };
}

// 타이밍 시각화 컴포넌트
function AnimationTimeline({ events }: { events: TimingEvent[] }) {
  const minTime = Math.min(...events.map(e => e.timestamp));
  const maxTime = Math.max(...events.map(e => e.timestamp));
  const range = maxTime - minTime || 1;

  // 애니메이션 ID별로 그룹화
  const grouped = events.reduce((acc, event) => {
    if (!acc[event.id]) acc[event.id] = [];
    acc[event.id].push(event);
    return acc;
  }, {} as Record<string, TimingEvent[]>);

  return (
    <View style={styles.timeline}>
      <Text style={styles.timelineTitle}>Animation Timeline</Text>

      {Object.entries(grouped).map(([id, eventList], index) => (
        <View key={id} style={styles.timelineRow}>
          <Text style={styles.animId}>{id}</Text>

          <View style={styles.timelineTrack}>
            {eventList.map((event, i) => {
              const left = ((event.timestamp - minTime) / range) * 100;

              return (
                <View
                  key={i}
                  style={[
                    styles.timelineEvent,
                    {
                      left: `${left}%`,
                      backgroundColor: getEventColor(event.type),
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      ))}

      {/* 시간 축 */}
      <View style={styles.timeAxis}>
        <Text>0ms</Text>
        <Text>{Math.round(range)}ms</Text>
      </View>
    </View>
  );
}

function getEventColor(type: TimingEvent['type']): string {
  switch (type) {
    case 'start': return '#4CAF50';
    case 'update': return '#2196F3';
    case 'complete': return '#9C27B0';
    case 'cancel': return '#F44336';
    default: return '#999';
  }
}
```

## 📱 sometimes-app 적용 사례

### 매칭 카드 스와이프 시퀀스

```typescript
// src/features/matching/hooks/use-card-swipe-sequence.ts
import { useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Haptics } from '@/src/shared/libs/haptics';

interface SwipeResult {
  direction: 'left' | 'right';
  velocity: number;
}

export function useCardSwipeSequence() {
  // 카드 스택 상태
  const cards = useSharedValue<string[]>([]);
  const currentIndex = useSharedValue(0);

  // 애니메이션 상태
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 다음 카드 상태
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.8);

  // 타이밍 관리
  const isAnimating = useSharedValue(false);
  const swipeStartTime = useSharedValue(0);

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
  const SWIPE_OUT_DURATION = 300;
  const RESET_DURATION = 200;
  const NEXT_CARD_DURATION = 250;

  const triggerHaptic = (type: 'light' | 'medium' | 'success') => {
    Haptics.impact(type);
  };

  const executeSwipe = (result: SwipeResult, onComplete: () => void) => {
    'worklet';

    if (isAnimating.value) return;
    isAnimating.value = true;
    swipeStartTime.value = Date.now();

    const direction = result.direction === 'right' ? 1 : -1;
    const targetX = direction * SCREEN_WIDTH * 1.5;
    const targetRotate = direction * 30;

    // 단계 1: 현재 카드 날리기 (동시에 여러 속성)
    translateX.value = withSpring(
      targetX,
      {
        velocity: result.velocity,
        stiffness: 100,
        damping: 15,
      }
    );

    rotate.value = withSpring(targetRotate, {
      velocity: result.velocity * 0.1,
      stiffness: 100,
      damping: 15,
    });

    opacity.value = withTiming(0, { duration: SWIPE_OUT_DURATION });

    // 단계 2: 다음 카드 올리기 (약간의 딜레이)
    nextCardScale.value = withDelay(
      100,
      withSpring(1, {
        stiffness: 200,
        damping: 20,
      })
    );

    nextCardOpacity.value = withDelay(
      100,
      withTiming(1, { duration: NEXT_CARD_DURATION })
    );

    // 단계 3: 상태 리셋 및 완료 콜백
    const resetValue = useSharedValue(0);
    resetValue.value = withDelay(
      SWIPE_OUT_DURATION,
      withTiming(1, { duration: 0 }, (finished) => {
        if (finished) {
          // 위치 리셋 (다음 카드 준비)
          translateX.value = 0;
          translateY.value = 0;
          rotate.value = 0;
          scale.value = 1;
          opacity.value = 1;

          // 다음 카드 초기 상태
          nextCardScale.value = 0.95;
          nextCardOpacity.value = 0.8;

          currentIndex.value++;
          isAnimating.value = false;

          runOnJS(onComplete)();
        }
      })
    );

    // 햅틱 피드백
    runOnJS(triggerHaptic)(result.direction === 'right' ? 'success' : 'light');
  };

  const cancelSwipe = () => {
    'worklet';

    if (isAnimating.value) return;

    // 부드럽게 원위치로
    translateX.value = withSpring(0, { stiffness: 300, damping: 25 });
    translateY.value = withSpring(0, { stiffness: 300, damping: 25 });
    rotate.value = withSpring(0, { stiffness: 300, damping: 25 });

    runOnJS(triggerHaptic)('light');
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isAnimating.value) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // 수직 이동 감소
      rotate.value = (event.translationX / SCREEN_WIDTH) * 20;

      // 다음 카드 미리보기
      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      nextCardScale.value = interpolate(
        progress,
        [0, 1],
        [0.95, 1],
        Extrapolate.CLAMP
      );
      nextCardOpacity.value = interpolate(
        progress,
        [0, 1],
        [0.8, 1],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (isAnimating.value) return;

      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD ||
                          Math.abs(event.velocityX) > 500;

      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        executeSwipe(
          { direction, velocity: event.velocityX },
          () => {
            // 스와이프 완료 후 처리
            console.log(`Swiped ${direction}`);
          }
        );
      } else {
        cancelSwipe();
      }
    });

  const currentCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
    opacity: nextCardOpacity.value,
  }));

  return {
    panGesture,
    currentCardStyle,
    nextCardStyle,
    currentIndex,
    isAnimating,
  };
}

// 컴포넌트에서 사용
function MatchingCardStack() {
  const {
    panGesture,
    currentCardStyle,
    nextCardStyle,
    currentIndex,
  } = useCardSwipeSequence();

  return (
    <View style={styles.cardStack}>
      {/* 다음 카드 (뒤에 배치) */}
      <Animated.View style={[styles.card, styles.nextCard, nextCardStyle]}>
        <MatchCard data={cards[currentIndex.value + 1]} />
      </Animated.View>

      {/* 현재 카드 (위에 배치) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, currentCardStyle]}>
          <MatchCard data={cards[currentIndex.value]} />
        </Animated.View>
      </GestureDetector>

      {/* 스와이프 인디케이터 */}
      <SwipeIndicators translateX={translateX} />
    </View>
  );
}

// 스와이프 인디케이터
function SwipeIndicators({ translateX }: { translateX: SharedValue<number> }) {
  const leftStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-100, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  const rightStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, 100],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <>
      <Animated.View style={[styles.indicator, styles.leftIndicator, leftStyle]}>
        <Icon name="close" size={40} color="#FF6B6B" />
      </Animated.View>

      <Animated.View style={[styles.indicator, styles.rightIndicator, rightStyle]}>
        <Icon name="heart" size={40} color="#4CAF50" />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  nextCard: {
    zIndex: 1,
  },
  indicator: {
    position: 'absolute',
    top: 50,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  leftIndicator: {
    left: 20,
  },
  rightIndicator: {
    right: 20,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 콜백 타이밍 불일치

```typescript
// ❌ 잘못된 방식: setTimeout과 withTiming duration 불일치
const animateAndNotify = () => {
  opacity.value = withTiming(1, { duration: 500 });

  setTimeout(() => {
    onAnimationComplete(); // 500ms 후 호출되지만 애니메이션은 아직 진행 중일 수 있음
  }, 500);
};

// ✅ 올바른 방식: 콜백 사용
const animateAndNotify = () => {
  opacity.value = withTiming(1, { duration: 500 }, (finished) => {
    if (finished) {
      runOnJS(onAnimationComplete)();
    }
  });
};
```

### 2. 연속 애니메이션 중첩

```typescript
// ❌ 잘못된 방식: 이전 애니메이션 완료 전 새 애니메이션
const handlePress = () => {
  scale.value = withSequence(
    withTiming(1.2, { duration: 100 }),
    withTiming(1, { duration: 100 })
  );
  // 빠른 연속 탭 시 애니메이션 충돌
};

// ✅ 올바른 방식: 가드 추가
const isAnimating = useSharedValue(false);

const handlePress = () => {
  if (isAnimating.value) return;

  isAnimating.value = true;
  scale.value = withSequence(
    withTiming(1.2, { duration: 100 }),
    withTiming(1, { duration: 100 }, (finished) => {
      if (finished) {
        isAnimating.value = false;
      }
    })
  );
};
```

### 3. 비동기 상태와 애니메이션 동기화

```typescript
// ❌ 잘못된 방식: API 응답과 애니메이션 불일치
const fetchAndAnimate = async () => {
  setLoading(true);
  loadingOpacity.value = withTiming(1);

  const data = await fetchData();

  setLoading(false);
  loadingOpacity.value = withTiming(0); // 즉시 사라짐
};

// ✅ 올바른 방식: 최소 표시 시간 보장
const fetchAndAnimate = async () => {
  const startTime = Date.now();
  const MIN_LOADING_TIME = 500;

  setLoading(true);
  loadingOpacity.value = withTiming(1);

  const data = await fetchData();

  const elapsed = Date.now() - startTime;
  const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

  // 최소 시간 후 fade out
  loadingOpacity.value = withDelay(
    remainingTime,
    withTiming(0, { duration: 200 }, () => {
      runOnJS(setLoading)(false);
    })
  );
};
```

## 💡 팁

1. **애니메이션 ID로 추적하기**: 복잡한 시퀀스에서는 각 애니메이션에 고유 ID를 부여하여 디버깅 용이
2. **완료 콜백 항상 사용하기**: setTimeout 대신 withTiming의 콜백 활용
3. **애니메이션 상태 공유 값으로 관리**: isAnimating을 SharedValue로 두어 UI 스레드에서 즉시 체크
4. **인터럽트 처리 고려**: 모든 애니메이션은 중간에 취소될 수 있음을 가정
5. **프레임 단위로 생각하기**: 16ms(60fps) 기준으로 타이밍 계획

## 🏋️ 연습 문제

### 문제 1: 순차 폼 검증 애니메이션

폼 필드를 순차적으로 검증하며 각 필드에 애니메이션을 적용하는 훅을 만드세요.

<details>
<summary>정답 보기</summary>

```typescript
interface FieldValidation {
  fieldId: string;
  isValid: boolean;
  errorMessage?: string;
}

function useSequentialFormValidation() {
  const fieldAnimations = useSharedValue<Record<string, number>>({});
  const currentFieldIndex = useSharedValue(0);
  const validationResults = useSharedValue<FieldValidation[]>([]);

  const validateSequentially = async (
    fields: string[],
    validators: Record<string, () => Promise<FieldValidation>>
  ) => {
    const results: FieldValidation[] = [];

    for (let i = 0; i < fields.length; i++) {
      const fieldId = fields[i];
      currentFieldIndex.value = i;

      // 필드 하이라이트 애니메이션
      runOnUI(() => {
        'worklet';
        fieldAnimations.value = {
          ...fieldAnimations.value,
          [fieldId]: withTiming(1, { duration: 200 }),
        };
      })();

      // 검증 실행
      const result = await validators[fieldId]();
      results.push(result);
      validationResults.value = [...results];

      // 결과 애니메이션
      runOnUI(() => {
        'worklet';
        const color = result.isValid ? 1 : -1;
        fieldAnimations.value = {
          ...fieldAnimations.value,
          [fieldId]: withSequence(
            withTiming(color * 1.5, { duration: 100 }),
            withTiming(color, { duration: 200 })
          ),
        };
      })();

      // 에러 시 중단 옵션
      if (!result.isValid) {
        // shake 애니메이션
        runOnUI(() => {
          'worklet';
          fieldAnimations.value = {
            ...fieldAnimations.value,
            [`${fieldId}_shake`]: withSequence(
              withTiming(10, { duration: 50 }),
              withTiming(-10, { duration: 50 }),
              withTiming(10, { duration: 50 }),
              withTiming(0, { duration: 50 })
            ),
          };
        })();
        break;
      }

      // 다음 필드 전 딜레이
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    return results;
  };

  const getFieldStyle = (fieldId: string) => {
    return useAnimatedStyle(() => {
      const value = fieldAnimations.value[fieldId] || 0;
      const shake = fieldAnimations.value[`${fieldId}_shake`] || 0;

      const borderColor = interpolateColor(
        value,
        [-1, 0, 1],
        ['#FF6B6B', '#E0E0E0', '#4CAF50']
      );

      return {
        borderColor,
        borderWidth: 2,
        transform: [{ translateX: shake }],
      };
    });
  };

  return {
    validateSequentially,
    getFieldStyle,
    currentFieldIndex,
    validationResults,
  };
}
```
</details>

### 문제 2: 타이밍 동기화 유틸리티

여러 애니메이션의 시작/완료 시점을 정확히 동기화하는 유틸리티를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
type AnimationFactory = (
  onComplete: () => void
) => void;

function createSynchronizedAnimations() {
  const startTime = { value: 0 };
  const completedAnimations = { value: new Set<string>() };
  const totalAnimations = { value: 0 };
  const onAllComplete = { value: (() => {}) as () => void };

  const addAnimation = (
    id: string,
    factory: AnimationFactory
  ) => {
    totalAnimations.value++;

    return () => {
      'worklet';

      factory(() => {
        completedAnimations.value.add(id);

        if (completedAnimations.value.size === totalAnimations.value) {
          const duration = Date.now() - startTime.value;
          console.log(`All animations completed in ${duration}ms`);
          runOnJS(onAllComplete.value)();
        }
      });
    };
  };

  const runAll = (callback?: () => void) => {
    'worklet';

    if (callback) {
      onAllComplete.value = callback;
    }

    startTime.value = Date.now();
    completedAnimations.value.clear();
  };

  return {
    addAnimation,
    runAll,
  };
}

// 사용 예시
function SynchronizedDemo() {
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const sync = useMemo(() => createSynchronizedAnimations(), []);

  const anim1 = sync.addAnimation('opacity1', (onComplete) => {
    'worklet';
    opacity1.value = withTiming(1, { duration: 300 }, (finished) => {
      if (finished) onComplete();
    });
  });

  const anim2 = sync.addAnimation('opacity2', (onComplete) => {
    'worklet';
    opacity2.value = withTiming(1, { duration: 500 }, (finished) => {
      if (finished) onComplete();
    });
  });

  const anim3 = sync.addAnimation('scale', (onComplete) => {
    'worklet';
    scale.value = withSpring(1, { stiffness: 100 }, (finished) => {
      if (finished) onComplete();
    });
  });

  const startAll = () => {
    runOnUI(() => {
      'worklet';
      sync.runAll(() => {
        console.log('All synchronized animations complete!');
      });
      anim1();
      anim2();
      anim3();
    })();
  };

  return (
    <Button onPress={startAll} title="Start Synchronized" />
  );
}
```
</details>

## 📚 이 장에서 배운 내용

1. **시퀀스 애니메이션 동기화**: 단계별 진행과 완료 콜백 관리
2. **병렬 애니메이션 조율**: 여러 애니메이션의 동시 실행과 완료 감지
3. **레이스 컨디션 방지**: 애니메이션 락과 큐를 통한 안전한 실행
4. **디바운스와 스로틀**: 과도한 업데이트 방지
5. **타이밍 디버거**: 애니메이션 실행 시점 분석 도구

> **다음 장 예고**: **Chapter 78: 마이그레이션 가이드**에서는 Reanimated 버전 업그레이드와 API 변경 대응 방법을 다룹니다.
