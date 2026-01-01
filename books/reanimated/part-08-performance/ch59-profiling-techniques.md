# Chapter 59: 프로파일링 기법

React Native와 Reanimated 애니메이션의 성능을 측정하고 분석하는 도구와 기법을 배웁니다.

## 📌 학습 목표

- React Native Performance Monitor 활용법
- Flipper를 통한 성능 프로파일링
- 커스텀 성능 측정 도구 구현
- 애니메이션 병목 현상 식별 및 해결

## 📖 개념 이해

### 프로파일링 도구 개요

```
┌─────────────────────────────────────────────────────────────┐
│                  Profiling Tools Overview                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Built-in Tools (무료)                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • Performance Monitor (RN 내장)                      │    │
│  │ • console.time / console.timeEnd                     │    │
│  │ • React DevTools Profiler                            │    │
│  │ • useFrameCallback (Reanimated)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              External Tools (선택)                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • Flipper + React DevTools Plugin                    │    │
│  │ • Xcode Instruments (iOS)                            │    │
│  │ • Android Studio Profiler                            │    │
│  │ • Reactotron                                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Custom Implementation                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • useAnimationProfiler Hook                          │    │
│  │ • PerformanceOverlay Component                       │    │
│  │ • Frame Drop Detector                                │    │
│  │ • Render Count Tracker                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 측정 지표

```
┌─────────────────────────────────────────────────────────────┐
│                    Key Metrics                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FPS (Frames Per Second)                                     │
│  ├── 60 FPS: 이상적 (16.6ms/frame)                          │
│  ├── 45-59 FPS: 허용 가능                                   │
│  ├── 30-44 FPS: 개선 필요                                   │
│  └── < 30 FPS: 심각한 문제                                  │
│                                                              │
│  Frame Time (프레임 처리 시간)                               │
│  ├── < 8ms: 최적 (여유 있음)                                │
│  ├── 8-12ms: 양호                                           │
│  ├── 12-16ms: 경계                                          │
│  └── > 16ms: 프레임 드롭 발생                               │
│                                                              │
│  JS Thread Usage                                             │
│  ├── < 60%: 양호                                            │
│  ├── 60-80%: 주의                                           │
│  └── > 80%: 병목 가능성                                     │
│                                                              │
│  Memory Usage                                                │
│  ├── 안정적: 일정하게 유지                                  │
│  ├── 경고: 지속적 증가 (누수 의심)                          │
│  └── 위험: 급격한 증가                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 기본 성능 모니터

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  jank: number;
  jsThread: number;
}

function usePerformanceMonitor(enabled: boolean = true) {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.6,
    jank: 0,
    jsThread: 0,
  });

  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(0);
  const accumulatedTime = useSharedValue(0);
  const jankCount = useSharedValue(0);

  const updateStats = useCallback((
    fps: number,
    frameTime: number,
    jank: number
  ) => {
    setStats(prev => ({
      ...prev,
      fps,
      frameTime,
      jank,
    }));
  }, []);

  useFrameCallback((info) => {
    if (!enabled) return;

    const currentTime = info.timestamp;

    if (lastTime.value > 0) {
      const deltaMs = (currentTime - lastTime.value) / 1000000; // ns to ms

      // Jank 감지 (25ms 이상)
      if (deltaMs > 25) {
        jankCount.value++;
      }

      accumulatedTime.value += deltaMs;
      frameCount.value++;

      // 1초마다 통계 업데이트
      if (accumulatedTime.value >= 1000) {
        const avgFrameTime = accumulatedTime.value / frameCount.value;
        const fps = Math.round(1000 / avgFrameTime);

        runOnJS(updateStats)(
          fps,
          avgFrameTime,
          jankCount.value
        );

        accumulatedTime.value = 0;
        frameCount.value = 0;
        jankCount.value = 0;
      }
    }

    lastTime.value = currentTime;
  }, enabled);

  return stats;
}

