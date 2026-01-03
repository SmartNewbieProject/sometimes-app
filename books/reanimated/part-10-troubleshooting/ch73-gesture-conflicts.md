# Chapter 73: 제스처 충돌 해결

여러 제스처가 동시에 활성화될 때 발생하는 충돌을 진단하고 해결하는 방법을 학습합니다.

## 📌 학습 목표

- 제스처 충돌의 원인과 유형 이해
- 제스처 우선순위 설정 방법
- Simultaneous, Exclusive, Awaits 관계 활용
- 복잡한 중첩 제스처 디버깅

## 📖 개념 이해

### 제스처 충돌 유형

```
┌─────────────────────────────────────────────────────────────┐
│                   Gesture Conflict Types                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Parent-Child Conflict (부모-자식 충돌)                   │
│  ┌───────────────────────────┐                              │
│  │  Parent Scroll            │                              │
│  │  ┌───────────────────┐    │                              │
│  │  │  Child Swipeable  │ ← 어느 쪽이 스와이프 처리?        │
│  │  └───────────────────┘    │                              │
│  └───────────────────────────┘                              │
│                                                              │
│  2. Sibling Conflict (형제 충돌)                             │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │  Pan Left   │ │  Pan Right  │ ← 경계에서 어느 쪽?        │
│  └─────────────┘ └─────────────┘                            │
│                                                              │
│  3. Same-Element Conflict (동일 요소 충돌)                   │
│  ┌───────────────────────────┐                              │
│  │  Element with:            │                              │
│  │  - Tap                    │                              │
│  │  - LongPress              │ ← Tap vs LongPress 구분?     │
│  │  - Pan                    │ ← Pan vs Tap 구분?           │
│  │  - Pinch                  │ ← Pinch vs Pan 구분?         │
│  └───────────────────────────┘                              │
│                                                              │
│  4. System Conflict (시스템 제스처 충돌)                     │
│  ┌───────────────────────────┐                              │
│  │  App Edge Gesture         │ ← iOS 스와이프 백 충돌       │
│  │  vs System Back Gesture   │                              │
│  └───────────────────────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 제스처 관계 종류

```
┌─────────────────────────────────────────────────────────────┐
│                   Gesture Relationships                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  simultaneousWithExternalGesture (동시 실행)                 │
│  ┌────┐ ┌────┐                                              │
│  │ G1 │↔│ G2 │  두 제스처 모두 동시에 활성화 가능           │
│  └────┘ └────┘  예: Pinch + Pan으로 지도 조작               │
│                                                              │
│  requireExternalGestureToFail (실패 대기)                    │
│  ┌────┐   ┌────┐                                            │
│  │ G1 │──→│ G2 │  G1이 실패해야 G2 시작 가능                │
│  └────┘   └────┘  예: LongPress 실패 후 Tap 인식            │
│                                                              │
│  blocksExternalGesture (차단)                                │
│  ┌────┐ ⊗ ┌────┐                                            │
│  │ G1 │───│ G2 │  G1이 활성화되면 G2 차단                   │
│  └────┘   └────┘  예: Modal이 열리면 배경 스크롤 차단       │
│                                                              │
│  enabled (조건부 활성화)                                     │
│  ┌────┐                                                      │
│  │ G1 │  enabled={condition} 조건이 true일 때만 활성화      │
│  └────┘  예: 편집 모드에서만 드래그 가능                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: 기본 제스처 충돌 해결

