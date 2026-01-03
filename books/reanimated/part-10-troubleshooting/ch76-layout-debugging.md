# Chapter 76: 레이아웃 디버깅

애니메이션과 레이아웃 계산 간의 충돌을 해결하고 부드러운 레이아웃 전환을 구현하는 방법을 학습합니다.

## 📌 학습 목표

- 레이아웃 계산 타이밍 이해
- measure 함수 활용법
- 레이아웃 애니메이션 동기화
- 동적 레이아웃 변화 처리

## 📖 개념 이해

### 레이아웃 계산 파이프라인

```
┌─────────────────────────────────────────────────────────────┐
│                  Layout Calculation Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Style Changes (스타일 변경)                             │
│       ↓                                                      │
│  ┌─────────────────────────────────────────┐                │
│  │  Yoga Layout Engine                      │                │
│  │  - Flexbox calculations                  │                │
│  │  - Size & position computation           │                │
│  └─────────────────────────────────────────┘                │
│       ↓                                                      │
│  2. Layout Measurement (레이아웃 측정)                       │
│       ↓                                                      │
│  ┌─────────────────────────────────────────┐                │
│  │  Native View Update                      │                │
│  │  - Apply calculated dimensions           │                │
│  │  - Trigger onLayout callback             │                │
│  └─────────────────────────────────────────┘                │
│       ↓                                                      │
│  3. Animation Application (애니메이션 적용)                  │
│       ↓                                                      │
│  ┌─────────────────────────────────────────┐                │
│  │  Transform/Style Animation               │                │
│  │  - SharedValue changes                   │                │
│  │  - useAnimatedStyle updates              │                │
│  └─────────────────────────────────────────┘                │
│       ↓                                                      │
│  4. Render (렌더링)                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 흔한 레이아웃 문제

```
┌─────────────────────────────────────────────────────────────┐
│                    Common Layout Issues                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Layout Shift (레이아웃 점프)                            │
│  ┌───────────┐    ┌───────────┐                             │
│  │  Before   │ → │  After    │  Jump without transition    │
│  │  ■■■■■    │    │  ■■■■■■■■■│                             │
│  └───────────┘    └───────────┘                             │
│                                                              │
│  2. Measurement Race (측정 경쟁)                            │
│  ┌──────────────────────────────────────────┐               │
│  │ Animation starts → Layout changes         │               │
│  │              → Stale measurements used    │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  3. Flash of Content (콘텐츠 깜빡임)                        │
│  ┌──────────────────────────────────────────┐               │
│  │ Mount → Brief wrong position → Correct   │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  4. Cumulative Layout Shift (누적 레이아웃 이동)            │
│  ┌──────────────────────────────────────────┐               │
│  │ Multiple small shifts = Poor UX          │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: 레이아웃 측정과 애니메이션 동기화

