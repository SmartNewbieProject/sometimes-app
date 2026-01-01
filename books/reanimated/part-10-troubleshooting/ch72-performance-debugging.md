# Chapter 72: 성능 디버깅 도구

Reanimated 애니메이션의 성능 문제를 진단하고 해결하기 위한 도구와 기법을 학습합니다.

## 📌 학습 목표

- 성능 모니터링 도구 활용법
- JS Thread vs UI Thread 병목 구분
- FPS 드롭 원인 분석
- 메모리 프로파일링 기법

## 📖 개념 이해

### 애니메이션 성능 측정 지표

```
┌─────────────────────────────────────────────────────────────┐
│                Performance Metrics                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   Frame Rate     │    │   Frame Drops    │               │
│  │   Target: 60fps  │    │   Target: 0      │               │
│  │   Min: 30fps     │    │   Warning: >5%   │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   JS Thread      │    │   UI Thread      │               │
│  │   < 16ms/frame   │    │   < 16ms/frame   │               │
│  │   (Non-blocking) │    │   (Rendering)    │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Memory Usage    │    │   CPU Usage      │               │
│  │  Watch for leaks │    │  Monitor spikes  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 성능 병목 발생 위치

```
┌─────────────────────────────────────────────────────────────┐
│                 Animation Pipeline                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Input                                                  │
│      ↓                                                       │
│  ┌────────────────┐                                         │
│  │   JS Thread    │ ← Potential bottleneck                  │
│  │  (Event Loop)  │   - Complex calculations               │
│  │                │   - State updates                       │
│  └───────┬────────┘   - Heavy callbacks                     │
│          ↓                                                   │
│  ┌────────────────┐                                         │
│  │  Bridge/JSI    │ ← Minimal with Reanimated 3+            │
│  └───────┬────────┘                                         │
│          ↓                                                   │
│  ┌────────────────┐                                         │
│  │   UI Thread    │ ← Worklets run here                     │
│  │   (Rendering)  │   - Style calculations                  │
│  └───────┬────────┘   - Layout updates                      │
│          ↓                                                   │
│  ┌────────────────┐                                         │
│  │    GPU/Metal   │ ← Hardware acceleration                 │
│  │   Compositing  │                                         │
│  └────────────────┘                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: FPS 모니터링 컴포넌트

```typescript
// src/debug/FPSMonitor.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

interface FPSData {
  current: number;
  average: number;
  min: number;
  max: number;
  drops: number;
}

export function FPSMonitor({ enabled = __DEV__ }: { enabled?: boolean }) {
  const [fps, setFps] = useState<FPSData>({
    current: 60,
    average: 60,
    min: 60,
    max: 60,
    drops: 0,
  });

  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(0);
  const fpsHistory = useRef<number[]>([]);

  const updateFPS = useCallback((currentFps: number) => {
    fpsHistory.current.push(currentFps);
    if (fpsHistory.current.length > 60) {
      fpsHistory.current.shift();
    }

    const history = fpsHistory.current;
    const average = history.reduce((a, b) => a + b, 0) / history.length;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const drops = history.filter((f) => f < 50).length;

    setFps({
      current: Math.round(currentFps),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
      drops,
    });
  }, []);

  useFrameCallback((frameInfo) => {
    'worklet';
    const now = frameInfo.timestamp;

    if (lastTime.value === 0) {
      lastTime.value = now;
      return;
    }

    frameCount.value += 1;

    // 매 초마다 FPS 계산
    const elapsed = now - lastTime.value;
    if (elapsed >= 1000) {
      const currentFps = (frameCount.value / elapsed) * 1000;
      runOnJS(updateFPS)(currentFps);
      frameCount.value = 0;
      lastTime.value = now;
    }
  }, enabled);

  if (!enabled) return null;

  const getFPSColor = (value: number) => {
    if (value >= 55) return '#4CAF50';
    if (value >= 45) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.fps, { color: getFPSColor(fps.current) }]}>
        {fps.current} FPS
      </Text>
      <View style={styles.stats}>
        <Text style={styles.statText}>Avg: {fps.average}</Text>
        <Text style={styles.statText}>Min: {fps.min}</Text>
        <Text style={styles.statText}>Max: {fps.max}</Text>
        <Text style={[styles.statText, fps.drops > 3 && styles.warning]}>
          Drops: {fps.drops}
        </Text>
      </View>
    </View>
  );
}

// 프레임 드롭 감지 전용
export function useFrameDropDetector(
  onDrop: (droppedFrames: number) => void,
  threshold: number = 2
) {
  const lastFrameTime = useSharedValue(0);
  const expectedFrameTime = 1000 / 60; // ~16.67ms

  useFrameCallback((frameInfo) => {
    'worklet';
    const now = frameInfo.timestamp;

    if (lastFrameTime.value > 0) {
      const delta = now - lastFrameTime.value;
      const droppedFrames = Math.floor(delta / expectedFrameTime) - 1;

      if (droppedFrames >= threshold) {
        runOnJS(onDrop)(droppedFrames);
      }
    }

    lastFrameTime.value = now;
  });
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },
  fps: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  stats: {
    marginTop: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#F44336',
  },
});
```

