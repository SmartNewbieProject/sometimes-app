# Chapter 62: 애니메이션 디버깅

Reanimated 애니메이션의 문제를 효과적으로 찾고 해결하는 방법을 배웁니다.

## 📌 학습 목표

- Reanimated 디버깅 도구와 기법 이해
- 효과적인 로깅 전략 수립
- 흔한 버그 패턴 인식 및 해결
- 성능 문제 진단 및 수정

## 📖 개념 이해

### 애니메이션 버그 유형

```
┌─────────────────────────────────────────────────────────────┐
│                    Bug Categories                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 시각적 버그 (Visual Bugs)                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • 애니메이션이 시작되지 않음                          │    │
│  │ • 잘못된 시작/종료 값                                 │    │
│  │ • 끊김/떨림 (Jitter, Jank)                           │    │
│  │ • 예상과 다른 움직임                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  2. 성능 버그 (Performance Bugs)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • 프레임 드롭                                         │    │
│  │ • 높은 CPU/GPU 사용량                                │    │
│  │ • 메모리 누수                                         │    │
│  │ • 배터리 과소모                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  3. 로직 버그 (Logic Bugs)                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • 제스처 인식 오류                                    │    │
│  │ • 상태 동기화 문제                                    │    │
│  │ • 콜백 미호출                                         │    │
│  │ • 무한 루프                                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  4. 스레드 버그 (Thread Bugs)                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Worklet 외부에서 SharedValue 접근                  │    │
│  │ • runOnJS 누락                                        │    │
│  │ • 크로스 스레드 데이터 오염                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 디버깅 도구

```
┌─────────────────────────────────────────────────────────────┐
│                    Debugging Tools                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Built-in                                                    │
│  ├── console.log (runOnJS 통해)                              │
│  ├── React DevTools                                          │
│  ├── Performance Monitor                                     │
│  └── Chrome DevTools (Web)                                   │
│                                                              │
│  Reanimated Specific                                         │
│  ├── useAnimatedReaction (값 변화 추적)                      │
│  ├── useFrameCallback (프레임 분석)                          │
│  └── makeMutable (디버그용 값 추적)                          │
│                                                              │
│  External                                                    │
│  ├── Flipper                                                 │
│  ├── Reactotron                                              │
│  ├── Xcode Instruments                                       │
│  └── Android Studio Profiler                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 디버그 로거

```typescript
import { useCallback, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

interface LogEntry {
  timestamp: number;
  type: 'value' | 'event' | 'error' | 'warning';
  name: string;
  value?: any;
  message?: string;
}

// 애니메이션 디버그 로거
class AnimationDebugger {
  private static instance: AnimationDebugger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 500;
  private enabled: boolean = __DEV__;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AnimationDebugger();
    }
    return this.instance;
  }

  log(entry: Omit<LogEntry, 'timestamp'>) {
    if (!this.enabled) return;

    this.logs.push({
      ...entry,
      timestamp: Date.now(),
    });

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 콘솔 출력
    const prefix = `[Animation:${entry.type}]`;
    const message = entry.message || `${entry.name} = ${JSON.stringify(entry.value)}`;

    switch (entry.type) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warning':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }

  logValue(name: string, value: any) {
    this.log({ type: 'value', name, value });
  }

  logEvent(name: string, message: string) {
    this.log({ type: 'event', name, message });
  }

  logError(name: string, message: string) {
    this.log({ type: 'error', name, message });
  }

  logWarning(name: string, message: string) {
    this.log({ type: 'warning', name, message });
  }

  getLogs(filter?: LogEntry['type']): LogEntry[] {
    if (filter) {
      return this.logs.filter(log => log.type === filter);
    }
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// 디버그 훅
function useAnimationDebug<T extends number>(
  value: SharedValue<T>,
  name: string
) {
  const debugger_ = AnimationDebugger.getInstance();
  const previousValue = useRef<T | null>(null);

  const logChange = useCallback((current: T, previous: T | null) => {
    if (__DEV__) {
      debugger_.logValue(name, {
        current,
        previous,
        delta: previous !== null ? current - previous : null,
      });
    }
  }, [name]);

  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      runOnJS(logChange)(current, previous);
    },
    [logChange]
  );

  return {
    log: (message: string) => debugger_.logEvent(name, message),
    warn: (message: string) => debugger_.logWarning(name, message),
    error: (message: string) => debugger_.logError(name, message),
  };
}

export { AnimationDebugger, useAnimationDebug };
```