```typescript
// src/utils/layout/useMeasuredLayout.ts
import { useCallback, useRef, useState } from 'react';
import { View, LayoutRectangle, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  measure,
  useAnimatedRef,
} from 'react-native-reanimated';

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

// 레이아웃 측정과 애니메이션 통합 훅
export function useMeasuredAnimation() {
  const animatedRef = useAnimatedRef<Animated.View>();
  const layout = useSharedValue<Layout | null>(null);
  const isReady = useSharedValue(false);

  const measureLayout = useCallback(() => {
    'worklet';
    const measured = measure(animatedRef);
    if (measured) {
      layout.value = measured;
      isReady.value = true;
    }
    return measured;
  }, []);

  // 레이아웃 기반 애니메이션
  const animateToPosition = useCallback(
    (targetX: number, targetY: number) => {
      'worklet';
      const current = layout.value;
      if (!current) return;

      const deltaX = targetX - current.pageX;
      const deltaY = targetY - current.pageY;

      // 현재 위치에서 목표 위치로 애니메이션
      return {
        translateX: withSpring(deltaX),
        translateY: withSpring(deltaY),
      };
    },
    []
  );

  return {
    animatedRef,
    layout,
    isReady,
    measureLayout,
    animateToPosition,
  };
}

// 레이아웃 변화 감지 훅
export function useLayoutTransition() {
  const previousLayout = useSharedValue<Layout | null>(null);
  const currentLayout = useSharedValue<Layout | null>(null);
  const isTransitioning = useSharedValue(false);

  const onLayoutChange = useCallback((event: LayoutChangeEvent) => {
    'worklet';
    const { x, y, width, height } = event.nativeEvent.layout;

    previousLayout.value = currentLayout.value;
    currentLayout.value = { x, y, width, height, pageX: 0, pageY: 0 };

    if (previousLayout.value) {
      isTransitioning.value = true;
      // 트랜지션 완료 후 플래그 리셋
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    }
  }, []);

  // 레이아웃 변화량
  const layoutDelta = useAnimatedStyle(() => {
    if (!previousLayout.value || !currentLayout.value) {
      return { transform: [] };
    }

    const deltaX = previousLayout.value.x - currentLayout.value.x;
    const deltaY = previousLayout.value.y - currentLayout.value.y;
    const scaleX = previousLayout.value.width / currentLayout.value.width;
    const scaleY = previousLayout.value.height / currentLayout.value.height;

    return {
      transform: [
        { translateX: isTransitioning.value ? withSpring(0, {}, () => {}) : deltaX },
        { translateY: isTransitioning.value ? withSpring(0) : deltaY },
        { scaleX: isTransitioning.value ? withSpring(1) : scaleX },
        { scaleY: isTransitioning.value ? withSpring(1) : scaleY },
      ],
    };
  });

  return {
    onLayoutChange,
    layoutDelta,
    isTransitioning,
  };
}

// 사용 예시: 부드러운 크기 변화
function SmoothResizeBox({ expanded }: { expanded: boolean }) {
  const { onLayoutChange, layoutDelta, isTransitioning } = useLayoutTransition();

  return (
    <Animated.View
      style={[
        {
          width: expanded ? 200 : 100,
          height: expanded ? 200 : 100,
          backgroundColor: '#3498db',
        },
        layoutDelta,
      ]}
      onLayout={onLayoutChange}
    />
  );
}
```

### 예제 2: 레이아웃 점프 방지

```typescript
// src/components/LayoutJumpPrevention.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnUI,
  runOnJS,
  measure,
  useAnimatedRef,
} from 'react-native-reanimated';

// 콘텐츠 로딩 시 레이아웃 점프 방지
export function LayoutJumpGuard({
  children,
  minHeight = 0,
  placeholder,
}: {
  children: React.ReactNode;
  minHeight?: number;
  placeholder?: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const measuredHeight = useSharedValue(minHeight);
  const opacity = useSharedValue(0);
  const contentRef = useAnimatedRef<Animated.View>();

  // 콘텐츠가 마운트되면 높이 측정
  const measureContent = useCallback(() => {
    'worklet';
    const measured = measure(contentRef);
    if (measured && measured.height > 0) {
      measuredHeight.value = withTiming(measured.height, { duration: 200 });
      opacity.value = withTiming(1, { duration: 150 });
      runOnJS(setIsReady)(true);
    }
  }, []);

  useEffect(() => {
    // 약간의 지연 후 측정 (레이아웃 완료 보장)
    const timer = setTimeout(() => {
      runOnUI(measureContent)();
    }, 50);
    return () => clearTimeout(timer);
  }, [children]);

  const containerStyle = useAnimatedStyle(() => ({
    height: measuredHeight.value,
    overflow: 'hidden',
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={containerStyle}>
      {!isReady && placeholder}
      <Animated.View ref={contentRef} style={[styles.content, contentStyle]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// 이미지 로딩 시 레이아웃 점프 방지
export function LayoutStableImage({
  source,
  aspectRatio = 1,
  width,
}: {
  source: { uri: string };
  aspectRatio?: number;
  width: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1);
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        width,
        height: width / aspectRatio,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
      }}
    >
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, imageStyle]}
        onLoad={handleLoad}
        resizeMode="cover"
      />
      {!isLoaded && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
}

// 동적 리스트 아이템 추가 시 레이아웃 점프 방지
export function SmoothListInsertion({
  items,
  renderItem,
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  const [renderedItems, setRenderedItems] = useState<any[]>([]);
  const itemAnimations = useRef(new Map<string, Animated.SharedValue<number>>());

  useEffect(() => {
    // 새 아이템 감지
    const newItems = items.filter(
      (item) => !renderedItems.find((r) => r.id === item.id)
    );

    if (newItems.length > 0) {
      // 새 아이템에 애니메이션 추가
      newItems.forEach((item) => {
        const anim = useSharedValue(0);
        itemAnimations.current.set(item.id, anim);
        anim.value = withSpring(1, { damping: 15 });
      });

      setRenderedItems(items);
    }
  }, [items]);

  return (
    <View>
      {renderedItems.map((item, index) => {
        const anim = itemAnimations.current.get(item.id);

        const itemStyle = useAnimatedStyle(() => {
          const progress = anim?.value ?? 1;
          return {
            opacity: progress,
            transform: [
              { translateY: (1 - progress) * 20 },
              { scale: 0.95 + progress * 0.05 },
            ],
          };
        });

        return (
          <Animated.View key={item.id} style={itemStyle}>
            {renderItem(item, index)}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
});
```

