# Chapter 56: 성능 최적화 기초

Reanimated 애니메이션의 성능을 이해하고 최적화하는 첫 걸음을 배웁니다.

## 📌 학습 목표

- React Native의 스레드 구조와 Reanimated의 동작 원리 이해
- UI Thread vs JS Thread 성능 차이 파악
- 60fps 유지를 위한 핵심 원칙 습득
- 성능 측정 기초 도구 활용

## 📖 개념 이해

### React Native 스레드 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │  JS Thread  │     │   Bridge    │     │  UI Thread  │   │
│  │             │────▶│  (Async)    │────▶│             │   │
│  │ • React     │     │  • Batching │     │ • Native    │   │
│  │ • Business  │     │  • Serialize│     │   Views     │   │
│  │   Logic     │     │             │     │ • Rendering │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│         │                                       ▲           │
│         │         ┌─────────────────┐          │           │
│         └────────▶│   Reanimated    │──────────┘           │
│                   │   Worklet       │                       │
│                   │   (Sync, Direct)│                       │
│                   └─────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 기존 방식 vs Reanimated

```
기존 React Native 애니메이션:
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│Frame 1 │───▶│  JS    │───▶│ Bridge │───▶│ Native │
│ 16.6ms │    │ Thread │    │  Async │    │  View  │
└────────┘    └────────┘    └────────┘    └────────┘
    │              │             │             │
    │   Calculate  │  Serialize  │   Apply     │
    │   ~5-10ms    │   ~2-5ms    │   ~2-5ms    │
    │              │             │             │
    └──────────────┴─────────────┴─────────────┘
                Total: ~10-20ms (프레임 드롭!)

Reanimated Worklet:
┌────────┐    ┌────────────────────────────────┐
│Frame 1 │───▶│        UI Thread               │
│ 16.6ms │    │   Worklet → Native View        │
└────────┘    │        ~1-3ms                  │
              └────────────────────────────────┘
              Total: ~1-3ms (부드러운 60fps!)
```

### 16.6ms 규칙

