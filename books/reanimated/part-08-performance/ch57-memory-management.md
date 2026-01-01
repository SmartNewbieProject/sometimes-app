# Chapter 57: 메모리 관리

Reanimated 애니메이션에서 발생할 수 있는 메모리 누수를 방지하고 효율적으로 메모리를 관리하는 방법을 배웁니다.

## 📌 학습 목표

- SharedValue의 생명주기와 메모리 관리 이해
- 애니메이션 정리(cleanup) 패턴 습득
- 메모리 누수 감지 및 해결 방법 학습
- 대규모 애니메이션 리스트 메모리 최적화

## 📖 개념 이해

### SharedValue 생명주기

```
┌─────────────────────────────────────────────────────────────┐
│                SharedValue Lifecycle                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Component Mount                                            │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────┐                                       │
│   │ useSharedValue  │ ──▶ SharedValue 생성                  │
│   │ (initial: 0)    │     (Native 메모리 할당)              │
│   └─────────────────┘                                       │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────┐                                       │
│   │ Animation Run   │ ──▶ 값 변경                           │
│   │ (withSpring)    │     (UI Thread에서 업데이트)          │
│   └─────────────────┘                                       │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────┐                                       │
│   │ Component       │ ──▶ Cleanup 실행                      │
│   │ Unmount         │     (cancelAnimation 권장)            │
│   └─────────────────┘                                       │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────┐                                       │
│   │ GC Cycle        │ ──▶ 메모리 해제                       │
│   └─────────────────┘     (자동, 하지만 지연될 수 있음)     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 메모리 누수 패턴

```
┌─────────────────────────────────────────────────────────────┐
│                    Memory Leak Patterns                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 미정리 애니메이션                                        │
│  ┌──────────┐     ┌──────────┐                              │
│  │Component │────▶│Animation │ ← Unmount 후에도 실행 중!    │
│  │(Unmounted)│     │(Running) │                              │
│  └──────────┘     └──────────┘                              │
│                                                              │
│  2. 클로저 참조 유지                                         │
│  ┌──────────┐     ┌──────────┐                              │
│  │ Callback │────▶│  State   │ ← 오래된 참조 유지           │
│  │(in Worklet)│    │ (Stale)  │                              │
│  └──────────┘     └──────────┘                              │
│                                                              │
│  3. 이벤트 리스너 미해제                                     │
│  ┌──────────┐     ┌──────────┐                              │
│  │Scroll    │────▶│  Handler │ ← 해제되지 않은 리스너       │
│  │Event     │     │ (Leaked) │                              │
│  └──────────┘     └──────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 기본 Cleanup 패턴

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

// ❌ 안티패턴: Cleanup 없음
function LeakyAnimation() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // 무한 반복 애니메이션 시작
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1, // 무한 반복
      false
    );
    // Cleanup 없음 - 언마운트 후에도 계속 실행!
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}

// ✅ 권장: 적절한 Cleanup
function SafeAnimation() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );

    // Cleanup: 언마운트 시 애니메이션 취소
    return () => {
      cancelAnimation(rotation);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#7A4AE2',
    borderRadius: 12,
  },
});
```

### 2. 다중 SharedValue Cleanup Hook

```typescript
import { useEffect, useRef, useCallback } from 'react';
import Animated, {
  SharedValue,
  cancelAnimation,
  useSharedValue,
} from 'react-native-reanimated';

// 다중 SharedValue 관리 훅
function useAnimatedValues<T extends Record<string, number>>(
  initialValues: T
): {
  values: { [K in keyof T]: SharedValue<number> };
  reset: () => void;
  cleanup: () => void;
} {
  const valuesRef = useRef<{ [K in keyof T]: SharedValue<number> }>(
    {} as any
  );

  // 초기화 (한 번만 실행)
  if (Object.keys(valuesRef.current).length === 0) {
    for (const key in initialValues) {
      valuesRef.current[key] = useSharedValue(initialValues[key]);
    }
  }

  const reset = useCallback(() => {
    for (const key in initialValues) {
      valuesRef.current[key].value = initialValues[key];
    }
  }, [initialValues]);

  const cleanup = useCallback(() => {
    for (const key in valuesRef.current) {
      cancelAnimation(valuesRef.current[key]);
    }
  }, []);

  // 자동 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    values: valuesRef.current,
    reset,
    cleanup,
  };
}

