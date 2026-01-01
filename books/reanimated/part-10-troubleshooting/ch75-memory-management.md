# Chapter 75: 메모리 관리

애니메이션으로 인한 메모리 누수를 방지하고 효율적으로 리소스를 관리하는 방법을 학습합니다.

## 📌 학습 목표

- SharedValue 메모리 생명주기 이해
- 애니메이션 리소스 정리 패턴
- 메모리 누수 감지 및 해결
- 대규모 리스트 최적화

## 📖 개념 이해

### SharedValue 메모리 구조

```
┌─────────────────────────────────────────────────────────────┐
│                SharedValue Memory Lifecycle                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Component Mount                                            │
│       ↓                                                      │
│  ┌─────────────────────┐                                    │
│  │  useSharedValue(0)  │ → JS Heap allocation               │
│  │                     │ → UI Thread allocation             │
│  │  ┌───────────────┐  │                                    │
│  │  │ JS Reference  │←─┼──── React Component                │
│  │  └───────┬───────┘  │                                    │
│  │          ↓          │                                    │
│  │  ┌───────────────┐  │                                    │
│  │  │ UI Reference  │←─┼──── Worklet                        │
│  │  └───────────────┘  │                                    │
│  └─────────────────────┘                                    │
│       ↓                                                      │
│  Component Unmount                                          │
│       ↓                                                      │
│  ┌─────────────────────┐                                    │
│  │  Cleanup Required   │                                    │
│  │  - Cancel animations│                                    │
│  │  - Release refs     │                                    │
│  │  - Clear callbacks  │                                    │
│  └─────────────────────┘                                    │
│       ↓                                                      │
│  GC collects (eventually)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 메모리 누수 원인

```
┌─────────────────────────────────────────────────────────────┐
│                   Memory Leak Sources                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Uncanceled Animations                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ withSpring() → Component unmounts       │               │
│  │              → Animation continues      │ ← LEAK!       │
│  │              → SharedValue persists     │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
│  2. Stale Closure References                                │
│  ┌─────────────────────────────────────────┐               │
│  │ runOnJS(callback)                       │               │
│  │              → callback captures state  │ ← LEAK!       │
│  │              → State object retained    │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
│  3. Unreleased Event Handlers                               │
│  ┌─────────────────────────────────────────┐               │
│  │ useAnimatedScrollHandler()              │               │
│  │              → Handler not cleaned up   │ ← LEAK!       │
│  │              → View reference retained  │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
│  4. Circular References                                     │
│  ┌─────────────────────────────────────────┐               │
│  │ SharedValue A → Worklet → SharedValue B │               │
│  │       ↑                         ↓       │ ← LEAK!       │
│  │       └─────────────────────────┘       │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: 안전한 애니메이션 정리