### 예제 2: 성능 프로파일러 훅

```typescript
// src/debug/useAnimationProfiler.ts
import { useRef, useCallback } from 'react';
import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

interface ProfilerData {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  frameCount: number;
  averageFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
}

interface ProfilerOptions {
  name: string;
  onComplete?: (data: ProfilerData) => void;
  warnThreshold?: number; // ms
}

export function useAnimationProfiler(options: ProfilerOptions) {
  const { name, onComplete, warnThreshold = 16.67 } = options;

  const isRunning = useSharedValue(false);
  const startTime = useSharedValue(0);
  const frameCount = useSharedValue(0);
  const frameTimes = useSharedValue<number[]>([]);
  const lastFrameTime = useSharedValue(0);

  const profileData = useRef<ProfilerData | null>(null);

  const logResult = useCallback((data: ProfilerData) => {
    profileData.current = data;

    const status = data.averageFrameTime <= warnThreshold ? '✅' : '⚠️';

    console.group(`${status} Animation Profile: ${data.name}`);
    console.log(`Duration: ${data.duration.toFixed(2)}ms`);
    console.log(`Frames: ${data.frameCount}`);
    console.log(`Avg Frame Time: ${data.averageFrameTime.toFixed(2)}ms`);
    console.log(`Max Frame Time: ${data.maxFrameTime.toFixed(2)}ms`);
    console.log(`Min Frame Time: ${data.minFrameTime.toFixed(2)}ms`);

    if (data.averageFrameTime > warnThreshold) {
      console.warn(`Frame time exceeds threshold (${warnThreshold}ms)`);
    }

    console.groupEnd();

    onComplete?.(data);
  }, [name, warnThreshold, onComplete]);

  const start = useCallback(() => {
    'worklet';
    isRunning.value = true;
    startTime.value = performance.now();
    frameCount.value = 0;
    frameTimes.value = [];
    lastFrameTime.value = performance.now();
  }, []);

  const recordFrame = useCallback(() => {
    'worklet';
    if (!isRunning.value) return;

    const now = performance.now();
    const frameTime = now - lastFrameTime.value;

    frameCount.value += 1;
    frameTimes.value = [...frameTimes.value, frameTime];
    lastFrameTime.value = now;
  }, []);

  const stop = useCallback(() => {
    'worklet';
    if (!isRunning.value) return;

    isRunning.value = false;
    const endTime = performance.now();
    const duration = endTime - startTime.value;
    const frames = frameTimes.value;

    const avgFrameTime =
      frames.length > 0
        ? frames.reduce((a, b) => a + b, 0) / frames.length
        : 0;

    const data: ProfilerData = {
      name,
      startTime: startTime.value,
      endTime,
      duration,
      frameCount: frameCount.value,
      averageFrameTime: avgFrameTime,
      maxFrameTime: frames.length > 0 ? Math.max(...frames) : 0,
      minFrameTime: frames.length > 0 ? Math.min(...frames) : 0,
    };

    runOnJS(logResult)(data);
  }, [name, logResult]);

  return {
    start,
    recordFrame,
    stop,
    isRunning,
    getData: () => profileData.current,
  };
}

// 사용 예시
export function ProfiledAnimation() {
  const translateX = useSharedValue(0);
  const profiler = useAnimationProfiler({
    name: 'SlideAnimation',
    warnThreshold: 16.67,
    onComplete: (data) => {
      // Analytics로 전송
      sendToAnalytics('animation_performance', data);
    },
  });

  // 값 변화 시 프레임 기록
  useAnimatedReaction(
    () => translateX.value,
    () => {
      profiler.recordFrame();
    }
  );

  const startAnimation = () => {
    profiler.start();
    translateX.value = withSpring(300, { damping: 15 }, (finished) => {
      if (finished) {
        profiler.stop();
      }
    });
  };

  return (
    <TouchableOpacity onPress={startAnimation}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
      }))} />
    </TouchableOpacity>
  );
}
```