### 2. 값 추적 시각화

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

interface ValueHistory {
  timestamp: number;
  value: number;
}

interface TrackedValue {
  name: string;
  history: ValueHistory[];
  current: number;
}

// 값 추적 훅
function useValueTracker(
  value: SharedValue<number>,
  name: string,
  maxHistory: number = 50
) {
  const historyRef = useRef<ValueHistory[]>([]);
  const [current, setCurrent] = useState(value.value);

  useAnimatedReaction(
    () => value.value,
    (val) => {
      runOnJS((v: number) => {
        historyRef.current.push({
          timestamp: Date.now(),
          value: v,
        });

        if (historyRef.current.length > maxHistory) {
          historyRef.current.shift();
        }

        setCurrent(v);
      })(val);
    },
    []
  );

  return {
    name,
    history: historyRef.current,
    current,
  };
}

// 값 추적 시각화 컴포넌트
function ValueTrackerOverlay({
  trackedValues,
  visible,
  onClose,
}: {
  trackedValues: TrackedValue[];
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible || !__DEV__) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Value Tracker</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.closeButton}>×</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {trackedValues.map((tracked, index) => (
          <View key={index} style={styles.valueCard}>
            <View style={styles.valueHeader}>
              <Text style={styles.valueName}>{tracked.name}</Text>
              <Text style={styles.currentValue}>
                {tracked.current.toFixed(2)}
              </Text>
            </View>

            {/* 미니 그래프 */}
            <View style={styles.graph}>
              {tracked.history.slice(-20).map((point, i) => {
                const min = Math.min(...tracked.history.map(h => h.value));
                const max = Math.max(...tracked.history.map(h => h.value));
                const range = max - min || 1;
                const height = ((point.value - min) / range) * 30;

                return (
                  <View
                    key={i}
                    style={[
                      styles.graphBar,
                      { height: Math.max(2, height) }
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.valueStats}>
              <Text style={styles.statText}>
                Min: {Math.min(...tracked.history.map(h => h.value)).toFixed(2)}
              </Text>
              <Text style={styles.statText}>
                Max: {Math.max(...tracked.history.map(h => h.value)).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    maxHeight: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  valueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  currentValue: {
    color: '#7A4AE2',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  graph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    gap: 2,
  },
  graphBar: {
    flex: 1,
    backgroundColor: '#7A4AE2',
    borderRadius: 2,
  },
  valueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statText: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export { useValueTracker, ValueTrackerOverlay, TrackedValue };
```

### 3. 제스처 디버깅

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GestureEvent {
  type: 'start' | 'update' | 'end' | 'cancel';
  timestamp: number;
  data: {
    translationX?: number;
    translationY?: number;
    velocityX?: number;
    velocityY?: number;
    scale?: number;
    rotation?: number;
  };
}

// 제스처 디버그 훅
function useGestureDebug(name: string) {
  const [events, setEvents] = useState<GestureEvent[]>([]);
  const [isActive, setIsActive] = useState(false);

  const logEvent = useCallback((event: GestureEvent) => {
    if (!__DEV__) return;

    setEvents(prev => {
      const newEvents = [...prev, event];
      // 최근 50개만 유지
      return newEvents.slice(-50);
    });

    console.log(
      `[Gesture:${name}]`,
      event.type,
      JSON.stringify(event.data)
    );
  }, [name]);

  const createGestureHandlers = useCallback(() => ({
    onStart: (data: any) => {
      setIsActive(true);
      logEvent({
        type: 'start',
        timestamp: Date.now(),
        data: {
          translationX: data.translationX,
          translationY: data.translationY,
        },
      });
    },
    onUpdate: (data: any) => {
      logEvent({
        type: 'update',
        timestamp: Date.now(),
        data: {
          translationX: data.translationX,
          translationY: data.translationY,
          velocityX: data.velocityX,
          velocityY: data.velocityY,
        },
      });
    },
    onEnd: (data: any) => {
      setIsActive(false);
      logEvent({
        type: 'end',
        timestamp: Date.now(),
        data: {
          translationX: data.translationX,
          translationY: data.translationY,
          velocityX: data.velocityX,
          velocityY: data.velocityY,
        },
      });
    },
  }), [logEvent]);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isActive,
    createGestureHandlers,
    logEvent,
    clear,
  };
}

// 제스처 디버그 오버레이
function GestureDebugOverlay({
  events,
  isActive,
}: {
  events: GestureEvent[];
  isActive: boolean;
}) {
  if (!__DEV__) return null;

  const lastEvent = events[events.length - 1];

  return (
    <View style={styles.gestureOverlay}>
      <View style={[
        styles.statusDot,
        { backgroundColor: isActive ? '#4CAF50' : '#999' }
      ]} />

      {lastEvent && (
        <View style={styles.gestureInfo}>
          <Text style={styles.gestureType}>{lastEvent.type}</Text>
          {lastEvent.data.translationX !== undefined && (
            <Text style={styles.gestureValue}>
              X: {lastEvent.data.translationX.toFixed(1)}
            </Text>
          )}
          {lastEvent.data.translationY !== undefined && (
            <Text style={styles.gestureValue}>
              Y: {lastEvent.data.translationY.toFixed(1)}
            </Text>
          )}
          {lastEvent.data.velocityX !== undefined && (
            <Text style={styles.gestureValue}>
              vX: {lastEvent.data.velocityX.toFixed(1)}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.eventCount}>
        Events: {events.length}
      </Text>
    </View>
  );
}

// 사용 예시: 디버그 가능한 드래그 컴포넌트
function DebuggableDraggable() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const { events, isActive, createGestureHandlers } = useGestureDebug('drag');

  const handlers = createGestureHandlers();

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      runOnJS(handlers.onStart)(event);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      runOnJS(handlers.onUpdate)(event);
    })
    .onEnd((event) => {
      runOnJS(handlers.onEnd)(event);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDebugOverlay events={events} isActive={isActive} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.draggable, animatedStyle]}>
          <Text style={styles.draggableText}>Drag Me</Text>
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
  gestureOverlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 10,
    minWidth: 120,
  },
  statusDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gestureInfo: {
    marginBottom: 8,
  },
  gestureType: {
    color: '#7A4AE2',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gestureValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  eventCount: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  draggable: {
    width: 120,
    height: 120,
    backgroundColor: '#7A4AE2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggableText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { useGestureDebug, GestureDebugOverlay };
```

### 4. 흔한 버그 패턴 감지

```typescript
import { useEffect, useRef, useCallback } from 'react';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

type BugType =
  | 'infinite_loop'
  | 'stale_value'
  | 'rapid_changes'
  | 'nan_value'
  | 'infinity_value';

interface BugReport {
  type: BugType;
  valueName: string;
  message: string;
  timestamp: number;
  context?: any;
}

// 버그 패턴 감지기
function useBugDetector(
  value: SharedValue<number>,
  name: string,
  options?: {
    maxChangesPerSecond?: number;
    checkNaN?: boolean;
    checkInfinity?: boolean;
  }
) {
  const {
    maxChangesPerSecond = 120,
    checkNaN = true,
    checkInfinity = true,
  } = options || {};

  const changesRef = useRef<number[]>([]);
  const lastValueRef = useRef<number | null>(null);
  const bugReportsRef = useRef<BugReport[]>([]);

  const reportBug = useCallback((bug: BugReport) => {
    if (!__DEV__) return;

    bugReportsRef.current.push(bug);
    console.error(`[BugDetector] ${bug.type}: ${bug.message}`, bug.context);
  }, []);

  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      runOnJS((cur: number, prev: number | null) => {
        const now = Date.now();

        // NaN 체크
        if (checkNaN && isNaN(cur)) {
          reportBug({
            type: 'nan_value',
            valueName: name,
            message: `Value became NaN`,
            timestamp: now,
            context: { previous: prev },
          });
        }

        // Infinity 체크
        if (checkInfinity && !isFinite(cur)) {
          reportBug({
            type: 'infinity_value',
            valueName: name,
            message: `Value became Infinity`,
            timestamp: now,
            context: { value: cur, previous: prev },
          });
        }

        // 급격한 변화 체크 (무한 루프 감지)
        changesRef.current.push(now);
        changesRef.current = changesRef.current.filter(
          t => now - t < 1000
        );

        if (changesRef.current.length > maxChangesPerSecond) {
          reportBug({
            type: 'rapid_changes',
            valueName: name,
            message: `Too many changes: ${changesRef.current.length}/sec`,
            timestamp: now,
            context: { changesPerSecond: changesRef.current.length },
          });
        }

        // Stale value 체크 (같은 값이 계속 설정됨)
        if (prev !== null && cur === prev && cur === lastValueRef.current) {
          // 세 번 연속 같은 값이면 경고
          reportBug({
            type: 'stale_value',
            valueName: name,
            message: `Same value set repeatedly: ${cur}`,
            timestamp: now,
          });
        }

        lastValueRef.current = cur;
      })(current, previous);
    },
    []
  );

  return {
    getBugReports: () => bugReportsRef.current,
    clearReports: () => { bugReportsRef.current = []; },
  };
}

// 전역 버그 리포터
class AnimationBugReporter {
  private static reports: BugReport[] = [];
  private static listeners: ((report: BugReport) => void)[] = [];

  static report(bug: BugReport) {
    this.reports.push(bug);
    this.listeners.forEach(listener => listener(bug));

    if (__DEV__) {
      console.error(
        `[AnimationBug] ${bug.type}`,
        bug.valueName,
        bug.message
      );
    }
  }

  static subscribe(listener: (report: BugReport) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static getReports() {
    return [...this.reports];
  }

  static clear() {
    this.reports = [];
  }
}

export { useBugDetector, AnimationBugReporter, BugReport, BugType };
```

### 5. Worklet 오류 처리

```typescript
import { useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';

// 안전한 Worklet 래퍼
function createSafeWorklet<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void
): T {
  'worklet';

  return ((...args: Parameters<T>) => {
    'worklet';
    try {
      return fn(...args);
    } catch (error) {
      if (errorHandler) {
        runOnJS(errorHandler)(error as Error);
      } else if (__DEV__) {
        runOnJS(console.error)('[WorkletError]', String(error));
      }
      return undefined as ReturnType<T>;
    }
  }) as T;
}

// Worklet 디버거 훅
function useWorkletDebugger(name: string) {
  const errorCount = useSharedValue(0);
  const lastError = useSharedValue<string | null>(null);

  const handleError = useCallback((error: Error) => {
    console.error(`[Worklet:${name}] Error:`, error.message);
  }, [name]);

  const wrapWorklet = useCallback(<T extends (...args: any[]) => any>(
    fn: T
  ): T => {
    return createSafeWorklet(fn, handleError);
  }, [handleError]);

  const safeAnimatedStyle = useCallback((
    fn: () => Record<string, any>
  ) => {
    return useAnimatedStyle(() => {
      'worklet';
      try {
        return fn();
      } catch (error) {
        runOnJS(handleError)(error as Error);
        return {};
      }
    });
  }, [handleError]);

  return {
    wrapWorklet,
    safeAnimatedStyle,
    errorCount,
    lastError,
  };
}

// 사용 예시
function SafeAnimatedComponent() {
  const translateX = useSharedValue(0);
  const { safeAnimatedStyle, wrapWorklet } = useWorkletDebugger('SafeComponent');

  // 안전한 계산
  const calculate = wrapWorklet((value: number) => {
    'worklet';
    // 잠재적으로 오류가 발생할 수 있는 계산
    if (value < 0) {
      throw new Error('Negative value not allowed');
    }
    return Math.sqrt(value) * 100;
  });

  const animatedStyle = safeAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: calculate(translateX.value) }],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

export { createSafeWorklet, useWorkletDebugger };
```

### 6. 디버그 대시보드

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { AnimationDebugger } from './AnimationDebugger';
import { AnimationBugReporter, BugReport } from './BugDetector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'logs' | 'bugs' | 'performance';

function DebugDashboard({ visible }: { visible: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>('logs');
  const [logs, setLogs] = useState<any[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);

  useEffect(() => {
    // 로그 업데이트
    const interval = setInterval(() => {
      setLogs(AnimationDebugger.getInstance().getLogs());
      setBugs(AnimationBugReporter.getReports());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleClear = useCallback(() => {
    AnimationDebugger.getInstance().clear();
    AnimationBugReporter.clear();
    setLogs([]);
    setBugs([]);
  }, []);

  if (!visible || !__DEV__) return null;

  return (
    <View style={styles.dashboard}>
      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        {(['logs', 'bugs', 'performance'] as Tab[]).map(tab => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}>
              {tab.toUpperCase()}
              {tab === 'bugs' && bugs.length > 0 && (
                <Text style={styles.badge}> ({bugs.length})</Text>
              )}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 콘텐츠 */}
      <ScrollView style={styles.content}>
        {activeTab === 'logs' && (
          <View>
            {logs.slice(-50).reverse().map((log, index) => (
              <View
                key={index}
                style={[
                  styles.logItem,
                  log.type === 'error' && styles.errorLog,
                  log.type === 'warning' && styles.warningLog,
                ]}
              >
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.logName}>{log.name}</Text>
                <Text style={styles.logValue}>
                  {log.message || JSON.stringify(log.value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'bugs' && (
          <View>
            {bugs.length === 0 ? (
              <Text style={styles.emptyText}>No bugs detected</Text>
            ) : (
              bugs.map((bug, index) => (
                <View key={index} style={styles.bugItem}>
                  <View style={styles.bugHeader}>
                    <Text style={styles.bugType}>{bug.type}</Text>
                    <Text style={styles.bugTime}>
                      {new Date(bug.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.bugValue}>{bug.valueName}</Text>
                  <Text style={styles.bugMessage}>{bug.message}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'performance' && (
          <View style={styles.performanceTab}>
            <Text style={styles.comingSoon}>
              Performance metrics coming soon...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 액션 바 */}
      <View style={styles.actionBar}>
        <Pressable style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7A4AE2',
  },
  tabText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  badge: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: 8,
  },
  errorLog: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  warningLog: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  logTime: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
    width: 70,
  },
  logName: {
    color: '#7A4AE2',
    fontSize: 11,
    fontWeight: '600',
    width: 80,
  },
  logValue: {
    color: '#FFFFFF',
    fontSize: 10,
    flex: 1,
    fontFamily: 'monospace',
  },
  bugItem: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bugType: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bugTime: {
    color: '#666',
    fontSize: 10,
  },
  bugValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bugMessage: {
    color: '#999',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  performanceTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    color: '#666',
    fontSize: 14,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export { DebugDashboard };
```

## sometimes-app 적용 사례

### 매칭 카드 디버거

```typescript
// src/features/matching/debug/matching-debug.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SwipeDebugInfo {
  translateX: number;
  translateY: number;
  rotation: number;
  velocity: number;
  direction: 'none' | 'left' | 'right';
  phase: 'idle' | 'swiping' | 'completing';
}

export function MatchingCardDebugger({
  children,
  enabled = __DEV__,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const [debugInfo, setDebugInfo] = useState<SwipeDebugInfo>({
    translateX: 0,
    translateY: 0,
    rotation: 0,
    velocity: 0,
    direction: 'none',
    phase: 'idle',
  });
  const [showDebug, setShowDebug] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const phase = useSharedValue<'idle' | 'swiping' | 'completing'>('idle');

  const updateDebugInfo = useCallback((info: Partial<SwipeDebugInfo>) => {
    setDebugInfo(prev => ({ ...prev, ...info }));
  }, []);

  // 값 변화 추적
  useAnimatedReaction(
    () => ({
      x: translateX.value,
      y: translateY.value,
      r: rotation.value,
    }),
    (current) => {
      const direction = current.x > 50 ? 'right' :
                       current.x < -50 ? 'left' : 'none';

      runOnJS(updateDebugInfo)({
        translateX: current.x,
        translateY: current.y,
        rotation: current.r,
        direction,
      });
    },
    []
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      phase.value = 'swiping';
      runOnJS(updateDebugInfo)({ phase: 'swiping' });
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / 20;

      runOnJS(updateDebugInfo)({
        velocity: Math.sqrt(
          event.velocityX ** 2 + event.velocityY ** 2
        ),
      });
    })
    .onEnd((event) => {
      const shouldComplete = Math.abs(translateX.value) > 150;

      if (shouldComplete) {
        phase.value = 'completing';
        runOnJS(updateDebugInfo)({ phase: 'completing' });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
        phase.value = 'idle';
        runOnJS(updateDebugInfo)({ phase: 'idle' });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* 디버그 오버레이 */}
      {showDebug && (
        <View style={styles.debugOverlay}>
          <View style={styles.debugHeader}>
            <Text style={styles.debugTitle}>Swipe Debug</Text>
            <Pressable onPress={() => setShowDebug(false)}>
              <Text style={styles.hideButton}>Hide</Text>
            </Pressable>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>Phase:</Text>
            <Text style={[
              styles.debugValue,
              debugInfo.phase === 'swiping' && styles.activeValue,
            ]}>
              {debugInfo.phase}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>Direction:</Text>
            <Text style={[
              styles.debugValue,
              debugInfo.direction === 'right' && styles.rightDirection,
              debugInfo.direction === 'left' && styles.leftDirection,
            ]}>
              {debugInfo.direction}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>X:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.translateX.toFixed(1)}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>Y:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.translateY.toFixed(1)}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>Rotation:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.rotation.toFixed(1)}°
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>Velocity:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.velocity.toFixed(0)}
            </Text>
          </View>
        </View>
      )}

      {!showDebug && (
        <Pressable
          style={styles.showButton}
          onPress={() => setShowDebug(true)}
        >
          <Text style={styles.showButtonText}>Debug</Text>
        </Pressable>
      )}

      {/* 카드 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
    minWidth: 150,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  debugTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hideButton: {
    color: '#999',
    fontSize: 12,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  debugLabel: {
    color: '#999',
    fontSize: 12,
  },
  debugValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  activeValue: {
    color: '#4CAF50',
  },
  rightDirection: {
    color: '#4CAF50',
  },
  leftDirection: {
    color: '#F44336',
  },
  showButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 6,
    zIndex: 100,
  },
  showButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  card: {
    flex: 1,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. Worklet 외부에서 SharedValue 접근

```typescript
// ❌ 에러 발생
const handlePress = () => {
  console.log(translateX.value); // 직접 접근
};

// ✅ runOnJS 사용
const logValue = (value: number) => {
  console.log('Value:', value);
};

useAnimatedReaction(
  () => translateX.value,
  (value) => {
    runOnJS(logValue)(value);
  }
);
```

### 2. 콜백에서 stale closure

```typescript
// ❌ 오래된 상태 참조
const handleComplete = () => {
  console.log(count); // 항상 초기값
};

translateX.value = withTiming(100, {}, () => {
  runOnJS(handleComplete)();
});

// ✅ ref 또는 최신 값 전달
const countRef = useRef(count);
countRef.current = count;

const handleComplete = () => {
  console.log(countRef.current);
};
```

### 3. 무한 useAnimatedReaction

```typescript
// ❌ 무한 루프
useAnimatedReaction(
  () => value.value,
  (current) => {
    value.value = current + 1; // 다시 트리거!
  }
);

// ✅ 조건부 업데이트
useAnimatedReaction(
  () => value.value,
  (current, previous) => {
    if (current !== previous && current < 100) {
      // 조건 체크
    }
  }
);
```

## 📚 이 장에서 배운 내용

1. **디버그 로거**: 애니메이션 값 변화 추적 시스템
2. **값 시각화**: 실시간 값 변화 그래프
3. **제스처 디버깅**: 터치 이벤트 모니터링
4. **버그 감지**: NaN, Infinity, 무한 루프 자동 감지
5. **Worklet 안전성**: 오류 처리 래퍼
6. **디버그 대시보드**: 통합 디버깅 UI

## 다음 장 예고

**Chapter 63: 프로덕션 최적화 체크리스트**에서는 앱을 프로덕션에 배포하기 전 확인해야 할 애니메이션 최적화 항목들을 정리합니다. 최종 성능 검증, 디버그 코드 제거, 번들 최적화 등을 다룹니다.