```typescript
// src/hooks/useSafeAnimation.ts
import { useEffect, useRef, useCallback } from 'react';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  cancelAnimation,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

interface SafeAnimationOptions {
  autoCleanup?: boolean;
}

export function useSafeSharedValue<T>(
  initialValue: T,
  options: SafeAnimationOptions = { autoCleanup: true }
) {
  const value = useSharedValue(initialValue);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      if (options.autoCleanup) {
        // 언마운트 시 진행 중인 애니메이션 취소
        cancelAnimation(value);
      }
    };
  }, []);

  // 안전한 애니메이션 래퍼
  const safeAnimate = useCallback(
    (
      targetValue: T,
      config?: WithSpringConfig | WithTimingConfig,
      type: 'spring' | 'timing' = 'spring'
    ) => {
      'worklet';
      if (!isMounted.current) return;

      if (type === 'spring') {
        value.value = withSpring(targetValue as number, config as WithSpringConfig);
      } else {
        value.value = withTiming(targetValue as number, config as WithTimingConfig);
      }
    },
    []
  );

  const safeSet = useCallback((newValue: T) => {
    if (isMounted.current) {
      value.value = newValue;
    }
  }, []);

  return {
    value,
    safeAnimate,
    safeSet,
    isMounted: isMounted.current,
  };
}

// 여러 SharedValue 그룹 관리
export function useSharedValueGroup<T extends Record<string, any>>(
  initialValues: T
): {
  values: { [K in keyof T]: Animated.SharedValue<T[K]> };
  cancelAll: () => void;
  resetAll: () => void;
} {
  const valuesRef = useRef<{ [K in keyof T]: Animated.SharedValue<T[K]> }>(
    {} as any
  );

  // 초기화
  if (Object.keys(valuesRef.current).length === 0) {
    for (const key in initialValues) {
      valuesRef.current[key] = useSharedValue(initialValues[key]);
    }
  }

  const cancelAll = useCallback(() => {
    for (const key in valuesRef.current) {
      cancelAnimation(valuesRef.current[key]);
    }
  }, []);

  const resetAll = useCallback(() => {
    for (const key in initialValues) {
      cancelAnimation(valuesRef.current[key]);
      valuesRef.current[key].value = initialValues[key];
    }
  }, [initialValues]);

  useEffect(() => {
    return () => {
      cancelAll();
    };
  }, [cancelAll]);

  return {
    values: valuesRef.current,
    cancelAll,
    resetAll,
  };
}

// 사용 예시
function AnimatedCard() {
  const { values, cancelAll, resetAll } = useSharedValueGroup({
    translateX: 0,
    translateY: 0,
    scale: 1,
    opacity: 1,
  });

  useEffect(() => {
    // 컴포넌트 언마운트 시 자동으로 모든 애니메이션 취소
    return () => {
      cancelAll();
    };
  }, []);

  // 리셋 기능
  const handleReset = () => {
    resetAll();
  };

  return (
    <Animated.View
      style={useAnimatedStyle(() => ({
        transform: [
          { translateX: values.translateX.value },
          { translateY: values.translateY.value },
          { scale: values.scale.value },
        ],
        opacity: values.opacity.value,
      }))}
    />
  );
}
```

### 예제 2: 콜백 메모리 관리

```typescript
// src/hooks/useSafeCallback.ts
import { useCallback, useRef, useEffect } from 'react';
import { runOnJS, runOnUI } from 'react-native-reanimated';

// 안전한 JS 콜백 래퍼
export function useSafeRunOnJS<T extends (...args: any[]) => any>(
  callback: T
): T {
  const isMounted = useRef(true);
  const callbackRef = useRef(callback);

  // 최신 콜백 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeCallback = useCallback((...args: Parameters<T>) => {
    if (isMounted.current && callbackRef.current) {
      return callbackRef.current(...args);
    }
  }, []) as T;

  return safeCallback;
}

// Worklet에서 안전하게 JS 호출
export function createSafeJSCallback<T extends (...args: any[]) => any>(
  callback: T,
  isMountedRef: React.MutableRefObject<boolean>
): (...args: Parameters<T>) => void {
  'worklet';
  return (...args: Parameters<T>) => {
    'worklet';
    runOnJS(() => {
      if (isMountedRef.current) {
        callback(...args);
      }
    })();
  };
}

// 사용 예시
function AnimatedButton({ onPress }: { onPress: () => void }) {
  const isMounted = useRef(true);
  const safeOnPress = useSafeRunOnJS(onPress);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const gesture = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      // 안전한 콜백 호출
      if (isMounted.current) {
        runOnJS(safeOnPress)();
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={styles.button} />
    </GestureDetector>
  );
}

// 약한 참조를 활용한 콜백 관리
const callbackRegistry = new WeakMap<object, Set<() => void>>();

export function registerCleanupCallback(
  owner: object,
  cleanup: () => void
): void {
  if (!callbackRegistry.has(owner)) {
    callbackRegistry.set(owner, new Set());
  }
  callbackRegistry.get(owner)!.add(cleanup);
}

export function executeCleanupCallbacks(owner: object): void {
  const callbacks = callbackRegistry.get(owner);
  if (callbacks) {
    callbacks.forEach((cb) => cb());
    callbackRegistry.delete(owner);
  }
}
```

### 예제 3: 리스트 아이템 메모리 최적화