### 예제 3: Thread 모니터링

```typescript
// src/debug/ThreadMonitor.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, InteractionManager } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
  runOnUI,
} from 'react-native-reanimated';

interface ThreadMetrics {
  js: {
    busy: boolean;
    lastBlockDuration: number;
    totalBlockTime: number;
  };
  ui: {
    frameTime: number;
    isSmooth: boolean;
  };
}

export function ThreadMonitor() {
  const [metrics, setMetrics] = useState<ThreadMetrics>({
    js: { busy: false, lastBlockDuration: 0, totalBlockTime: 0 },
    ui: { frameTime: 16.67, isSmooth: true },
  });

  const lastUIFrameTime = useSharedValue(0);
  const uiFrameTime = useSharedValue(16.67);

  // JS Thread 모니터링
  useEffect(() => {
    let jsBlockStart = 0;
    let totalBlockTime = 0;
    let handle: NodeJS.Timeout;

    const checkJSThread = () => {
      const start = Date.now();

      // 다음 tick에서 실행
      setImmediate(() => {
        const elapsed = Date.now() - start;

        if (elapsed > 50) {
          // 50ms 이상 블록되면 busy
          totalBlockTime += elapsed;
          setMetrics((prev) => ({
            ...prev,
            js: {
              busy: true,
              lastBlockDuration: elapsed,
              totalBlockTime,
            },
          }));
        } else {
          setMetrics((prev) => ({
            ...prev,
            js: { ...prev.js, busy: false },
          }));
        }

        handle = setTimeout(checkJSThread, 100);
      });
    };

    checkJSThread();

    return () => clearTimeout(handle);
  }, []);

  // UI Thread 모니터링
  const updateUIMetrics = useCallback((frameTime: number) => {
    setMetrics((prev) => ({
      ...prev,
      ui: {
        frameTime,
        isSmooth: frameTime < 20, // 20ms 이하면 부드러움
      },
    }));
  }, []);

  useFrameCallback((info) => {
    'worklet';
    const now = info.timestamp;

    if (lastUIFrameTime.value > 0) {
      const delta = now - lastUIFrameTime.value;
      uiFrameTime.value = delta;
      runOnJS(updateUIMetrics)(delta);
    }

    lastUIFrameTime.value = now;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thread Monitor</Text>

      <View style={styles.row}>
        <View style={[styles.indicator, metrics.js.busy && styles.busy]} />
        <Text style={styles.label}>JS Thread</Text>
        {metrics.js.busy && (
          <Text style={styles.warning}>
            Blocked: {metrics.js.lastBlockDuration}ms
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <View
          style={[styles.indicator, !metrics.ui.isSmooth && styles.busy]}
        />
        <Text style={styles.label}>UI Thread</Text>
        <Text
          style={[styles.value, !metrics.ui.isSmooth && styles.warning]}
        >
          {metrics.ui.frameTime.toFixed(1)}ms
        </Text>
      </View>

      <Text style={styles.stats}>
        Total JS Block: {metrics.js.totalBlockTime}ms
      </Text>
    </View>
  );
}

// JS Thread 블로킹 감지 훅
export function useJSThreadBlockDetector(
  onBlock: (duration: number) => void,
  threshold: number = 100
) {
  useEffect(() => {
    let lastCheck = Date.now();
    let frameId: number;

    const check = () => {
      const now = Date.now();
      const delta = now - lastCheck;

      if (delta > threshold) {
        onBlock(delta);
      }

      lastCheck = now;
      frameId = requestAnimationFrame(check);
    };

    frameId = requestAnimationFrame(check);

    return () => cancelAnimationFrame(frameId);
  }, [onBlock, threshold]);
}

// UI Thread worklet 성능 측정
export function measureWorkletPerformance(
  workletFn: () => void,
  name: string
): () => void {
  'worklet';
  return () => {
    'worklet';
    const start = performance.now();
    workletFn();
    const duration = performance.now() - start;

    if (duration > 1) {
      // 1ms 이상이면 로깅
      console.log(`[Worklet] ${name}: ${duration.toFixed(2)}ms`);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    minWidth: 150,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  busy: {
    backgroundColor: '#F44336',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#FF9800',
  },
  stats: {
    color: '#888',
    fontSize: 10,
    marginTop: 8,
  },
});
```

### 예제 4: 렌더링 디버거