```typescript
// src/gestures/GestureConflictResolver.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// 문제 상황: Tap과 LongPress 충돌
function TapLongPressConflict() {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('#3498db');

  // ❌ 잘못된 방법 - 각각 독립적으로 정의
  // const tap = Gesture.Tap().onEnd(() => console.log('Tap!'));
  // const longPress = Gesture.LongPress().onEnd(() => console.log('LongPress!'));

  // ✅ 올바른 방법 - Race 또는 Exclusive 사용
  const tap = Gesture.Tap()
    .maxDuration(250)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(0.95);
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
      backgroundColor.value = '#2ecc71';
      console.log('Tap detected!');
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
    });

  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(0.9);
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
      backgroundColor.value = '#e74c3c';
      console.log('LongPress detected!');
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
    });

  // Exclusive: 하나만 활성화 (먼저 조건 만족하는 것)
  const composed = Gesture.Exclusive(longPress, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

// 문제 상황: Pan과 Tap 충돌
function PanTapConflict() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const pan = Gesture.Pan()
    .minDistance(10) // 최소 이동 거리 설정
    .onStart(() => {
      'worklet';
      isDragging.value = true;
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const tap = Gesture.Tap()
    .maxDistance(10) // Pan의 minDistance보다 작게
    .onEnd(() => {
      'worklet';
      if (!isDragging.value) {
        console.log('Tap detected!');
      }
    });

  // Pan이 실패해야 Tap 인식
  const composed = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.draggableBox, animatedStyle]} />
    </GestureDetector>
  );
}

// 문제 상황: DoubleTap과 SingleTap 충돌
function DoubleTapSingleTapConflict() {
  const scale = useSharedValue(1);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(scale.value === 1 ? 2 : 1);
      console.log('Double tap - toggle zoom');
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .requireExternalGestureToFail(doubleTap) // DoubleTap 실패 대기
    .onEnd(() => {
      'worklet';
      console.log('Single tap - toggle controls');
    });

  const composed = Gesture.Exclusive(doubleTap, singleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.zoomableBox, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  draggableBox: {
    width: 80,
    height: 80,
    backgroundColor: '#9b59b6',
    borderRadius: 8,
  },
  zoomableBox: {
    width: 200,
    height: 200,
    backgroundColor: '#1abc9c',
    borderRadius: 8,
  },
});
```

### 예제 2: 부모-자식 제스처 충돌

```typescript
// src/gestures/NestedGestureConflict.tsx
import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// 문제: ScrollView 안의 Swipeable 카드
export function ScrollableSwipeableList() {
  const scrollRef = useRef<ScrollView>(null);
  const isScrollEnabled = useSharedValue(true);

  const setScrollEnabled = (enabled: boolean) => {
    if (scrollRef.current) {
      scrollRef.current.setNativeProps({ scrollEnabled: enabled });
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <SwipeableCard
          key={index}
          index={index}
          onSwipeStart={() => {
            isScrollEnabled.value = false;
            runOnJS(setScrollEnabled)(false);
          }}
          onSwipeEnd={() => {
            isScrollEnabled.value = true;
            runOnJS(setScrollEnabled)(true);
          }}
        />
      ))}
    </ScrollView>
  );
}

interface SwipeableCardProps {
  index: number;
  onSwipeStart: () => void;
  onSwipeEnd: () => void;
}

function SwipeableCard({ index, onSwipeStart, onSwipeEnd }: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const isActive = useSharedValue(false);

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20]) // 수평 20px 이상 이동해야 활성화
    .failOffsetY([-10, 10])   // 수직 10px 이동하면 실패 (스크롤에게 양보)
    .onStart(() => {
      'worklet';
      isActive.value = true;
      runOnJS(onSwipeStart)();
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      isActive.value = false;

      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }

      runOnJS(onSwipeEnd)();
    })
    .onFinalize(() => {
      'worklet';
      if (isActive.value) {
        isActive.value = false;
        runOnJS(onSwipeEnd)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.cardContent}>
          <Animated.Text style={styles.cardText}>
            Card {index + 1}
          </Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// 더 복잡한 케이스: 중첩된 스크롤과 드래그
export function NestedScrollDrag() {
  const outerScrollY = useSharedValue(0);
  const innerPanY = useSharedValue(0);
  const activeHandler = useSharedValue<'outer' | 'inner' | null>(null);

  const outerScroll = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (activeHandler.value === null) {
        activeHandler.value = 'outer';
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (activeHandler.value === 'outer') {
        outerScrollY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      activeHandler.value = null;
      outerScrollY.value = withSpring(0);
    });

  const innerDrag = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (activeHandler.value === null) {
        activeHandler.value = 'inner';
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (activeHandler.value === 'inner') {
        innerPanY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      activeHandler.value = null;
      innerPanY.value = withSpring(0);
    })
    .blocksExternalGesture(outerScroll); // 내부가 활성화되면 외부 차단

  return (
    <GestureDetector gesture={outerScroll}>
      <Animated.View style={styles.outerContainer}>
        <GestureDetector gesture={innerDrag}>
          <Animated.View
            style={[
              styles.innerDraggable,
              useAnimatedStyle(() => ({
                transform: [{ translateY: innerPanY.value }],
              })),
            ]}
          />
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDraggable: {
    width: 100,
    height: 100,
    backgroundColor: '#3498db',
    borderRadius: 50,
  },
});
```

