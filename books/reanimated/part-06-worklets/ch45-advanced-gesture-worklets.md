# Chapter 45: 고급 제스처 워크릿

복잡한 제스처 인식과 처리를 위한 고급 워크릿 기법을 마스터합니다. 멀티 터치, 커스텀 제스처 인식기, 제스처 조합, 그리고 제스처 상태 머신을 구현하는 방법을 배웁니다.

## 📌 학습 목표

- 복잡한 제스처 상태 관리
- 멀티 터치와 동시 제스처 처리
- 커스텀 제스처 인식기 구현
- 제스처 체인과 시퀀스
- 제스처 충돌 해결 전략

## 📖 제스처 워크릿의 아키텍처

### 제스처 처리 파이프라인

```
┌─────────────────────────────────────────────────────────────────┐
│                   Gesture Processing Pipeline                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 터치 이벤트 수신 (네이티브)                                  │
│     ┌──────────────────┐                                        │
│     │ Touch Event      │ ← pointerDown, pointerMove, pointerUp  │
│     │ {x, y, id, ...}  │                                        │
│     └────────┬─────────┘                                        │
│              │                                                   │
│  2. 제스처 인식 (UI 스레드 워크릿)                              │
│              ▼                                                   │
│     ┌──────────────────┐                                        │
│     │ Gesture Handler  │ ← onStart, onUpdate, onEnd             │
│     │ (Worklet)        │   제스처 유형 판별                      │
│     └────────┬─────────┘                                        │
│              │                                                   │
│  3. 상태 업데이트                                               │
│              ▼                                                   │
│     ┌──────────────────┐                                        │
│     │ SharedValue      │ ← 애니메이션 값 업데이트               │
│     │ Updates          │                                        │
│     └────────┬─────────┘                                        │
│              │                                                   │
│  4. 뷰 업데이트 (동기적)                                        │
│              ▼                                                   │
│     ┌──────────────────┐                                        │
│     │ useAnimatedStyle │ ← transform, opacity, etc.             │
│     └──────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 제스처 상태 머신 기본

```typescript
type GestureState =
  | 'UNDETERMINED'
  | 'BEGAN'
  | 'ACTIVE'
  | 'END'
  | 'CANCELLED'
  | 'FAILED';

interface GestureContext {
  startX: number;
  startY: number;
  startTime: number;
  velocity: { x: number; y: number };
  state: GestureState;
}