```typescript
// src/debug/RenderDebugger.tsx
import React, { useRef, useEffect, memo, PropsWithChildren } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RenderStats {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  renderTimes: number[];
}

const renderStatsMap = new Map<string, RenderStats>();

export function useRenderTracking(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef(0);

  // 렌더 시작
  lastRenderStart.current = performance.now();
  renderCount.current += 1;

  // 렌더 완료 후 측정
  useEffect(() => {
    const renderTime = performance.now() - lastRenderStart.current;
    renderTimes.current.push(renderTime);

    // 최근 20개만 유지
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift();
    }

    const avgTime =
      renderTimes.current.reduce((a, b) => a + b, 0) /
      renderTimes.current.length;

    renderStatsMap.set(componentName, {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      averageRenderTime: avgTime,
      renderTimes: [...renderTimes.current],
    });

    if (__DEV__ && renderTime > 16) {
      console.warn(
        `[Slow Render] ${componentName}: ${renderTime.toFixed(2)}ms ` +
          `(${renderCount.current} renders)`
      );
    }
  });

  return {
    renderCount: renderCount.current,
    getStats: () => renderStatsMap.get(componentName),
  };
}

// 불필요한 리렌더 감지
export function useRenderReason<T extends Record<string, any>>(
  componentName: string,
  props: T
) {
  const prevPropsRef = useRef<T>();

  useEffect(() => {
    if (prevPropsRef.current) {
      const changedProps: string[] = [];

      Object.keys(props).forEach((key) => {
        if (prevPropsRef.current![key] !== props[key]) {
          changedProps.push(key);
        }
      });

      if (changedProps.length > 0) {
        console.log(
          `[Render Reason] ${componentName}:`,
          changedProps.join(', ')
        );

        // 얕은 비교로는 변경되지 않았어야 할 props 찾기
        changedProps.forEach((key) => {
          const prev = prevPropsRef.current![key];
          const curr = props[key];

          if (
            typeof prev === 'object' &&
            typeof curr === 'object' &&
            JSON.stringify(prev) === JSON.stringify(curr)
          ) {
            console.warn(
              `[Unnecessary Render] ${componentName}.${key}: ` +
                `Object reference changed but value is same`
            );
          }
        });
      }
    }

    prevPropsRef.current = { ...props };
  });
}

// 렌더 카운터 오버레이
export const RenderCounter = memo(function RenderCounter({
  name,
  children,
}: PropsWithChildren<{ name: string }>) {
  const { renderCount } = useRenderTracking(name);

  return (
    <View style={styles.wrapper}>
      {children}
      {__DEV__ && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{renderCount}</Text>
        </View>
      )}
    </View>
  );
});

// 렌더 통계 대시보드
export function RenderStatsDashboard() {
  const [stats, setStats] = React.useState<RenderStats[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(Array.from(renderStatsMap.values()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.dashboard}>
      <Text style={styles.dashboardTitle}>Render Stats</Text>
      {stats
        .sort((a, b) => b.renderCount - a.renderCount)
        .slice(0, 10)
        .map((stat) => (
          <View key={stat.componentName} style={styles.statRow}>
            <Text style={styles.statName}>{stat.componentName}</Text>
            <Text style={styles.statValue}>
              {stat.renderCount}x ({stat.averageRenderTime.toFixed(1)}ms)
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  counter: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dashboard: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 250,
  },
  dashboardTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statName: {
    color: '#FFFFFF',
    fontSize: 11,
    flex: 1,
  },
  statValue: {
    color: '#4CAF50',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
```

### 예제 5: 메모리 프로파일링