### 예제 3: 동시 제스처 처리

```typescript
// src/gestures/SimultaneousGestures.tsx
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// 지도 스타일 제스처: Pan + Pinch + Rotate 동시 처리
export function MapStyleGesture() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);

  const pan = Gesture.Pan()
    .averageTouches(true) // 멀티터치 시 평균 위치 사용
    .onStart(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(0.5, Math.min(4, newScale)); // 0.5x ~ 4x 제한
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      'worklet';
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      'worklet';
      rotation.value = savedRotation.value + event.rotation;
    });

  // 세 제스처 동시 실행
  const composed = Gesture.Simultaneous(pan, pinch, rotate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.mapContainer, animatedStyle]}>
        <Animated.Image
          source={{ uri: 'https://example.com/map.png' }}
          style={styles.mapImage}
        />
      </Animated.View>
    </GestureDetector>
  );
}

// 이미지 뷰어: Pinch zoom + Double tap zoom + Pan
export function ImageViewer({ imageUri }: { imageUri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      'worklet';
      if (scale.value > 1) {
        // 원래 크기로
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        // 2배 확대 (탭 위치 기준)
        scale.value = withSpring(2);
        const centerX = width / 2;
        const centerY = height / 2;
        translateX.value = withSpring((centerX - event.x) * 1);
        translateY.value = withSpring((centerY - event.y) * 1);
      }
    });

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      'worklet';
      savedScale.value = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(0.5, Math.min(5, newScale));
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1) {
        // 확대 상태에서만 팬 가능
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      // 경계 체크 및 바운스 백
      const maxTranslateX = ((scale.value - 1) * width) / 2;
      const maxTranslateY = ((scale.value - 1) * height) / 2;

      if (Math.abs(translateX.value) > maxTranslateX) {
        translateX.value = withSpring(
          Math.sign(translateX.value) * maxTranslateX
        );
      }
      if (Math.abs(translateY.value) > maxTranslateY) {
        translateY.value = withSpring(
          Math.sign(translateY.value) * maxTranslateY
        );
      }
    });

  // Pinch와 Pan은 동시에, DoubleTap은 우선
  const composed = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: imageUri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: width * 2,
    height: height * 2,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width,
    height,
  },
});
```

### 예제 4: 제스처 디버거

