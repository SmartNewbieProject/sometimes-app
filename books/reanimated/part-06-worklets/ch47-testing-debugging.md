# Chapter 47: 워크릿 테스팅과 디버깅

워크릿 코드를 효과적으로 테스트하고 디버깅하는 전략을 배웁니다. 개발 도구, 성능 프로파일링, 그리고 일반적인 문제 해결 방법을 마스터합니다.

## 📌 학습 목표

- 워크릿 코드 테스팅 전략
- 개발 중 디버깅 기법
- 성능 프로파일링 도구 활용
- 일반적인 문제와 해결 방법
- 프로덕션 에러 추적

## 📖 워크릿 디버깅의 특수성

### 두 스레드 환경의 도전

```
┌─────────────────────────────────────────────────────────────────┐
│                    Debugging Challenges                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JavaScript Thread                   UI Thread                  │
│  ┌──────────────────┐               ┌──────────────────┐        │
│  │ • console.log ✓  │               │ • console.log ✗  │        │
│  │ • breakpoints ✓  │               │ • breakpoints ?  │        │
│  │ • React DevTools │               │ • 직접 접근 불가 │        │
│  │ • Flipper        │               │                  │        │
│  └──────────────────┘               └──────────────────┘        │
│                                                                  │
│  워크릿 디버깅의 어려움:                                         │
│  1. UI 스레드에서 직접 console.log 불가                          │
│  2. 일반적인 JS 디버거로 워크릿 중단점 불가                       │
│  3. 에러 스택 트레이스가 불명확할 수 있음                        │
│  4. 타이밍 관련 버그 재현이 어려움                               │
│                                                                  │
│  해결 전략:                                                       │
│  1. runOnJS로 로깅                                              │
│  2. Shared Values로 상태 노출                                   │
│  3. 개발용 시각화 도구                                          │
│  4. 단위 테스트                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 기본 디버깅 패턴

```typescript
import { runOnJS } from 'react-native-reanimated';

// 워크릿 내 로깅
const debugLog = (message: string, value: any) => {
  if (__DEV__) {
    console.log(`[Worklet] ${message}:`, value);
  }
};

function MyWorklet(value: number) {
  'worklet';

  // 워크릿에서 로깅
  runOnJS(debugLog)('Progress', value);

  return value * 2;
}
```

## 💻 개발용 디버깅 도구

### 애니메이션 상태 시각화

```typescript
interface DebugInfo {
  sharedValues: { [key: string]: number };
  fps: number;
  frameTime: number;
}

function useAnimationDebugger(
  values: { [key: string]: SharedValue<number> }
) {
  const debugInfo = useSharedValue<DebugInfo>({
    sharedValues: {},
    fps: 60,
    frameTime: 16.67,
  });

  const [displayInfo, setDisplayInfo] = useState<DebugInfo | null>(null);

  // FPS 계산
  const frameCount = useSharedValue(0);
  const lastSecond = useSharedValue(Date.now());

  useFrameCallback((info) => {
    frameCount.value += 1;

    const now = Date.now();
    if (now - lastSecond.value >= 1000) {
      debugInfo.value = {
        ...debugInfo.value,
        fps: frameCount.value,
        frameTime: info.timeSincePreviousFrame ?? 16.67,
      };

      frameCount.value = 0;
      lastSecond.value = now;
    }

    // Shared Values 수집
    const sharedValues: { [key: string]: number } = {};
    for (const [name, value] of Object.entries(values)) {
      sharedValues[name] = value.value;
    }

    debugInfo.value = {
      ...debugInfo.value,
      sharedValues,
    };
  });

  // JS로 전달 (100ms마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayInfo({ ...debugInfo.value });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return displayInfo;
}

