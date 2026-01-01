# 부록 D: 디버깅 도구

Reanimated 애니메이션을 디버깅하고 성능을 분석하는 데 유용한 도구와 기법을 정리했습니다.

---

## 🔍 FPS 모니터

### 기본 FPS 모니터

```typescript
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';

function FPSMonitor() {
  const [fps, setFps] = useState(60);
  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(Date.now());

  useFrameCallback(() => {
    frameCount.value++;

    const now = Date.now();
    if (now - lastTime.value >= 1000) {
      const currentFps = frameCount.value;
      runOnJS(setFps)(currentFps);
      frameCount.value = 0;
      lastTime.value = now;
    }
  });

  const getFpsColor = () => {
    if (fps >= 55) return '#4CAF50';
    if (fps >= 45) return '#FFC107';
    return '#F44336';
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.fpsContainer}>
      <Text style={[styles.fpsText, { color: getFpsColor() }]}>
        {fps} FPS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fpsContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
    zIndex: 9999,
  },
  fpsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

### 상세 프레임 분석기

```typescript
interface FrameStats {
  fps: number;
  avgFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number;
  jank: number;
}

function DetailedFrameMonitor() {
  const [stats, setStats] = useState<FrameStats>({
    fps: 60,
    avgFrameTime: 16.67,
    maxFrameTime: 16.67,
    droppedFrames: 0,
    jank: 0,
  });

  const frameTimes = useSharedValue<number[]>([]);
  const lastFrameTime = useSharedValue(0);
  const droppedCount = useSharedValue(0);

  useFrameCallback((info) => {
    const now = info.timestamp;

    if (lastFrameTime.value > 0) {
      const delta = now - lastFrameTime.value;
      frameTimes.value = [...frameTimes.value.slice(-59), delta];

      if (delta > 20) {
        droppedCount.value++;
      }
    }

    lastFrameTime.value = now;

    if (frameTimes.value.length >= 60) {
      const times = frameTimes.value;
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const fps = Math.round(1000 / avg);
      const jank = times.filter((t) => t > 25).length;

      runOnJS(setStats)({
        fps,
        avgFrameTime: avg,
        maxFrameTime: max,
        droppedFrames: droppedCount.value,
        jank,
      });
    }
  });

  if (!__DEV__) return null;

  return (
    <View style={styles.detailedMonitor}>
      <Text style={styles.monitorTitle}>Frame Stats</Text>
      <Text>FPS: {stats.fps}</Text>
      <Text>Avg: {stats.avgFrameTime.toFixed(2)}ms</Text>
      <Text>Max: {stats.maxFrameTime.toFixed(2)}ms</Text>
      <Text>Dropped: {stats.droppedFrames}</Text>
      <Text>Jank: {stats.jank}</Text>
    </View>
  );
}
```

---

## 🎯 SharedValue 디버거

### SharedValue 추적기

```typescript
function useSharedValueDebugger<T>(
  sharedValue: SharedValue<T>,
  name: string,
  options?: {
    logChanges?: boolean;
    trackHistory?: boolean;
    maxHistory?: number;
  }
) {
  const { logChanges = true, trackHistory = true, maxHistory = 100 } = options || {};
  const history = useRef<{ value: T; timestamp: number }[]>([]);

  useAnimatedReaction(
    () => sharedValue.value,
    (current, previous) => {
      if (logChanges && previous !== null) {
        console.log(`[SharedValue:${name}] ${previous} → ${current}`);
      }

      if (trackHistory) {
        runOnJS((value: T) => {
          history.current.push({ value, timestamp: Date.now() });
          if (history.current.length > maxHistory) {
            history.current.shift();
          }
        })(current);
      }
    }
  );

  const getHistory = () => history.current;

  const getStats = () => {
    const values = history.current.map((h) => h.value);
    if (typeof values[0] === 'number') {
      const nums = values as number[];
      return {
        min: Math.min(...nums),
        max: Math.max(...nums),
        avg: nums.reduce((a, b) => a + b, 0) / nums.length,
        count: nums.length,
      };
    }
    return { count: values.length };
  };

  return { getHistory, getStats };
}