```typescript
// src/components/OptimizedAnimatedList.tsx
import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
  useDerivedValue,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT) + 2;

interface ListItem {
  id: string;
  title: string;
}

// 애니메이션 상태를 외부에서 관리하여 메모리 효율화
class AnimationStateManager {
  private states = new Map<string, Animated.SharedValue<number>>();
  private activeCount = 0;
  private readonly maxActive = VISIBLE_ITEMS * 2;

  getOrCreate(id: string): Animated.SharedValue<number> | null {
    if (this.states.has(id)) {
      return this.states.get(id)!;
    }

    // 활성 상태 수 제한
    if (this.activeCount >= this.maxActive) {
      // 가장 오래된 것 정리
      const firstKey = this.states.keys().next().value;
      if (firstKey) {
        this.release(firstKey);
      }
    }

    const state = useSharedValue(0);
    this.states.set(id, state);
    this.activeCount++;
    return state;
  }

  release(id: string): void {
    const state = this.states.get(id);
    if (state) {
      cancelAnimation(state);
      this.states.delete(id);
      this.activeCount--;
    }
  }

  releaseAll(): void {
    this.states.forEach((state) => {
      cancelAnimation(state);
    });
    this.states.clear();
    this.activeCount = 0;
  }
}

// 싱글톤 인스턴스
const animationManager = new AnimationStateManager();

// 메모이즈된 리스트 아이템
const OptimizedListItem = memo(function OptimizedListItem({
  item,
  index,
  scrollY,
}: {
  item: ListItem;
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const itemTop = index * ITEM_HEIGHT;

  // 가시 영역 체크를 위한 derived value
  const isVisible = useDerivedValue(() => {
    const scrollPosition = scrollY.value;
    const top = itemTop - scrollPosition;
    const bottom = top + ITEM_HEIGHT;
    return top < SCREEN_HEIGHT && bottom > 0;
  });

  // 조건부 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    if (!isVisible.value) {
      // 화면 밖이면 애니메이션 건너뛰기
      return {};
    }

    const scrollPosition = scrollY.value;
    const relativePosition = (itemTop - scrollPosition) / SCREEN_HEIGHT;

    return {
      opacity: 1 - Math.abs(relativePosition - 0.5),
      transform: [
        { scale: 1 - Math.abs(relativePosition - 0.5) * 0.1 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Text>{item.title}</Text>
    </Animated.View>
  );
});

export function OptimizedAnimatedList({ data }: { data: ListItem[] }) {
  const scrollY = useSharedValue(0);
  const listRef = useRef<FlashList<ListItem>>(null);

  // 스크롤 핸들러
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      animationManager.releaseAll();
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => (
      <OptimizedListItem item={item} index={index} scrollY={scrollY} />
    ),
    [scrollY]
  );

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  return (
    <Animated.FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={VISIBLE_ITEMS}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});
```

### 예제 4: 이미지 및 리소스 캐싱

```typescript
// src/utils/AnimationResourceCache.ts
import Animated, {
  useSharedValue,
  cancelAnimation,
} from 'react-native-reanimated';

interface CacheEntry<T> {
  value: T;
  lastAccess: number;
  size: number;
}

class AnimationResourceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeMB: number = 50) {
    this.maxSize = maxSizeMB * 1024 * 1024;
  }

  set<T>(key: string, value: T, sizeMB: number = 0.01): void {
    const size = sizeMB * 1024 * 1024;

    // 공간 부족 시 오래된 항목 제거
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    // 기존 항목 업데이트
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentSize -= existing.size;
    }

    this.cache.set(key, {
      value,
      lastAccess: Date.now(),
      size,
    });
    this.currentSize += size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      return entry.value as T;
    }
    return null;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats(): { entries: number; sizeMB: number; maxSizeMB: number } {
    return {
      entries: this.cache.size,
      sizeMB: this.currentSize / (1024 * 1024),
      maxSizeMB: this.maxSize / (1024 * 1024),
    };
  }
}

// 싱글톤 인스턴스
export const animationCache = new AnimationResourceCache(30);

// 캐시된 애니메이션 설정
export function useCachedAnimationConfig<T extends object>(
  key: string,
  createConfig: () => T
): T {
  const cached = animationCache.get<T>(key);

  if (cached) {
    return cached;
  }

  const config = createConfig();
  animationCache.set(key, config);
  return config;
}

// 이미지 프리로딩과 캐싱
interface ImageCacheEntry {
  uri: string;
  loaded: boolean;
  width: number;
  height: number;
}

class AnimatedImageCache {
  private cache = new Map<string, ImageCacheEntry>();
  private loadPromises = new Map<string, Promise<ImageCacheEntry>>();

  async preload(uri: string): Promise<ImageCacheEntry> {
    if (this.cache.has(uri)) {
      return this.cache.get(uri)!;
    }

    if (this.loadPromises.has(uri)) {
      return this.loadPromises.get(uri)!;
    }

    const promise = new Promise<ImageCacheEntry>((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => {
          const entry: ImageCacheEntry = {
            uri,
            loaded: true,
            width,
            height,
          };
          this.cache.set(uri, entry);
          this.loadPromises.delete(uri);
          resolve(entry);
        },
        (error) => {
          this.loadPromises.delete(uri);
          reject(error);
        }
      );
    });

    this.loadPromises.set(uri, promise);
    return promise;
  }

  getSync(uri: string): ImageCacheEntry | null {
    return this.cache.get(uri) || null;
  }

  clear(): void {
    this.cache.clear();
    this.loadPromises.clear();
  }
}

export const imageCache = new AnimatedImageCache();

// 사용 예시: 캐시된 이미지 애니메이션
export function CachedAnimatedImage({
  uri,
  style,
}: {
  uri: string;
  style?: ViewStyle;
}) {
  const opacity = useSharedValue(0);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const cached = imageCache.getSync(uri);

    if (cached) {
      setDimensions({ width: cached.width, height: cached.height });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      imageCache.preload(uri).then((entry) => {
        setDimensions({ width: entry.width, height: entry.height });
        opacity.value = withTiming(1, { duration: 300 });
      });
    }

    return () => {
      cancelAnimation(opacity);
    };
  }, [uri]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!dimensions) {
    return <View style={[style, styles.placeholder]} />;
  }

  return (
    <Animated.Image
      source={{ uri }}
      style={[style, animatedStyle]}
      resizeMode="cover"
    />
  );
}
```

