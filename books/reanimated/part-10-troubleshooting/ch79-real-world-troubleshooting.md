# Chapter 79: 실전 트러블슈팅

이 장에서는 실제 프로덕션 환경에서 발생한 Reanimated 관련 문제들과 그 해결 과정을 케이스 스터디로 살펴봅니다. 각 사례에서 문제 발견부터 근본 원인 분석, 해결까지의 전 과정을 다룹니다.

## 📌 학습 목표

- 실제 프로덕션 이슈 분석 방법론 학습
- 복잡한 애니메이션 버그 디버깅 기법
- 성능 문제 진단 및 최적화 과정
- 크래시 리포트 분석과 대응

## 📖 트러블슈팅 프레임워크

```
┌─────────────────────────────────────────────────────────────┐
│                 트러블슈팅 5단계 프로세스                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 증상 파악        ──→  무엇이 잘못되었는가?                │
│  │                                                          │
│  ▼                                                          │
│  2. 재현            ──→  언제, 어떻게 발생하는가?             │
│  │                                                          │
│  ▼                                                          │
│  3. 격리            ──→  최소 재현 케이스 만들기              │
│  │                                                          │
│  ▼                                                          │
│  4. 분석            ──→  근본 원인(Root Cause) 찾기          │
│  │                                                          │
│  ▼                                                          │
│  5. 수정 & 검증     ──→  해결책 적용 및 회귀 테스트           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Case Study 1: iOS에서만 발생하는 애니메이션 끊김

### 증상

```
사용자 리포트:
- iOS에서 카드 스와이프 시 간헐적으로 버벅거림
- Android에서는 정상 동작
- 특정 기기(iPhone 12 이하)에서 더 자주 발생
```

### 재현

```typescript
// 문제 재현을 위한 진단 코드
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';

function DiagnosticOverlay() {
  const frameCount = useSharedValue(0);
  const droppedFrames = useSharedValue(0);
  const lastFrameTime = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const now = frameInfo.timestamp;
    const delta = now - lastFrameTime.value;

    // 16.67ms (60fps) 기준으로 프레임 드롭 감지
    if (lastFrameTime.value > 0 && delta > 20) {
      droppedFrames.value++;
      console.warn(`Frame dropped: ${delta.toFixed(2)}ms gap`);
    }

    frameCount.value++;
    lastFrameTime.value = now;
  });

  return (
    <View style={styles.diagnosticOverlay}>
      <Text>Frames: {frameCount.value}</Text>
      <Text>Dropped: {droppedFrames.value}</Text>
    </View>
  );
}
```

### 격리

```typescript
// 최소 재현 케이스
function MinimalReproduction() {
  const translateX = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.3);

  // 문제 원인: 복잡한 shadow 계산
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    // iOS에서 shadow 속성 변경은 비용이 높음
    shadowOpacity: shadowOpacity.value,
    shadowRadius: 10 + Math.abs(translateX.value) * 0.1,
    shadowOffset: {
      width: translateX.value * 0.1,
      height: 5,
    },
  }));

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // 매 프레임마다 shadow 업데이트
      shadowOpacity.value = 0.3 + Math.abs(e.translationX) * 0.002;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]} />
    </GestureDetector>
  );
}
```

### 분석

```typescript
// 근본 원인 분석
/*
 * 문제: iOS에서 shadow 속성 변경은 레이어 재렌더링 필요
 *
 * iOS Core Animation 파이프라인:
 * 1. shadow 속성 변경 감지
 * 2. 레이어의 shadowPath 재계산
 * 3. GPU에서 shadow 블러 재렌더링
 * 4. 컴포지팅
 *
 * 매 프레임(16ms) 내에 완료되지 않으면 프레임 드롭 발생
 */

