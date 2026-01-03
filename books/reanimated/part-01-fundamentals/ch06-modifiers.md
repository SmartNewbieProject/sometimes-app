# Chapter 6: 애니메이션 수정자

## 📌 개요

이 챕터에서 배울 내용:
- withSequence: 순차적 애니메이션
- withDelay: 지연 애니메이션
- withRepeat: 반복 애니메이션
- 수정자 조합으로 복잡한 효과 만들기
- 실무에서 자주 사용하는 패턴

**선수 지식**: Chapter 5 (기본 애니메이션 함수) 완료
**예상 학습 시간**: 40분

---

## 📖 개념 이해

### 애니메이션 수정자란?

수정자(Modifier)는 **기본 애니메이션을 감싸서 동작을 변형**하는 함수입니다. 순차 실행, 지연, 반복 등의 고급 동작을 쉽게 구현할 수 있습니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    애니메이션 수정자 구조                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   기본 애니메이션                                             │
│   withTiming(value, config)                                  │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │ withDelay   │ ── │ withSequence│ ── │ withRepeat  │     │
│   │ (지연)      │    │ (순차)      │    │ (반복)      │     │
│   └─────────────┘    └─────────────┘    └─────────────┘     │
│        │                                                     │
│        ▼                                                     │
│   복합 애니메이션                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 수정자 종류

| 수정자 | 역할 | 사용 예 |
|--------|------|---------|
| `withSequence` | 순차 실행 | A → B → C |
| `withDelay` | 시작 지연 | 500ms 후 시작 |
| `withRepeat` | 반복 실행 | 3회 반복, 무한 반복 |

---

## 💻 withSequence

### 기본 사용법

```typescript
import { withSequence, withTiming } from 'react-native-reanimated';

// 순차적으로 실행
scale.value = withSequence(
  withTiming(1.2, { duration: 200 }),  // 1단계: 확대
  withTiming(0.9, { duration: 150 }),  // 2단계: 축소
  withTiming(1, { duration: 100 })     // 3단계: 원래 크기
);
```

### 동작 시각화

```
withSequence(A, B, C) 실행 흐름:

값
 │
 │         ┌──B──┐
 │    ┌──A─┤     │
 │    │    │     └──C──────────────
 │────┴────┴────────────────────────► 시간
     200ms  150ms  100ms
     ◄────►◄────►◄────►
```

### 실전 예제: 쉐이크 애니메이션

```typescript
const ShakeButton = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return (
    <Pressable onPress={shake}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text>눌러서 흔들기</Text>
      </Animated.View>
    </Pressable>
  );
};
```

### 다양한 애니메이션 조합

```typescript
// withSpring과 조합
scale.value = withSequence(
  withSpring(1.3, { damping: 10 }),
  withSpring(1, { damping: 15 })
);

// 색상 변화 시퀀스
backgroundColor.value = withSequence(
  withTiming('#FF0000', { duration: 300 }),
  withTiming('#00FF00', { duration: 300 }),
  withTiming('#0000FF', { duration: 300 }),
  withTiming('#7A4AE2', { duration: 300 })
);
```

---

## 💻 withDelay

### 기본 사용법

```typescript
import { withDelay, withTiming } from 'react-native-reanimated';

// 500ms 후에 애니메이션 시작
opacity.value = withDelay(
  500,  // 지연 시간 (ms)
  withTiming(1, { duration: 300 })
);
```

### 동작 시각화

```
withDelay(500, animation) 실행 흐름:

값
 │
 │                    ┌───────────
 │                   ╱
 │                  ╱
 │─────────────────╱──────────────► 시간
 │◄──── 500ms ────►◄─ animation ─►
     (대기)           (실행)
```

### Stagger 효과 (순차 등장)

```typescript
const StaggeredList = ({ items }) => {
  return (
    <View>
      {items.map((item, index) => (
        <StaggeredItem
          key={item.id}
          item={item}
          index={index}
        />
      ))}
    </View>
  );
};

const StaggeredItem = ({ item, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // 각 아이템에 100ms씩 지연 추가
    const delay = index * 100;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300 })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Text>{item.title}</Text>
    </Animated.View>
  );
};
```

### 시각화: Stagger 효과

```
아이템 등장 타이밍:

Item 0: ████████
Item 1:   ████████
Item 2:     ████████
Item 3:       ████████
Item 4:         ████████
        ─────────────────────► 시간
        0   100 200 300 400ms
```

---

## 💻 withRepeat

### 기본 사용법

```typescript
import { withRepeat, withTiming } from 'react-native-reanimated';

// 3회 반복
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  3  // 반복 횟수
);

// 무한 반복
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1  // -1 = 무한
);

// 반전 반복 (yoyo)
scale.value = withRepeat(
  withTiming(1.5, { duration: 500 }),
  -1,   // 무한
  true  // reverse = true (왕복)
);
```

### 옵션 설명

```typescript
withRepeat(
  animation,    // 반복할 애니메이션
  numberOfReps, // 반복 횟수 (-1 = 무한)
  reverse,      // true면 왕복 (yoyo)
  callback      // 완료 콜백
);
```