```typescript
// src/debug/GestureDebugger.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  Gesture,
  GestureDetector,
  State,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

interface GestureEvent {
  id: string;
  type: string;
  state: string;
  timestamp: number;
  details: Record<string, any>;
}

export function useGestureDebugger(name: string) {
  const [events, setEvents] = useState<GestureEvent[]>([]);
  const maxEvents = 50;

  const logEvent = useCallback(
    (type: string, state: string, details: Record<string, any> = {}) => {
      const event: GestureEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        state,
        timestamp: Date.now(),
        details,
      };

      setEvents((prev) => {
        const next = [event, ...prev];
        return next.slice(0, maxEvents);
      });

      if (__DEV__) {
        console.log(
          `[Gesture:${name}] ${type} - ${state}`,
          Object.keys(details).length > 0 ? details : ''
        );
      }
    },
    [name]
  );

  const wrapGesture = useCallback(
    <T extends ReturnType<typeof Gesture.Pan | typeof Gesture.Tap>>(
      gesture: T,
      gestureType: string
    ): T => {
      return gesture
        .onBegin((e) => {
          'worklet';
          runOnJS(logEvent)(gestureType, 'BEGIN', {
            x: e.x,
            y: e.y,
          });
        })
        .onStart((e) => {
          'worklet';
          runOnJS(logEvent)(gestureType, 'START', {
            x: e.x,
            y: e.y,
          });
        })
        .onEnd((e, success) => {
          'worklet';
          runOnJS(logEvent)(gestureType, success ? 'END_SUCCESS' : 'END_FAIL', {
            x: e.x,
            y: e.y,
          });
        })
        .onFinalize((e, success) => {
          'worklet';
          runOnJS(logEvent)(gestureType, success ? 'FINALIZE_SUCCESS' : 'FINALIZE_FAIL');
        }) as T;
    },
    [logEvent]
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    logEvent,
    wrapGesture,
    clearEvents,
  };
}

// 제스처 상태를 문자열로 변환
function getStateName(state: State): string {
  switch (state) {
    case State.UNDETERMINED:
      return 'UNDETERMINED';
    case State.FAILED:
      return 'FAILED';
    case State.BEGAN:
      return 'BEGAN';
    case State.CANCELLED:
      return 'CANCELLED';
    case State.ACTIVE:
      return 'ACTIVE';
    case State.END:
      return 'END';
    default:
      return 'UNKNOWN';
  }
}

// 시각적 디버그 오버레이
export function GestureDebugOverlay({ events }: { events: GestureEvent[] }) {
  if (!__DEV__) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>Gesture Events</Text>
      <ScrollView style={styles.eventList}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <Text
              style={[
                styles.eventType,
                event.state.includes('SUCCESS') && styles.success,
                event.state.includes('FAIL') && styles.fail,
              ]}
            >
              {event.type}
            </Text>
            <Text style={styles.eventState}>{event.state}</Text>
            {Object.keys(event.details).length > 0 && (
              <Text style={styles.eventDetails}>
                {JSON.stringify(event.details)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// 터치 포인트 시각화
export function TouchVisualizer({ children }: { children: React.ReactNode }) {
  const [touches, setTouches] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(10)
    .onTouchesDown((e) => {
      'worklet';
      const newTouches = e.allTouches.map((t) => ({
        id: t.id,
        x: t.absoluteX,
        y: t.absoluteY,
      }));
      runOnJS(setTouches)(newTouches);
    })
    .onTouchesMove((e) => {
      'worklet';
      const newTouches = e.allTouches.map((t) => ({
        id: t.id,
        x: t.absoluteX,
        y: t.absoluteY,
      }));
      runOnJS(setTouches)(newTouches);
    })
    .onTouchesUp((e) => {
      'worklet';
      const remainingIds = e.allTouches.map((t) => t.id);
      const removed = e.changedTouches.map((t) => t.id);
      runOnJS(setTouches)((prev) =>
        prev.filter((t) => !removed.includes(t.id))
      );
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(setTouches)([]);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.touchContainer}>
        {children}
        {touches.map((touch) => (
          <View
            key={touch.id}
            style={[
              styles.touchPoint,
              {
                left: touch.x - 25,
                top: touch.y - 25,
              },
            ]}
          >
            <Text style={styles.touchId}>{touch.id}</Text>
          </View>
        ))}
      </View>
    </GestureDetector>
  );
}

// 제스처 상태 다이어그램
export function GestureStateDiagram({
  currentState,
}: {
  currentState: State;
}) {
  const states = [
    { state: State.UNDETERMINED, label: 'UNDETERMINED' },
    { state: State.BEGAN, label: 'BEGAN' },
    { state: State.ACTIVE, label: 'ACTIVE' },
    { state: State.END, label: 'END' },
    { state: State.FAILED, label: 'FAILED' },
    { state: State.CANCELLED, label: 'CANCELLED' },
  ];

  return (
    <View style={styles.diagram}>
      {states.map(({ state, label }) => (
        <View
          key={state}
          style={[
            styles.diagramState,
            currentState === state && styles.diagramStateActive,
          ]}
        >
          <Text
            style={[
              styles.diagramLabel,
              currentState === state && styles.diagramLabelActive,
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    maxHeight: 200,
    padding: 8,
  },
  overlayTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  eventType: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
  },
  eventState: {
    color: '#888',
    fontSize: 11,
    minWidth: 80,
  },
  eventDetails: {
    color: '#666',
    fontSize: 10,
  },
  success: {
    color: '#2ecc71',
  },
  fail: {
    color: '#e74c3c',
  },
  touchContainer: {
    flex: 1,
  },
  touchPoint: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(52, 152, 219, 0.5)',
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchId: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  diagram: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  diagramState: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  diagramStateActive: {
    backgroundColor: '#3498db',
  },
  diagramLabel: {
    color: '#888',
    fontSize: 10,
  },
  diagramLabelActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
```

### 예제 5: 시스템 제스처 충돌 처리