// 사용 예시
function MultiValueAnimation() {
  const { values, reset, cleanup } = useAnimatedValues({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  });

  useEffect(() => {
    // 여러 애니메이션 시작
    values.translateX.value = withRepeat(
      withTiming(100, { duration: 1000 }),
      -1,
      true
    );
    values.rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );

    // cleanup이 자동으로 호출됨
  }, [values]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: values.translateX.value },
      { translateY: values.translateY.value },
      { scale: values.scale.value },
      { rotate: `${values.rotation.value}deg` },
    ],
    opacity: values.opacity.value,
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

### 3. Gesture Handler 메모리 관리

```typescript
import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DraggableCardProps {
  id: string;
  onDismiss: (id: string) => void;
}

function DraggableCard({ id, onDismiss }: DraggableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 메모이제이션된 콜백 (클로저 메모리 최적화)
  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  // Gesture는 메모이제이션이 자동으로 됨
  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // 스와이프 진행도에 따른 투명도
      opacity.value = 1 - Math.abs(translateX.value) / SCREEN_WIDTH;
    })
    .onEnd((event) => {
      const shouldDismiss = Math.abs(translateX.value) > SCREEN_WIDTH * 0.4;

      if (shouldDismiss) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(
          direction * SCREEN_WIDTH * 1.5,
          { damping: 15 },
          (finished) => {
            if (finished) {
              runOnJS(handleDismiss)();
            }
          }
        );
      } else {
        // 리셋
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }

      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* 카드 내용 */}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
  },
});
```

### 4. 리스트 아이템 메모리 최적화

```typescript
import React, { memo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
}

// 메모이제이션된 리스트 아이템
const AnimatedListItem = memo(function AnimatedListItem({
  item,
  index,
  onPress,
}: {
  item: ListItem;
  index: number;
  onPress: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);

  // 메모이제이션된 핸들러
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98);
    opacity.value = withTiming(0.8, { duration: 100 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 100 });
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.listItem, animatedStyle]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Animated.View>
  );
});

// 리스트 컴포넌트
function OptimizedAnimatedList({ data }: { data: ListItem[] }) {
  const handleItemPress = useCallback((id: string) => {
    console.log('Pressed:', id);
  }, []);

  const renderItem = useCallback(({ item, index }: {
    item: ListItem;
    index: number;
  }) => (
    <AnimatedListItem
      item={item}
      index={index}
      onPress={handleItemPress}
    />
  ), [handleItemPress]);

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
    />
  );
}

const styles = StyleSheet.create({
  listItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
```

### 5. 메모리 누수 감지 훅

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { SharedValue } from 'react-native-reanimated';

interface MemoryLeakWarning {
  type: 'animation' | 'callback' | 'subscription';
  message: string;
  location: string;
}

// 개발용 메모리 감시 훅
function useMemoryLeakDetector(componentName: string) {
  const mountedRef = useRef(true);
  const sharedValuesRef = useRef<WeakSet<SharedValue<any>>>(new WeakSet());
  const activeAnimationsRef = useRef<Set<string>>(new Set());
  const warningsRef = useRef<MemoryLeakWarning[]>([]);

  // SharedValue 등록
  const trackSharedValue = useCallback(<T>(
    value: SharedValue<T>,
    name: string
  ) => {
    if (__DEV__) {
      sharedValuesRef.current.add(value);
      activeAnimationsRef.current.add(name);
    }
    return value;
  }, []);

  // 애니메이션 완료 마킹
  const markAnimationComplete = useCallback((name: string) => {
    activeAnimationsRef.current.delete(name);
  }, []);

  // 언마운트 체크
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      // 활성 애니메이션 체크
      if (__DEV__ && activeAnimationsRef.current.size > 0) {
        const activeList = Array.from(activeAnimationsRef.current);
        console.warn(
          `[MemoryLeakDetector] ${componentName}: ` +
          `${activeList.length} animations still active on unmount:`,
          activeList
        );
      }
    };
  }, [componentName]);

  // 안전한 콜백 래퍼
  const safeCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    callbackName: string
  ) => {
    return ((...args: Parameters<T>) => {
      if (!mountedRef.current) {
        if (__DEV__) {
          console.warn(
            `[MemoryLeakDetector] ${componentName}: ` +
            `Callback "${callbackName}" called after unmount`
          );
        }
        return;
      }
      return callback(...args);
    }) as T;
  }, [componentName]);

  return {
    trackSharedValue,
    markAnimationComplete,
    safeCallback,
    isMounted: () => mountedRef.current,
  };
}