60fps를 유지하려면 각 프레임을 16.6ms 안에 처리해야 합니다:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frame Budget (16.6ms)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ▼ 좋은 성능 (< 8ms)                                        │
│  ├──────────┤                                               │
│  │ Worklet  │ (2ms)                                         │
│  │ Render   │ (3ms)                                         │
│  │ Composite│ (2ms)                                         │
│  ├──────────┼──────────────────────────────────────────────│
│  │          │ 여유 시간 (9ms) - 복잡한 작업 가능            │
│  └──────────┴──────────────────────────────────────────────│
│                                                              │
│  ▼ 경계 성능 (8-14ms)                                       │
│  ├──────────────────────────┤                               │
│  │       Animation          │ (12ms)                        │
│  │       Processing         │                               │
│  ├──────────────────────────┼──────────────────────────────│
│  │                          │ 적은 여유 (4ms)               │
│  └──────────────────────────┴──────────────────────────────│
│                                                              │
│  ▼ 나쁜 성능 (> 16.6ms) - 프레임 드롭!                      │
│  ├───────────────────────────────────────┤                  │
│  │              Heavy Processing          │ (25ms)          │
│  ├───────────────────────────────────────┼────┤            │
│  │                                        │SKIP│ ← 드롭!   │
│  └───────────────────────────────────────┴────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. Worklet vs Non-Worklet 비교

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// ❌ 안티패턴: JS Thread에서 처리
function SlowAnimation() {
  const [position, setPosition] = useState(0);

  const handlePress = () => {
    // 매 프레임마다 Bridge를 통해 전달
    const interval = setInterval(() => {
      setPosition(prev => {
        if (prev >= 200) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 16);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.box,
          { transform: [{ translateX: position }] }
        ]}
      />
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>
          Slow Animation (JS Thread)
        </Text>
      </Pressable>
    </View>
  );
}

// ✅ 권장: UI Thread에서 처리
function FastAnimation() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    translateX.value = 0;
    translateX.value = withTiming(200, { duration: 500 });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>
          Fast Animation (UI Thread)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#7A4AE2',
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7A4AE2',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

### 2. 성능 측정 Hook

```typescript
import { useRef, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

interface PerformanceMetrics {
  frameCount: number;
  averageFrameTime: number;
  droppedFrames: number;
  fps: number;
}

function useAnimationPerformance() {
  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());
  const frameTimes = useRef<number[]>([]);
  const droppedFrames = useRef(0);

  const trigger = useSharedValue(0);

  const measureFrame = useCallback(() => {
    const now = Date.now();
    const frameTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    frameCount.current++;
    frameTimes.current.push(frameTime);

    // 16.6ms 초과시 드롭 카운트
    if (frameTime > 16.6) {
      droppedFrames.current++;
    }

    // 최근 60프레임만 유지
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();
    }
  }, []);

  // UI Thread에서 프레임 측정
  useAnimatedReaction(
    () => trigger.value,
    (current) => {
      runOnJS(measureFrame)();
    },
    [measureFrame]
  );

  const getMetrics = useCallback((): PerformanceMetrics => {
    const times = frameTimes.current;
    const avgTime = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;

    return {
      frameCount: frameCount.current,
      averageFrameTime: avgTime,
      droppedFrames: droppedFrames.current,
      fps: avgTime > 0 ? Math.round(1000 / avgTime) : 0,
    };
  }, []);

  const startMeasuring = useCallback(() => {
    frameCount.current = 0;
    droppedFrames.current = 0;
    frameTimes.current = [];
    lastFrameTime.current = Date.now();

    // 매 프레임 트리거
    const interval = setInterval(() => {
      trigger.value = Date.now();
    }, 16);

    return () => clearInterval(interval);
  }, [trigger]);

  const reset = useCallback(() => {
    frameCount.current = 0;
    droppedFrames.current = 0;
    frameTimes.current = [];
  }, []);

  return {
    getMetrics,
    startMeasuring,
    reset,
  };
}
```

### 3. 성능 모니터 오버레이

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

interface FrameStats {
  fps: number;
  frameTime: number;
  jank: boolean;
}

function PerformanceOverlay({ enabled = true }: { enabled?: boolean }) {
  const [stats, setStats] = useState<FrameStats>({
    fps: 60,
    frameTime: 16.6,
    jank: false,
  });
  const [visible, setVisible] = useState(true);

  const lastFrameTime = useSharedValue(0);
  const frameCount = useSharedValue(0);
  const accumulatedTime = useSharedValue(0);

  const updateStats = useCallback((fps: number, frameTime: number, jank: boolean) => {
    setStats({ fps, frameTime, jank });
  }, []);

  // 매 프레임 실행
  useFrameCallback((frameInfo) => {
    if (!enabled) return;

    const currentTime = frameInfo.timestamp;

    if (lastFrameTime.value > 0) {
      const deltaTime = currentTime - lastFrameTime.value;
      const frameTimeMs = deltaTime / 1000000; // ns to ms

      accumulatedTime.value += frameTimeMs;
      frameCount.value++;

      // 500ms마다 통계 업데이트
      if (accumulatedTime.value >= 500) {
        const avgFrameTime = accumulatedTime.value / frameCount.value;
        const fps = Math.round(1000 / avgFrameTime);
        const jank = avgFrameTime > 20; // 20ms 초과시 버벅임

        runOnJS(updateStats)(fps, avgFrameTime, jank);

        accumulatedTime.value = 0;
        frameCount.value = 0;
      }
    }

    lastFrameTime.value = currentTime;
  }, enabled);

  const overlayOpacity = useSharedValue(1);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const toggleVisibility = () => {
    overlayOpacity.value = withSpring(visible ? 0 : 1);
    setVisible(!visible);
  };

  if (!enabled) return null;

  const fpsColor = stats.fps >= 55 ? '#4CAF50' :
                   stats.fps >= 45 ? '#FFC107' : '#F44336';

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable onPress={toggleVisibility} style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.fps, { color: fpsColor }]}>
            {stats.fps} FPS
          </Text>
          {stats.jank && (
            <View style={styles.jankBadge}>
              <Text style={styles.jankText}>JANK</Text>
            </View>
          )}
        </View>
        <Text style={styles.frameTime}>
          {stats.frameTime.toFixed(1)}ms/frame
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 10,
    zIndex: 9999,
  },
  content: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fps: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  frameTime: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  jankBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  jankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export { PerformanceOverlay };