```typescript
// src/gestures/SystemGestureHandler.tsx
import React, { useEffect } from 'react';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// iOS 스와이프 백 제스처와의 충돌 처리
export function EdgeSwipeHandler({ children }: { children: React.ReactNode }) {
  const translateX = useSharedValue(0);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const EDGE_WIDTH = 20; // iOS 엣지 제스처 영역
  const SWIPE_THRESHOLD = 100;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const pan = Gesture.Pan()
    .activeOffsetX([10, 1000]) // 오른쪽으로 10px 이상 이동해야 활성화
    .failOffsetX([-1000, -1]) // 왼쪽으로 이동하면 실패
    .hitSlop({ left: 0, width: EDGE_WIDTH }) // 왼쪽 엣지에서만 시작
    .onUpdate((event) => {
      'worklet';
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationX > SWIPE_THRESHOLD) {
        // 네비게이션 백
        runOnJS(handleGoBack)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  // iOS에서 기본 제스처와의 충돌 방지
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // React Navigation의 제스처와 조율
      navigation.setOptions({
        gestureEnabled: false, // 커스텀 제스처 사용
      });
    }
  }, [navigation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 1 - translateX.value / 400,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Android 백 버튼 및 제스처 처리
export function AndroidBackHandler({
  onBack,
  enabled = true,
  children,
}: {
  onBack: () => boolean; // true 반환 시 이벤트 소비
  enabled?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const { BackHandler } = require('react-native');
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (enabled) {
          return onBack();
        }
        return false;
      }
    );

    return () => subscription.remove();
  }, [onBack, enabled]);

  // Android 제스처 내비게이션과의 충돌 처리
  const pan = Gesture.Pan()
    .activeOffsetX([30, 1000]) // iOS보다 큰 오프셋
    .enabled(Platform.OS === 'android' && enabled);

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

// 풀스크린 모드에서의 시스템 제스처 처리
export function FullscreenGestureHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const isSystemUIVisible = useSharedValue(true);

  useEffect(() => {
    // 상태바 숨기기/보이기
    if (Platform.OS === 'android') {
      StatusBar.setHidden(!isSystemUIVisible.value);
    }
  }, []);

  const tap = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      isSystemUIVisible.value = !isSystemUIVisible.value;
      if (Platform.OS === 'android') {
        runOnJS(StatusBar.setHidden)(!isSystemUIVisible.value);
      }
    });

  // 시스템 제스처 영역 피하기
  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: isSystemUIVisible.value ? insets.top : 0,
    paddingBottom: isSystemUIVisible.value ? insets.bottom : 0,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.fullscreen, containerStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// 드로어와 엣지 스와이프 충돌 해결
export function DrawerEdgeHandler({
  isDrawerOpen,
  onOpenDrawer,
  onCloseDrawer,
  children,
}: {
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  children: React.ReactNode;
}) {
  const translateX = useSharedValue(0);
  const DRAWER_WIDTH = 280;
  const EDGE_WIDTH = 30;

  const openGesture = Gesture.Pan()
    .activeOffsetX([10, 1000])
    .hitSlop({ left: 0, width: EDGE_WIDTH })
    .enabled(!isDrawerOpen)
    .onUpdate((event) => {
      'worklet';
      translateX.value = Math.min(event.translationX, DRAWER_WIDTH);
    })
    .onEnd((event) => {
      'worklet';
      if (translateX.value > DRAWER_WIDTH / 2 || event.velocityX > 500) {
        translateX.value = withSpring(DRAWER_WIDTH);
        runOnJS(onOpenDrawer)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const closeGesture = Gesture.Pan()
    .activeOffsetX([-1000, -10])
    .enabled(isDrawerOpen)
    .onUpdate((event) => {
      'worklet';
      translateX.value = Math.max(DRAWER_WIDTH + event.translationX, 0);
    })
    .onEnd((event) => {
      'worklet';
      if (translateX.value < DRAWER_WIDTH / 2 || event.velocityX < -500) {
        translateX.value = withSpring(0);
        runOnJS(onCloseDrawer)();
      } else {
        translateX.value = withSpring(DRAWER_WIDTH);
      }
    });

  const composed = Gesture.Race(openGesture, closeGesture);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.container}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
});
```

## 🎯 sometimes-app 적용 사례

### 매칭 카드 복합 제스처