// 제스처 상태 관리 훅
function useGestureStateMachine() {
  const state = useSharedValue<GestureState>('UNDETERMINED');
  const context = useSharedValue<GestureContext>({
    startX: 0,
    startY: 0,
    startTime: 0,
    velocity: { x: 0, y: 0 },
    state: 'UNDETERMINED',
  });

  const transition = (newState: GestureState) => {
    'worklet';
    const validTransitions: Record<GestureState, GestureState[]> = {
      UNDETERMINED: ['BEGAN'],
      BEGAN: ['ACTIVE', 'FAILED', 'CANCELLED'],
      ACTIVE: ['END', 'CANCELLED'],
      END: ['UNDETERMINED'],
      CANCELLED: ['UNDETERMINED'],
      FAILED: ['UNDETERMINED'],
    };

    if (validTransitions[state.value].includes(newState)) {
      state.value = newState;
      context.value = { ...context.value, state: newState };
    }
  };

  return { state, context, transition };
}
```

## 💻 복잡한 제스처 핸들러

### 드래그 + 스케일 + 회전 통합

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface TransformState {
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
}

function useTransformGestures() {
  // 현재 변환 상태
  const transform = useSharedValue<TransformState>({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
  });

  // 제스처 시작 시점의 상태
  const savedTransform = useSharedValue<TransformState>({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
  });

  // 팬 제스처
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTransform.value = { ...transform.value };
    })
    .onUpdate((event) => {
      transform.value = {
        ...transform.value,
        translateX: savedTransform.value.translateX + event.translationX,
        translateY: savedTransform.value.translateY + event.translationY,
      };
    })
    .onEnd((event) => {
      // 관성 적용
      const VELOCITY_FACTOR = 0.2;
      transform.value = {
        ...transform.value,
        translateX: withDecay({
          velocity: event.velocityX * VELOCITY_FACTOR,
          rubberBandEffect: true,
          rubberBandFactor: 0.8,
        }),
        translateY: withDecay({
          velocity: event.velocityY * VELOCITY_FACTOR,
          rubberBandEffect: true,
          rubberBandFactor: 0.8,
        }),
      };
    });

  // 핀치 제스처
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedTransform.value = { ...transform.value };
    })
    .onUpdate((event) => {
      const newScale = savedTransform.value.scale * event.scale;
      transform.value = {
        ...transform.value,
        scale: Math.min(Math.max(newScale, 0.5), 3), // 제한
      };
    })
    .onEnd(() => {
      // 스냅백
      if (transform.value.scale < 1) {
        transform.value = {
          ...transform.value,
          scale: withSpring(1, { damping: 15 }),
        };
      }
    });

  // 회전 제스처
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedTransform.value = { ...transform.value };
    })
    .onUpdate((event) => {
      transform.value = {
        ...transform.value,
        rotation: savedTransform.value.rotation + event.rotation,
      };
    })
    .onEnd(() => {
      // 90도 단위로 스냅
      const snapAngle = Math.round(transform.value.rotation / (Math.PI / 2)) * (Math.PI / 2);
      transform.value = {
        ...transform.value,
        rotation: withSpring(snapAngle, { damping: 20 }),
      };
    });

  // 동시 실행 조합
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    Gesture.Simultaneous(pinchGesture, rotationGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transform.value.translateX },
      { translateY: transform.value.translateY },
      { scale: transform.value.scale },
      { rotate: `${transform.value.rotation}rad` },
    ],
  }));

  return { composedGesture, animatedStyle, transform };
}
```

### 포컬 포인트 기반 스케일링

```typescript
// 핀치 중심점을 기준으로 스케일링
function useFocalPointScaling() {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;

      // 포컬 포인트를 중심으로 스케일
      const focalOffsetX = focalX.value - savedTranslateX.value;
      const focalOffsetY = focalY.value - savedTranslateY.value;

      const scaleDiff = newScale / savedScale.value;

      translateX.value = focalX.value - focalOffsetX * scaleDiff;
      translateY.value = focalY.value - focalOffsetY * scaleDiff;
      scale.value = newScale;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return { pinchGesture, animatedStyle };
}
```

## 💻 커스텀 제스처 인식기

### 스와이프 방향 인식

```typescript
type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeConfig {
  minDistance: number;
  minVelocity: number;
  maxDuration: number;
}

function useSwipeRecognizer(
  onSwipe: (direction: SwipeDirection) => void,
  config: SwipeConfig = { minDistance: 50, minVelocity: 500, maxDuration: 300 }
) {
  const startTime = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const recognizeSwipe = (
    endX: number,
    endY: number,
    velocityX: number,
    velocityY: number
  ): SwipeDirection => {
    'worklet';

    const duration = Date.now() - startTime.value;
    if (duration > config.maxDuration) return null;

    const dx = endX - startX.value;
    const dy = endY - startY.value;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // 최소 거리 확인
    if (absX < config.minDistance && absY < config.minDistance) return null;

    // 주 방향 판별
    if (absX > absY) {
      // 수평 스와이프
      if (Math.abs(velocityX) < config.minVelocity) return null;
      return dx > 0 ? 'right' : 'left';
    } else {
      // 수직 스와이프
      if (Math.abs(velocityY) < config.minVelocity) return null;
      return dy > 0 ? 'down' : 'up';
    }
  };

  const gesture = Gesture.Pan()
    .onStart((event) => {
      startTime.value = Date.now();
      startX.value = event.x;
      startY.value = event.y;
    })
    .onEnd((event) => {
      const direction = recognizeSwipe(
        event.x,
        event.y,
        event.velocityX,
        event.velocityY
      );

      if (direction) {
        runOnJS(onSwipe)(direction);
      }
    });

  return gesture;
}
```

### 롱 프레스 + 드래그

