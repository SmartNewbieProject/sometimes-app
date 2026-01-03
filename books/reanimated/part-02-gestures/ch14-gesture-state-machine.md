# Chapter 14: 제스처 상태 머신

## 📌 개요

복잡한 제스처 로직은 if-else 문으로 관리하기 어렵습니다. 상태 머신(State Machine) 패턴을 사용하면 제스처의 상태 전환을 명확하게 정의하고, 버그를 줄이며, 유지보수성을 높일 수 있습니다. 이 장에서는 제스처를 상태 머신으로 설계하는 방법을 배웁니다.

### 학습 목표

- 상태 머신의 기본 개념 이해
- useSharedValue로 상태 머신 구현
- 복잡한 제스처 로직 상태 머신화
- 상태 전환 애니메이션 연동
- 디버깅과 테스트 용이성 확보

---

## 📖 상태 머신 기본 개념

### 상태 머신이란?

상태 머신은 시스템이 가질 수 있는 **유한한 상태들**과 **상태 간 전환 규칙**을 정의하는 패턴입니다.

```
[IDLE] ---(swipe right)---> [LIKING] ---(release)---> [LIKED]
   |                                                      |
   +---(swipe left)---> [PASSING] ---(release)---> [PASSED]
```

### 상태 머신의 구성 요소

1. **States (상태)**: 시스템이 있을 수 있는 상태들
2. **Events (이벤트)**: 상태 전환을 트리거하는 동작
3. **Transitions (전환)**: 이벤트에 따른 상태 변화 규칙
4. **Actions (액션)**: 전환 시 실행되는 부수 효과

---

## 💻 기본 상태 머신 구현

### 열거형으로 상태 정의

```typescript
// 상태 정의
const State = {
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  RETURNING: 'RETURNING',
  DISMISSED: 'DISMISSED',
} as const;

type StateType = typeof State[keyof typeof State];

function StateMachineCard() {
  const state = useSharedValue<StateType>(State.IDLE);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (state.value === State.IDLE) {
        state.value = State.DRAGGING;
      }
    })
    .onUpdate((event) => {
      if (state.value === State.DRAGGING) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (state.value === State.DRAGGING) {
        const shouldDismiss = Math.abs(event.translationX) > 150;

        if (shouldDismiss) {
          state.value = State.DISMISSED;
          translateX.value = withTiming(
            event.translationX > 0 ? 400 : -400,
            { duration: 200 }
          );
        } else {
          state.value = State.RETURNING;
          translateX.value = withSpring(0, {}, () => {
            state.value = State.IDLE;
          });
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: state.value === State.DISMISSED ? 0 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]} />
    </GestureDetector>
  );
}
```

---

## 💻 상태 전환 테이블

### 명시적인 전환 규칙 정의

```typescript
const State = {
  IDLE: 'IDLE',
  PRESSING: 'PRESSING',
  DRAGGING: 'DRAGGING',
  SWIPED_RIGHT: 'SWIPED_RIGHT',
  SWIPED_LEFT: 'SWIPED_LEFT',
  RETURNING: 'RETURNING',
} as const;

type StateType = typeof State[keyof typeof State];

const Event = {
  PRESS_START: 'PRESS_START',
  PRESS_END: 'PRESS_END',
  DRAG_START: 'DRAG_START',
  DRAG_UPDATE: 'DRAG_UPDATE',
  DRAG_END: 'DRAG_END',
  SWIPE_RIGHT: 'SWIPE_RIGHT',
  SWIPE_LEFT: 'SWIPE_LEFT',
  ANIMATION_COMPLETE: 'ANIMATION_COMPLETE',
} as const;

type EventType = typeof Event[keyof typeof Event];

// 상태 전환 테이블
const transitions: Record<StateType, Partial<Record<EventType, StateType>>> = {
  [State.IDLE]: {
    [Event.PRESS_START]: State.PRESSING,
    [Event.DRAG_START]: State.DRAGGING,
  },
  [State.PRESSING]: {
    [Event.PRESS_END]: State.IDLE,
    [Event.DRAG_START]: State.DRAGGING,
  },
  [State.DRAGGING]: {
    [Event.SWIPE_RIGHT]: State.SWIPED_RIGHT,
    [Event.SWIPE_LEFT]: State.SWIPED_LEFT,
    [Event.DRAG_END]: State.RETURNING,
  },
  [State.SWIPED_RIGHT]: {
    [Event.ANIMATION_COMPLETE]: State.IDLE,
  },
  [State.SWIPED_LEFT]: {
    [Event.ANIMATION_COMPLETE]: State.IDLE,
  },
  [State.RETURNING]: {
    [Event.ANIMATION_COMPLETE]: State.IDLE,
  },
};

// 상태 전환 함수
function transition(
  currentState: StateType,
  event: EventType
): StateType {
  'worklet';
  const nextState = transitions[currentState]?.[event];
  return nextState || currentState;
}
```