```

### 4. 핵심 성능 원칙 컴포넌트

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

// 원칙 1: 불필요한 runOnJS 최소화
function Principle1_MinimizeRunOnJS() {
  const scale = useSharedValue(1);
  const [pressCount, setPressCount] = useState(0);

  // ❌ 안티패턴: 매 프레임 runOnJS
  const badAnimatedStyle = useAnimatedStyle(() => {
    // 이렇게 하면 안 됨!
    // runOnJS(someFunction)();
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // ✅ 권장: 필요할 때만 runOnJS
  const goodAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2, {}, (finished) => {
      if (finished) {
        // 완료시에만 JS Thread로 콜백
        runOnJS(setPressCount)(prev => prev + 1);
        scale.value = withSpring(1);
      }
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>원칙 1: runOnJS 최소화</Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.box, goodAnimatedStyle]}>
          <Text style={styles.boxText}>{pressCount}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// 원칙 2: SharedValue 연산은 UI Thread에서
function Principle2_UIThreadComputation() {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    // ✅ 모든 계산을 worklet 내부에서
    const progress = translateX.value / 200;
    const calculatedOpacity = 1 - progress * 0.5;

    return {
      transform: [{ translateX: translateX.value }],
      opacity: calculatedOpacity,
    };
  });

  const handlePress = () => {
    translateX.value = 0;
    translateX.value = withSpring(200);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>원칙 2: UI Thread 계산</Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </Pressable>
    </View>
  );
}

// 원칙 3: 메모이제이션 활용
function Principle3_Memoization() {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // ✅ 정적 스타일 분리
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    rotation.value = withSpring(rotation.value + 360);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>원칙 3: 스타일 메모이제이션</Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </Pressable>
    </View>
  );
}

// 원칙 4: 조건부 애니메이션 최적화
function Principle4_ConditionalAnimation() {
  const isActive = useSharedValue(false);
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('#7A4AE2');

  const animatedStyle = useAnimatedStyle(() => {
    // ✅ interpolate 대신 직접 계산 (단순한 경우)
    const bgColor = isActive.value ? '#4CAF50' : '#7A4AE2';

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bgColor,
    };
  });

  const handlePress = () => {
    isActive.value = !isActive.value;
    scale.value = withSpring(isActive.value ? 1.1 : 1);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>원칙 4: 조건부 최적화</Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: '#7A4AE2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  boxText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 5. 성능 비교 데모

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface BenchmarkResult {
  name: string;
  avgFrameTime: number;
  fps: number;
  status: 'good' | 'warning' | 'bad';
}

function PerformanceBenchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 테스트용 애니메이션 값들
  const values = Array.from({ length: 50 }, () => useSharedValue(0));

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    const newResults: BenchmarkResult[] = [];

    // 테스트 1: 단일 애니메이션
    const test1Start = performance.now();
    values[0].value = withRepeat(
      withTiming(100, { duration: 100 }),
      10,
      true
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    cancelAnimation(values[0]);
    const test1Time = (performance.now() - test1Start) / 60;

    newResults.push({
      name: '단일 애니메이션',
      avgFrameTime: test1Time,
      fps: Math.round(1000 / test1Time),
      status: test1Time < 16 ? 'good' : test1Time < 20 ? 'warning' : 'bad',
    });

    // 테스트 2: 다중 애니메이션 (10개)
    const test2Start = performance.now();
    values.slice(0, 10).forEach((val, i) => {
      val.value = withRepeat(
        withTiming(100, { duration: 100 + i * 10 }),
        10,
        true
      );
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    values.slice(0, 10).forEach(val => cancelAnimation(val));
    const test2Time = (performance.now() - test2Start) / 60;

    newResults.push({
      name: '다중 애니메이션 (10개)',
      avgFrameTime: test2Time,
      fps: Math.round(1000 / test2Time),
      status: test2Time < 16 ? 'good' : test2Time < 20 ? 'warning' : 'bad',
    });

    // 테스트 3: 복잡한 시퀀스
    const test3Start = performance.now();
    values[0].value = withRepeat(
      withSequence(
        withTiming(50, { duration: 100 }),
        withSpring(100),
        withTiming(0, { duration: 100 })
      ),
      5,
      false
    );
    await new Promise(resolve => setTimeout(resolve, 1500));
    cancelAnimation(values[0]);
    const test3Time = (performance.now() - test3Start) / 90;

    newResults.push({
      name: '복잡한 시퀀스',
      avgFrameTime: test3Time,
      fps: Math.round(1000 / test3Time),
      status: test3Time < 16 ? 'good' : test3Time < 20 ? 'warning' : 'bad',
    });

    setResults(newResults);
    setIsRunning(false);
  }, [values]);

  const getStatusColor = (status: BenchmarkResult['status']) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'bad': return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>성능 벤치마크</Text>

      <Pressable
        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
        onPress={runBenchmark}
        disabled={isRunning}
      >
        <Text style={styles.runButtonText}>
          {isRunning ? '측정 중...' : '벤치마크 실행'}
        </Text>
      </Pressable>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>{result.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(result.status) }
                ]}
              >
                <Text style={styles.statusText}>
                  {result.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.resultStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{result.fps}</Text>
                <Text style={styles.statLabel}>FPS</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {result.avgFrameTime.toFixed(1)}ms
                </Text>
                <Text style={styles.statLabel}>Frame Time</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  runButton: {
    backgroundColor: '#7A4AE2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  runButtonDisabled: {
    backgroundColor: '#CCC',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A4AE2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export { PerformanceBenchmark };
```