### 예제 5: 메모리 누수 감지기

```typescript
// src/debug/MemoryLeakDetector.ts
import { useEffect, useRef } from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';

interface LeakInfo {
  componentName: string;
  sharedValueCount: number;
  leakProbability: 'low' | 'medium' | 'high';
  details: string[];
}

// 전역 추적기
const globalTracker = {
  components: new Map<string, { count: number; unmountTime?: number }>(),
  sharedValues: new WeakSet<Animated.SharedValue<any>>(),
  totalCreated: 0,
  totalDestroyed: 0,
};

export function useMemoryLeakDetector(componentName: string) {
  const sharedValueCount = useRef(0);
  const mountTime = useRef(Date.now());
  const cleanupCallbacks = useRef<(() => void)[]>([]);

  // 컴포넌트 마운트 추적
  useEffect(() => {
    const existing = globalTracker.components.get(componentName);
    globalTracker.components.set(componentName, {
      count: (existing?.count || 0) + 1,
    });

    if (__DEV__) {
      console.log(
        `[Memory] ${componentName} mounted (total: ${
          globalTracker.components.get(componentName)?.count
        })`
      );
    }

    return () => {
      // 정리 콜백 실행
      cleanupCallbacks.current.forEach((cb) => cb());

      const current = globalTracker.components.get(componentName);
      if (current) {
        globalTracker.components.set(componentName, {
          count: current.count - 1,
          unmountTime: Date.now(),
        });
      }

      globalTracker.totalDestroyed++;

      // 잠재적 누수 감지
      setTimeout(() => {
        checkForLeaks(componentName, sharedValueCount.current);
      }, 5000);
    };
  }, [componentName]);

  // SharedValue 생성 추적
  const trackSharedValue = <T,>(value: Animated.SharedValue<T>) => {
    sharedValueCount.current++;
    globalTracker.totalCreated++;

    if (__DEV__ && sharedValueCount.current > 20) {
      console.warn(
        `[Memory Warning] ${componentName}: ${sharedValueCount.current} SharedValues created`
      );
    }

    return value;
  };

  // 정리 콜백 등록
  const registerCleanup = (callback: () => void) => {
    cleanupCallbacks.current.push(callback);
  };

  return {
    trackSharedValue,
    registerCleanup,
    getStats: () => ({
      sharedValueCount: sharedValueCount.current,
      mountDuration: Date.now() - mountTime.current,
    }),
  };
}

function checkForLeaks(componentName: string, expectedCount: number) {
  if (!__DEV__) return;

  // 메모리 스냅샷 비교 (간접적)
  const component = globalTracker.components.get(componentName);

  if (component && component.unmountTime) {
    const timeSinceUnmount = Date.now() - component.unmountTime;

    // 5초 후에도 여전히 참조가 있으면 경고
    if (timeSinceUnmount > 5000) {
      const leakInfo: LeakInfo = {
        componentName,
        sharedValueCount: expectedCount,
        leakProbability: expectedCount > 10 ? 'high' : expectedCount > 5 ? 'medium' : 'low',
        details: [
          `SharedValues: ${expectedCount}`,
          `Time since unmount: ${timeSinceUnmount}ms`,
          `Total created: ${globalTracker.totalCreated}`,
          `Total destroyed: ${globalTracker.totalDestroyed}`,
        ],
      };

      console.warn('[Potential Memory Leak]', leakInfo);
    }
  }
}

// 전역 메모리 리포트
export function getMemoryReport(): {
  activeComponents: Map<string, number>;
  totalSharedValues: { created: number; destroyed: number };
  potentialLeaks: string[];
} {
  const activeComponents = new Map<string, number>();
  const potentialLeaks: string[] = [];

  globalTracker.components.forEach((info, name) => {
    if (info.count > 0) {
      activeComponents.set(name, info.count);
    }
    if (info.unmountTime && info.count > 0) {
      potentialLeaks.push(name);
    }
  });

  return {
    activeComponents,
    totalSharedValues: {
      created: globalTracker.totalCreated,
      destroyed: globalTracker.totalDestroyed,
    },
    potentialLeaks,
  };
}

// 개발 도구: 메모리 대시보드
export function MemoryDebugDashboard() {
  const [report, setReport] = useState(getMemoryReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(getMemoryReport());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!__DEV__) return null;

  return (
    <View style={styles.dashboard}>
      <Text style={styles.title}>Memory Debug</Text>

      <Text style={styles.section}>Active Components:</Text>
      {Array.from(report.activeComponents.entries()).map(([name, count]) => (
        <Text key={name} style={styles.item}>
          {name}: {count}
        </Text>
      ))}

      <Text style={styles.section}>SharedValues:</Text>
      <Text style={styles.item}>
        Created: {report.totalSharedValues.created}
      </Text>
      <Text style={styles.item}>
        Destroyed: {report.totalSharedValues.destroyed}
      </Text>
      <Text style={styles.item}>
        Leaked: {report.totalSharedValues.created - report.totalSharedValues.destroyed}
      </Text>

      {report.potentialLeaks.length > 0 && (
        <>
          <Text style={[styles.section, styles.warning]}>
            Potential Leaks:
          </Text>
          {report.potentialLeaks.map((name) => (
            <Text key={name} style={[styles.item, styles.warning]}>
              {name}
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 200,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 4,
  },
  item: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#FF9800',
  },
});
```