### 예제 3: measure 함수 디버깅

```typescript
// src/debug/LayoutDebugger.tsx
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedRef,
  measure,
  runOnUI,
  runOnJS,
} from 'react-native-reanimated';

interface MeasurementLog {
  id: string;
  timestamp: number;
  element: string;
  measurement: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  } | null;
  error?: string;
}

// 레이아웃 측정 디버거
export function useLayoutDebugger(elementName: string) {
  const animatedRef = useAnimatedRef<Animated.View>();
  const [logs, setLogs] = useState<MeasurementLog[]>([]);
  const logIdCounter = useRef(0);

  const addLog = useCallback((measurement: MeasurementLog['measurement'], error?: string) => {
    setLogs((prev) => [
      {
        id: `${logIdCounter.current++}`,
        timestamp: Date.now(),
        element: elementName,
        measurement,
        error,
      },
      ...prev.slice(0, 19), // 최근 20개만 유지
    ]);
  }, [elementName]);

  const measureWithLogging = useCallback(() => {
    'worklet';
    try {
      const measured = measure(animatedRef);

      if (measured) {
        runOnJS(addLog)({
          x: measured.x,
          y: measured.y,
          width: measured.width,
          height: measured.height,
          pageX: measured.pageX,
          pageY: measured.pageY,
        });
      } else {
        runOnJS(addLog)(null, 'measure() returned null - element may not be mounted');
      }

      return measured;
    } catch (error) {
      runOnJS(addLog)(null, String(error));
      return null;
    }
  }, [addLog]);

  const triggerMeasure = useCallback(() => {
    runOnUI(measureWithLogging)();
  }, [measureWithLogging]);

  return {
    animatedRef,
    logs,
    triggerMeasure,
    measureWithLogging,
  };
}

// 레이아웃 디버그 오버레이
export function LayoutDebugOverlay({
  logs,
  visible,
}: {
  logs: MeasurementLog[];
  visible: boolean;
}) {
  if (!visible || !__DEV__) return null;

  return (
    <View style={debugStyles.overlay}>
      <Text style={debugStyles.title}>Layout Measurements</Text>
      {logs.map((log) => (
        <View key={log.id} style={debugStyles.logItem}>
          <Text style={debugStyles.logTime}>
            {new Date(log.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={debugStyles.logElement}>{log.element}</Text>
          {log.measurement ? (
            <View style={debugStyles.logMeasurement}>
              <Text style={debugStyles.logValue}>
                x: {log.measurement.x.toFixed(1)}, y: {log.measurement.y.toFixed(1)}
              </Text>
              <Text style={debugStyles.logValue}>
                w: {log.measurement.width.toFixed(1)}, h: {log.measurement.height.toFixed(1)}
              </Text>
              <Text style={debugStyles.logValue}>
                pageX: {log.measurement.pageX.toFixed(1)}, pageY: {log.measurement.pageY.toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text style={debugStyles.logError}>{log.error || 'No measurement'}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// 요소 경계 시각화
export function LayoutBoundaryVisualizer({
  children,
  color = 'rgba(255, 0, 0, 0.3)',
  showDimensions = true,
}: {
  children: React.ReactNode;
  color?: string;
  showDimensions?: boolean;
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  if (!__DEV__) return <>{children}</>;

  return (
    <View
      style={[debugStyles.boundaryContainer, { borderColor: color }]}
      onLayout={(e) => {
        setDimensions({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        });
      }}
    >
      {children}
      {showDimensions && (
        <View style={debugStyles.dimensionLabel}>
          <Text style={debugStyles.dimensionText}>
            {dimensions.width.toFixed(0)} × {dimensions.height.toFixed(0)}
          </Text>
        </View>
      )}
    </View>
  );
}

// 측정 타이밍 분석
export function useMeasurementTiming() {
  const timings = useRef<{ start: number; measure: number; end: number }[]>([]);

  const startTiming = useCallback(() => {
    timings.current.push({ start: performance.now(), measure: 0, end: 0 });
  }, []);

  const recordMeasure = useCallback(() => {
    const current = timings.current[timings.current.length - 1];
    if (current) {
      current.measure = performance.now();
    }
  }, []);

  const endTiming = useCallback(() => {
    const current = timings.current[timings.current.length - 1];
    if (current) {
      current.end = performance.now();

      if (__DEV__) {
        const measureDuration = current.measure - current.start;
        const totalDuration = current.end - current.start;
        console.log(
          `[Layout Timing] Measure: ${measureDuration.toFixed(2)}ms, Total: ${totalDuration.toFixed(2)}ms`
        );
      }
    }
  }, []);

  const getStats = useCallback(() => {
    if (timings.current.length === 0) return null;

    const measureTimes = timings.current
      .filter((t) => t.measure > 0)
      .map((t) => t.measure - t.start);

    const avg = measureTimes.reduce((a, b) => a + b, 0) / measureTimes.length;
    const max = Math.max(...measureTimes);
    const min = Math.min(...measureTimes);

    return { avg, max, min, count: measureTimes.length };
  }, []);

  return { startTiming, recordMeasure, endTiming, getStats };
}

const debugStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 10,
    maxHeight: 200,
  },
  title: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logItem: {
    marginVertical: 4,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  logTime: {
    color: '#888',
    fontSize: 10,
  },
  logElement: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
  },
  logMeasurement: {
    marginTop: 2,
  },
  logValue: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  logError: {
    color: '#F44336',
    fontSize: 10,
  },
  boundaryContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  dimensionLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderBottomLeftRadius: 4,
  },
  dimensionText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'monospace',
  },
});
```