### 동작 시각화

```
withRepeat(animation, 3, false):  // 단방향 3회

값
 │  ╱│  ╱│  ╱│
 │ ╱ │ ╱ │ ╱ │
 │╱  │╱  │╱  │
 ├───┴───┴───┴───────────────► 시간
   1회   2회   3회


withRepeat(animation, -1, true):  // 왕복 무한

값
 │  ╱╲  ╱╲  ╱╲  ╱╲
 │ ╱  ╲╱  ╲╱  ╲╱  ╲...
 │╱
 ├───────────────────────────► 시간
```

### 실전 예제: 로딩 스피너

```typescript
const LoadingSpinner = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,    // 무한 반복
      false  // 단방향
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinner, animatedStyle]} />
  );
};
```

### 실전 예제: 펄스 효과

```typescript
const PulsingDot = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 크기: 1 → 1.3 → 1 반복
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );

    // 투명도: 1 → 0.5 → 1 반복
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};
```

---

## 📊 수정자 조합

### 중첩 사용

```typescript
// 지연 후 반복
opacity.value = withDelay(
  1000,
  withRepeat(
    withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.3, { duration: 300 })
    ),
    -1,
    false
  )
);
```

### 복잡한 조합 예제

```typescript
// 하트 비트 효과
const heartBeat = () => {
  scale.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 0 }),      // 시작점
      withTiming(1.2, { duration: 100 }),  // 첫 번째 박동
      withTiming(1, { duration: 100 }),    // 돌아옴
      withTiming(1.3, { duration: 100 }),  // 두 번째 박동 (더 큼)
      withTiming(1, { duration: 200 }),    // 돌아옴
      withDelay(400, withTiming(1))        // 휴식
    ),
    -1,
    false
  );
};
```

### 조합 시각화

```
하트비트 시퀀스:

scale
  │     ╱╲
  │    ╱  ╲   ╱╲
1.3│   │   ╲ ╱  ╲
1.2│   ╱    ╳    ╲
1.0├──╱─────╲─────╲────────────────────────►
  │  100 100 100 200     400ms
     ◄─────────────────────►
              1 사이클
```

---

## ⚠️ 흔한 실수

### ❌ 실수 1: withRepeat 중지 안 함

```typescript
// ❌ 무한 반복 애니메이션이 계속 실행됨
useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000 }),
    -1
  );
  // cleanup 없음!
}, []);
```

### ✅ 올바른 방법

```typescript
// ✅ 언마운트 시 애니메이션 정리
useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000 }),
    -1
  );

  return () => {
    cancelAnimation(rotation);
  };
}, []);
```

### ❌ 실수 2: withSequence 빈 배열

```typescript
// ❌ 애니메이션 없음
scale.value = withSequence();
```

### ✅ 올바른 방법

```typescript
// ✅ 최소 하나의 애니메이션 필요
scale.value = withSequence(
  withTiming(1.2, { duration: 200 }),
  withTiming(1, { duration: 200 })
);
```

### ❌ 실수 3: withDelay에 음수 값

```typescript
// ❌ 음수 지연은 의미 없음
opacity.value = withDelay(-100, withTiming(1));
```

### ✅ 올바른 방법

```typescript
// ✅ 0 이상의 지연 사용
opacity.value = withDelay(0, withTiming(1)); // 즉시 시작
opacity.value = withTiming(1); // 또는 그냥 이렇게
```

### ❌ 실수 4: reverse를 withSequence에 잘못 적용

```typescript
// ❌ 의도한 대로 동작하지 않을 수 있음
scale.value = withRepeat(
  withSequence(
    withTiming(0.8),
    withTiming(1.2),
    withTiming(1)
  ),
  -1,
  true  // 이렇게 하면 전체 시퀀스가 역방향으로 재생
);
```

### ✅ 올바른 이해

```typescript
// reverse = true 일 때:
// 1회: 0.8 → 1.2 → 1
// 2회: 1 → 1.2 → 0.8 (역방향)
// 3회: 0.8 → 1.2 → 1
// ...

// 단순 왕복을 원하면:
scale.value = withRepeat(
  withTiming(1.2),
  -1,
  true  // 1 → 1.2 → 1 → 1.2 → ...
);
```

---

## 💡 성능 팁

### Tip 1: 무한 반복은 필요할 때만

```typescript
// ❌ 화면에 없는데 계속 애니메이션
const AlwaysSpinning = () => {
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360), -1);
  }, []);
};

// ✅ 조건부 애니메이션
const ConditionalSpinner = ({ isLoading }) => {
  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(withTiming(360), -1);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }

    return () => cancelAnimation(rotation);
  }, [isLoading]);
};
```

### Tip 2: 복잡한 시퀀스는 함수로 분리

```typescript
// ❌ 인라인으로 복잡한 시퀀스
const animate = () => {
  opacity.value = withDelay(100,
    withRepeat(
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(100, withTiming(0.5, { duration: 200 })),
        withTiming(1, { duration: 200 })
      ),
      3
    )
  );
};

// ✅ 재사용 가능한 함수로 분리
const createBlinkAnimation = (times = 3) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0.5, { duration: 200 })
    ),
    times,
    false
  );
};

const animate = () => {
  opacity.value = withDelay(100, createBlinkAnimation(3));
};
```