---

## 💻 상태 머신 훅 패턴

### 재사용 가능한 상태 머신 훅

```typescript
type TransitionTable<S extends string, E extends string> =
  Record<S, Partial<Record<E, S>>>;

function useStateMachine<S extends string, E extends string>(
  initialState: S,
  transitionTable: TransitionTable<S, E>
) {
  const state = useSharedValue<S>(initialState);

  const send = useCallback((event: E) => {
    'worklet';
    const currentState = state.value;
    const nextState = transitionTable[currentState]?.[event];
    if (nextState) {
      state.value = nextState;
    }
  }, [transitionTable]);

  const isState = useCallback((checkState: S) => {
    'worklet';
    return state.value === checkState;
  }, []);

  return { state, send, isState };
}

// 사용 예시
function SwipeCard() {
  const { state, send, isState } = useStateMachine(
    State.IDLE,
    transitions
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      send(Event.DRAG_START);
    })
    .onUpdate((event) => {
      if (isState(State.DRAGGING)) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 150) {
        send(Event.SWIPE_RIGHT);
      } else if (event.translationX < -150) {
        send(Event.SWIPE_LEFT);
      } else {
        send(Event.DRAG_END);
      }
    });

  // ...
}
```

---

## 💻 상태별 애니메이션 매핑

### 상태 변화에 따른 자동 애니메이션

```typescript
const stateAnimations: Record<StateType, AnimationConfig> = {
  [State.IDLE]: {
    scale: 1,
    opacity: 1,
    translateX: 0,
  },
  [State.PRESSING]: {
    scale: 0.98,
    opacity: 0.9,
    translateX: 0,
  },
  [State.DRAGGING]: {
    scale: 1.02,
    opacity: 1,
    // translateX는 제스처가 직접 제어
  },
  [State.SWIPED_RIGHT]: {
    scale: 0.8,
    opacity: 0,
    translateX: 400,
  },
  [State.SWIPED_LEFT]: {
    scale: 0.8,
    opacity: 0,
    translateX: -400,
  },
  [State.RETURNING]: {
    scale: 1,
    opacity: 1,
    translateX: 0,
  },
};

function AnimatedStateMachine() {
  const state = useSharedValue<StateType>(State.IDLE);
  const translateX = useSharedValue(0);

  // 상태 변화 감지해서 애니메이션 실행
  useAnimatedReaction(
    () => state.value,
    (currentState, previousState) => {
      if (currentState === previousState) return;

      const config = stateAnimations[currentState];

      // DRAGGING이 아닐 때만 translateX 애니메이션
      if (currentState !== State.DRAGGING && config.translateX !== undefined) {
        translateX.value = withSpring(config.translateX, {}, () => {
          if (
            currentState === State.SWIPED_RIGHT ||
            currentState === State.SWIPED_LEFT ||
            currentState === State.RETURNING
          ) {
            state.value = State.IDLE;
          }
        });
      }
    },
    []
  );

  const animatedStyle = useAnimatedStyle(() => {
    const config = stateAnimations[state.value] || stateAnimations[State.IDLE];

    return {
      transform: [
        { translateX: translateX.value },
        { scale: withSpring(config.scale) },
      ],
      opacity: withTiming(config.opacity),
    };
  });

  // ...
}
```