### 예제 4: 동적 높이 애니메이션

```typescript
// src/components/AnimatedHeight.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { View, LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedHeightProps {
  children: React.ReactNode;
  duration?: number;
  useSpring?: boolean;
}

// 콘텐츠에 따라 높이가 자동으로 애니메이션되는 컨테이너
export function AnimatedHeight({
  children,
  duration = 300,
  useSpring: useSpringAnimation = true,
}: AnimatedHeightProps) {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const newHeight = event.nativeEvent.layout.height;

      if (!isInitialized) {
        // 초기 렌더링 시 즉시 적용
        height.value = newHeight;
        opacity.value = 1;
        setIsInitialized(true);
      } else {
        // 이후 변화는 애니메이션
        if (useSpringAnimation) {
          height.value = withSpring(newHeight, { damping: 15, stiffness: 150 });
        } else {
          height.value = withTiming(newHeight, { duration });
        }
      }
    },
    [isInitialized, useSpringAnimation, duration]
  );

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.measureContainer} onLayout={handleLayout}>
        {children}
      </View>
    </Animated.View>
  );
}

// Accordion 스타일 확장/축소
export function AnimatedCollapsible({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const height = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const opacity = useSharedValue(0);

  const handleContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      contentHeight.value = event.nativeEvent.layout.height;

      if (isOpen && height.value === 0) {
        // 처음 열릴 때
        height.value = withSpring(contentHeight.value, { damping: 15 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      height.value = withSpring(contentHeight.value, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      height.value = withSpring(0, { damping: 20 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isOpen]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={containerStyle}>
      <View
        style={styles.absoluteContent}
        onLayout={handleContentLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
}

// 텍스트 줄 수에 따른 동적 높이
export function AnimatedTextHeight({
  text,
  maxLines,
  expanded,
}: {
  text: string;
  maxLines: number;
  expanded: boolean;
}) {
  const height = useSharedValue(0);
  const collapsedHeight = useSharedValue(0);
  const fullHeight = useSharedValue(0);

  const measureCollapsed = useCallback((event: LayoutChangeEvent) => {
    collapsedHeight.value = event.nativeEvent.layout.height;
  }, []);

  const measureFull = useCallback((event: LayoutChangeEvent) => {
    fullHeight.value = event.nativeEvent.layout.height;
  }, []);

  useEffect(() => {
    const targetHeight = expanded ? fullHeight.value : collapsedHeight.value;
    if (targetHeight > 0) {
      height.value = withSpring(targetHeight, { damping: 15 });
    }
  }, [expanded, collapsedHeight.value, fullHeight.value]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value > 0 ? height.value : undefined,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={containerStyle}>
      {/* 측정용 숨겨진 뷰 */}
      <View style={styles.hidden}>
        <Text numberOfLines={maxLines} onLayout={measureCollapsed}>
          {text}
        </Text>
        <Text onLayout={measureFull}>{text}</Text>
      </View>

      {/* 실제 표시 */}
      <Text numberOfLines={expanded ? undefined : maxLines}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  measureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  absoluteContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
});
```