// 사용 예시
function ComponentWithLeakDetection() {
  const {
    trackSharedValue,
    markAnimationComplete,
    safeCallback,
    isMounted,
  } = useMemoryLeakDetector('ComponentWithLeakDetection');

  const opacity = trackSharedValue(useSharedValue(1), 'opacity');
  const translateY = trackSharedValue(useSharedValue(0), 'translateY');

  const handleAnimationComplete = safeCallback(() => {
    markAnimationComplete('fadeIn');
    console.log('Animation completed safely');
  }, 'handleAnimationComplete');

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleAnimationComplete)();
      }
    });

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, []);

  return /* ... */;
}
```

### 6. 객체 풀링 패턴

```typescript
import { useRef, useCallback } from 'react';
import Animated, {
  useSharedValue,
  SharedValue,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';

interface PooledValue {
  value: SharedValue<number>;
  inUse: boolean;
}

// SharedValue 풀 관리자
class SharedValuePool {
  private pool: PooledValue[] = [];
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  acquire(initialValue: number = 0): SharedValue<number> {
    // 사용 가능한 값 찾기
    const available = this.pool.find(item => !item.inUse);

    if (available) {
      available.inUse = true;
      available.value.value = initialValue;
      return available.value;
    }

    // 풀이 가득 찬 경우
    if (this.pool.length >= this.maxSize) {
      console.warn('SharedValuePool: Max size reached, creating new value');
    }

    // 새 값 생성 (실제로는 useSharedValue를 통해 생성해야 함)
    // 이 예시에서는 개념적 설명
    return { value: initialValue } as SharedValue<number>;
  }

  release(value: SharedValue<number>): void {
    const pooled = this.pool.find(item => item.value === value);
    if (pooled) {
      cancelAnimation(value);
      pooled.inUse = false;
      pooled.value.value = 0;
    }
  }

  clear(): void {
    this.pool.forEach(item => {
      cancelAnimation(item.value);
    });
    this.pool = [];
  }

  getStats() {
    return {
      total: this.pool.length,
      inUse: this.pool.filter(item => item.inUse).length,
      available: this.pool.filter(item => !item.inUse).length,
    };
  }
}

// 풀 사용 훅
function useSharedValuePool(poolSize: number = 20) {
  const poolRef = useRef<Map<string, SharedValue<number>>>(new Map());
  const availableRef = useRef<SharedValue<number>[]>([]);

  const acquire = useCallback((key: string, initialValue: number = 0) => {
    // 이미 할당된 경우
    if (poolRef.current.has(key)) {
      return poolRef.current.get(key)!;
    }

    // 사용 가능한 값 재사용
    let value: SharedValue<number>;
    if (availableRef.current.length > 0) {
      value = availableRef.current.pop()!;
      value.value = initialValue;
    } else {
      // 새로 생성 (훅 내부에서는 직접 생성 불가, 개념적 예시)
      value = useSharedValue(initialValue);
    }

    poolRef.current.set(key, value);
    return value;
  }, []);

  const release = useCallback((key: string) => {
    const value = poolRef.current.get(key);
    if (value) {
      cancelAnimation(value);
      poolRef.current.delete(key);
      availableRef.current.push(value);
    }
  }, []);

  const releaseAll = useCallback(() => {
    poolRef.current.forEach((value, key) => {
      cancelAnimation(value);
      availableRef.current.push(value);
    });
    poolRef.current.clear();
  }, []);

  return { acquire, release, releaseAll };
}
```

## sometimes-app 적용 사례

### 채팅 메시지 애니메이션 최적화

```typescript
// src/features/chat/ui/optimized-message-list.tsx
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  cancelAnimation,
  FadeInDown,
  FadeOutUp,
  runOnJS,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'read';
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onLongPress?: (id: string) => void;
}