### 예제 6: 자동 정리 HOC

```typescript
// src/hoc/withAnimationCleanup.tsx
import React, { useEffect, useRef, ComponentType } from 'react';
import { cancelAnimation } from 'react-native-reanimated';

interface AnimationRef {
  value: Animated.SharedValue<any>;
  name: string;
}

const animationRegistry = new Map<string, AnimationRef[]>();

// 애니메이션 자동 정리 HOC
export function withAnimationCleanup<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentId?: string
) {
  const displayName =
    componentId ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  return function AnimationCleanupWrapper(props: P) {
    const instanceId = useRef(
      `${displayName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );

    useEffect(() => {
      animationRegistry.set(instanceId.current, []);

      return () => {
        // 언마운트 시 등록된 모든 애니메이션 취소
        const animations = animationRegistry.get(instanceId.current);
        if (animations) {
          animations.forEach(({ value, name }) => {
            cancelAnimation(value);
            if (__DEV__) {
              console.log(`[Cleanup] Cancelled animation: ${name}`);
            }
          });
          animationRegistry.delete(instanceId.current);
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}

// 애니메이션 등록 훅
export function useRegisterAnimation(
  value: Animated.SharedValue<any>,
  name: string = 'unnamed'
) {
  const componentRef = useRef<string | null>(null);

  useEffect(() => {
    // 가장 가까운 HOC 래퍼 찾기
    const entries = Array.from(animationRegistry.entries());
    if (entries.length > 0) {
      componentRef.current = entries[entries.length - 1][0];
      animationRegistry.get(componentRef.current)?.push({ value, name });
    }

    return () => {
      if (componentRef.current) {
        const animations = animationRegistry.get(componentRef.current);
        if (animations) {
          const index = animations.findIndex((a) => a.value === value);
          if (index > -1) {
            animations.splice(index, 1);
          }
        }
      }
    };
  }, [value, name]);
}

// 사용 예시
const AnimatedCard = withAnimationCleanup(function AnimatedCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // 자동으로 정리 등록
  useRegisterAnimation(translateX, 'translateX');
  useRegisterAnimation(translateY, 'translateY');
  useRegisterAnimation(scale, 'scale');

  // ... 컴포넌트 로직

  return <Animated.View style={animatedStyle} />;
}, 'AnimatedCard');

// Context 기반 정리
const AnimationCleanupContext = React.createContext<{
  register: (value: Animated.SharedValue<any>, name: string) => void;
  cleanup: () => void;
} | null>(null);

export function AnimationCleanupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const animations = useRef<AnimationRef[]>([]);

  const register = useCallback(
    (value: Animated.SharedValue<any>, name: string) => {
      animations.current.push({ value, name });
    },
    []
  );

  const cleanup = useCallback(() => {
    animations.current.forEach(({ value }) => {
      cancelAnimation(value);
    });
    animations.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <AnimationCleanupContext.Provider value={{ register, cleanup }}>
      {children}
    </AnimationCleanupContext.Provider>
  );
}

export function useAnimationCleanup() {
  const context = React.useContext(AnimationCleanupContext);
  if (!context) {
    throw new Error(
      'useAnimationCleanup must be used within AnimationCleanupProvider'
    );
  }
  return context;
}
```

## 🎯 sometimes-app 적용 사례

### 매칭 카드 스택 메모리 최적화

```typescript
// src/features/matching/components/OptimizedCardStack.tsx
import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { animationCache } from '@/utils/AnimationResourceCache';
import { useMemoryLeakDetector } from '@/debug/MemoryLeakDetector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_VISIBLE_CARDS = 3;

interface User {
  id: string;
  name: string;
  imageUrl: string;
}

// 카드별 애니메이션 상태 풀
class CardAnimationPool {
  private pool: Map<string, {
    translateX: Animated.SharedValue<number>;
    translateY: Animated.SharedValue<number>;
    scale: Animated.SharedValue<number>;
    rotation: Animated.SharedValue<number>;
  }> = new Map();

  private maxSize = MAX_VISIBLE_CARDS + 2; // 버퍼 포함

  acquire(id: string) {
    if (this.pool.has(id)) {
      return this.pool.get(id)!;
    }

    // 풀 크기 제한
    if (this.pool.size >= this.maxSize) {
      const firstKey = this.pool.keys().next().value;
      this.release(firstKey);
    }

    const state = {
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      scale: useSharedValue(1),
      rotation: useSharedValue(0),
    };

    this.pool.set(id, state);
    return state;
  }

  release(id: string) {
    const state = this.pool.get(id);
    if (state) {
      cancelAnimation(state.translateX);
      cancelAnimation(state.translateY);
      cancelAnimation(state.scale);
      cancelAnimation(state.rotation);
      this.pool.delete(id);
    }
  }

  releaseAll() {
    this.pool.forEach((_, id) => this.release(id));
  }

  reset(id: string) {
    const state = this.pool.get(id);
    if (state) {
      state.translateX.value = 0;
      state.translateY.value = 0;
      state.scale.value = 1;
      state.rotation.value = 0;
    }
  }
}

export function OptimizedCardStack({
  users,
  onSwipe,
}: {
  users: User[];
  onSwipe: (userId: string, direction: 'left' | 'right') => void;
}) {
  const poolRef = useRef(new CardAnimationPool());
  const { registerCleanup, getStats } = useMemoryLeakDetector('CardStack');

  // 보이는 카드만 렌더링
  const visibleUsers = useMemo(
    () => users.slice(0, MAX_VISIBLE_CARDS),
    [users]
  );

  // 사용하지 않는 카드 정리
  useEffect(() => {
    const visibleIds = new Set(visibleUsers.map((u) => u.id));

    // 현재 풀에서 보이지 않는 카드 정리
    poolRef.current.pool.forEach((_, id) => {
      if (!visibleIds.has(id)) {
        poolRef.current.release(id);
      }
    });
  }, [visibleUsers]);

  // 컴포넌트 언마운트 시 전체 정리
  useEffect(() => {
    registerCleanup(() => {
      poolRef.current.releaseAll();
    });

    return () => {
      poolRef.current.releaseAll();
    };
  }, []);

  const handleSwipe = useCallback(
    (userId: string, direction: 'left' | 'right') => {
      onSwipe(userId, direction);

      // 스와이프 완료 후 리소스 해제
      setTimeout(() => {
        poolRef.current.release(userId);
      }, 500);
    },
    [onSwipe]
  );

  return (
    <View style={styles.container}>
      {visibleUsers.map((user, index) => (
        <MemoizedCard
          key={user.id}
          user={user}
          index={index}
          pool={poolRef.current}
          onSwipe={handleSwipe}
        />
      ))}

      {__DEV__ && (
        <View style={styles.debug}>
          <Text style={styles.debugText}>
            Pool size: {poolRef.current.pool.size}
          </Text>
          <Text style={styles.debugText}>
            Stats: {JSON.stringify(getStats())}
          </Text>
        </View>
      )}
    </View>
  );
}

// 메모이즈된 개별 카드
const MemoizedCard = React.memo(function MemoizedCard({
  user,
  index,
  pool,
  onSwipe,
}: {
  user: User;
  index: number;
  pool: CardAnimationPool;
  onSwipe: (userId: string, direction: 'left' | 'right') => void;
}) {
  const state = pool.acquire(user.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: state.translateX.value },
      { translateY: state.translateY.value },
      { scale: state.scale.value - index * 0.05 },
      { rotate: `${state.rotation.value}deg` },
    ],
    zIndex: MAX_VISIBLE_CARDS - index,
  }));

  // ... 제스처 및 카드 렌더링

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <CachedAnimatedImage uri={user.imageUrl} style={styles.image} />
      <Text style={styles.name}>{user.name}</Text>
    </Animated.View>
  );
}, (prev, next) => prev.user.id === next.user.id && prev.index === next.index);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    aspectRatio: 0.7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  debug: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFF',
    fontSize: 10,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 언마운트 시 애니메이션 미정리