// 사용 예시
function DebugExample() {
  const translateX = useSharedValue(0);
  const { getStats } = useSharedValueDebugger(translateX, 'translateX');

  // 통계 출력
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Stats:', getStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
```

### SharedValue 시각화

```typescript
function SharedValueVisualizer({
  value,
  name,
  min = -200,
  max = 200,
}: {
  value: SharedValue<number>;
  name: string;
  min?: number;
  max?: number;
}) {
  const barWidth = useDerivedValue(() => {
    const normalized = (value.value - min) / (max - min);
    return Math.max(0, Math.min(1, normalized)) * 200;
  });

  const barStyle = useAnimatedStyle(() => ({
    width: barWidth.value,
    backgroundColor: value.value >= 0 ? '#4CAF50' : '#F44336',
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: Math.abs(value.value) > (max - min) * 0.8 ? '#FF5722' : '#333',
  }));

  return (
    <View style={styles.visualizerRow}>
      <Text style={styles.visualizerName}>{name}</Text>
      <View style={styles.visualizerBar}>
        <Animated.View style={[styles.visualizerFill, barStyle]} />
      </View>
      <AnimatedText text={value} style={[styles.visualizerValue, textStyle]} />
    </View>
  );
}

// AnimatedText 헬퍼
function AnimatedText({
  text,
  style,
}: {
  text: SharedValue<number>;
  style?: any;
}) {
  const animatedProps = useAnimatedProps(() => ({
    text: text.value.toFixed(2),
  }));

  return (
    <Animated.TextInput
      editable={false}
      style={style}
      animatedProps={animatedProps}
    />
  );
}
```

---

## 🖱️ 제스처 디버거

### 터치 포인트 시각화

```typescript
function TouchPointVisualizer() {
  const touches = useSharedValue<{ x: number; y: number; id: number }[]>([]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      touches.value = [{ x: event.absoluteX, y: event.absoluteY, id: 0 }];
    })
    .onEnd(() => {
      touches.value = [];
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={StyleSheet.absoluteFill}>
        {touches.value.map((touch) => (
          <Animated.View
            key={touch.id}
            style={[
              styles.touchPoint,
              {
                left: touch.x - 20,
                top: touch.y - 20,
              },
            ]}
          />
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  touchPoint: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(122, 74, 226, 0.5)',
    borderWidth: 2,
    borderColor: '#7A4AE2',
  },
});
```

### 제스처 상태 로거

```typescript
function useGestureLogger(name: string) {
  const logEvent = (event: string, data?: any) => {
    console.log(`[Gesture:${name}] ${event}`, data ? JSON.stringify(data) : '');
  };

  const wrapGesture = <T extends GestureType>(gesture: T): T => {
    return gesture
      .onBegin((e) => logEvent('BEGIN', { x: e.x, y: e.y }))
      .onStart((e) => logEvent('START', { x: e.x, y: e.y }))
      .onUpdate((e) => logEvent('UPDATE', {
        translationX: (e as any).translationX,
        translationY: (e as any).translationY,
      }))
      .onEnd((e) => logEvent('END', {
        velocityX: (e as any).velocityX,
        velocityY: (e as any).velocityY,
      }))
      .onFinalize((e, success) => logEvent('FINALIZE', { success })) as T;
  };

  return { wrapGesture };
}

// 사용 예시
function DebugGestureComponent() {
  const { wrapGesture } = useGestureLogger('SwipeCard');
  const translateX = useSharedValue(0);

  const gesture = wrapGesture(
    Gesture.Pan().onUpdate((e) => {
      translateX.value = e.translationX;
    })
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
      }))} />
    </GestureDetector>
  );
}
```

---

## ⏱️ 타이밍 분석기

### 애니메이션 타이밍 프로파일러

```typescript
interface AnimationProfile {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  frames: number;
}