## sometimes-app 적용 사례

### 매칭 카드 성능 모니터링

```typescript
// src/features/matching/ui/performance-matching-card.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
  useFrameCallback,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface PerformanceMatchingCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    imageUrl: string;
    university: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  debugMode?: boolean;
}

export function PerformanceMatchingCard({
  user,
  onSwipeLeft,
  onSwipeRight,
  debugMode = __DEV__,
}: PerformanceMatchingCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // 성능 측정
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameTime: 16.6,
  });

  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(0);
  const accumulatedTime = useSharedValue(0);

  useFrameCallback((info) => {
    if (!debugMode) return;

    if (lastTime.value > 0) {
      const delta = (info.timestamp - lastTime.value) / 1000000;
      accumulatedTime.value += delta;
      frameCount.value++;

      if (accumulatedTime.value >= 1000) {
        const avgTime = accumulatedTime.value / frameCount.value;
        runOnJS(setMetrics)({
          fps: Math.round(1000 / avgTime),
          frameTime: avgTime,
        });
        accumulatedTime.value = 0;
        frameCount.value = 0;
      }
    }
    lastTime.value = info.timestamp;
  }, debugMode);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // UI Thread에서 회전 계산
      rotation.value = event.translationX / 20;
    })
    .onEnd((event) => {
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;

      if (shouldSwipeRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (shouldSwipeLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        // 리셋
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }

      scale.value = withSpring(1);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  // Like/Nope 오버레이 스타일 (성능 최적화)
  const likeOpacity = useAnimatedStyle(() => ({
    // 계산을 worklet에서 수행
    opacity: translateX.value > 0
      ? Math.min(translateX.value / SWIPE_THRESHOLD, 1)
      : 0,
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: translateX.value < 0
      ? Math.min(-translateX.value / SWIPE_THRESHOLD, 1)
      : 0,
  }));

  return (
    <View style={styles.container}>
      {/* 성능 오버레이 (디버그 모드) */}
      {debugMode && (
        <View style={styles.debugOverlay}>
          <Text style={[
            styles.debugFps,
            { color: metrics.fps >= 55 ? '#4CAF50' : '#F44336' }
          ]}>
            {metrics.fps} FPS
          </Text>
          <Text style={styles.debugFrameTime}>
            {metrics.frameTime.toFixed(1)}ms
          </Text>
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Image source={{ uri: user.imageUrl }} style={styles.image} />

          {/* Like 오버레이 */}
          <Animated.View style={[styles.likeOverlay, likeOpacity]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          {/* Nope 오버레이 */}
          <Animated.View style={[styles.nopeOverlay, nopeOpacity]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {/* 사용자 정보 */}
          <View style={styles.info}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            <Text style={styles.university}>{user.university}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    zIndex: 100,
  },
  debugFps: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  debugFrameTime: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeOverlay: {
    position: 'absolute',
    top: 40,
    left: 30,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
  },
  likeText: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nopeOverlay: {
    position: 'absolute',
    top: 40,
    right: 30,
    transform: [{ rotate: '15deg' }],
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 10,
  },
  nopeText: {
    color: '#F44336',
    fontSize: 32,
    fontWeight: 'bold',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  university: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 4,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. JS Thread 블로킹

```typescript
// ❌ 잘못된 예: 동기 연산이 애니메이션 차단
function BadExample() {
  const translateX = useSharedValue(0);

  const handlePress = () => {
    // 무거운 동기 연산
    const heavyResult = heavyComputation(); // 100ms 블로킹!
    translateX.value = withTiming(heavyResult);
  };

  return /* ... */;
}