```typescript
// src/debug/MemoryProfiler.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, NativeModules, Platform } from 'react-native';

interface MemoryInfo {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
  nativeHeapSize?: number;
  nativeHeapAllocatedSize?: number;
}

interface MemorySnapshot {
  timestamp: number;
  memory: MemoryInfo;
  label?: string;
}

// 메모리 정보 수집 (플랫폼별)
function getMemoryInfo(): MemoryInfo | null {
  if (Platform.OS === 'web' && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    };
  }

  // Native에서는 별도 모듈 필요
  if (NativeModules.MemoryInfo) {
    return NativeModules.MemoryInfo.getMemoryInfo();
  }

  return null;
}

export function useMemoryProfiler() {
  const snapshots = useRef<MemorySnapshot[]>([]);
  const [currentMemory, setCurrentMemory] = useState<MemoryInfo | null>(null);

  const takeSnapshot = useCallback((label?: string) => {
    const memory = getMemoryInfo();
    if (memory) {
      const snapshot: MemorySnapshot = {
        timestamp: Date.now(),
        memory,
        label,
      };
      snapshots.current.push(snapshot);

      if (__DEV__) {
        console.log(
          `[Memory Snapshot] ${label || 'unnamed'}:`,
          formatBytes(memory.usedJSHeapSize || 0)
        );
      }

      return snapshot;
    }
    return null;
  }, []);

  const compareSnapshots = useCallback(
    (labelA: string, labelB: string) => {
      const snapshotA = snapshots.current.find((s) => s.label === labelA);
      const snapshotB = snapshots.current.find((s) => s.label === labelB);

      if (!snapshotA || !snapshotB) {
        console.warn('Snapshots not found');
        return null;
      }

      const diff =
        (snapshotB.memory.usedJSHeapSize || 0) -
        (snapshotA.memory.usedJSHeapSize || 0);

      const result = {
        from: labelA,
        to: labelB,
        diff,
        diffFormatted: formatBytes(diff),
        isLeak: diff > 1024 * 1024, // 1MB 이상 증가면 leak 의심
      };

      if (__DEV__) {
        console.log(
          `[Memory Diff] ${labelA} → ${labelB}:`,
          result.diffFormatted,
          result.isLeak ? '⚠️ Possible leak' : ''
        );
      }

      return result;
    },
    []
  );

  const clearSnapshots = useCallback(() => {
    snapshots.current = [];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMemory(getMemoryInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    currentMemory,
    takeSnapshot,
    compareSnapshots,
    clearSnapshots,
    snapshots: snapshots.current,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} ${sizes[i]}`;
}

// 애니메이션 메모리 누수 감지
export function useAnimationLeakDetector(animationName: string) {
  const sharedValueCount = useRef(0);
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const trackSharedValue = useCallback(() => {
    sharedValueCount.current += 1;

    if (__DEV__ && sharedValueCount.current > 50) {
      console.warn(
        `[Memory Warning] ${animationName}: ` +
          `${sharedValueCount.current} SharedValues created. ` +
          `Consider cleanup or memoization.`
      );
    }

    return () => {
      sharedValueCount.current -= 1;
    };
  }, [animationName]);

  const registerCleanup = useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach((fn) => fn());
    cleanupFunctions.current = [];
    sharedValueCount.current = 0;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    trackSharedValue,
    registerCleanup,
    cleanup,
    sharedValueCount: sharedValueCount.current,
  };
}

export function MemoryMonitor() {
  const { currentMemory, takeSnapshot } = useMemoryProfiler();

  if (!currentMemory) {
    return (
      <View style={styles.container}>
        <Text style={styles.unavailable}>Memory info unavailable</Text>
      </View>
    );
  }

  const usedMB = (currentMemory.usedJSHeapSize || 0) / (1024 * 1024);
  const totalMB = (currentMemory.totalJSHeapSize || 0) / (1024 * 1024);
  const usagePercent = (usedMB / totalMB) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory</Text>
      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            { width: `${usagePercent}%` },
            usagePercent > 80 && styles.barWarning,
          ]}
        />
      </View>
      <Text style={styles.value}>
        {usedMB.toFixed(1)} / {totalMB.toFixed(1)} MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 220,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  barWarning: {
    backgroundColor: '#F44336',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  unavailable: {
    color: '#888',
    fontSize: 11,
  },
});
```

### 예제 6: 통합 성능 대시보드

```typescript
// src/debug/PerformanceDashboard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FPSMonitor } from './FPSMonitor';
import { ThreadMonitor } from './ThreadMonitor';
import { MemoryMonitor } from './MemoryProfiler';
import { RenderStatsDashboard } from './RenderDebugger';

type TabType = 'overview' | 'fps' | 'threads' | 'memory' | 'renders';