```typescript
// src/features/matching/gestures/MatchingCardGestures.tsx
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const VELOCITY_THRESHOLD = 500;

interface MatchingCardGesturesProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  children: React.ReactNode;
}

export function MatchingCardGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
  onDoubleTap,
  children,
}: MatchingCardGesturesProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const context = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  // 스와이프 결과 처리
  const handleSwipeComplete = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      if (direction === 'left') onSwipeLeft();
      else if (direction === 'right') onSwipeRight();
      else if (direction === 'up') onSwipeUp?.();
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp]
  );

  // 위치 리셋
  const resetPosition = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    rotation.value = withSpring(0, { damping: 15 });
    scale.value = withSpring(1);
  }, []);

  // 카드 날리기 애니메이션
  const flyAway = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      'worklet';
      const targetX =
        direction === 'left' ? -SCREEN_WIDTH * 1.5 :
        direction === 'right' ? SCREEN_WIDTH * 1.5 : 0;
      const targetY = direction === 'up' ? -SCREEN_HEIGHT : 0;
      const targetRotation =
        direction === 'left' ? -30 :
        direction === 'right' ? 30 : 0;

      translateX.value = withSpring(targetX, { velocity: 1000 });
      translateY.value = withSpring(targetY, { velocity: 1000 });
      rotation.value = withSpring(targetRotation);

      runOnJS(handleSwipeComplete)(direction);
    },
    [handleSwipeComplete]
  );

  // 메인 팬 제스처
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { x: translateX.value, y: translateY.value };
      isActive.value = true;
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;

      // 회전은 수평 이동에 비례
      rotation.value = interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      'worklet';
      isActive.value = false;
      scale.value = withSpring(1);

      const { velocityX, velocityY } = event;

      // 오른쪽 스와이프
      if (
        translateX.value > SWIPE_THRESHOLD ||
        velocityX > VELOCITY_THRESHOLD
      ) {
        flyAway('right');
        return;
      }

      // 왼쪽 스와이프
      if (
        translateX.value < -SWIPE_THRESHOLD ||
        velocityX < -VELOCITY_THRESHOLD
      ) {
        flyAway('left');
        return;
      }

      // 위쪽 스와이프 (슈퍼라이크)
      if (
        onSwipeUp &&
        (translateY.value < -SWIPE_THRESHOLD || velocityY < -VELOCITY_THRESHOLD)
      ) {
        flyAway('up');
        return;
      }

      // 리셋
      resetPosition();
    });

  // 더블탭 제스처 (프로필 확대)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!!onDoubleTap)
    .onEnd(() => {
      'worklet';
      if (onDoubleTap) {
        runOnJS(onDoubleTap)();
      }
    });

  // 싱글탭 제스처 (상세보기)
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .enabled(!!onTap)
    .requireExternalGestureToFail(doubleTapGesture)
    .maxDuration(200)
    .onEnd(() => {
      'worklet';
      if (!isActive.value && onTap) {
        runOnJS(onTap)();
      }
    });

  // 제스처 조합: 탭은 독립적, 더블탭 우선
  const tapGestures = Gesture.Exclusive(doubleTapGesture, singleTapGesture);

  // 전체 제스처 조합: 팬과 탭은 레이스
  const composedGesture = Gesture.Race(panGesture, tapGestures);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  // 오버레이 스타일
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const superlikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}

        {/* LIKE 오버레이 */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
          <Animated.Text style={styles.overlayText}>LIKE</Animated.Text>
        </Animated.View>

        {/* NOPE 오버레이 */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
          <Animated.Text style={styles.overlayText}>NOPE</Animated.Text>
        </Animated.View>

        {/* SUPER LIKE 오버레이 */}
        {onSwipeUp && (
          <Animated.View
            style={[styles.overlay, styles.superlikeOverlay, superlikeOverlayStyle]}
          >
            <Animated.Text style={styles.overlayText}>SUPER LIKE</Animated.Text>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 8,
  },
  likeOverlay: {
    right: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '15deg' }],
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#F44336',
    transform: [{ rotate: '-15deg' }],
  },
  superlikeOverlay: {
    alignSelf: 'center',
    borderColor: '#2196F3',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 제스처 참조 누락

```typescript
// ❌ 잘못된 방법 - 참조 없이 조합
const pan = Gesture.Pan();
const tap = Gesture.Tap();

// tap이 pan보다 먼저 인식되어 pan이 동작 안 함
const composed = Gesture.Race(tap, pan);

// ✅ 올바른 방법 - 올바른 순서와 설정
const pan = Gesture.Pan()
  .minDistance(10); // 최소 이동 거리

const tap = Gesture.Tap()
  .maxDuration(200) // 탭 최대 시간
  .requireExternalGestureToFail(pan); // pan 실패 후 tap