// 메모이제이션된 메시지 버블
const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  onLongPress,
}: MessageBubbleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(isOwn ? 50 : -50);

  // 마운트 시 입장 애니메이션
  useEffect(() => {
    translateX.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });

    // 정리 함수
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(translateX);
    };
  }, []);

  // 전송 상태에 따른 투명도
  useEffect(() => {
    opacity.value = withTiming(
      message.status === 'sending' ? 0.6 : 1,
      { duration: 200 }
    );
  }, [message.status, opacity]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(message.id);
  }, [message.id, onLongPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        isOwn ? styles.ownMessage : styles.otherMessage,
        animatedStyle,
      ]}
    >
      <Text style={[
        styles.messageText,
        isOwn && styles.ownMessageText,
      ]}>
        {message.text}
      </Text>

      {/* 전송 상태 인디케이터 */}
      {isOwn && (
        <MessageStatusIndicator status={message.status} />
      )}
    </Animated.View>
  );
});

// 상태 인디케이터 (별도 컴포넌트로 분리하여 불필요한 리렌더 방지)
const MessageStatusIndicator = memo(function MessageStatusIndicator({
  status,
}: { status: ChatMessage['status'] }) {
  const opacity = useSharedValue(status === 'sending' ? 0.5 : 1);

  useEffect(() => {
    opacity.value = withTiming(status === 'sending' ? 0.5 : 1);

    return () => cancelAnimation(opacity);
  }, [status, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const statusIcon = status === 'read' ? '✓✓' :
                     status === 'sent' ? '✓' : '○';

  return (
    <Animated.Text style={[styles.statusText, animatedStyle]}>
      {statusIcon}
    </Animated.Text>
  );
});

// 메시지 리스트
export function OptimizedChatMessageList({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[];
  currentUserId: string;
}) {
  const listRef = useRef<FlashList<ChatMessage>>(null);

  // 새 메시지 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [messages.length]);

  const handleLongPress = useCallback((messageId: string) => {
    // 메시지 옵션 표시
    console.log('Long press on:', messageId);
  }, []);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === currentUserId}
      onLongPress={handleLongPress}
    />
  ), [currentUserId, handleLongPress]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <FlashList
      ref={listRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={60}
      inverted
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.75,
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7A4AE2',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});
```

### 매칭 카드 스택 메모리 최적화

```typescript
// src/features/matching/hooks/use-card-stack-memory.ts
import { useRef, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';

interface CardAnimationValues {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
}

interface CardState {
  id: string;
  values: CardAnimationValues;
  isActive: boolean;
}

export function useCardStackMemory(maxCards: number = 3) {
  const cardStatesRef = useRef<Map<string, CardState>>(new Map());
  const poolRef = useRef<CardAnimationValues[]>([]);

  // 카드 값 생성 또는 풀에서 가져오기
  const acquireCardValues = useCallback((cardId: string): CardAnimationValues => {
    // 이미 존재하는 경우
    const existing = cardStatesRef.current.get(cardId);
    if (existing) {
      existing.isActive = true;
      return existing.values;
    }

    // 풀에서 재사용
    let values: CardAnimationValues;
    if (poolRef.current.length > 0) {
      values = poolRef.current.pop()!;
      // 초기화
      values.translateX.value = 0;
      values.translateY.value = 0;
      values.rotation.value = 0;
      values.scale.value = 1;
      values.opacity.value = 1;
    } else {
      // 새로 생성
      values = {
        translateX: useSharedValue(0),
        translateY: useSharedValue(0),
        rotation: useSharedValue(0),
        scale: useSharedValue(1),
        opacity: useSharedValue(1),
      };
    }

    cardStatesRef.current.set(cardId, {
      id: cardId,
      values,
      isActive: true,
    });

    return values;
  }, []);

  // 카드 해제 (풀로 반환)
  const releaseCard = useCallback((cardId: string) => {
    const cardState = cardStatesRef.current.get(cardId);
    if (!cardState) return;

    // 모든 애니메이션 취소
    cancelAnimation(cardState.values.translateX);
    cancelAnimation(cardState.values.translateY);
    cancelAnimation(cardState.values.rotation);
    cancelAnimation(cardState.values.scale);
    cancelAnimation(cardState.values.opacity);

    // 풀로 반환
    cardState.isActive = false;
    poolRef.current.push(cardState.values);
    cardStatesRef.current.delete(cardId);
  }, []);

  // 모든 카드 정리
  const releaseAllCards = useCallback(() => {
    cardStatesRef.current.forEach((state, id) => {
      releaseCard(id);
    });
  }, [releaseCard]);

  // 비활성 카드 정리 (메모리 최적화)
  const pruneInactiveCards = useCallback(() => {
    const inactiveCards: string[] = [];

    cardStatesRef.current.forEach((state, id) => {
      if (!state.isActive) {
        inactiveCards.push(id);
      }
    });

    inactiveCards.forEach(id => releaseCard(id));
  }, [releaseCard]);

  // 통계
  const getMemoryStats = useCallback(() => ({
    activeCards: Array.from(cardStatesRef.current.values())
      .filter(s => s.isActive).length,
    poolSize: poolRef.current.length,
    totalAllocated: cardStatesRef.current.size + poolRef.current.length,
  }), []);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      releaseAllCards();
      poolRef.current = [];
    };
  }, [releaseAllCards]);

  return {
    acquireCardValues,
    releaseCard,
    releaseAllCards,
    pruneInactiveCards,
    getMemoryStats,
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. useEffect에서 cleanup 누락

```typescript
// ❌ 잘못된 예
useEffect(() => {
  opacity.value = withRepeat(withTiming(0.5), -1, true);
  // cleanup 없음!
}, []);

// ✅ 올바른 예
useEffect(() => {
  opacity.value = withRepeat(withTiming(0.5), -1, true);

  return () => {
    cancelAnimation(opacity);
  };
}, []);
```

### 2. 클로저에서 stale 참조

```typescript
// ❌ 잘못된 예: stale closure
function BadComponent() {
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.2, {}, () => {
      // count는 항상 0 (stale)
      runOnJS(console.log)(count);
    });
  }, []); // 의존성 배열에 count 없음
}

// ✅ 올바른 예: useRef 또는 올바른 의존성
function GoodComponent() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);

  // ref 동기화
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    scale.value = withSpring(1.2, {}, () => {
      // 항상 최신 값
      runOnJS(console.log)(countRef.current);
    });
  }, [scale]);
}
```

### 3. 리스트에서 key 미사용

```typescript
// ❌ 잘못된 예: index를 key로 사용
{items.map((item, index) => (
  <AnimatedItem key={index} item={item} /> // 재정렬 시 문제!
))}

// ✅ 올바른 예: 고유 ID 사용
{items.map(item => (
  <AnimatedItem key={item.id} item={item} />
))}
```

## 💡 성능 최적화 팁

### 1. WeakRef 활용

```typescript
// 콜백에서 컴포넌트 참조 유지 방지
const callbackRef = useRef<WeakRef<() => void> | null>(null);

const setCallback = (callback: () => void) => {
  callbackRef.current = new WeakRef(callback);
};

const executeCallback = () => {
  const callback = callbackRef.current?.deref();
  if (callback) {
    callback();
  }
};
```

### 2. 배치 업데이트

```typescript
// 여러 SharedValue를 동시에 업데이트
const updateAllValues = useCallback(() => {
  // ✅ 배치로 처리
  translateX.value = 0;
  translateY.value = 0;
  scale.value = 1;
  opacity.value = 1;
  // 모든 업데이트가 한 프레임에 적용됨
}, []);
```

### 3. 메모리 프로파일링

```typescript
// 개발 중 메모리 사용량 모니터링
if (__DEV__) {
  const NativeModules = require('react-native').NativeModules;

  setInterval(() => {
    // 메모리 정보 로깅 (플랫폼별 구현 필요)
    console.log('Memory check:', {
      activeAnimations: activeAnimationsCount,
      sharedValuesAllocated: sharedValuesCount,
    });
  }, 5000);
}
```

## 🏋️ 연습 문제

### 문제 1: 자동 정리 훅 구현

언마운트 시 모든 SharedValue를 자동으로 정리하는 훅을 구현하세요.

```typescript
function useAutoCleanupSharedValue<T>(initialValue: T): SharedValue<T> {
  // 구현하세요
}
```

### 문제 2: 메모리 사용량 추적기

활성 SharedValue 개수와 예상 메모리 사용량을 추적하는 유틸리티를 구현하세요.

### 문제 3: 카드 스택 가상화

100개 이상의 카드를 효율적으로 처리하는 가상화된 카드 스택을 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
// 문제 1 정답
function useAutoCleanupSharedValue<T extends number>(
  initialValue: T
): SharedValue<T> {
  const value = useSharedValue(initialValue);

  useEffect(() => {
    return () => {
      cancelAnimation(value);
    };
  }, [value]);

  return value;
}

// 문제 2 정답
class AnimationMemoryTracker {
  private static instance: AnimationMemoryTracker;
  private allocations = new Map<string, number>();
  private totalCount = 0;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AnimationMemoryTracker();
    }
    return this.instance;
  }

  track(componentName: string, count: number = 1) {
    const current = this.allocations.get(componentName) || 0;
    this.allocations.set(componentName, current + count);
    this.totalCount += count;
  }

  untrack(componentName: string, count: number = 1) {
    const current = this.allocations.get(componentName) || 0;
    this.allocations.set(componentName, Math.max(0, current - count));
    this.totalCount = Math.max(0, this.totalCount - count);
  }

  getReport() {
    const ESTIMATED_BYTES_PER_VALUE = 64;
    return {
      totalValues: this.totalCount,
      estimatedMemoryKB: (this.totalCount * ESTIMATED_BYTES_PER_VALUE) / 1024,
      byComponent: Object.fromEntries(this.allocations),
    };
  }
}