export function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!__DEV__) return null;

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsed}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.collapsedText}>📊</Text>
      </TouchableOpacity>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.overview}>
            <FPSMonitor enabled />
            <ThreadMonitor />
            <MemoryMonitor />
          </View>
        );
      case 'fps':
        return <FPSMonitor enabled />;
      case 'threads':
        return <ThreadMonitor />;
      case 'memory':
        return <MemoryMonitor />;
      case 'renders':
        return <RenderStatsDashboard />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.tabs}>
        {(['overview', 'fps', 'threads', 'memory', 'renders'] as TabType[]).map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

// 앱에 쉽게 추가할 수 있는 래퍼
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function PerformanceWrapper(props: P) {
    return (
      <View style={{ flex: 1 }}>
        <WrappedComponent {...props} />
        <PerformanceDashboard />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 18,
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 12,
    maxHeight: 280,
  },
  overview: {
    gap: 8,
  },
  collapsed: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedText: {
    fontSize: 20,
  },
});
```

## 🎯 sometimes-app 적용 사례

### 매칭 카드 성능 프로파일링

```typescript
// src/features/matching/debug/MatchingPerformanceProfiler.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { useAnimationProfiler } from '@/debug/useAnimationProfiler';
import { useMemoryProfiler, useAnimationLeakDetector } from '@/debug/MemoryProfiler';

interface SwipeMetrics {
  totalSwipes: number;
  averageSwipeTime: number;
  droppedFrameSwipes: number;
  memoryBeforeSwipe: number;
  memoryAfterSwipe: number;
}

export function useMatchingPerformanceProfiler() {
  const metricsRef = useRef<SwipeMetrics>({
    totalSwipes: 0,
    averageSwipeTime: 0,
    droppedFrameSwipes: 0,
    memoryBeforeSwipe: 0,
    memoryAfterSwipe: 0,
  });

  const swipeProfiler = useAnimationProfiler({
    name: 'MatchingCardSwipe',
    warnThreshold: 16.67,
    onComplete: (data) => {
      metricsRef.current.totalSwipes += 1;

      // 평균 계산
      const total = metricsRef.current.totalSwipes;
      metricsRef.current.averageSwipeTime =
        (metricsRef.current.averageSwipeTime * (total - 1) + data.duration) /
        total;

      // 프레임 드롭 감지
      if (data.maxFrameTime > 20) {
        metricsRef.current.droppedFrameSwipes += 1;
      }

      // 성능 리포트 (매 10번째 스와이프)
      if (total % 10 === 0) {
        reportPerformance(metricsRef.current);
      }
    },
  });

  const memoryProfiler = useMemoryProfiler();
  const leakDetector = useAnimationLeakDetector('MatchingCard');

  const startSwipeProfile = () => {
    memoryProfiler.takeSnapshot('swipe-start');
    swipeProfiler.start();
  };

  const recordSwipeFrame = () => {
    swipeProfiler.recordFrame();
  };

  const endSwipeProfile = () => {
    swipeProfiler.stop();
    memoryProfiler.takeSnapshot('swipe-end');

    // 메모리 누수 체크
    const memoryDiff = memoryProfiler.compareSnapshots(
      'swipe-start',
      'swipe-end'
    );

    if (memoryDiff?.isLeak) {
      console.warn('[Matching] Potential memory leak after swipe');
    }
  };

  return {
    startSwipeProfile,
    recordSwipeFrame,
    endSwipeProfile,
    getMetrics: () => metricsRef.current,
    leakDetector,
  };
}

function reportPerformance(metrics: SwipeMetrics) {
  console.group('📊 Matching Card Performance Report');
  console.log(`Total Swipes: ${metrics.totalSwipes}`);
  console.log(`Average Swipe Time: ${metrics.averageSwipeTime.toFixed(2)}ms`);
  console.log(
    `Dropped Frame Rate: ${(
      (metrics.droppedFrameSwipes / metrics.totalSwipes) *
      100
    ).toFixed(1)}%`
  );
  console.groupEnd();

  // Analytics 전송
  sendToAnalytics('matching_performance', {
    ...metrics,
    timestamp: Date.now(),
  });
}

// 프로파일러가 통합된 매칭 카드
export function ProfiledMatchingCard({
  user,
  onSwipe,
  ...props
}: MatchingCardProps) {
  const {
    startSwipeProfile,
    recordSwipeFrame,
    endSwipeProfile,
  } = useMatchingPerformanceProfiler();

  const translateX = useSharedValue(0);

  // 위치 변화 시마다 프레임 기록
  useAnimatedReaction(
    () => translateX.value,
    (current, prev) => {
      if (prev !== null && current !== prev) {
        runOnJS(recordSwipeFrame)();
      }
    }
  );

  const handleGestureStart = () => {
    startSwipeProfile();
  };

  const handleGestureEnd = (direction: 'left' | 'right') => {
    endSwipeProfile();
    onSwipe(direction);
  };

  return (
    <MatchingCard
      {...props}
      user={user}
      onGestureStart={handleGestureStart}
      onGestureEnd={handleGestureEnd}
      translateX={translateX}
    />
  );
}