class AnimationProfiler {
  private profiles: Map<string, AnimationProfile> = new Map();
  private frameCallbacks: Map<string, () => void> = new Map();

  start(id: string, name: string) {
    this.profiles.set(id, {
      id,
      name,
      startTime: performance.now(),
      frames: 0,
    });

    console.log(`[Profiler] Started: ${name}`);
  }

  frame(id: string) {
    const profile = this.profiles.get(id);
    if (profile) {
      profile.frames++;
    }
  }

  end(id: string) {
    const profile = this.profiles.get(id);
    if (profile) {
      profile.endTime = performance.now();
      profile.duration = profile.endTime - profile.startTime;

      const avgFps = profile.frames / (profile.duration / 1000);

      console.log(`[Profiler] Completed: ${profile.name}`);
      console.log(`  Duration: ${profile.duration.toFixed(2)}ms`);
      console.log(`  Frames: ${profile.frames}`);
      console.log(`  Avg FPS: ${avgFps.toFixed(1)}`);
    }
  }

  getReport(): AnimationProfile[] {
    return Array.from(this.profiles.values());
  }
}

const profiler = new AnimationProfiler();

// 훅으로 래핑
function useAnimationProfile(name: string) {
  const id = useRef(`${name}-${Date.now()}`).current;
  const isRunning = useSharedValue(false);

  const start = () => {
    'worklet';
    isRunning.value = true;
    runOnJS(profiler.start.bind(profiler))(id, name);
  };

  const end = () => {
    'worklet';
    isRunning.value = false;
    runOnJS(profiler.end.bind(profiler))(id);
  };

  useFrameCallback(() => {
    if (isRunning.value) {
      runOnJS(profiler.frame.bind(profiler))(id);
    }
  });

  return { start, end };
}
```

### 렌더 사이클 추적기

```typescript
function RenderTracker({ children, name }: { children: React.ReactNode; name: string }) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const delta = now - lastRenderTime.current;

    console.log(`[Render:${name}] #${renderCount.current}, delta: ${delta}ms`);
    lastRenderTime.current = now;
  });

  return <>{children}</>;
}

// 사용 예시
function TrackedComponent() {
  return (
    <RenderTracker name="SwipeCard">
      <SwipeCard />
    </RenderTracker>
  );
}
```

---

## 📊 통합 디버그 패널

```typescript
interface DebugState {
  fps: number;
  memoryWarning: boolean;
  activeAnimations: number;
  gestureState: string;
  lastError?: string;
}