```typescript
function useLongPressDrag(
  onDragStart: () => void,
  onDragEnd: (position: { x: number; y: number }) => void
) {
  const isLongPressed = useSharedValue(false);
  const position = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);

  const LONG_PRESS_DURATION = 500;

  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart(() => {
      isLongPressed.value = true;
      scale.value = withSpring(1.1, { damping: 10 });
      runOnJS(onDragStart)();
    });

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      if (isLongPressed.value) {
        stateManager.activate();
      }
    })
    .onUpdate((event) => {
      if (!isLongPressed.value) return;
      position.value = {
        x: event.absoluteX,
        y: event.absoluteY,
      };
    })
    .onEnd(() => {
      if (isLongPressed.value) {
        isLongPressed.value = false;
        scale.value = withSpring(1);
        runOnJS(onDragEnd)(position.value);
      }
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: position.value.x - 25,
    top: position.value.y - 25,
    transform: [{ scale: scale.value }],
    opacity: isLongPressed.value ? 0.8 : 0,
  }));

  return { composedGesture, animatedStyle };
}
```

### 더블 탭 인식

```typescript
function useDoubleTap(
  onSingleTap: () => void,
  onDoubleTap: () => void,
  doubleTapDelay: number = 300
) {
  const lastTapTime = useSharedValue(0);
  const tapCount = useSharedValue(0);
  const pendingTimeout = useSharedValue<number | null>(null);

  const clearPendingTap = () => {
    runOnJS(clearTimeout)(pendingTimeout.value as number);
    pendingTimeout.value = null;
    tapCount.value = 0;
  };

  const scheduleSingleTap = () => {
    const timeout = setTimeout(() => {
      onSingleTap();
      tapCount.value = 0;
    }, doubleTapDelay);

    runOnUI(() => {
      'worklet';
      pendingTimeout.value = timeout as unknown as number;
    })();
  };

  const gesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.value;
      lastTapTime.value = now;

      if (timeSinceLastTap < doubleTapDelay && tapCount.value === 1) {
        // 더블 탭
        runOnJS(clearTimeout)(pendingTimeout.value as number);
        pendingTimeout.value = null;
        tapCount.value = 0;
        runOnJS(onDoubleTap)();
      } else {
        // 첫 번째 탭
        tapCount.value = 1;
        runOnJS(scheduleSingleTap)();
      }
    });

  return gesture;
}

// 사용: 싱글 탭은 선택, 더블 탭은 줌
function ImageViewer() {
  const scale = useSharedValue(1);
  const [selected, setSelected] = useState(false);

  const tapGesture = useDoubleTap(
    () => setSelected(!selected),
    () => {
      scale.value = scale.value === 1
        ? withSpring(2)
        : withSpring(1);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.Image source={image} style={animatedStyle} />
    </GestureDetector>
  );
}
```

## 💻 제스처 시퀀스와 조합

### 제스처 시퀀스 (순차 실행)

```typescript
// 특정 패턴 인식: 좌→우→좌 스와이프
function useGestureSequence(
  pattern: SwipeDirection[],
  onPatternComplete: () => void
) {
  const currentIndex = useSharedValue(0);
  const lastGestureTime = useSharedValue(0);
  const MAX_DELAY = 1000; // 제스처 간 최대 대기 시간

  const checkSequence = (direction: SwipeDirection) => {
    'worklet';

    const now = Date.now();
    const timeSinceLast = now - lastGestureTime.value;

    // 타임아웃 시 리셋
    if (timeSinceLast > MAX_DELAY && currentIndex.value > 0) {
      currentIndex.value = 0;
    }

    lastGestureTime.value = now;

    // 패턴 매칭
    if (direction === pattern[currentIndex.value]) {
      currentIndex.value += 1;

      if (currentIndex.value === pattern.length) {
        currentIndex.value = 0;
        runOnJS(onPatternComplete)();
      }
    } else {
      // 첫 번째 패턴과 일치하면 다시 시작
      currentIndex.value = direction === pattern[0] ? 1 : 0;
    }
  };

  const swipeGesture = useSwipeRecognizer((direction) => {
    runOnUI(() => {
      'worklet';
      checkSequence(direction);
    })();
  });

  return swipeGesture;
}

// 사용: 비밀 제스처 (↑↑↓↓←→←→)
function SecretGesture() {
  const pattern: SwipeDirection[] = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];

  const gesture = useGestureSequence(pattern, () => {
    console.log('Secret unlocked!');
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container} />
    </GestureDetector>
  );
}
```