### 예제 5: Shared Element 전환

```typescript
// src/components/SharedElementTransition.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnUI,
  runOnJS,
  measure,
  useAnimatedRef,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface SharedElementProps {
  id: string;
  isSource?: boolean;
  isTarget?: boolean;
  children: React.ReactNode;
}

// 전역 레이아웃 레지스트리
const layoutRegistry = new Map<string, Layout>();

export function SharedElement({
  id,
  isSource = false,
  isTarget = false,
  children,
}: SharedElementProps) {
  const animatedRef = useAnimatedRef<Animated.View>();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const opacity = useSharedValue(isTarget ? 0 : 1);

  const registerLayout = useCallback((layout: Layout) => {
    layoutRegistry.set(id, layout);
  }, [id]);

  useEffect(() => {
    // 레이아웃 측정 및 등록
    const measureAndRegister = () => {
      'worklet';
      const measured = measure(animatedRef);
      if (measured) {
        runOnJS(registerLayout)({
          x: measured.x,
          y: measured.y,
          width: measured.width,
          height: measured.height,
          pageX: measured.pageX,
          pageY: measured.pageY,
        });
      }
    };

    // 약간의 지연 후 측정
    const timer = setTimeout(() => {
      runOnUI(measureAndRegister)();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 타겟으로 전환할 때 애니메이션
  useEffect(() => {
    if (isTarget) {
      const sourceLayout = layoutRegistry.get(id);
      if (!sourceLayout) return;

      // 소스 위치에서 시작
      runOnUI(() => {
        'worklet';
        const targetMeasured = measure(animatedRef);
        if (!targetMeasured) return;

        // 초기 위치 설정 (소스 -> 타겟)
        translateX.value = sourceLayout.pageX - targetMeasured.pageX;
        translateY.value = sourceLayout.pageY - targetMeasured.pageY;
        scaleX.value = sourceLayout.width / targetMeasured.width;
        scaleY.value = sourceLayout.height / targetMeasured.height;
        opacity.value = 1;

        // 타겟 위치로 애니메이션
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
        scaleX.value = withSpring(1, { damping: 20 });
        scaleY.value = withSpring(1, { damping: 20 });
      })();
    }
  }, [isTarget]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  return (
    <Animated.View ref={animatedRef} style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

// Shared Element 전환 컨테이너
export function SharedElementTransitionContainer({
  isVisible,
  sourceElement,
  targetElement,
  onClose,
}: {
  isVisible: boolean;
  sourceElement: React.ReactNode;
  targetElement: React.ReactNode;
  onClose: () => void;
}) {
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withSpring(isVisible ? 1 : 0);
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <>
      {/* 소스 요소 */}
      {!isVisible && sourceElement}

      {/* 오버레이 + 타겟 요소 */}
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
          {isVisible && targetElement}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## 🎯 sometimes-app 적용 사례

### 프로필 카드 확장 애니메이션

```typescript
// src/features/matching/components/ExpandableProfileCard.tsx
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnUI,
  measure,
  useAnimatedRef,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    bio: string;
    imageUrl: string;
    details: {
      university: string;
      major: string;
      interests: string[];
    };
  };
}