// 성능 프로파일링
function analyzeShadowPerformance() {
  const measurements: number[] = [];

  return {
    startMeasure: () => {
      'worklet';
      return performance.now();
    },

    endMeasure: (startTime: number, operation: string) => {
      'worklet';
      const duration = performance.now() - startTime;
      measurements.push(duration);

      if (duration > 8) {
        console.warn(`Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
    },

    getStats: () => {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const max = Math.max(...measurements);
      return { avg, max, count: measurements.length };
    },
  };
}
```

### 수정

```typescript
// ✅ 해결책 1: Shadow를 정적으로 유지하고 opacity만 변경
function FixedCardSwipe() {
  const translateX = useSharedValue(0);
  const swipeProgress = useSharedValue(0);

  // Shadow를 별도 레이어로 분리
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Shadow 레이어는 opacity만 변경 (저비용)
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(swipeProgress.value),
      [0, 100],
      [0.3, 0.6],
      Extrapolate.CLAMP
    ),
  }));

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      swipeProgress.value = e.translationX;
    });

  return (
    <GestureDetector gesture={gesture}>
      <View>
        {/* 고정된 shadow 레이어 */}
        <Animated.View style={[styles.shadowLayer, shadowStyle]} />

        {/* 카드 본체 */}
        <Animated.View style={[styles.card, cardStyle]}>
          <CardContent />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

// ✅ 해결책 2: shouldRasterize 사용 (iOS)
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    // iOS에서 shadow가 있는 뷰를 래스터화
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        // 중요: 레이어를 비트맵으로 캐싱
        shouldRasterizeIOS: true,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

// ✅ 해결책 3: 스로틀링으로 shadow 업데이트 빈도 감소
function ThrottledShadowCard() {
  const translateX = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.3);
  const lastShadowUpdate = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;

      // 50ms마다만 shadow 업데이트
      const now = Date.now();
      if (now - lastShadowUpdate.value > 50) {
        shadowOpacity.value = withTiming(
          0.3 + Math.abs(e.translationX) * 0.002,
          { duration: 50 }
        );
        lastShadowUpdate.value = now;
      }
    });

  // ...
}
```

### 검증

```typescript
// 수정 후 성능 검증
function PerformanceVerification() {
  const [metrics, setMetrics] = useState({
    avgFrameTime: 0,
    droppedFrames: 0,
    testDuration: 0,
  });

  const runTest = () => {
    const startTime = Date.now();
    let frameCount = 0;
    let droppedCount = 0;
    let totalFrameTime = 0;
    let lastFrame = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastFrame;

      totalFrameTime += delta;
      frameCount++;

      if (delta > 20) {
        droppedCount++;
      }

      lastFrame = now;

      if (Date.now() - startTime < 5000) {
        requestAnimationFrame(measureFrame);
      } else {
        setMetrics({
          avgFrameTime: totalFrameTime / frameCount,
          droppedFrames: droppedCount,
          testDuration: 5000,
        });
      }
    };

    requestAnimationFrame(measureFrame);
  };

  return (
    <View>
      <Button onPress={runTest} title="Run 5s Test" />
      <Text>Avg Frame Time: {metrics.avgFrameTime.toFixed(2)}ms</Text>
      <Text>Dropped Frames: {metrics.droppedFrames}</Text>
      <Text>Target: 16.67ms, 0 drops</Text>
    </View>
  );
}
```

## 💻 Case Study 2: 메모리 누수로 인한 크래시

### 증상

```
Sentry 크래시 리포트:
- Error: Reanimated: setValue for SharedValue with id X called after cleanup
- 앱 사용 시간이 길어질수록 메모리 사용량 증가
- 결국 OOM(Out of Memory) 크래시
```

### 재현

```typescript
// 문제가 있는 코드 패턴
function ProblematicComponent() {
  const translateY = useSharedValue(0);
  const [items, setItems] = useState<Item[]>([]);

  // 문제 1: 컴포넌트 언마운트 시에도 애니메이션 계속 실행
  useEffect(() => {
    const interval = setInterval(() => {
      translateY.value = withSequence(
        withTiming(-10, { duration: 500 }),
        withTiming(0, { duration: 500 })
      );
    }, 2000);

    // cleanup 없음!
    // return () => clearInterval(interval);
  }, []);

  // 문제 2: 클로저가 stale 상태 참조
  const animatedStyle = useAnimatedStyle(() => {
    // items가 업데이트되어도 이전 참조 유지
    const itemCount = items.length; // stale closure

    return {
      transform: [{ translateY: translateY.value }],
      opacity: itemCount > 0 ? 1 : 0.5,
    };
  });

  return <Animated.View style={animatedStyle} />;
}
```

### 격리

```typescript
// 메모리 누수 감지 유틸리티
class MemoryLeakDetector {
  private snapshots: { timestamp: number; size: number }[] = [];
  private componentRefs = new WeakMap<object, string>();

  takeSnapshot(label: string) {
    // React Native에서는 직접적인 힙 크기 접근 불가
    // 대신 SharedValue 인스턴스 수 추적
    const snapshot = {
      timestamp: Date.now(),
      size: this.estimateMemoryUsage(),
      label,
    };

    this.snapshots.push(snapshot);
    console.log(`[Memory] ${label}: ~${snapshot.size} estimated units`);

    return snapshot;
  }

  private estimateMemoryUsage(): number {
    // 글로벌 SharedValue 레지스트리 크기 추정
    // (실제로는 더 정교한 방법 필요)
    return Math.random() * 1000; // placeholder
  }

  analyzeGrowth(): { growing: boolean; rate: number } {
    if (this.snapshots.length < 2) {
      return { growing: false, rate: 0 };
    }

    const recent = this.snapshots.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const timeDelta = (last.timestamp - first.timestamp) / 1000; // seconds
    const sizeDelta = last.size - first.size;
    const rate = sizeDelta / timeDelta;

    return {
      growing: rate > 10, // 10 units/second 이상이면 누수 의심
      rate,
    };
  }
}

// 컴포넌트 라이프사이클 추적
function useComponentLifecycleTracker(componentName: string) {
  const mountTime = useRef(Date.now());
  const animationCount = useRef(0);

  useEffect(() => {
    console.log(`[Lifecycle] ${componentName} mounted`);

    return () => {
      const lifetime = Date.now() - mountTime.current;
      console.log(
        `[Lifecycle] ${componentName} unmounted after ${lifetime}ms, ` +
        `${animationCount.current} animations started`
      );
    };
  }, [componentName]);

  const trackAnimation = () => {
    animationCount.current++;
  };

  return { trackAnimation };
}
```

### 분석

```typescript
// 근본 원인 분석 도구
function analyzeAnimationLifecycle() {
  const activeAnimations = new Map<number, {
    startTime: number;
    type: string;
    stackTrace: string;
  }>();

  let nextId = 0;

  return {
    trackStart: (type: string) => {
      const id = nextId++;
      activeAnimations.set(id, {
        startTime: Date.now(),
        type,
        stackTrace: new Error().stack || '',
      });
      return id;
    },

    trackEnd: (id: number) => {
      activeAnimations.delete(id);
    },

    getLeaks: (thresholdMs: number = 30000) => {
      const now = Date.now();
      const leaks: Array<{ id: number; info: any }> = [];

      activeAnimations.forEach((info, id) => {
        if (now - info.startTime > thresholdMs) {
          leaks.push({ id, info });
        }
      });

      return leaks;
    },

    printReport: () => {
      console.log('=== Animation Lifecycle Report ===');
      console.log(`Active animations: ${activeAnimations.size}`);

      const leaks = analyzeAnimationLifecycle().getLeaks();
      if (leaks.length > 0) {
        console.log(`Potential leaks: ${leaks.length}`);
        leaks.forEach(({ id, info }) => {
          console.log(`  ID ${id}: ${info.type} started ${Date.now() - info.startTime}ms ago`);
          console.log(`    Stack: ${info.stackTrace.split('\n')[2]}`);
        });
      }
    },
  };
}
```

### 수정

```typescript
// ✅ 수정된 코드
function FixedComponent() {
  const translateY = useSharedValue(0);
  const [items, setItems] = useState<Item[]>([]);
  const isMounted = useSharedValue(true);

  // 수정 1: 적절한 cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      // 마운트 상태 확인
      if (!isMounted.value) return;

      translateY.value = withSequence(
        withTiming(-10, { duration: 500 }),
        withTiming(0, { duration: 500 })
      );
    }, 2000);

    return () => {
      clearInterval(interval);
      isMounted.value = false;
      cancelAnimation(translateY);
    };
  }, []);

  // 수정 2: useDerivedValue로 반응적 값 처리
  const itemCount = useDerivedValue(() => items.length);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: itemCount.value > 0 ? 1 : 0.5,
    };
  });

  return <Animated.View style={animatedStyle} />;
}

// 안전한 애니메이션 훅
function useSafeAnimation<T extends number>(initialValue: T) {
  const value = useSharedValue(initialValue);
  const isCleaned = useSharedValue(false);

  useEffect(() => {
    return () => {
      isCleaned.value = true;
      cancelAnimation(value);
    };
  }, []);

  const safeAnimate = (animation: T, callback?: (finished: boolean) => void) => {
    'worklet';

    if (isCleaned.value) {
      console.warn('Animation attempted after cleanup');
      return;
    }

    if (typeof animation === 'number') {
      value.value = withTiming(animation, undefined, (finished) => {
        if (!isCleaned.value && callback) {
          callback(finished ?? false);
        }
      });
    } else {
      value.value = animation;
    }
  };

  return { value, safeAnimate, isCleaned };
}

// 사용 예시
function SafeAnimationComponent() {
  const { value: opacity, safeAnimate } = useSafeAnimation(0);

  const handlePress = () => {
    safeAnimate(1, (finished) => {
      if (finished) {
        console.log('Animation completed safely');
      }
    });
  };

  return (
    <Animated.View style={useAnimatedStyle(() => ({ opacity: opacity.value }))}>
      <Button onPress={handlePress} title="Animate" />
    </Animated.View>
  );
}
```

## 💻 Case Study 3: 리스트 스크롤 성능 저하

### 증상

```
사용자 리포트:
- 채팅 목록에서 스크롤할 때 버벅거림
- 특히 이미지가 많은 대화에서 심함
- 메시지가 많아질수록 악화
```

### 재현 및 분석

```typescript
// 문제가 있는 채팅 리스트
function ProblematicChatList() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <Animated.FlatList
      data={messages}
      onScroll={scrollHandler}
      scrollEventThrottle={1} // 문제: 모든 스크롤 이벤트 처리
      renderItem={({ item, index }) => (
        // 문제: 각 아이템에 복잡한 애니메이션
        <AnimatedMessageItem
          message={item}
          scrollY={scrollY}
          index={index}
        />
      )}
    />
  );
}

// 문제가 있는 메시지 아이템
function AnimatedMessageItem({
  message,
  scrollY,
  index,
}: {
  message: Message;
  scrollY: SharedValue<number>;
  index: number;
}) {
  // 문제: 모든 아이템이 scrollY에 반응
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      index * 80 - 200,
      index * 80,
      index * 80 + 200,
    ];

    // 복잡한 계산이 모든 아이템에서 매 프레임 실행
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      scrollY.value,
      inputRange,
      [-20, 0, 20],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateX }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <MessageContent message={message} />
    </Animated.View>
  );
}
```

### 수정

```typescript
// ✅ 최적화된 채팅 리스트
import { FlashList } from '@shopify/flash-list';

function OptimizedChatList() {
  const scrollY = useSharedValue(0);

  // 수정 1: 스크롤 이벤트 스로틀링
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 수정 2: 뷰포트 정보 추적
  const viewportInfo = useSharedValue({
    firstVisible: 0,
    lastVisible: 10,
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      runOnUI(() => {
        viewportInfo.value = {
          firstVisible: viewableItems[0].index,
          lastVisible: viewableItems[viewableItems.length - 1].index,
        };
      })();
    }
  }, []);

  // 수정 3: FlashList 사용으로 렌더링 최적화
  return (
    <Animated.FlatList
      as={FlashList}
      data={messages}
      onScroll={scrollHandler}
      scrollEventThrottle={16} // 60fps로 제한
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      estimatedItemSize={80}
      renderItem={({ item, index }) => (
        <OptimizedMessageItem
          message={item}
          index={index}
          viewportInfo={viewportInfo}
        />
      )}
    />
  );
}

// ✅ 최적화된 메시지 아이템
const OptimizedMessageItem = React.memo(function OptimizedMessageItem({
  message,
  index,
  viewportInfo,
}: {
  message: Message;
  index: number;
  viewportInfo: SharedValue<{ firstVisible: number; lastVisible: number }>;
}) {
  // 수정 4: 뷰포트 내 아이템만 애니메이션
  const animatedStyle = useAnimatedStyle(() => {
    const { firstVisible, lastVisible } = viewportInfo.value;
    const isVisible = index >= firstVisible - 2 && index <= lastVisible + 2;

    if (!isVisible) {
      // 뷰포트 밖은 기본 스타일
      return {
        transform: [{ scale: 1 }, { translateX: 0 }],
        opacity: 1,
      };
    }

    // 수정 5: 단순화된 애니메이션 (입장 효과만)
    const distanceFromCenter = Math.abs(
      index - (firstVisible + lastVisible) / 2
    );

    const scale = interpolate(
      distanceFromCenter,
      [0, 5],
      [1, 0.95],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity: 1,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <MessageContent message={message} />
    </Animated.View>
  );
});

// 수정 6: 이미지 최적화
function MessageContent({ message }: { message: Message }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (message.type === 'image') {
    return (
      <View style={styles.imageContainer}>
        {/* 저해상도 플레이스홀더 */}
        {!isImageLoaded && (
          <Image
            source={{ uri: message.thumbnailUrl }}
            style={styles.imagePlaceholder}
            blurRadius={10}
          />
        )}

        {/* 실제 이미지 (지연 로딩) */}
        <Image
          source={{ uri: message.imageUrl }}
          style={[styles.image, !isImageLoaded && styles.hidden]}
          onLoad={() => setIsImageLoaded(true)}
        />
      </View>
    );
  }

  return <Text style={styles.messageText}>{message.text}</Text>;
}
```

## 💻 Case Study 4: 제스처 충돌로 인한 UX 문제

### 증상

```
사용자 리포트:
- 프로필 카드를 스와이프하려는데 스크롤됨
- 좌우 스와이프와 상하 스크롤이 충돌
- 의도한 동작과 다른 결과
```

### 분석 및 수정

```typescript
// 문제: 제스처 의도 구분 실패
function ProblematicSwipeableList() {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView ref={scrollViewRef}>
      {items.map((item) => (
        // 문제: Pan 제스처가 ScrollView와 충돌
        <SwipeableItem key={item.id} item={item} />
      ))}
    </Animated.ScrollView>
  );
}

// ✅ 수정: 제스처 방향 명확히 분리
function FixedSwipeableList() {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  // 스크롤 제스처 (네이티브)
  const nativeGesture = Gesture.Native();

  return (
    <GestureDetector gesture={nativeGesture}>
      <Animated.ScrollView ref={scrollViewRef}>
        {items.map((item) => (
          <GestureAwareSwipeableItem
            key={item.id}
            item={item}
            scrollViewGesture={nativeGesture}
          />
        ))}
      </Animated.ScrollView>
    </GestureDetector>
  );
}

function GestureAwareSwipeableItem({
  item,
  scrollViewGesture,
}: {
  item: Item;
  scrollViewGesture: GestureType;
}) {
  const translateX = useSharedValue(0);
  const isHorizontalSwipe = useSharedValue(false);

  // 수평 스와이프 제스처
  const panGesture = Gesture.Pan()
    // 핵심: 수평 20px 이동 후에만 활성화
    .activeOffsetX([-20, 20])
    // 수직 10px 이동 시 실패 (스크롤로 전환)
    .failOffsetY([-10, 10])
    .onStart(() => {
      isHorizontalSwipe.value = true;
    })
    .onUpdate((event) => {
      if (isHorizontalSwipe.value) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      isHorizontalSwipe.value = false;
    })
    // 스크롤뷰 제스처가 이 제스처 실패 시 시작하도록
    .simultaneousWithExternalGesture(scrollViewGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <ItemContent item={item} />
      </Animated.View>
    </GestureDetector>
  );
}

// 제스처 디버거
function GestureDebugger() {
  const [gestureLog, setGestureLog] = useState<string[]>([]);

  const logGesture = (type: string, info: string) => {
    setGestureLog((prev) => [
      ...prev.slice(-20),
      `${Date.now()}: ${type} - ${info}`,
    ]);
  };

  return (
    <View style={styles.debugPanel}>
      <Text style={styles.debugTitle}>Gesture Log</Text>
      <ScrollView style={styles.debugLog}>
        {gestureLog.map((log, i) => (
          <Text key={i} style={styles.debugLogItem}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}
```

## 📱 sometimes-app 적용 사례

### 종합 디버깅 대시보드

```typescript
// src/features/debug/ui/animation-debug-dashboard.tsx

import { useSharedValue, useAnimatedStyle, useFrameCallback } from 'react-native-reanimated';

interface DebugMetrics {
  fps: number;
  memoryUsage: number;
  activeAnimations: number;
  gestureState: string;
}

export function AnimationDebugDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<DebugMetrics>({
    fps: 60,
    memoryUsage: 0,
    activeAnimations: 0,
    gestureState: 'idle',
  });

  // FPS 모니터링
  const frameCount = useSharedValue(0);
  const lastSecond = useSharedValue(Date.now());

  useFrameCallback(() => {
    frameCount.value++;

    const now = Date.now();
    if (now - lastSecond.value >= 1000) {
      const fps = frameCount.value;
      runOnJS(setMetrics)((prev) => ({ ...prev, fps }));

      frameCount.value = 0;
      lastSecond.value = now;
    }
  });

  // 패널 토글 애니메이션
  const panelHeight = useSharedValue(40);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    panelHeight.value = withSpring(isExpanded ? 40 : 200);
  };

  const panelStyle = useAnimatedStyle(() => ({
    height: panelHeight.value,
  }));

  if (!__DEV__) return null;

  return (
    <Animated.View style={[styles.debugPanel, panelStyle]}>
      <Pressable onPress={toggleExpand} style={styles.header}>
        <Text style={styles.title}>🔧 Animation Debug</Text>
        <View style={[styles.fpsIndicator, getFpsColor(metrics.fps)]}>
          <Text style={styles.fpsText}>{metrics.fps} FPS</Text>
        </View>
      </Pressable>

      {isExpanded && (
        <ScrollView style={styles.content}>
          <MetricRow label="Active Animations" value={metrics.activeAnimations} />
          <MetricRow label="Memory" value={`${metrics.memoryUsage}MB`} />
          <MetricRow label="Gesture State" value={metrics.gestureState} />

          <View style={styles.actions}>
            <Button title="Force GC" onPress={() => global.gc?.()} />
            <Button title="Clear Cache" onPress={clearAnimationCache} />
            <Button title="Export Logs" onPress={exportDebugLogs} />
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getFpsColor(fps: number): ViewStyle {
  if (fps >= 55) return { backgroundColor: '#4CAF50' };
  if (fps >= 45) return { backgroundColor: '#FFC107' };
  return { backgroundColor: '#F44336' };
}

async function exportDebugLogs() {
  // 디버그 로그 수집 및 내보내기
  const logs = {
    timestamp: new Date().toISOString(),
    device: Platform.OS,
    version: Platform.Version,
    reanimatedVersion: require('react-native-reanimated/package.json').version,
    // ... 추가 정보
  };

  await Share.share({
    message: JSON.stringify(logs, null, 2),
    title: 'Animation Debug Logs',
  });
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
  },
  fpsIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fpsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#999',
  },
  metricValue: {
    color: 'white',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
```

## ⚠️ 실전 트러블슈팅 체크리스트

```typescript
// src/shared/utils/animation-troubleshooting-checklist.ts

export const TROUBLESHOOTING_CHECKLIST = {
  performance: [
    '[ ] useAnimatedStyle 내부에서 불필요한 계산 없는지 확인',
    '[ ] 리스트 아이템에서 scrollY 직접 참조하지 않는지 확인',
    '[ ] shadow 속성이 매 프레임 변경되지 않는지 확인',
    '[ ] Platform.select로 iOS/Android 최적화 적용했는지 확인',
    '[ ] FlashList 또는 최적화된 리스트 사용하는지 확인',
  ],

  memoryLeaks: [
    '[ ] useEffect cleanup에서 cancelAnimation 호출하는지 확인',
    '[ ] setInterval/setTimeout 정리하는지 확인',
    '[ ] 컴포넌트 언마운트 후 SharedValue 접근하지 않는지 확인',
    '[ ] 클로저가 stale 상태를 참조하지 않는지 확인',
  ],

  gestureConflicts: [
    '[ ] activeOffsetX/Y 설정했는지 확인',
    '[ ] failOffsetX/Y 설정했는지 확인',
    '[ ] simultaneousWithExternalGesture 적용했는지 확인',
    '[ ] 제스처 우선순위 명확한지 확인',
  ],

  crashes: [
    '[ ] worklet 함수에 "worklet" 디렉티브 있는지 확인',
    '[ ] runOnJS로 JS 함수 호출하는지 확인',
    '[ ] SharedValue 타입이 올바른지 확인',
    '[ ] Babel 설정에 reanimated 플러그인 있는지 확인',
  ],

  platformSpecific: [
    '[ ] iOS shadow와 Android elevation 분리했는지 확인',
    '[ ] 시스템 제스처(back swipe) 고려했는지 확인',
    '[ ] 키보드 애니메이션 처리했는지 확인',
    '[ ] Safe Area 고려했는지 확인',
  ],
};

export function runTroubleshootingCheck(): {
  category: string;
  passed: boolean;
  issues: string[];
}[] {
  // 자동화된 체크 실행
  const results: ReturnType<typeof runTroubleshootingCheck> = [];

  // 성능 체크
  const performanceIssues: string[] = [];
  // ... 자동화된 검사 로직

  results.push({
    category: 'performance',
    passed: performanceIssues.length === 0,
    issues: performanceIssues,
  });

  return results;
}
```

## 💡 팁

1. **재현 먼저**: 문제를 안정적으로 재현할 수 있어야 디버깅 가능
2. **격리하기**: 최소 재현 케이스를 만들어 변수 줄이기
3. **측정하기**: 추측하지 말고 성능 데이터로 판단
4. **점진적 수정**: 한 번에 하나씩 변경하고 검증
5. **문서화**: 해결 과정을 기록하여 재발 방지

## 📚 이 장에서 배운 내용

1. **트러블슈팅 프레임워크**: 체계적인 5단계 문제 해결 프로세스
2. **iOS 성능 문제**: shadow 관련 최적화 기법
3. **메모리 누수 대응**: cleanup과 lifecycle 관리
4. **리스트 최적화**: 뷰포트 기반 애니메이션 제한
5. **제스처 충돌 해결**: offset 설정과 제스처 관계 설정
6. **디버깅 도구**: 실시간 성능 모니터링 대시보드

> **Part 10 완료!**: 트러블슈팅 가이드를 모두 학습했습니다. 다음은 **부록**에서 API 레퍼런스, 성능 체크리스트, 용어집 등 실전 활용에 도움되는 자료를 제공합니다.