// 성능 오버레이
export function MatchingPerformanceOverlay() {
  const [metrics, setMetrics] = React.useState<SwipeMetrics | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // 전역 메트릭 가져오기
      setMetrics(globalMatchingMetrics.current);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!__DEV__ || !metrics) return null;

  const dropRate =
    metrics.totalSwipes > 0
      ? (metrics.droppedFrameSwipes / metrics.totalSwipes) * 100
      : 0;

  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>Matching Performance</Text>
      <Text style={styles.overlayText}>
        Swipes: {metrics.totalSwipes}
      </Text>
      <Text style={styles.overlayText}>
        Avg Time: {metrics.averageSwipeTime.toFixed(1)}ms
      </Text>
      <Text
        style={[
          styles.overlayText,
          dropRate > 10 && styles.warning,
        ]}
      >
        Drop Rate: {dropRate.toFixed(1)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#FF9800',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 프로덕션에서 디버그 코드 포함

```typescript
// ❌ 잘못된 방법 - 프로덕션에도 포함됨
export function App() {
  return (
    <View>
      <MainContent />
      <FPSMonitor enabled={true} />
    </View>
  );
}

// ✅ 올바른 방법 - DEV에서만 포함
export function App() {
  return (
    <View>
      <MainContent />
      {__DEV__ && <FPSMonitor enabled />}
    </View>
  );
}

// 더 나은 방법 - 조건부 import
const FPSMonitor = __DEV__
  ? require('./debug/FPSMonitor').FPSMonitor
  : () => null;
```

### 실수 2: 프로파일링 자체가 성능에 영향

```typescript
// ❌ 잘못된 방법 - 매 프레임 console.log
useFrameCallback(() => {
  'worklet';
  console.log('Frame:', Date.now()); // 성능 저하 원인
});

// ✅ 올바른 방법 - 샘플링 + 배치 로깅
const frameCount = useSharedValue(0);
const logs = useSharedValue<number[]>([]);

useFrameCallback((info) => {
  'worklet';
  frameCount.value += 1;

  // 10프레임마다 기록
  if (frameCount.value % 10 === 0) {
    logs.value = [...logs.value, info.timestamp];
  }

  // 100프레임마다 JS로 전송
  if (frameCount.value % 100 === 0) {
    runOnJS(batchLog)(logs.value);
    logs.value = [];
  }
});
```

### 실수 3: 메모리 스냅샷 비교 타이밍

```typescript
// ❌ 잘못된 방법 - 애니메이션 중 스냅샷
const animatedValue = useSharedValue(0);

// 값이 변할 때마다 스냅샷 (너무 잦음)
useAnimatedReaction(
  () => animatedValue.value,
  () => {
    runOnJS(takeMemorySnapshot)();
  }
);

// ✅ 올바른 방법 - 애니메이션 완료 후 스냅샷
const handleComplete = () => {
  // GC가 실행될 시간 주기
  setTimeout(() => {
    takeMemorySnapshot('after-animation');
  }, 500);
};
```

## 💡 팁

### 팁 1: Flipper 플러그인 활용

```bash
# Flipper 설치 후 플러그인 추가
# Performance 플러그인으로 JS/UI 스레드 모니터링
# React DevTools로 컴포넌트 리렌더 추적
```

### 팁 2: 릴리즈 빌드에서 프로파일링

```typescript
// metro.config.js
module.exports = {
  transformer: {
    // 릴리즈 빌드에서도 __DEV__ false로 프로파일링
    minifierConfig: {
      keep_fnames: true, // 함수 이름 유지
      mangle: false,     // 변수명 유지
    },
  },
};

// 별도 프로파일 빌드
// eas build --profile profile
```

### 팁 3: CI/CD에 성능 테스트 통합

```typescript
// e2e/performance.test.ts
describe('Animation Performance', () => {
  it('should maintain 60fps during card swipe', async () => {
    const metrics = await measureAnimation('card-swipe');

    expect(metrics.averageFrameTime).toBeLessThan(16.67);
    expect(metrics.droppedFrames).toBeLessThan(5);
  });

  it('should not leak memory after 100 swipes', async () => {
    const before = await getMemoryUsage();

    for (let i = 0; i < 100; i++) {
      await swipeCard('right');
    }

    const after = await getMemoryUsage();
    const diff = after - before;

    expect(diff).toBeLessThan(10 * 1024 * 1024); // 10MB 미만
  });
});
```

## 🏋️ 연습 문제

### 문제 1: 커스텀 FPS 히스토리 그래프

FPS 데이터를 시간에 따라 그래프로 표시하는 컴포넌트를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
export function FPSGraph({ width = 200, height = 50 }) {
  const [history, setHistory] = useState<number[]>([]);
  const maxHistory = 60; // 1분간 기록

  useFrameCallback(() => {
    // ... FPS 계산 로직
    runOnJS(addToHistory)(currentFps);
  });

  const addToHistory = (fps: number) => {
    setHistory((prev) => {
      const next = [...prev, fps];
      return next.slice(-maxHistory);
    });
  };

  const path = useMemo(() => {
    if (history.length < 2) return '';

    const stepX = width / (maxHistory - 1);

    return history
      .map((fps, i) => {
        const x = i * stepX;
        const y = height - (fps / 60) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [history, width, height]);

  return (
    <Svg width={width} height={height}>
      {/* 기준선 */}
      <Line
        x1={0}
        y1={height - (30 / 60) * height}
        x2={width}
        y2={height - (30 / 60) * height}
        stroke="rgba(255, 0, 0, 0.3)"
        strokeDasharray="4"
      />
      <Line
        x1={0}
        y1={height - (55 / 60) * height}
        x2={width}
        y2={height - (55 / 60) * height}
        stroke="rgba(0, 255, 0, 0.3)"
        strokeDasharray="4"
      />
      {/* FPS 라인 */}
      <Path d={path} stroke="#4CAF50" fill="none" strokeWidth={2} />
    </Svg>
  );
}
```
</details>

### 문제 2: 성능 회귀 감지

이전 세션의 성능과 비교하여 회귀를 감지하는 시스템을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
interface PerformanceBaseline {
  version: string;
  metrics: {
    averageFps: number;
    p95FrameTime: number;
    memoryBaseline: number;
  };
}

export function usePerformanceRegression() {
  const [baseline, setBaseline] = useState<PerformanceBaseline | null>(null);

  useEffect(() => {
    loadBaseline().then(setBaseline);
  }, []);

  const checkRegression = useCallback(
    (currentMetrics: typeof baseline.metrics) => {
      if (!baseline) return null;

      const regressions: string[] = [];

      // FPS 5% 이상 감소
      if (currentMetrics.averageFps < baseline.metrics.averageFps * 0.95) {
        regressions.push(
          `FPS: ${baseline.metrics.averageFps} → ${currentMetrics.averageFps}`
        );
      }

      // Frame time 10% 이상 증가
      if (
        currentMetrics.p95FrameTime >
        baseline.metrics.p95FrameTime * 1.1
      ) {
        regressions.push(
          `P95 Frame: ${baseline.metrics.p95FrameTime}ms → ${currentMetrics.p95FrameTime}ms`
        );
      }

      // 메모리 20% 이상 증가
      if (
        currentMetrics.memoryBaseline >
        baseline.metrics.memoryBaseline * 1.2
      ) {
        regressions.push(
          `Memory: ${formatBytes(baseline.metrics.memoryBaseline)} → ${formatBytes(currentMetrics.memoryBaseline)}`
        );
      }

      if (regressions.length > 0) {
        console.error('⚠️ Performance Regression Detected:');
        regressions.forEach((r) => console.error(`  - ${r}`));
        return regressions;
      }

      return null;
    },
    [baseline]
  );

  const saveAsBaseline = useCallback(
    async (metrics: typeof baseline.metrics) => {
      const newBaseline: PerformanceBaseline = {
        version: APP_VERSION,
        metrics,
      };
      await AsyncStorage.setItem(
        'performance_baseline',
        JSON.stringify(newBaseline)
      );
      setBaseline(newBaseline);
    },
    []
  );

  return { baseline, checkRegression, saveAsBaseline };
}
```
</details>

## 📚 이 장에서 배운 내용

1. **FPS 모니터링**: useFrameCallback을 활용한 실시간 프레임 레이트 측정
2. **Thread 분석**: JS Thread와 UI Thread 병목 구분 방법
3. **메모리 프로파일링**: 스냅샷 비교와 누수 감지
4. **렌더링 추적**: 불필요한 리렌더 원인 파악
5. **통합 대시보드**: 개발 중 실시간 성능 모니터링

## 다음 장 예고

**Chapter 73: 제스처 충돌 해결**에서는 여러 제스처가 동시에 활성화될 때 발생하는 충돌 문제를 진단하고 해결하는 방법을 배웁니다.