### 조건부 제스처 활성화

```typescript
function useConditionalGesture(
  isEnabled: SharedValue<boolean>,
  onGesture: (event: PanGestureHandlerEventPayload) => void
) {
  const gesture = Gesture.Pan()
    .enabled(true) // 항상 이벤트 수신
    .onUpdate((event) => {
      // 워크릿에서 조건 체크
      if (!isEnabled.value) return;
      onGesture(event);
    });

  return gesture;
}

// 더 복잡한 조건
function useStateBasedGesture() {
  const mode = useSharedValue<'view' | 'edit' | 'locked'>('view');
  const position = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 모드에 따라 다른 동작
      switch (mode.value) {
        case 'view':
          // 읽기 모드: 스크롤만
          break;
        case 'edit':
          // 편집 모드: 위치 변경
          position.value = {
            x: event.absoluteX,
            y: event.absoluteY,
          };
          break;
        case 'locked':
          // 잠금 모드: 무시
          break;
      }
    });

  return { panGesture, mode, position };
}
```

### 배타적 제스처 (Race)

```typescript
// 수평/수직 스와이프 경쟁
function useExclusiveSwipe(
  onHorizontalSwipe: (direction: 'left' | 'right') => void,
  onVerticalSwipe: (direction: 'up' | 'down') => void
) {
  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // 수평 20px 이동 시 활성화
    .failOffsetY([-10, 10])   // 수직 10px 이동 시 실패
    .onEnd((event) => {
      const direction = event.translationX > 0 ? 'right' : 'left';
      runOnJS(onHorizontalSwipe)(direction);
    });

  const verticalGesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-10, 10])
    .onEnd((event) => {
      const direction = event.translationY > 0 ? 'down' : 'up';
      runOnJS(onVerticalSwipe)(direction);
    });

  // Race: 먼저 활성화된 제스처가 승리
  const composedGesture = Gesture.Race(horizontalGesture, verticalGesture);

  return composedGesture;
}
```

## 💻 제스처 충돌 해결

### 부모-자식 제스처 조율

```typescript
// 스크롤뷰 내 드래그 가능 아이템
function DraggableInScrollView() {
  const scrollEnabled = useSharedValue(true);
  const itemPosition = useSharedValue({ x: 0, y: 0 });

  // 아이템 드래그 제스처
  const itemGesture = Gesture.Pan()
    .onStart(() => {
      // 드래그 시작하면 스크롤 비활성화
      scrollEnabled.value = false;
    })
    .onUpdate((event) => {
      itemPosition.value = {
        x: event.translationX,
        y: event.translationY,
      };
    })
    .onEnd(() => {
      scrollEnabled.value = true;
      itemPosition.value = withSpring({ x: 0, y: 0 });
    });

  // 스크롤 제스처
  const scrollGesture = Gesture.Pan()
    .enabled(scrollEnabled.value); // 동적 활성화

  // 아이템 먼저, 스크롤 나중
  const composedGesture = Gesture.Exclusive(itemGesture, scrollGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.ScrollView>
        <DraggableItem gesture={itemGesture} position={itemPosition} />
      </Animated.ScrollView>
    </GestureDetector>
  );
}
```

### 네이티브 스크롤과 공존

```typescript
function useScrollAwareGesture() {
  const scrollY = useSharedValue(0);
  const canPullToRefresh = useSharedValue(true);
  const pullDistance = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const TRIGGER_THRESHOLD = 80;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // 맨 위에서만 풀 투 리프레시 가능
      canPullToRefresh.value = event.contentOffset.y <= 0;
    },
  });

  const pullGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!canPullToRefresh.value || isRefreshing.value) return;

      if (event.translationY > 0) {
        // 저항 적용
        pullDistance.value = event.translationY * 0.5;
      }
    })
    .onEnd(() => {
      if (pullDistance.value > TRIGGER_THRESHOLD) {
        isRefreshing.value = true;
        pullDistance.value = withTiming(TRIGGER_THRESHOLD);

        runOnJS(refresh)();
      } else {
        pullDistance.value = withSpring(0);
      }
    });

  const refresh = async () => {
    await fetchData();
    runOnUI(() => {
      'worklet';
      isRefreshing.value = false;
      pullDistance.value = withSpring(0);
    })();
  };

  return { scrollHandler, pullGesture, pullDistance };
}
```