### Tip 3: 콜백 활용한 상태 동기화

```typescript
const AnimatedProgress = ({ onComplete }) => {
  const progress = useSharedValue(0);

  const animate = () => {
    progress.value = withSequence(
      withTiming(0.5, { duration: 500 }),
      withTiming(1, { duration: 500 }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(onComplete)(); // JS 함수 호출
        }
      })
    );
  };
};
```

---

## 🎯 실무 적용

### 패턴 1: 성공/실패 피드백

```typescript
const FeedbackButton = () => {
  const backgroundColor = useSharedValue('#7A4AE2');
  const scale = useSharedValue(1);

  const showSuccess = () => {
    backgroundColor.value = withSequence(
      withTiming('#4CAF50', { duration: 200 }),
      withDelay(1000, withTiming('#7A4AE2', { duration: 300 }))
    );
    scale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );
  };

  const showError = () => {
    backgroundColor.value = withSequence(
      withTiming('#F44336', { duration: 200 }),
      withDelay(1000, withTiming('#7A4AE2', { duration: 300 }))
    );
    // 쉐이크 효과
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  };
};
```

### 패턴 2: 타이핑 인디케이터

```typescript
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dot: SharedValue<number>, delay: number) => {
      dot.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        )
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    return () => {
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
    };
  }, []);

  const createDotStyle = (dot: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: dot.value }],
    }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, createDotStyle(dot1)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot2)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot3)]} />
    </View>
  );
};
```

### 패턴 3: 카운트다운 애니메이션

```typescript
const Countdown = ({ from, onComplete }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count > 0) {
      // 숫자가 커졌다가 사라지는 효과
      scale.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1.5, { duration: 400 }),
        withTiming(1.2, { duration: 200 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 200 }, (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setCount)(count - 1);
          }
        })
      );
    } else {
      onComplete?.();
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (count === 0) return null;

  return (
    <Animated.Text style={[styles.countText, animatedStyle]}>
      {count}
    </Animated.Text>
  );
};
```

---

## 🏋️ 연습 문제

### 문제 1: 깜빡이는 커서

텍스트 편집기의 깜빡이는 커서 애니메이션을 구현하세요.
- 0.5초 동안 보이고
- 0.5초 동안 숨김
- 무한 반복

<details>
<summary>✅ 해답</summary>

```typescript
const BlinkingCursor = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    );

    return () => cancelAnimation(opacity);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cursor, animatedStyle]} />
  );
};
```

</details>

### 문제 2: 순차 등장 버튼들

3개의 버튼이 200ms 간격으로 순차적으로 아래에서 위로 나타나는 애니메이션을 구현하세요.

<details>
<summary>✅ 해답</summary>

```typescript
const StaggeredButtons = () => {
  const buttons = ['버튼 1', '버튼 2', '버튼 3'];
  const opacities = buttons.map(() => useSharedValue(0));
  const translateYs = buttons.map(() => useSharedValue(30));

  useEffect(() => {
    buttons.forEach((_, index) => {
      const delay = index * 200;

      opacities[index].value = withDelay(
        delay,
        withTiming(1, { duration: 300 })
      );

      translateYs[index].value = withDelay(
        delay,
        withSpring(0, { damping: 15 })
      );
    });
  }, []);

  return (
    <View>
      {buttons.map((text, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacities[index].value,
          transform: [{ translateY: translateYs[index].value }],
        }));

        return (
          <Animated.View key={index} style={[styles.button, animatedStyle]}>
            <Text>{text}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};
```

</details>

### 문제 3: 알림 벨 흔들기

알림 아이콘을 눌렀을 때 좌우로 흔들리는 효과를 구현하세요.
- 좌우 15도씩 3회 왕복
- 스프링 느낌으로 자연스럽게 멈춤

<details>
<summary>✅ 해답</summary>

```typescript
const NotificationBell = () => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const shake = () => {
    rotation.value = withSequence(
      withTiming(-15, { duration: 50 }),
      withRepeat(
        withTiming(15, { duration: 100 }),
        5, // 2.5 왕복 = 5회
        true
      ),
      withSpring(0, { damping: 10 })
    );
  };

  return (
    <Pressable onPress={shake}>
      <Animated.View style={animatedStyle}>
        <BellIcon />
      </Animated.View>
    </Pressable>
  );
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **withSequence**: 애니메이션을 **순차적으로 실행** (A → B → C)
- **withDelay**: 애니메이션 **시작을 지연** (Stagger 효과에 유용)
- **withRepeat**: 애니메이션을 **반복** (-1은 무한, reverse로 왕복)
- 수정자들은 **중첩하여 조합** 가능
- 무한 반복 시 반드시 **cleanup에서 cancelAnimation** 호출
- 복잡한 시퀀스는 **별도 함수로 분리**하면 재사용 및 관리 용이

**다음 챕터**: useAnimatedProps와 네이티브 속성 - 스타일 외의 props를 애니메이션하는 방법을 배웁니다.