export function ExpandableProfileCard({ user }: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useAnimatedRef<Animated.View>();

  // 애니메이션 상태
  const progress = useSharedValue(0);
  const cardLayout = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });

  // 카드 확장/축소
  const toggleExpand = useCallback(() => {
    runOnUI(() => {
      'worklet';
      // 현재 레이아웃 저장
      const measured = measure(cardRef);
      if (measured) {
        cardLayout.value = {
          x: measured.pageX,
          y: measured.pageY,
          width: measured.width,
          height: measured.height,
        };
      }
    })();

    setIsExpanded(!isExpanded);
    progress.value = withSpring(isExpanded ? 0 : 1, {
      damping: 20,
      stiffness: 150,
    });
  }, [isExpanded]);

  // 카드 스타일 (미리보기 → 전체화면)
  const cardStyle = useAnimatedStyle(() => {
    const layout = cardLayout.value;

    // 시작: 원래 위치, 끝: 전체화면
    const width = interpolate(
      progress.value,
      [0, 1],
      [layout.width || SCREEN_WIDTH * 0.9, SCREEN_WIDTH]
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [layout.height || 400, SCREEN_HEIGHT]
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, -(layout.x || (SCREEN_WIDTH * 0.05))]
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -(layout.y || 100)]
    );
    const borderRadius = interpolate(progress.value, [0, 1], [20, 0]);

    return {
      width,
      height,
      borderRadius,
      transform: [{ translateX }, { translateY }],
      zIndex: progress.value > 0 ? 1000 : 1,
    };
  });

  // 상세 정보 스타일 (확장 시 페이드인)
  const detailsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0.5, 1],
          [20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // 닫기 버튼 스타일
  const closeButtonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View ref={cardRef} style={[styles.card, cardStyle]}>
      <Pressable onPress={toggleExpand} style={styles.pressable}>
        {/* 프로필 이미지 */}
        <Animated.Image
          source={{ uri: user.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* 기본 정보 */}
        <View style={styles.basicInfo}>
          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>
          <Text style={styles.bio} numberOfLines={isExpanded ? undefined : 2}>
            {user.bio}
          </Text>
        </View>

        {/* 확장 시 상세 정보 */}
        <Animated.View style={[styles.details, detailsStyle]}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>University</Text>
            <Text style={styles.detailValue}>{user.details.university}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Major</Text>
            <Text style={styles.detailValue}>{user.details.major}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Interests</Text>
            <View style={styles.interestTags}>
              {user.details.interests.map((interest, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Pressable>

      {/* 닫기 버튼 */}
      <Animated.View style={[styles.closeButton, closeButtonStyle]}>
        <Pressable onPress={toggleExpand}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '60%',
  },
  basicInfo: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  details: {
    padding: 16,
    paddingTop: 0,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 측정 전 애니메이션 시작

```typescript
// ❌ 잘못된 방법 - 레이아웃 전에 애니메이션
function BadAnimation() {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withSpring(200); // 레이아웃 완료 전!
  }, []);
}

// ✅ 올바른 방법 - onLayout 후 애니메이션
function GoodAnimation() {
  const height = useSharedValue(0);
  const isReady = useSharedValue(false);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    if (!isReady.value) {
      isReady.value = true;
      height.value = withSpring(e.nativeEvent.layout.height);
    }
  }, []);

  return <View onLayout={handleLayout} />;
}
```

### 실수 2: measure가 null 반환 무시

```typescript
// ❌ 잘못된 방법 - null 체크 없음
const measureElement = () => {
  'worklet';
  const result = measure(animatedRef);
  translateX.value = result.pageX; // 크래시 가능!
};

// ✅ 올바른 방법 - null 체크 포함
const measureElement = () => {
  'worklet';
  const result = measure(animatedRef);
  if (result) {
    translateX.value = result.pageX;
  } else {
    console.warn('Element not yet mounted');
  }
};
```

## 💡 팁

### 팁 1: 레이아웃 측정 지연

```typescript
// 마운트 직후 측정 실패 방지
useEffect(() => {
  const timer = setTimeout(() => {
    runOnUI(measureLayout)();
  }, 100); // 레이아웃 안정화 대기
  return () => clearTimeout(timer);
}, []);
```

### 팁 2: 레이아웃 캐싱

```typescript
const layoutCache = new Map<string, Layout>();

function getCachedLayout(id: string): Layout | null {
  return layoutCache.get(id) || null;
}
```

## 📚 이 장에서 배운 내용

1. **레이아웃 파이프라인**: Yoga → Native View → Animation
2. **measure 함수**: 정확한 레이아웃 측정 방법
3. **점프 방지**: 콘텐츠 로딩 시 부드러운 전환
4. **동적 높이**: 콘텐츠 변화에 따른 애니메이션
5. **Shared Element**: 화면 전환 시 요소 공유

## 다음 장 예고

**Chapter 77: 타이밍 이슈**에서는 애니메이션 타이밍 동기화 문제와 지연 처리 방법을 다룹니다.