// 디버그 오버레이 컴포넌트
function AnimationDebugOverlay({
  values,
}: {
  values: { [key: string]: SharedValue<number> };
}) {
  const debugInfo = useAnimationDebugger(values);

  if (!__DEV__ || !debugInfo) return null;

  const fpsColor = debugInfo.fps >= 55 ? '#10B981' :
                   debugInfo.fps >= 30 ? '#F59E0B' : '#EF4444';

  return (
    <View style={styles.debugOverlay}>
      {/* FPS 표시 */}
      <View style={styles.fpsContainer}>
        <Text style={[styles.fpsText, { color: fpsColor }]}>
          {debugInfo.fps} FPS
        </Text>
        <Text style={styles.frameTimeText}>
          {debugInfo.frameTime.toFixed(2)}ms
        </Text>
      </View>

      {/* Shared Values */}
      <View style={styles.valuesContainer}>
        {Object.entries(debugInfo.sharedValues).map(([name, value]) => (
          <View key={name} style={styles.valueRow}>
            <Text style={styles.valueName}>{name}:</Text>
            <Text style={styles.valueNumber}>
              {typeof value === 'number' ? value.toFixed(2) : String(value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  debugOverlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    minWidth: 150,
  },
  fpsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 8,
  },
  fpsText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
  },
  frameTimeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  valuesContainer: {
    gap: 4,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueName: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  valueNumber: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
```

### 애니메이션 타임라인 기록

```typescript
interface TimelineEvent {
  timestamp: number;
  type: string;
  values: { [key: string]: number };
}

function useAnimationTimeline(
  values: { [key: string]: SharedValue<number> },
  options: { maxEvents?: number; sampleRate?: number } = {}
) {
  const { maxEvents = 500, sampleRate = 60 } = options;

  const events = useRef<TimelineEvent[]>([]);
  const isRecording = useSharedValue(false);
  const startTime = useSharedValue(0);

  const sampleInterval = 1000 / sampleRate;
  const lastSampleTime = useSharedValue(0);

  useFrameCallback((info) => {
    if (!isRecording.value) return;

    const elapsed = info.timeSinceFirstFrame - startTime.value;

    // 샘플링 레이트 제한
    if (elapsed - lastSampleTime.value < sampleInterval) return;
    lastSampleTime.value = elapsed;

    const snapshot: { [key: string]: number } = {};
    for (const [name, value] of Object.entries(values)) {
      snapshot[name] = value.value;
    }

    runOnJS(addEvent)({
      timestamp: elapsed,
      type: 'frame',
      values: snapshot,
    });
  });

  const addEvent = (event: TimelineEvent) => {
    events.current.push(event);
    if (events.current.length > maxEvents) {
      events.current.shift();
    }
  };

  const startRecording = () => {
    events.current = [];
    startTime.value = Date.now();
    isRecording.value = true;
  };

  const stopRecording = () => {
    isRecording.value = false;
    return [...events.current];
  };

  const exportTimeline = () => {
    return JSON.stringify(events.current, null, 2);
  };

  return { startRecording, stopRecording, exportTimeline, events: events.current };
}

// 타임라인 시각화
function TimelineVisualizer({
  events,
  property,
}: {
  events: TimelineEvent[];
  property: string;
}) {
  const width = 300;
  const height = 100;
  const padding = 10;

  if (events.length === 0) return null;

  const values = events.map(e => e.values[property]);
  const times = events.map(e => e.timestamp);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const maxTime = Math.max(...times);

  const scaleX = (t: number) => padding + (t / maxTime) * (width - padding * 2);
  const scaleY = (v: number) =>
    height - padding - ((v - minValue) / (maxValue - minValue || 1)) * (height - padding * 2);

  const path = events
    .map((e, i) => {
      const x = scaleX(e.timestamp);
      const y = scaleY(e.values[property]);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>{property}</Text>
      <Svg width={width} height={height}>
        <Path d={path} stroke="#7A4AE2" strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}
```

### 조건부 디버깅

```typescript
// 개발 환경에서만 활성화되는 디버그 훅
function useDebugValue<T>(
  name: string,
  value: SharedValue<T>,
  options: { logChanges?: boolean; threshold?: number } = {}
) {
  if (!__DEV__) return;

  const { logChanges = false, threshold = 0.01 } = options;
  const lastValue = useSharedValue<T>(value.value);

  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      if (!logChanges) return;

      // 숫자인 경우 임계값 이상 변화만 로깅
      if (typeof current === 'number' && typeof previous === 'number') {
        if (Math.abs(current - previous) < threshold) return;
      }

      runOnJS(console.log)(
        `[Debug] ${name}: ${JSON.stringify(previous)} → ${JSON.stringify(current)}`
      );
    }
  );
}

// 사용
function AnimatedComponent() {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  // 개발 중 값 변화 추적
  useDebugValue('progress', progress, { logChanges: true, threshold: 0.1 });
  useDebugValue('scale', scale, { logChanges: true });

  // ...
}
```

## 💻 워크릿 유닛 테스팅

### 순수 워크릿 함수 테스트

```typescript
// src/shared/libs/animation-utils.ts
export function easeOutQuad(t: number): number {
  'worklet';
  return t * (2 - t);
}

export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

export function interpolateValue(
  progress: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  'worklet';
  const [inStart, inEnd] = inputRange;
  const [outStart, outEnd] = outputRange;

  const normalized = (progress - inStart) / (inEnd - inStart);
  const clamped = clamp(normalized, 0, 1);

  return outStart + (outEnd - outStart) * clamped;
}
```

```typescript
// __tests__/animation-utils.test.ts
import { easeOutQuad, clamp, interpolateValue } from '../src/shared/libs/animation-utils';

describe('Animation Utilities', () => {
  describe('easeOutQuad', () => {
    it('returns 0 at start', () => {
      expect(easeOutQuad(0)).toBe(0);
    });

    it('returns 1 at end', () => {
      expect(easeOutQuad(1)).toBe(1);
    });

    it('follows ease out curve', () => {
      // 중간 지점에서 0.5 이상이어야 함 (ease out 특성)
      expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
      expect(easeOutQuad(0.5)).toBe(0.75);
    });
  });

  describe('clamp', () => {
    it('clamps value to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('interpolateValue', () => {
    it('interpolates correctly', () => {
      expect(interpolateValue(0, [0, 1], [0, 100])).toBe(0);
      expect(interpolateValue(0.5, [0, 1], [0, 100])).toBe(50);
      expect(interpolateValue(1, [0, 1], [0, 100])).toBe(100);
    });

    it('clamps outside input range', () => {
      expect(interpolateValue(-0.5, [0, 1], [0, 100])).toBe(0);
      expect(interpolateValue(1.5, [0, 1], [0, 100])).toBe(100);
    });

    it('handles reverse ranges', () => {
      expect(interpolateValue(0, [0, 1], [100, 0])).toBe(100);
      expect(interpolateValue(1, [0, 1], [100, 0])).toBe(0);
    });
  });
});
```

### 컴포넌트 통합 테스트

```typescript
// __tests__/AnimatedButton.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedButton from '../src/components/AnimatedButton';

// Reanimated 모킹
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // 커스텀 모킹
  Reanimated.useAnimatedStyle = jest.fn(() => ({}));
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));

  return Reanimated;
});

describe('AnimatedButton', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );

  it('renders correctly', () => {
    const { getByText } = render(
      <AnimatedButton title="Press Me" onPress={() => {}} />,
      { wrapper }
    );

    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <AnimatedButton title="Press Me" onPress={onPressMock} />,
      { wrapper }
    );

    fireEvent.press(getByText('Press Me'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <AnimatedButton title="Press Me" onPress={onPressMock} disabled />,
      { wrapper }
    );

    fireEvent.press(getByText('Press Me'));

    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

### E2E 애니메이션 테스트

```typescript
// e2e/animation.test.ts
import { device, element, by, expect, waitFor } from 'detox';

describe('Animation E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete fade animation', async () => {
    // 버튼 탭
    await element(by.id('animate-button')).tap();

    // 요소가 나타날 때까지 대기
    await waitFor(element(by.id('animated-view')))
      .toBeVisible()
      .withTimeout(1000);

    // 스크린샷으로 시각적 확인
    await device.takeScreenshot('animation-complete');
  });

  it('should respond to swipe gesture', async () => {
    const card = element(by.id('swipeable-card'));

    // 스와이프 제스처
    await card.swipe('right', 'fast', 0.8);

    // 카드가 사라졌는지 확인
    await waitFor(card).not.toBeVisible().withTimeout(500);

    // 다음 카드가 보이는지 확인
    await expect(element(by.id('next-card'))).toBeVisible();
  });

  it('should handle spring animation correctly', async () => {
    await element(by.id('spring-button')).tap();

    // 스프링 애니메이션은 오버슈트 후 안착
    // 약간의 시간 후 최종 위치 확인
    await new Promise(resolve => setTimeout(resolve, 500));

    // 최종 상태 스크린샷
    await device.takeScreenshot('spring-settled');
  });
});
```

## 💻 성능 프로파일링

### React Native 성능 모니터

```typescript
// 개발 빌드에서 성능 모니터 활성화
function enablePerformanceMonitor() {
  if (__DEV__) {
    // Perf Monitor 표시
    const DevMenu = require('react-native/Libraries/NativeModules/specs/NativeDevMenu');
    DevMenu.show();
  }
}

// 커스텀 성능 측정
function usePerformanceMetrics() {
  const metrics = useRef({
    renderCount: 0,
    animationFrames: 0,
    droppedFrames: 0,
    averageFrameTime: 16.67,
  });

  const frameTimes = useRef<number[]>([]);

  useFrameCallback((info) => {
    metrics.current.animationFrames += 1;

    if (info.timeSincePreviousFrame) {
      frameTimes.current.push(info.timeSincePreviousFrame);

      // 30프레임 드롭 감지 (33ms 이상)
      if (info.timeSincePreviousFrame > 33) {
        metrics.current.droppedFrames += 1;
      }

      // 최근 60프레임 평균
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }

      metrics.current.averageFrameTime =
        frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
    }
  });

  const getReport = () => {
    const fps = 1000 / metrics.current.averageFrameTime;
    const dropRate = (metrics.current.droppedFrames / metrics.current.animationFrames) * 100;

    return {
      ...metrics.current,
      fps: fps.toFixed(1),
      dropRate: `${dropRate.toFixed(2)}%`,
    };
  };

  return { getReport };
}
```

### Flipper 플러그인 연동

```typescript
// Flipper에서 애니메이션 상태 추적
import { addPlugin } from 'react-native-flipper';

function setupAnimationFlipperPlugin() {
  if (!__DEV__) return;

  addPlugin({
    getId: () => 'reanimated-debugger',
    onConnect: (connection) => {
      // 애니메이션 상태 전송
      const sendUpdate = (data: any) => {
        connection.send('animationUpdate', data);
      };

      // 글로벌 리스너 설정
      (global as any).__REANIMATED_FLIPPER_CALLBACK__ = sendUpdate;
    },
    onDisconnect: () => {
      (global as any).__REANIMATED_FLIPPER_CALLBACK__ = undefined;
    },
  });
}

// 워크릿에서 Flipper로 전송
function reportToFlipper(name: string, value: any) {
  'worklet';
  if (__DEV__) {
    runOnJS((n: string, v: any) => {
      const callback = (global as any).__REANIMATED_FLIPPER_CALLBACK__;
      if (callback) {
        callback({ name: n, value: v, timestamp: Date.now() });
      }
    })(name, value);
  }
}
```

## 💻 일반적인 문제와 해결

### 문제 1: 워크릿에서 외부 함수 호출

```typescript
// ❌ 에러: 외부 함수를 워크릿에서 직접 호출
const helper = (x: number) => x * 2;

const animatedStyle = useAnimatedStyle(() => {
  return { opacity: helper(progress.value) }; // 에러!
});

// ✅ 해결: 함수에 'worklet' 지시문 추가
const helper = (x: number) => {
  'worklet';
  return x * 2;
};

const animatedStyle = useAnimatedStyle(() => {
  return { opacity: helper(progress.value) };
});
```

### 문제 2: Shared Value 초기화 타이밍

```typescript
// ❌ 문제: useEffect에서 애니메이션 시작이 지연됨
useEffect(() => {
  progress.value = withTiming(1); // 컴포넌트 마운트 후 실행
}, []);

// ✅ 해결: 초기값에서 바로 시작
const progress = useSharedValue(0);

// 마운트 즉시 애니메이션 시작
useEffect(() => {
  requestAnimationFrame(() => {
    progress.value = withTiming(1);
  });
}, []);

// 또는 useAnimatedProps의 초기 실행 활용
```

### 문제 3: 무한 루프

```typescript
// ❌ 문제: useAnimatedReaction에서 무한 루프
useAnimatedReaction(
  () => valueA.value,
  (current) => {
    valueB.value = current * 2;
  }
);

useAnimatedReaction(
  () => valueB.value,
  (current) => {
    valueA.value = current / 2; // 순환 참조!
  }
);

// ✅ 해결: 단방향 데이터 흐름
const source = useSharedValue(0);
const derived = useDerivedValue(() => source.value * 2);
// source만 수정, derived는 읽기 전용
```

### 문제 4: 메모리 누수

```typescript
// ❌ 문제: 클린업 없는 구독
useEffect(() => {
  const interval = setInterval(() => {
    runOnUI(() => {
      'worklet';
      // ...
    })();
  }, 16);
  // 클린업 없음!
}, []);

// ✅ 해결: 적절한 클린업
useEffect(() => {
  const interval = setInterval(() => {
    runOnUI(() => {
      'worklet';
      // ...
    })();
  }, 16);

  return () => clearInterval(interval);
}, []);
```

### 문제 5: 스타일 적용 안됨

```typescript
// ❌ 문제: animatedStyle이 적용 안됨
const animatedStyle = useAnimatedStyle(() => ({
  opacity: progress.value,
}));

return <View style={animatedStyle} />; // Animated.View가 아님!

// ✅ 해결: Animated 컴포넌트 사용
import Animated from 'react-native-reanimated';

return <Animated.View style={animatedStyle} />;
```

## 📱 sometimes-app 디버깅 사례

### 매칭 애니메이션 디버거

```typescript
// src/features/matching/debug/MatchingAnimationDebugger.tsx
export function MatchingAnimationDebugger({
  translateX,
  translateY,
  rotation,
  scale,
}: {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
}) {
  if (!__DEV__) return null;

  const debugInfo = useAnimationDebugger({
    translateX,
    translateY,
    rotation,
    scale,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.debugContainer}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.debugHeader}
      >
        <Text style={styles.debugTitle}>🐛 Animation Debug</Text>
        <Text style={styles.fpsIndicator}>
          {debugInfo?.fps ?? '--'} FPS
        </Text>
      </TouchableOpacity>

      {isExpanded && debugInfo && (
        <View style={styles.debugBody}>
          <Text style={styles.debugText}>
            X: {debugInfo.sharedValues.translateX?.toFixed(1) ?? '0'}
          </Text>
          <Text style={styles.debugText}>
            Y: {debugInfo.sharedValues.translateY?.toFixed(1) ?? '0'}
          </Text>
          <Text style={styles.debugText}>
            Rotation: {(debugInfo.sharedValues.rotation * 180 / Math.PI)?.toFixed(1) ?? '0'}°
          </Text>
          <Text style={styles.debugText}>
            Scale: {debugInfo.sharedValues.scale?.toFixed(2) ?? '1'}
          </Text>

          {/* 스와이프 방향 표시 */}
          <View style={styles.directionIndicator}>
            <Text style={[
              styles.directionText,
              debugInfo.sharedValues.translateX > 50 && styles.activeDirection
            ]}>
              → LIKE
            </Text>
            <Text style={[
              styles.directionText,
              debugInfo.sharedValues.translateX < -50 && styles.activeDirection
            ]}>
              ← NOPE
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
```

## ⚠️ 프로덕션 에러 추적

### Sentry 통합

```typescript
import * as Sentry from '@sentry/react-native';

// 워크릿 에러 캡처
function captureWorkletError(error: Error, context?: object) {
  if (!__DEV__) {
    Sentry.captureException(error, {
      tags: { source: 'worklet' },
      extra: context,
    });
  }
}

// 안전한 워크릿 실행
function safeWorklet<T>(
  worklet: () => T,
  fallback: T,
  context?: object
): T {
  'worklet';

  try {
    return worklet();
  } catch (error) {
    runOnJS(captureWorkletError)(error as Error, context);
    return fallback;
  }
}

// 사용
const animatedStyle = useAnimatedStyle(() => {
  return safeWorklet(
    () => ({
      transform: [
        { translateX: complexCalculation(progress.value) },
      ],
    }),
    { transform: [{ translateX: 0 }] },
    { component: 'AnimatedCard' }
  );
});
```

## 💡 디버깅 팁

### 1. 단계별 접근

```typescript
// 복잡한 애니메이션을 단계별로 디버깅
const step1 = useDerivedValue(() => {
  const result = calculateStep1(input.value);
  // runOnJS(console.log)('Step 1:', result);
  return result;
});

const step2 = useDerivedValue(() => {
  const result = calculateStep2(step1.value);
  // runOnJS(console.log)('Step 2:', result);
  return result;
});

// 각 단계의 중간값 확인 가능
```

### 2. 시각적 디버깅

```typescript
// 보이지 않는 값을 시각화
const debugStyle = useAnimatedStyle(() => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: `${progress.value * 100}%`,
  height: 4,
  backgroundColor: 'red',
}));
```

## 🏋️ 연습 문제

### 과제 1: 디버그 패널
토글 가능한 디버그 패널을 만들어 모든 애니메이션 상태를 표시하세요.

### 과제 2: 성능 경고
FPS가 떨어질 때 자동으로 경고하는 시스템을 구현하세요.

### 과제 3: 리플레이 시스템
기록된 애니메이션을 다시 재생할 수 있는 시스템을 만드세요.

## 📚 이 장에서 배운 내용

1. **디버깅 기법**: runOnJS 로깅, 상태 시각화
2. **테스팅 전략**: 유닛 테스트, 통합 테스트, E2E
3. **성능 프로파일링**: FPS 모니터링, 프레임 타임 분석
4. **일반적인 문제**: 워크릿 에러, 메모리 누수, 초기화 타이밍
5. **프로덕션 추적**: Sentry 통합, 안전한 워크릿 실행

## 다음 파트 예고

**Part 7: 마이크로 인터랙션**에서는 사용자 경험을 한 단계 높이는 미세한 애니메이션과 인터랙션을 배웁니다. 버튼 피드백, 로딩 상태, 성공/실패 애니메이션 등 세심한 UX를 구현합니다. Chapter 48부터 시작합니다.