// 성능 오버레이 컴포넌트
function PerformanceOverlay({
  enabled = __DEV__,
}: {
  enabled?: boolean;
}) {
  const stats = usePerformanceMonitor(enabled);
  const [visible, setVisible] = useState(true);

  if (!enabled) return null;

  const fpsColor = stats.fps >= 55 ? '#4CAF50' :
                   stats.fps >= 45 ? '#FFC107' : '#F44336';

  return (
    <Pressable
      style={styles.overlay}
      onPress={() => setVisible(v => !v)}
    >
      {visible && (
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={[styles.fps, { color: fpsColor }]}>
              {stats.fps}
            </Text>
            <Text style={styles.label}>FPS</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>
              {stats.frameTime.toFixed(1)}
            </Text>
            <Text style={styles.label}>ms</Text>
          </View>
          {stats.jank > 0 && (
            <View style={styles.jankBadge}>
              <Text style={styles.jankText}>
                {stats.jank} janks
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fps: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  jankBadge: {
    marginTop: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export { PerformanceOverlay, usePerformanceMonitor };
```

### 2. 상세 프로파일러

```typescript
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

interface FrameData {
  timestamp: number;
  duration: number;
  isJank: boolean;
}

interface ProfilerReport {
  totalFrames: number;
  averageFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  p95FrameTime: number;
  jankFrames: number;
  jankPercentage: number;
  fps: number;
}

function useDetailedProfiler(maxFrames: number = 300) {
  const [isRecording, setIsRecording] = useState(false);
  const [report, setReport] = useState<ProfilerReport | null>(null);

  const framesRef = useRef<FrameData[]>([]);
  const lastTimeRef = useSharedValue(0);
  const recordingRef = useSharedValue(false);

  const processFrames = useCallback(() => {
    const frames = framesRef.current;
    if (frames.length === 0) return null;

    const durations = frames.map(f => f.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const jankFrames = frames.filter(f => f.isJank).length;

    const p95Index = Math.floor(durations.length * 0.95);

    return {
      totalFrames: frames.length,
      averageFrameTime: total / frames.length,
      minFrameTime: durations[0],
      maxFrameTime: durations[durations.length - 1],
      p95FrameTime: durations[p95Index],
      jankFrames,
      jankPercentage: (jankFrames / frames.length) * 100,
      fps: Math.round(1000 / (total / frames.length)),
    };
  }, []);

  useFrameCallback((info) => {
    if (!recordingRef.value) return;

    const currentTime = info.timestamp;

    if (lastTimeRef.value > 0) {
      const duration = (currentTime - lastTimeRef.value) / 1000000;

      runOnJS((d: number, t: number) => {
        if (framesRef.current.length < maxFrames) {
          framesRef.current.push({
            timestamp: t,
            duration: d,
            isJank: d > 20,
          });
        } else {
          // 자동 중지
          recordingRef.value = false;
          setIsRecording(false);
          const result = processFrames();
          setReport(result);
        }
      })(duration, currentTime);
    }

    lastTimeRef.value = currentTime;
  }, isRecording);

  const startRecording = useCallback(() => {
    framesRef.current = [];
    lastTimeRef.value = 0;
    recordingRef.value = true;
    setIsRecording(true);
    setReport(null);
  }, []);

  const stopRecording = useCallback(() => {
    recordingRef.value = false;
    setIsRecording(false);
    const result = processFrames();
    setReport(result);
  }, [processFrames]);

  const reset = useCallback(() => {
    framesRef.current = [];
    setReport(null);
    setIsRecording(false);
    recordingRef.value = false;
  }, []);

  return {
    isRecording,
    report,
    startRecording,
    stopRecording,
    reset,
    frameCount: framesRef.current.length,
  };
}

// 프로파일러 UI
function ProfilerUI() {
  const {
    isRecording,
    report,
    startRecording,
    stopRecording,
    reset,
    frameCount,
  } = useDetailedProfiler(300);

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return '#4CAF50';
    if (value <= thresholds[1]) return '#FFC107';
    return '#F44336';
  };

  return (
    <View style={styles.profiler}>
      <Text style={styles.title}>Animation Profiler</Text>

      <View style={styles.controls}>
        {!isRecording ? (
          <Pressable
            style={[styles.button, styles.startButton]}
            onPress={startRecording}
          >
            <Text style={styles.buttonText}>Start Recording</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, styles.stopButton]}
            onPress={stopRecording}
          >
            <Text style={styles.buttonText}>
              Stop ({frameCount}/300)
            </Text>
          </Pressable>
        )}

        {report && (
          <Pressable
            style={[styles.button, styles.resetButton]}
            onPress={reset}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        )}
      </View>

      {report && (
        <ScrollView style={styles.report}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Average FPS</Text>
            <Text style={[
              styles.metricValue,
              { color: getStatusColor(16.6, [12, 16]) }
            ]}>
              {report.fps}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg Frame Time</Text>
            <Text style={[
              styles.metricValue,
              { color: getStatusColor(report.averageFrameTime, [12, 16]) }
            ]}>
              {report.averageFrameTime.toFixed(2)}ms
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>P95 Frame Time</Text>
            <Text style={[
              styles.metricValue,
              { color: getStatusColor(report.p95FrameTime, [14, 20]) }
            ]}>
              {report.p95FrameTime.toFixed(2)}ms
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Min / Max</Text>
            <Text style={styles.metricValue}>
              {report.minFrameTime.toFixed(1)} / {report.maxFrameTime.toFixed(1)}ms
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Jank Frames</Text>
            <Text style={[
              styles.metricValue,
              { color: getStatusColor(report.jankPercentage, [5, 10]) }
            ]}>
              {report.jankFrames} ({report.jankPercentage.toFixed(1)}%)
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profiler: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  report: {
    maxHeight: 300,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  metricLabel: {
    color: '#999',
    fontSize: 14,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export { ProfilerUI, useDetailedProfiler };
```

### 3. 렌더링 프로파일러

```typescript
import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';

interface RenderInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

// 전역 렌더링 추적기
class RenderTracker {
  private static instance: RenderTracker;
  private renders: Map<string, RenderInfo> = new Map();
  private listeners: Set<() => void> = new Set();

  static getInstance() {
    if (!this.instance) {
      this.instance = new RenderTracker();
    }
    return this.instance;
  }

  trackRender(componentName: string, renderTime: number) {
    const existing = this.renders.get(componentName);

    if (existing) {
      const newTotal = existing.totalRenderTime + renderTime;
      const newCount = existing.renderCount + 1;

      this.renders.set(componentName, {
        componentName,
        renderCount: newCount,
        lastRenderTime: renderTime,
        averageRenderTime: newTotal / newCount,
        totalRenderTime: newTotal,
      });
    } else {
      this.renders.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: renderTime,
        averageRenderTime: renderTime,
        totalRenderTime: renderTime,
      });
    }

    this.notifyListeners();
  }

  getRenders(): RenderInfo[] {
    return Array.from(this.renders.values())
      .sort((a, b) => b.totalRenderTime - a.totalRenderTime);
  }

  reset() {
    this.renders.clear();
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }
}

// 렌더링 추적 HOC
function withRenderTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function TrackedComponent(props: P) {
    const startTime = useRef(performance.now());

    useEffect(() => {
      const renderTime = performance.now() - startTime.current;

      if (__DEV__) {
        RenderTracker.getInstance().trackRender(componentName, renderTime);
      }
    });

    // 매 렌더 시작 시간 기록
    startTime.current = performance.now();

    return <WrappedComponent {...props} />;
  };
}

// 렌더 프로파일러 훅
function useRenderProfiler(componentName: string) {
  const startTime = useRef(performance.now());
  const renderCount = useRef(0);

  renderCount.current++;

  useEffect(() => {
    const renderTime = performance.now() - startTime.current;

    if (__DEV__) {
      RenderTracker.getInstance().trackRender(componentName, renderTime);
    }
  });

  // 매 렌더 시작 시간 갱신
  startTime.current = performance.now();

  return {
    renderCount: renderCount.current,
  };
}

// 렌더 프로파일러 UI
function RenderProfilerUI() {
  const [renders, setRenders] = useState<RenderInfo[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const tracker = RenderTracker.getInstance();

    const update = () => {
      setRenders(tracker.getRenders());
    };

    update();
    return tracker.subscribe(update);
  }, []);

  const handleReset = () => {
    RenderTracker.getInstance().reset();
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
      >
        <Text style={styles.title}>Render Profiler</Text>
        <Text style={styles.count}>
          {renders.length} components
        </Text>
      </Pressable>

      {expanded && (
        <>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>

          <ScrollView style={styles.list}>
            {renders.map(info => (
              <View key={info.componentName} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.componentName}>
                    {info.componentName}
                  </Text>
                  <Text style={styles.renderCount}>
                    ×{info.renderCount}
                  </Text>
                </View>
                <View style={styles.itemStats}>
                  <Text style={styles.stat}>
                    Avg: {info.averageRenderTime.toFixed(2)}ms
                  </Text>
                  <Text style={styles.stat}>
                    Total: {info.totalRenderTime.toFixed(1)}ms
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  count: {
    color: '#999',
    fontSize: 12,
  },
  resetButton: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  resetText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    maxHeight: 200,
    padding: 8,
  },
  item: {
    padding: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  renderCount: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  stat: {
    color: '#999',
    fontSize: 10,
  },
});

export {
  RenderProfilerUI,
  withRenderTracking,
  useRenderProfiler,
  RenderTracker,
};
```

### 4. 애니메이션 벤치마크

```typescript
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface BenchmarkTest {
  name: string;
  description: string;
  run: (values: Animated.SharedValue<number>[]) => Promise<number>;
}

interface BenchmarkResult {
  name: string;
  duration: number;
  fps: number;
  status: 'good' | 'warning' | 'bad';
}

function useAnimationBenchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  // 테스트용 SharedValue들 (최대 100개)
  const values = useRef(
    Array.from({ length: 100 }, () => useSharedValue(0))
  ).current;

  const tests: BenchmarkTest[] = [
    {
      name: 'Single Timing',
      description: '단일 withTiming 애니메이션',
      run: async (vals) => {
        const start = performance.now();
        vals[0].value = withTiming(100, { duration: 500 });
        await new Promise(r => setTimeout(r, 600));
        cancelAnimation(vals[0]);
        return performance.now() - start;
      },
    },
    {
      name: 'Single Spring',
      description: '단일 withSpring 애니메이션',
      run: async (vals) => {
        const start = performance.now();
        vals[0].value = withSpring(100);
        await new Promise(r => setTimeout(r, 800));
        cancelAnimation(vals[0]);
        return performance.now() - start;
      },
    },
    {
      name: 'Multi Timing (10)',
      description: '10개 동시 withTiming',
      run: async (vals) => {
        const start = performance.now();
        vals.slice(0, 10).forEach((v, i) => {
          v.value = withTiming(100, { duration: 500 + i * 50 });
        });
        await new Promise(r => setTimeout(r, 1000));
        vals.slice(0, 10).forEach(v => cancelAnimation(v));
        return performance.now() - start;
      },
    },
    {
      name: 'Multi Spring (10)',
      description: '10개 동시 withSpring',
      run: async (vals) => {
        const start = performance.now();
        vals.slice(0, 10).forEach(v => {
          v.value = withSpring(100);
        });
        await new Promise(r => setTimeout(r, 1000));
        vals.slice(0, 10).forEach(v => cancelAnimation(v));
        return performance.now() - start;
      },
    },
    {
      name: 'Stress Test (50)',
      description: '50개 동시 애니메이션',
      run: async (vals) => {
        const start = performance.now();
        vals.slice(0, 50).forEach((v, i) => {
          v.value = withRepeat(
            withTiming(100, { duration: 200 + i * 10 }),
            3,
            true
          );
        });
        await new Promise(r => setTimeout(r, 1500));
        vals.slice(0, 50).forEach(v => cancelAnimation(v));
        return performance.now() - start;
      },
    },
    {
      name: 'Complex Sequence',
      description: '복잡한 시퀀스 애니메이션',
      run: async (vals) => {
        const start = performance.now();
        vals[0].value = withRepeat(
          withSequence(
            withTiming(50, { duration: 200 }),
            withSpring(100),
            withTiming(75, { duration: 200 }),
            withSpring(0)
          ),
          2,
          false
        );
        await new Promise(r => setTimeout(r, 2000));
        cancelAnimation(vals[0]);
        return performance.now() - start;
      },
    },
  ];

  const runBenchmarks = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const newResults: BenchmarkResult[] = [];

    for (const test of tests) {
      setCurrentTest(test.name);

      // 이전 애니메이션 정리
      values.forEach(v => {
        cancelAnimation(v);
        v.value = 0;
      });

      await new Promise(r => setTimeout(r, 100));

      const duration = await test.run(values);
      const fps = Math.round((duration / 1000) * 60);

      newResults.push({
        name: test.name,
        duration,
        fps,
        status: duration < 800 ? 'good' :
                duration < 1500 ? 'warning' : 'bad',
      });

      setResults([...newResults]);
    }

    // 정리
    values.forEach(v => {
      cancelAnimation(v);
      v.value = 0;
    });

    setCurrentTest(null);
    setIsRunning(false);
  }, [tests, values]);

  return {
    results,
    isRunning,
    currentTest,
    runBenchmarks,
    tests,
  };
}

function BenchmarkUI() {
  const {
    results,
    isRunning,
    currentTest,
    runBenchmarks,
    tests,
  } = useAnimationBenchmark();

  const getStatusColor = (status: BenchmarkResult['status']) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'bad': return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Benchmark</Text>

      <Pressable
        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
        onPress={runBenchmarks}
        disabled={isRunning}
      >
        <Text style={styles.runButtonText}>
          {isRunning ? `Running: ${currentTest}...` : 'Run Benchmarks'}
        </Text>
      </Pressable>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>{result.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(result.status) }
              ]}>
                <Text style={styles.statusText}>
                  {result.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.resultDescription}>
              {tests.find(t => t.name === result.name)?.description}
            </Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultDuration}>
                {result.duration.toFixed(0)}ms
              </Text>
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
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  runButton: {
    backgroundColor: '#7A4AE2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  runButtonDisabled: {
    backgroundColor: '#999',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultStats: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  resultDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A4AE2',
  },
});

export { BenchmarkUI, useAnimationBenchmark };
```

## sometimes-app 적용 사례

### 매칭 화면 성능 모니터

```typescript
// src/features/matching/ui/matching-performance-monitor.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchingStats {
  fps: number;
  swipeLatency: number;
  renderCount: number;
  gestureEvents: number;
}

export function MatchingPerformanceMonitor({
  children,
  enabled = __DEV__,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const [stats, setStats] = useState<MatchingStats>({
    fps: 60,
    swipeLatency: 0,
    renderCount: 0,
    gestureEvents: 0,
  });

  // FPS 측정
  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(0);
  const accumulatedTime = useSharedValue(0);

  // 제스처 이벤트 카운트
  const gestureEventsRef = useSharedValue(0);

  // 스와이프 지연 시간 측정
  const swipeStartTime = useSharedValue(0);
  const swipeLatency = useSharedValue(0);

  const updateFps = useCallback((fps: number) => {
    setStats(prev => ({ ...prev, fps }));
  }, []);

  useFrameCallback((info) => {
    if (!enabled) return;

    const currentTime = info.timestamp;

    if (lastTime.value > 0) {
      const delta = (currentTime - lastTime.value) / 1000000;
      accumulatedTime.value += delta;
      frameCount.value++;

      if (accumulatedTime.value >= 1000) {
        const fps = Math.round(1000 / (accumulatedTime.value / frameCount.value));
        runOnJS(updateFps)(fps);
        accumulatedTime.value = 0;
        frameCount.value = 0;
      }
    }

    lastTime.value = currentTime;
  }, enabled);

  // 스와이프 성능 측정용 제스처
  const measureGesture = Gesture.Pan()
    .onStart(() => {
      swipeStartTime.value = Date.now();
      gestureEventsRef.value++;
    })
    .onUpdate(() => {
      gestureEventsRef.value++;
    })
    .onEnd(() => {
      const latency = Date.now() - swipeStartTime.value;
      swipeLatency.value = latency;

      runOnJS(setStats)((prev: MatchingStats) => ({
        ...prev,
        swipeLatency: latency,
        gestureEvents: gestureEventsRef.value,
      }));
    });

  if (!enabled) {
    return <>{children}</>;
  }

  const fpsColor = stats.fps >= 55 ? '#4CAF50' :
                   stats.fps >= 45 ? '#FFC107' : '#F44336';

  return (
    <View style={styles.container}>
      <GestureDetector gesture={measureGesture}>
        <View style={styles.content}>
          {children}
        </View>
      </GestureDetector>

      {/* 성능 오버레이 */}
      <View style={styles.overlay}>
        <View style={styles.statsRow}>
          <Text style={[styles.fps, { color: fpsColor }]}>
            {stats.fps} FPS
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.label}>Swipe Latency:</Text>
          <Text style={styles.value}>{stats.swipeLatency}ms</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.label}>Gesture Events:</Text>
          <Text style={styles.value}>{stats.gestureEvents}</Text>
        </View>
      </View>
    </View>
  );
}

// 카드 스와이프 성능 분석
export function useSwipePerformanceAnalysis() {
  const swipeMetrics = useSharedValue<{
    startTime: number;
    endTime: number;
    distance: number;
    velocity: number;
  }[]>([]);

  const startSwipe = useCallback(() => {
    'worklet';
    swipeMetrics.modify(metrics => {
      metrics.push({
        startTime: Date.now(),
        endTime: 0,
        distance: 0,
        velocity: 0,
      });
      return metrics;
    });
  }, [swipeMetrics]);

  const updateSwipe = useCallback((distance: number, velocity: number) => {
    'worklet';
    swipeMetrics.modify(metrics => {
      if (metrics.length > 0) {
        const last = metrics[metrics.length - 1];
        last.distance = distance;
        last.velocity = velocity;
      }
      return metrics;
    });
  }, [swipeMetrics]);

  const endSwipe = useCallback(() => {
    'worklet';
    swipeMetrics.modify(metrics => {
      if (metrics.length > 0) {
        metrics[metrics.length - 1].endTime = Date.now();
      }
      return metrics;
    });
  }, [swipeMetrics]);

  const getAnalysis = useCallback(() => {
    const metrics = swipeMetrics.value;
    if (metrics.length === 0) return null;

    const durations = metrics
      .filter(m => m.endTime > 0)
      .map(m => m.endTime - m.startTime);

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxVelocity = Math.max(...metrics.map(m => m.velocity));
    const avgDistance = metrics.reduce((a, b) => a + b.distance, 0) / metrics.length;

    return {
      totalSwipes: metrics.length,
      averageDuration: avgDuration,
      maxVelocity,
      averageDistance: avgDistance,
    };
  }, [swipeMetrics]);

  return {
    startSwipe,
    updateSwipe,
    endSwipe,
    getAnalysis,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fps: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  label: {
    color: '#999',
    fontSize: 11,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 프로덕션에서 프로파일링 코드 남김

```typescript
// ❌ 프로덕션에 불필요한 코드 포함
useFrameCallback((info) => {
  // 항상 실행됨
  trackPerformance(info);
});

// ✅ 개발 모드에서만 실행
useFrameCallback((info) => {
  trackPerformance(info);
}, __DEV__); // enabled 파라미터 활용
```

### 2. 과도한 로깅

```typescript
// ❌ 매 프레임 로깅 (성능 저하)
useFrameCallback(() => {
  console.log('Frame rendered');
});

// ✅ 집계 후 로깅
useFrameCallback((info) => {
  frameCount.value++;

  if (frameCount.value % 60 === 0) {
    runOnJS(console.log)('60 frames processed');
  }
});
```

### 3. 메모리 누수 측정 도구

```typescript
// 측정 데이터 누적으로 인한 메모리 누수
const frames: FrameData[] = []; // 계속 증가!

// ✅ 제한된 버퍼 사용
const MAX_FRAMES = 300;
if (frames.length >= MAX_FRAMES) {
  frames.shift(); // 오래된 데이터 제거
}
frames.push(newFrame);
```

## 💡 성능 최적화 팁

### 1. 조건부 프로파일링

```typescript
// 개발 환경에서만 프로파일링
const ProfilerWrapper = __DEV__
  ? PerformanceOverlay
  : ({ children }) => children;

// 사용
<ProfilerWrapper>
  <App />
</ProfilerWrapper>
```

### 2. 청크 기반 분석

```typescript
// 대량 데이터 청크 분석
function analyzeInChunks(data: FrameData[], chunkSize: number = 50) {
  const results: ChunkAnalysis[] = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    results.push(analyzeChunk(chunk, i));
  }

  return results;
}
```

### 3. 리모트 프로파일링

```typescript
// 실제 사용자 기기에서 데이터 수집
async function sendProfileData(data: ProfileData) {
  if (__DEV__) return; // 개발 중에는 로컬만

  try {
    await fetch('https://analytics.example.com/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    // 실패 무시 (성능에 영향 없도록)
  }
}
```

## 🏋️ 연습 문제

### 문제 1: 메모리 프로파일러

SharedValue 할당/해제를 추적하는 메모리 프로파일러를 구현하세요.

### 문제 2: 히트맵 시각화

프레임 시간을 히트맵으로 시각화하는 컴포넌트를 만드세요.

### 문제 3: 자동 성능 리포트

앱 세션 종료 시 성능 리포트를 생성하는 시스템을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
// 문제 1 정답
class MemoryProfiler {
  private allocations: Map<string, number> = new Map();
  private deallocations: Map<string, number> = new Map();

  trackAllocation(id: string) {
    const count = this.allocations.get(id) || 0;
    this.allocations.set(id, count + 1);
  }

  trackDeallocation(id: string) {
    const count = this.deallocations.get(id) || 0;
    this.deallocations.set(id, count + 1);
  }

  getLeaks(): string[] {
    const leaks: string[] = [];

    this.allocations.forEach((allocCount, id) => {
      const deallocCount = this.deallocations.get(id) || 0;
      if (allocCount > deallocCount) {
        leaks.push(`${id}: ${allocCount - deallocCount} leaked`);
      }
    });

    return leaks;
  }
}

// 문제 2 정답
function FrameHeatmap({ frames }: { frames: FrameData[] }) {
  const getColor = (frameTime: number) => {
    if (frameTime < 12) return '#4CAF50';
    if (frameTime < 16) return '#8BC34A';
    if (frameTime < 20) return '#FFEB3B';
    if (frameTime < 25) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.heatmap}>
      {frames.map((frame, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            { backgroundColor: getColor(frame.duration) }
          ]}
        />
      ))}
    </View>
  );
}

// 문제 3 정답
class SessionPerformanceReporter {
  private sessionData: {
    frames: FrameData[];
    renders: RenderInfo[];
    startTime: number;
  } = {
    frames: [],
    renders: [],
    startTime: Date.now(),
  };

  generateReport(): SessionReport {
    const duration = Date.now() - this.sessionData.startTime;
    const frames = this.sessionData.frames;

    return {
      sessionDuration: duration,
      totalFrames: frames.length,
      averageFps: this.calculateAverageFps(frames),
      jankPercentage: this.calculateJankPercentage(frames),
      worstFrameTime: Math.max(...frames.map(f => f.duration)),
      recommendations: this.generateRecommendations(frames),
    };
  }

  private calculateAverageFps(frames: FrameData[]): number {
    if (frames.length === 0) return 0;
    const avgTime = frames.reduce((a, b) => a + b.duration, 0) / frames.length;
    return Math.round(1000 / avgTime);
  }

  private calculateJankPercentage(frames: FrameData[]): number {
    const jankFrames = frames.filter(f => f.duration > 20);
    return (jankFrames.length / frames.length) * 100;
  }

  private generateRecommendations(frames: FrameData[]): string[] {
    const recommendations: string[] = [];
    const jankPercent = this.calculateJankPercentage(frames);

    if (jankPercent > 10) {
      recommendations.push('Consider reducing animation complexity');
    }

    return recommendations;
  }
}
```

</details>

## 📚 이 장에서 배운 내용

1. **성능 지표**: FPS, Frame Time, Jank 개념과 측정 방법
2. **useFrameCallback**: 매 프레임 성능 데이터 수집
3. **커스텀 프로파일러**: 상세 분석을 위한 도구 구현
4. **렌더링 추적**: 컴포넌트별 렌더링 횟수와 시간 측정
5. **벤치마크**: 다양한 애니메이션 패턴 성능 비교
6. **개발/프로덕션 분리**: 조건부 프로파일링으로 성능 영향 최소화

## 다음 장 예고

**Chapter 60: 배터리 효율**에서는 모바일 기기의 배터리를 효율적으로 사용하면서 부드러운 애니메이션을 유지하는 방법을 배웁니다. 백그라운드 상태 처리, 적응형 프레임 레이트, 전력 효율적인 애니메이션 패턴을 다룹니다.