---

## 💻 실전: Tinder 스와이프 상태 머신

### 완전한 스와이프 카드 상태 머신

```typescript
const CardState = {
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  LIKING: 'LIKING',       // 오른쪽으로 스와이프 중
  NOPING: 'NOPING',       // 왼쪽으로 스와이프 중
  LIKED: 'LIKED',         // 좋아요 완료
  NOPED: 'NOPED',         // 싫어요 완료
  SUPER_LIKING: 'SUPER_LIKING', // 위로 스와이프 중
  SUPER_LIKED: 'SUPER_LIKED',
  RETURNING: 'RETURNING',
} as const;

type CardStateType = typeof CardState[keyof typeof CardState];

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;

function TinderCard({
  profile,
  onLike,
  onNope,
  onSuperLike,
}: TinderCardProps) {
  const state = useSharedValue<CardStateType>(CardState.IDLE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // 상태 전환 함수
  const transitionTo = (nextState: CardStateType) => {
    'worklet';
    state.value = nextState;
  };

  // 현재 방향 판단
  const getDirection = (x: number, y: number, vx: number, vy: number) => {
    'worklet';
    const isVelocitySwipe = Math.abs(vx) > VELOCITY_THRESHOLD ||
                            Math.abs(vy) > VELOCITY_THRESHOLD;

    if (y < -SWIPE_THRESHOLD || (vy < -VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'up';
    }
    if (x > SWIPE_THRESHOLD || (vx > VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'right';
    }
    if (x < -SWIPE_THRESHOLD || (vx < -VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'left';
    }
    return 'none';
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (state.value === CardState.IDLE) {
        transitionTo(CardState.DRAGGING);
      }
    })
    .onUpdate((event) => {
      if (state.value !== CardState.DRAGGING) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-200, 0, 200],
        [-15, 0, 15]
      );

      // 방향에 따른 시각적 피드백
      const direction = getDirection(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (direction === 'right') {
        transitionTo(CardState.LIKING);
      } else if (direction === 'left') {
        transitionTo(CardState.NOPING);
      } else if (direction === 'up') {
        transitionTo(CardState.SUPER_LIKING);
      } else {
        transitionTo(CardState.DRAGGING);
      }
    })
    .onEnd((event) => {
      const direction = getDirection(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (direction === 'right') {
        transitionTo(CardState.LIKED);
        translateX.value = withTiming(500, { duration: 300 }, () => {
          runOnJS(onLike)(profile);
        });
      } else if (direction === 'left') {
        transitionTo(CardState.NOPED);
        translateX.value = withTiming(-500, { duration: 300 }, () => {
          runOnJS(onNope)(profile);
        });
      } else if (direction === 'up') {
        transitionTo(CardState.SUPER_LIKED);
        translateY.value = withTiming(-600, { duration: 300 }, () => {
          runOnJS(onSuperLike)(profile);
        });
      } else {
        // 되돌아가기
        transitionTo(CardState.RETURNING);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0, {}, () => {
          transitionTo(CardState.IDLE);
        });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // 상태별 오버레이 (LIKE, NOPE, SUPER LIKE 표시)
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

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri: profile.photo }} style={styles.photo} />

        <Animated.View style={[styles.likeOverlay, likeOverlayStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.nopeOverlay, nopeOverlayStyle]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        <Animated.View style={[styles.superLikeOverlay, superLikeOverlayStyle]}>
          <Text style={styles.superLikeText}>SUPER</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 💻 상태 디버깅

### 상태 변화 로깅

```typescript
function useStateLogger<S extends string>(
  state: SharedValue<S>,
  componentName: string
) {
  useAnimatedReaction(
    () => state.value,
    (current, previous) => {
      if (current !== previous) {
        console.log(
          `[${componentName}] State: ${previous} → ${current}`
        );
      }
    },
    []
  );
}