// ✅ 올바른 예: 비동기 처리
function GoodExample() {
  const translateX = useSharedValue(0);

  const handlePress = async () => {
    // 먼저 애니메이션 시작
    translateX.value = withTiming(100);

    // 무거운 연산은 비동기로
    setTimeout(() => {
      const result = heavyComputation();
      // 필요시 추가 애니메이션
    }, 0);
  };

  return /* ... */;
}
```

### 2. 불필요한 리렌더링

```typescript
// ❌ 잘못된 예: 인라인 스타일 객체
function BadExample() {
  const scale = useSharedValue(1);

  return (
    <Animated.View
      // 매 렌더마다 새 객체 생성!
      style={[
        { width: 100, height: 100 },
        useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        })),
      ]}
    />
  );
}

// ✅ 올바른 예: 스타일 분리
function GoodExample() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.box, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  box: { width: 100, height: 100 },
});
```

### 3. 과도한 useAnimatedStyle

```typescript
// ❌ 잘못된 예: 별도의 useAnimatedStyle
function BadExample() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);

  // 3개의 별도 훅 - 불필요한 오버헤드
  const styleX = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const styleY = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  const styleRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return /* ... */;
}

// ✅ 올바른 예: 단일 useAnimatedStyle
function GoodExample() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);

  // 하나로 통합
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return /* ... */;
}
```

## 💡 성능 최적화 팁

### 1. 개발 중 성능 체크리스트

```typescript
/**
 * 성능 최적화 체크리스트
 *
 * □ 모든 애니메이션이 useAnimatedStyle을 사용하는가?
 * □ 무거운 계산이 worklet 내부에서 수행되는가?
 * □ runOnJS 호출이 최소화되어 있는가?
 * □ 불필요한 리렌더링이 없는가?
 * □ StyleSheet.create로 정적 스타일이 분리되어 있는가?
 * □ 애니메이션 값 개수가 적정한가? (< 50개 권장)
 * □ 이미지가 최적화되어 있는가?
 * □ 리스트에서 keyExtractor가 적절한가?
 */
```

### 2. 성능 프로파일링 유틸리티

```typescript
// utils/performance-profiler.ts
type ProfileCallback = () => void;