## 📱 sometimes-app 적용 사례

### 매칭 카드 스와이프 시스템

```typescript
// src/features/matching/hooks/use-card-swipe-system.ts
interface SwipeResult {
  direction: 'left' | 'right' | 'up';
  velocity: number;
  confidence: number;
}

export function useCardSwipeSystem(
  onSwipe: (result: SwipeResult) => void,
  onReject: () => void
) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const gestureState = useSharedValue<'idle' | 'active' | 'deciding'>('idle');
  const swipeDecision = useSharedValue<SwipeResult | null>(null);

  // 스와이프 임계값
  const SWIPE_THRESHOLD_X = 120;
  const SWIPE_THRESHOLD_Y = 100;
  const VELOCITY_THRESHOLD = 800;

  const calculateSwipeDecision = (
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ): SwipeResult | null => {
    'worklet';

    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    // 위로 스와이프 (슈퍼라이크)
    if (translationY < -SWIPE_THRESHOLD_Y && absY > absX) {
      return {
        direction: 'up',
        velocity: Math.abs(velocityY),
        confidence: Math.min(1, absY / (SWIPE_THRESHOLD_Y * 2)),
      };
    }

    // 좌우 스와이프
    if (absX > SWIPE_THRESHOLD_X) {
      const direction = translationX > 0 ? 'right' : 'left';
      return {
        direction,
        velocity: Math.abs(velocityX),
        confidence: Math.min(1, absX / (SWIPE_THRESHOLD_X * 2)),
      };
    }

    // 속도 기반 (빠른 플릭)
    if (Math.abs(velocityX) > VELOCITY_THRESHOLD && absX > 50) {
      return {
        direction: velocityX > 0 ? 'right' : 'left',
        velocity: Math.abs(velocityX),
        confidence: 0.8,
      };
    }

    return null;
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      gestureState.value = 'active';
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX * 0.1;

      // 실시간 결정 계산
      swipeDecision.value = calculateSwipeDecision(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );
    })
    .onEnd((event) => {
      const decision = calculateSwipeDecision(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (decision) {
        gestureState.value = 'deciding';
        executeSwipe(decision);
      } else {
        resetCard();
      }
    });

  const executeSwipe = (decision: SwipeResult) => {
    'worklet';

    const targetX = decision.direction === 'left' ? -500 :
                   decision.direction === 'right' ? 500 : 0;
    const targetY = decision.direction === 'up' ? -600 : 0;

    translateX.value = withTiming(targetX, { duration: 300 }, () => {
      gestureState.value = 'idle';
      runOnJS(onSwipe)(decision);
    });

    translateY.value = withTiming(targetY, { duration: 300 });
    rotation.value = withTiming(decision.direction === 'left' ? -30 :
                                decision.direction === 'right' ? 30 : 0,
                                { duration: 300 });
  };

  const resetCard = () => {
    'worklet';

    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    rotation.value = withSpring(0, { damping: 15 }, () => {
      gestureState.value = 'idle';
    });

    runOnJS(onReject)();
  };

  // 오버레이 표시
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 1],
      'clamp'
    );
    return { opacity };
  });

  const nopeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, 0],
      [1, 0],
      'clamp'
    );
    return { opacity };
  });

  const superLikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD_Y, 0],
      [1, 0],
      'clamp'
    );
    return { opacity };
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return {
    panGesture,
    cardStyle,
    likeOverlayStyle,
    nopeOverlayStyle,
    superLikeOverlayStyle,
    swipeDecision,
    gestureState,
  };
}
```

### 사진 갤러리 줌/팬