const composed = Gesture.Exclusive(pan, tap);
```

### 실수 2: 중첩 제스처에서 충돌 무시

```typescript
// ❌ 잘못된 방법 - 부모 스크롤과 충돌
function BadSwipeableInScroll() {
  const pan = Gesture.Pan()
    .onUpdate(() => {
      // 스크롤과 충돌!
    });

  return (
    <ScrollView>
      <GestureDetector gesture={pan}>
        <View />
      </GestureDetector>
    </ScrollView>
  );
}

// ✅ 올바른 방법 - 방향별 분리
function GoodSwipeableInScroll() {
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])  // 수평 10px 후 활성화
    .failOffsetY([-5, 5])      // 수직 5px 이동 시 실패
    .onUpdate(() => {
      // 수평 스와이프만 처리
    });

  return (
    <ScrollView>
      <GestureDetector gesture={pan}>
        <View />
      </GestureDetector>
    </ScrollView>
  );
}
```

### 실수 3: 상태 동기화 문제

```typescript
// ❌ 잘못된 방법 - 상태와 제스처 불일치
function BadGestureState() {
  const [isOpen, setIsOpen] = useState(false);

  const pan = Gesture.Pan()
    .enabled(true) // 항상 활성화
    .onEnd(() => {
      // isOpen 상태와 무관하게 동작
    });
}

// ✅ 올바른 방법 - SharedValue로 상태 관리
function GoodGestureState() {
  const isOpen = useSharedValue(false);

  const pan = Gesture.Pan()
    .onEnd(() => {
      'worklet';
      // SharedValue 직접 참조
      if (isOpen.value) {
        // close logic
      } else {
        // open logic
      }
    });
}
```

## 💡 팁

### 팁 1: 제스처 디버깅 로그

```typescript
const createDebugGesture = (name: string, gesture: typeof Gesture.Pan) => {
  return gesture
    .onBegin(() => console.log(`${name}: BEGIN`))
    .onStart(() => console.log(`${name}: START`))
    .onEnd((_, success) => console.log(`${name}: END (${success})`))
    .onFinalize((_, success) => console.log(`${name}: FINALIZE (${success})`));
};
```

### 팁 2: hitSlop으로 터치 영역 확장

```typescript
const smallButtonTap = Gesture.Tap()
  .hitSlop({ top: 20, bottom: 20, left: 20, right: 20 }) // 터치 영역 확장
  .onEnd(() => console.log('Tapped!'));
```

### 팁 3: manualActivation으로 정밀 제어

```typescript
const pan = Gesture.Pan()
  .manualActivation(true)
  .onTouchesMove((event, stateManager) => {
    if (shouldActivate(event)) {
      stateManager.activate();
    } else {
      stateManager.fail();
    }
  });
```

## 🏋️ 연습 문제

### 문제 1: 카드 플립 + 스와이프 구현

카드를 탭하면 플립되고, 스와이프하면 날아가는 제스처를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
function FlippableSwipeableCard() {
  const translateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const tap = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      isFlipped.value = !isFlipped.value;
      rotateY.value = withSpring(isFlipped.value ? 180 : 0);
    });

  const pan = Gesture.Pan()
    .minDistance(20)
    .onUpdate((e) => {
      'worklet';
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      if (Math.abs(translateX.value) > 100) {
        translateX.value = withSpring(translateX.value > 0 ? 500 : -500);
      } else {
        translateX.value = withSpring(0);
      }
    });

  // 플립 중에는 스와이프 비활성화
  const composed = Gesture.Race(
    pan.enabled(!isFlipped.value),
    tap
  );

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [
          { translateX: translateX.value },
          { perspective: 1000 },
          { rotateY: `${rotateY.value}deg` },
        ],
      }))} />
    </GestureDetector>
  );
}
```
</details>

## 📚 이 장에서 배운 내용

1. **충돌 유형**: 부모-자식, 형제, 동일요소, 시스템 제스처 충돌
2. **제스처 관계**: Simultaneous, Exclusive, Race, requireExternalGestureToFail
3. **방향 분리**: activeOffsetX/Y, failOffsetX/Y로 의도 명확화
4. **디버깅**: 제스처 이벤트 로깅과 시각화
5. **시스템 통합**: iOS/Android 시스템 제스처와의 조화

## 다음 장 예고

**Chapter 74: 플랫폼별 이슈**에서는 iOS와 Android 간의 애니메이션 동작 차이와 이를 해결하는 방법을 다룹니다.