function AnimationDebugPanel() {
  const [state, setState] = useState<DebugState>({
    fps: 60,
    memoryWarning: false,
    activeAnimations: 0,
    gestureState: 'idle',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const panelHeight = useSharedValue(40);

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    panelHeight.value = withSpring(isExpanded ? 40 : 300);
  };

  const panelStyle = useAnimatedStyle(() => ({
    height: panelHeight.value,
  }));

  if (!__DEV__) return null;

  return (
    <Animated.View style={[styles.debugPanel, panelStyle]}>
      <Pressable onPress={togglePanel} style={styles.debugHeader}>
        <Text style={styles.debugTitle}>🔧 Debug Panel</Text>
        <FPSBadge fps={state.fps} />
      </Pressable>

      {isExpanded && (
        <ScrollView style={styles.debugContent}>
          {/* FPS 그래프 */}
          <Section title="Performance">
            <FPSGraph />
            <Text>Active Animations: {state.activeAnimations}</Text>
          </Section>

          {/* SharedValue 모니터 */}
          <Section title="Shared Values">
            <SharedValueMonitor />
          </Section>

          {/* 제스처 상태 */}
          <Section title="Gestures">
            <Text>State: {state.gestureState}</Text>
          </Section>

          {/* 에러 로그 */}
          {state.lastError && (
            <Section title="Last Error">
              <Text style={styles.errorText}>{state.lastError}</Text>
            </Section>
          )}

          {/* 액션 버튼 */}
          <View style={styles.debugActions}>
            <Button title="Clear Cache" onPress={clearCache} />
            <Button title="Force GC" onPress={forceGC} />
            <Button title="Export Logs" onPress={exportLogs} />
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
}

function FPSBadge({ fps }: { fps: number }) {
  const backgroundColor = fps >= 55 ? '#4CAF50' : fps >= 45 ? '#FFC107' : '#F44336';

  return (
    <View style={[styles.fpsBadge, { backgroundColor }]}>
      <Text style={styles.fpsBadgeText}>{fps} FPS</Text>
    </View>
  );
}

function FPSGraph() {
  const [history, setHistory] = useState<number[]>([]);
  const MAX_POINTS = 60;

  useEffect(() => {
    const interval = setInterval(() => {
      // FPS 데이터 수집
      const currentFps = 60; // 실제 FPS 값으로 대체
      setHistory((prev) => [...prev.slice(-MAX_POINTS + 1), currentFps]);
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.fpsGraph}>
      {history.map((fps, i) => (
        <View
          key={i}
          style={[
            styles.fpsBar,
            {
              height: (fps / 60) * 50,
              backgroundColor: fps >= 55 ? '#4CAF50' : fps >= 45 ? '#FFC107' : '#F44336',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  debugPanel: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 9999,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  debugTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugContent: {
    flex: 1,
    padding: 10,
  },
  fpsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fpsBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fpsGraph: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  fpsBar: {
    flex: 1,
    minWidth: 2,
  },
  debugActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
  },
});
```

---

## 🛠️ 유틸리티 함수

### 안전한 worklet 실행

```typescript
function safeWorklet<T extends (...args: any[]) => any>(
  fn: T,
  fallback?: ReturnType<T>
): T {
  return ((...args: Parameters<T>) => {
    'worklet';
    try {
      return fn(...args);
    } catch (error) {
      console.error('[Worklet Error]', error);
      return fallback;
    }
  }) as T;
}

// 사용 예시
const safeCalculation = safeWorklet(
  (x: number, y: number) => {
    'worklet';
    if (y === 0) throw new Error('Division by zero');
    return x / y;
  },
  0
);
```

### 메모리 사용량 추적

```typescript
function useMemoryMonitor(interval = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
  }>({});

  useEffect(() => {
    if (!__DEV__) return;

    const checkMemory = () => {
      // React Native에서는 직접적인 힙 접근 불가
      // Hermes 사용 시 런타임 정보 접근 가능
      if ((global as any).HermesInternal) {
        const stats = (global as any).HermesInternal.getRuntimeProperties();
        setMemoryInfo({
          usedJSHeapSize: stats['js_heapSize'],
          totalJSHeapSize: stats['js_heapSizeLimit'],
        });
      }
    };

    const timer = setInterval(checkMemory, interval);
    checkMemory();

    return () => clearInterval(timer);
  }, [interval]);

  return memoryInfo;
}
```

---

## 📱 Flipper 플러그인 설정

### Flipper 디버깅 활성화

```typescript
// metro.config.js
module.exports = {
  transformer: {
    // Flipper 지원
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

### Reanimated 로거 플러그인

```typescript
// flipper-plugin-reanimated.ts
if (__DEV__) {
  const addPlugin = require('react-native-flipper').addPlugin;

  addPlugin({
    getId() {
      return 'reanimated-debugger';
    },
    onConnect(connection: any) {
      // SharedValue 변경 전송
      connection.send('init', { version: require('react-native-reanimated/package.json').version });
    },
    onDisconnect() {},
  });
}
```

---

## 디버깅 팁

1. **개발 빌드에서만 디버깅 코드 실행**: `__DEV__` 플래그 활용
2. **성능 오버헤드 최소화**: 프로덕션에서는 모든 디버깅 코드 제거
3. **로그 레벨 관리**: 중요도에 따라 로그 필터링
4. **실제 기기 테스트**: 시뮬레이터/에뮬레이터와 실제 기기 성능 차이 확인
5. **릴리스 빌드 프로파일링**: 최종 성능은 릴리스 빌드에서 측정