export function profileAnimation(name: string, callback: ProfileCallback) {
  if (!__DEV__) {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();

  const duration = endTime - startTime;
  const status = duration < 16 ? '✅' : duration < 33 ? '⚠️' : '❌';

  console.log(`${status} [Animation] ${name}: ${duration.toFixed(2)}ms`);
}

// 사용 예시
profileAnimation('card-swipe', () => {
  translateX.value = withSpring(200);
});
```

### 3. 조건부 애니메이션 로깅

```typescript
// hooks/use-animation-logger.ts
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';

export function useAnimationLogger(
  value: Animated.SharedValue<number>,
  name: string,
  enabled: boolean = __DEV__
) {
  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      if (!enabled) return;

      if (previous !== null && current !== previous) {
        runOnJS(console.log)(
          `[Animation] ${name}: ${previous?.toFixed(2)} → ${current.toFixed(2)}`
        );
      }
    },
    [enabled, name]
  );
}
```

## 🏋️ 연습 문제

### 문제 1: 프레임 드롭 감지기 구현

다음 요구사항을 만족하는 프레임 드롭 감지기를 구현하세요:
- 20ms 이상 걸리는 프레임 감지
- 연속 드롭 횟수 추적
- 경고 콜백 트리거

```typescript
function useFrameDropDetector(options: {
  threshold?: number;
  onDrop?: (droppedFrames: number) => void;
}) {
  // 구현하세요
}
```

### 문제 2: 애니메이션 복잡도 분석기

SharedValue 개수와 useAnimatedStyle 호출 빈도를 분석하는 도구를 구현하세요.

### 문제 3: 저사양 기기 감지

기기 성능을 감지하고 애니메이션 품질을 자동 조절하는 Hook을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
// 문제 1 정답
function useFrameDropDetector({
  threshold = 20,
  onDrop,
}: {
  threshold?: number;
  onDrop?: (droppedFrames: number) => void;
} = {}) {
  const lastFrameTime = useSharedValue(0);
  const consecutiveDrops = useSharedValue(0);

  const handleDrop = useCallback((count: number) => {
    onDrop?.(count);
  }, [onDrop]);

  useFrameCallback((info) => {
    if (lastFrameTime.value > 0) {
      const frameTime = (info.timestamp - lastFrameTime.value) / 1000000;

      if (frameTime > threshold) {
        consecutiveDrops.value++;
        runOnJS(handleDrop)(consecutiveDrops.value);
      } else {
        consecutiveDrops.value = 0;
      }
    }

    lastFrameTime.value = info.timestamp;
  });

  return {
    getDropCount: () => consecutiveDrops.value,
  };
}

// 문제 2 정답
function useAnimationComplexityAnalyzer() {
  const sharedValueCount = useRef(0);
  const animatedStyleCount = useRef(0);

  const trackSharedValue = useCallback(() => {
    sharedValueCount.current++;
  }, []);

  const trackAnimatedStyle = useCallback(() => {
    animatedStyleCount.current++;
  }, []);

  const getReport = useCallback(() => {
    const complexity = sharedValueCount.current * 0.5 +
                       animatedStyleCount.current * 1.5;

    return {
      sharedValues: sharedValueCount.current,
      animatedStyles: animatedStyleCount.current,
      complexityScore: complexity,
      recommendation: complexity > 50
        ? '최적화 필요'
        : complexity > 25
          ? '양호'
          : '최적',
    };
  }, []);

  return {
    trackSharedValue,
    trackAnimatedStyle,
    getReport,
  };
}

// 문제 3 정답
function useAdaptiveQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const checkPerformance = async () => {
      // 간단한 벤치마크
      const testValue = makeSharedValue(0);
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        testValue.value = withTiming(i, { duration: 1 });
      }

      const elapsed = performance.now() - startTime;

      if (elapsed < 50) {
        setQuality('high');
      } else if (elapsed < 100) {
        setQuality('medium');
      } else {
        setQuality('low');
      }
    };

    checkPerformance();
  }, []);

  const getAnimationConfig = useCallback(() => {
    switch (quality) {
      case 'high':
        return {
          useSpring: true,
          duration: 300,
          damping: 15,
        };
      case 'medium':
        return {
          useSpring: false,
          duration: 200,
          damping: 20,
        };
      case 'low':
        return {
          useSpring: false,
          duration: 150,
          damping: 25,
        };
    }
  }, [quality]);

  return { quality, getAnimationConfig };
}
```

</details>

## 📚 이 장에서 배운 내용

1. **스레드 아키텍처**: React Native의 JS Thread, UI Thread, Bridge 구조
2. **Worklet의 이점**: UI Thread에서 직접 실행으로 Bridge 오버헤드 제거
3. **16.6ms 규칙**: 60fps 유지를 위한 프레임 예산 관리
4. **성능 측정**: useFrameCallback을 활용한 실시간 FPS 모니터링
5. **핵심 원칙**: runOnJS 최소화, UI Thread 계산, 스타일 메모이제이션
6. **디버깅 도구**: 성능 오버레이, 벤치마크, 프로파일링 유틸리티

## 다음 장 예고

**Chapter 57: 메모리 관리**에서는 Reanimated 애니메이션의 메모리 누수를 방지하고 효율적으로 관리하는 방법을 배웁니다. SharedValue 생명주기, 애니메이션 정리, 가비지 컬렉션 최적화 등을 다룹니다.