// 사용
function DebugableCard() {
  const state = useSharedValue(CardState.IDLE);

  if (__DEV__) {
    useStateLogger(state, 'TinderCard');
  }

  // ...
}
```

### 상태 시각화 (개발용)

```typescript
function StateDebugOverlay({ state }: { state: SharedValue<string> }) {
  const [displayState, setDisplayState] = useState('');

  useAnimatedReaction(
    () => state.value,
    (currentState) => {
      runOnJS(setDisplayState)(currentState);
    },
    []
  );

  if (!__DEV__) return null;

  return (
    <View style={styles.debugOverlay}>
      <Text style={styles.debugText}>State: {displayState}</Text>
    </View>
  );
}
```

---

## 📊 상태 다이어그램

### Tinder 카드 상태 다이어그램

```
                    ┌─────────┐
                    │  IDLE   │
                    └────┬────┘
                         │ onStart
                         ▼
                    ┌─────────┐
                    │DRAGGING │◄──────────────┐
                    └────┬────┘               │
           ┌─────────────┼─────────────┐      │
           │             │             │      │
      x > threshold  y < threshold  x < threshold
           │             │             │      │
           ▼             ▼             ▼      │
      ┌────────┐   ┌───────────┐  ┌────────┐  │
      │ LIKING │   │SUPER_LIKING│  │ NOPING │  │
      └───┬────┘   └─────┬─────┘  └───┬────┘  │
          │              │            │       │
     onEnd: release  onEnd: release  onEnd: release
          │              │            │       │
   ┌──────┴──────┐   ┌───┴───┐   ┌───┴──────┐│
   │ confirmed?  │   │confirm?│   │confirmed?││
   └──────┬──────┘   └───┬───┘   └───┬──────┘│
          │              │           │       │
      Yes │ No       Yes │ No    Yes │ No    │
          │  │           │  │        │  │    │
          ▼  └───────────┴──┴────────┴──┼────┘
      ┌──────┐                          │
      │LIKED │                     RETURNING
      └──────┘                          │
                                        │
                                   animation
                                   complete
                                        │
                                        ▼
                                     [IDLE]
```

---

## ⚠️ 흔한 실수와 해결법

### 1. 상태 전환 누락

```typescript
// ❌ RETURNING 상태에서 제스처 시작하면?
.onStart(() => {
  if (state.value === State.IDLE) { // RETURNING은?
    state.value = State.DRAGGING;
  }
})

// ✅ 모든 가능한 상태 처리
.onStart(() => {
  if (state.value === State.IDLE || state.value === State.RETURNING) {
    cancelAnimation(translateX); // 진행 중인 애니메이션 취소
    state.value = State.DRAGGING;
  }
})
```

### 2. 콜백에서 worklet 누락

```typescript
// ❌ worklet이 아닌 함수
const transition = (event: EventType) => {
  state.value = nextState; // UI 스레드에서 실행 안 됨
};

// ✅ worklet으로 선언
const transition = (event: EventType) => {
  'worklet';
  state.value = nextState;
};
```

### 3. 애니메이션 완료 전 상태 변경

```typescript
// ❌ 애니메이션 완료 기다리지 않음
translateX.value = withSpring(0);
state.value = State.IDLE; // 즉시 변경

// ✅ 콜백에서 상태 변경
translateX.value = withSpring(0, {}, (finished) => {
  if (finished) {
    state.value = State.IDLE;
  }
});
```

---

## 💡 성능 최적화 팁

### 1. 상태 비교 최적화

```typescript
// ✅ 문자열 비교보다 숫자 비교가 빠름
const StateNum = {
  IDLE: 0,
  DRAGGING: 1,
  LIKING: 2,
  // ...
} as const;