// 문제 3 정답
function useVirtualizedCardStack<T extends { id: string }>({
  cards,
  visibleCount = 3,
}: {
  cards: T[];
  visibleCount?: number;
}) {
  const [topIndex, setTopIndex] = useState(0);

  const visibleCards = useMemo(() => {
    return cards.slice(topIndex, topIndex + visibleCount);
  }, [cards, topIndex, visibleCount]);

  const { acquireCardValues, releaseCard } = useCardStackMemory(visibleCount);

  const swipeCard = useCallback((direction: 'left' | 'right') => {
    const currentCard = visibleCards[0];
    if (currentCard) {
      releaseCard(currentCard.id);
      setTopIndex(prev => Math.min(prev + 1, cards.length - 1));
    }
  }, [visibleCards, cards.length, releaseCard]);

  const rewindCard = useCallback(() => {
    setTopIndex(prev => Math.max(prev - 1, 0));
  }, []);

  return {
    visibleCards,
    swipeCard,
    rewindCard,
    acquireCardValues,
    hasMore: topIndex < cards.length - 1,
    canRewind: topIndex > 0,
  };
}
```

</details>

## 📚 이 장에서 배운 내용

1. **SharedValue 생명주기**: 생성부터 해제까지의 메모리 관리
2. **Cleanup 패턴**: useEffect에서 cancelAnimation 호출
3. **메모리 누수 방지**: 언마운트 후 콜백 실행 방지
4. **리스트 최적화**: memo, 적절한 key, FlashList 활용
5. **객체 풀링**: SharedValue 재사용으로 할당 최소화
6. **메모리 모니터링**: 개발 중 메모리 사용량 추적

## 다음 장 예고

**Chapter 58: 렌더링 최적화**에서는 Reanimated 애니메이션과 함께 React 컴포넌트의 렌더링을 최적화하는 방법을 배웁니다. 불필요한 리렌더 방지, 메모이제이션 전략, 컴포넌트 분리 패턴을 다룹니다.