```typescript
// src/features/profile/hooks/use-image-zoom.ts
export function useImageZoom() {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  // 경계 계산
  const getBounds = (currentScale: number) => {
    'worklet';
    const scaledWidth = SCREEN_WIDTH * currentScale;
    const scaledHeight = SCREEN_HEIGHT * currentScale;

    const maxX = Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2);
    const maxY = Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2);

    return { maxX, maxY };
  };

  const clampToBounds = (x: number, y: number, currentScale: number) => {
    'worklet';
    const { maxX, maxY } = getBounds(currentScale);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // 더블 탭으로 줌
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > 1) {
        // 줌 아웃
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        // 탭 위치로 줌 인
        const targetScale = 2.5;
        const focusX = event.x - SCREEN_WIDTH / 2;
        const focusY = event.y - SCREEN_HEIGHT / 2;

        scale.value = withTiming(targetScale);
        translateX.value = withTiming(-focusX * (targetScale - 1));
        translateY.value = withTiming(-focusY * (targetScale - 1));
      }
    });

  // 핀치 줌
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.max(
        MIN_SCALE * 0.5,
        Math.min(MAX_SCALE, savedScale.value * event.scale)
      );
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // 줌 시 팬
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1) return;

      const newX = savedTranslateX.value + event.translationX;
      const newY = savedTranslateY.value + event.translationY;

      const clamped = clampToBounds(newX, newY, scale.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      const clamped = clampToBounds(translateX.value, translateY.value, scale.value);
      translateX.value = withSpring(clamped.x);
      translateY.value = withSpring(clamped.y);
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return { composedGesture, animatedStyle, scale };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 제스처 상태 누출

```typescript
// ❌ 제스처 종료 후 상태 미정리
const panGesture = Gesture.Pan()
  .onStart(() => {
    isDragging.value = true;
  })
  .onEnd(() => {
    // isDragging 미정리!
  });

// ✅ 모든 종료 케이스 처리
const panGesture = Gesture.Pan()
  .onStart(() => {
    isDragging.value = true;
  })
  .onEnd(() => {
    isDragging.value = false;
  })
  .onFinalize(() => {
    // 취소 포함 모든 종료
    isDragging.value = false;
  });
```

### 2. 경계 체크 누락

```typescript
// ❌ 무한 드래그
.onUpdate((event) => {
  position.value = event.translationX;
})

// ✅ 경계 제한
.onUpdate((event) => {
  position.value = Math.max(
    MIN_POSITION,
    Math.min(MAX_POSITION, event.translationX)
  );
})
```

## 💡 성능 최적화 팁

### 1. 제스처 핸들러 메모이제이션

```typescript
// 제스처 객체는 렌더링마다 재생성하지 않기
const panGesture = useMemo(
  () => Gesture.Pan().onUpdate(/* ... */),
  [/* 의존성 */]
);
```

### 2. 조건부 처리 최적화

```typescript
// ❌ 매 업데이트마다 조건 체크
.onUpdate((event) => {
  if (isEnabled && mode === 'edit' && !isLocked) {
    // 처리
  }
})

// ✅ 제스처 레벨에서 필터링
Gesture.Pan()
  .enabled(isEnabled)
  .shouldCancelWhenOutside(true)
```

## 🏋️ 연습 문제

### 과제 1: 그림 잠금 해제
특정 패턴을 그려서 잠금을 해제하는 제스처를 구현하세요.

### 과제 2: 멀티 셀렉트
여러 아이템을 연속으로 드래그하며 선택하는 제스처를 구현하세요.

### 과제 3: 3D 카드 플립
제스처로 카드를 3D 회전시키는 인터랙션을 만드세요.

## 📚 이 장에서 배운 내용

1. **제스처 상태 머신**: 복잡한 제스처 흐름 관리
2. **멀티 터치**: 동시 제스처 처리
3. **커스텀 인식기**: 스와이프, 더블 탭, 시퀀스
4. **제스처 조합**: Race, Simultaneous, Exclusive
5. **충돌 해결**: 부모-자식 제스처 조율

## 다음 장 예고

**Chapter 46: 센서와 하드웨어 연동**에서는 가속도계, 자이로스코프, 그리고 기타 디바이스 센서를 애니메이션과 연동하는 방법을 배웁니다.