```typescript
// ❌ 잘못된 방법 - 정리 없음
function BadComponent() {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withSpring(100);
  }, []);

  return <Animated.View />;
}

// ✅ 올바른 방법 - 정리 포함
function GoodComponent() {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withSpring(100);

    return () => {
      cancelAnimation(value);
    };
  }, []);

  return <Animated.View />;
}
```

### 실수 2: 클로저에서 상태 캡처

```typescript
// ❌ 잘못된 방법 - stale closure
function BadCallback() {
  const [data, setData] = useState(initialData);

  const gesture = Gesture.Pan().onEnd(() => {
    'worklet';
    runOnJS(processData)(data); // data가 오래된 값일 수 있음
  });
}

// ✅ 올바른 방법 - ref 사용
function GoodCallback() {
  const [data, setData] = useState(initialData);
  const dataRef = useRef(data);
  dataRef.current = data;

  const gesture = Gesture.Pan().onEnd(() => {
    'worklet';
    runOnJS(() => processData(dataRef.current))();
  });
}
```

## 💡 팁

### 팁 1: 대규모 리스트에서 SharedValue 재사용

```typescript
// 풀링 패턴
const animationPool = {
  available: [] as Animated.SharedValue<number>[],
  acquire: () => animationPool.available.pop() || useSharedValue(0),
  release: (value) => animationPool.available.push(value),
};
```

### 팁 2: 개발 중 메모리 모니터링

```typescript
// 주기적 메모리 체크
if (__DEV__) {
  setInterval(() => {
    const report = getMemoryReport();
    if (report.potentialLeaks.length > 0) {
      console.warn('Potential memory leaks:', report.potentialLeaks);
    }
  }, 10000);
}
```

## 📚 이 장에서 배운 내용

1. **SharedValue 생명주기**: 생성부터 정리까지
2. **안전한 정리 패턴**: cancelAnimation, 콜백 래핑
3. **리스트 최적화**: 가시 영역 기반 렌더링, 풀링
4. **리소스 캐싱**: 애니메이션 설정, 이미지 캐시
5. **누수 감지**: 추적 및 디버깅 도구

## 다음 장 예고

**Chapter 76: 레이아웃 디버깅**에서는 애니메이션과 레이아웃 계산 간의 충돌을 해결하고 성능을 최적화하는 방법을 다룹니다.