const state = useSharedValue(StateNum.IDLE);

// 비교
if (state.value === StateNum.DRAGGING) { /* ... */ }
```

### 2. 불필요한 상태 전환 방지

```typescript
const transitionTo = (nextState: CardStateType) => {
  'worklet';
  // 같은 상태면 전환하지 않음
  if (state.value === nextState) return;
  state.value = nextState;
};
```

### 3. 상태 머신 로직 분리

```typescript
// 상태 전환 로직을 별도 파일로 분리
// src/features/matching/utils/card-state-machine.ts
export const cardStateMachine = {
  transitions,
  getNextState,
  shouldSwipe,
  // ...
};
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 매칭 카드 상태 머신

```typescript
// src/features/matching/utils/card-state-machine.ts
export const MatchingCardState = {
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  LIKING: 'LIKING',
  PASSING: 'PASSING',
  MATCHED: 'MATCHED',   // 매칭 성공
  PASSED: 'PASSED',
  RETURNING: 'RETURNING',
} as const;

// 상태별 UI 설정
export const stateConfig = {
  [MatchingCardState.LIKING]: {
    overlayColor: '#4CAF50',
    overlayText: 'LIKE',
    haptic: 'light',
  },
  [MatchingCardState.PASSING]: {
    overlayColor: '#F44336',
    overlayText: 'PASS',
    haptic: 'light',
  },
  [MatchingCardState.MATCHED]: {
    overlayColor: '#E91E63',
    overlayText: 'MATCH!',
    haptic: 'success',
  },
};
```

---

## 🏋️ 연습 문제

### 연습 1: 간단한 상태 머신
IDLE → PRESSED → RELEASED 상태를 가진 버튼을 구현하세요. 각 상태에서 scale이 달라져야 합니다.

### 연습 2: 토글 상태 머신
ON ↔ OFF를 토글하는 스위치를 상태 머신으로 구현하세요. 드래그로도 토글할 수 있어야 합니다.

### 연습 3: 삭제 확인 상태 머신
IDLE → SWIPING → CONFIRMING → DELETED 상태를 가진 삭제 가능한 리스트 아이템을 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
const State = {
  IDLE: 'IDLE',
  SWIPING: 'SWIPING',
  CONFIRMING: 'CONFIRMING', // 삭제 버튼 노출 상태
  DELETING: 'DELETING',     // 삭제 애니메이션 중
  DELETED: 'DELETED',
} as const;

// CONFIRMING 상태에서 삭제 버튼 탭하면 DELETING으로
// CONFIRMING 상태에서 다른 곳 탭하면 IDLE로
```

</details>

### 연습 4: 상태 히스토리
이전 상태로 되돌아갈 수 있는 Undo 기능이 있는 상태 머신을 구현하세요.

---

## 📚 요약

### 상태 머신 구성 요소

| 구성 | 설명 | 예시 |
|-----|------|------|
| States | 가능한 상태들 | IDLE, DRAGGING, LIKED |
| Events | 트리거 동작 | DRAG_START, SWIPE_RIGHT |
| Transitions | 상태 전환 규칙 | IDLE + DRAG_START → DRAGGING |
| Actions | 전환 시 부수 효과 | 햅틱, 콜백 호출 |

### 상태 머신 체크리스트

- [ ] 모든 가능한 상태 정의
- [ ] 상태 전환 테이블 작성
- [ ] 누락된 전환 없는지 확인
- [ ] 애니메이션 완료 콜백 처리
- [ ] 개발 모드 디버깅 로깅

### 다음 장 예고

다음 장에서는 **실전: Tinder 스와이프 카드**를 구현합니다. 이 장에서 배운 상태 머신을 활용해 완전한 Tinder 스타일 카드 스와이프 UI를 처음부터 끝까지 만들어봅니다.
