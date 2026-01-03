# Chapter 5: 기본 애니메이션 함수

## 📌 개요

이 챕터에서 배울 내용:
- withTiming: 시간 기반 애니메이션
- withSpring: 스프링 물리 기반 애니메이션
- withDecay: 감속 애니메이션
- Easing 함수와 커스텀 곡선
- 각 함수의 적합한 사용 상황

**선수 지식**: Chapter 3-4 완료
**예상 학습 시간**: 50분

---

## 📖 개념 이해

### 애니메이션 함수의 역할

애니메이션 함수는 **Shared Value를 현재 값에서 목표 값으로 변화**시키는 방법을 정의합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    애니메이션 함수 개요                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   시작값 ─────────────────────────────────────────► 목표값   │
│                                                              │
│   withTiming    ════════════════►     시간 기반 (선형/곡선)  │
│                 ▔▔▔▔▔▔▔▔▔▔▔▔                                 │
│                                                              │
│   withSpring    ~~~~~~~━━━━━━━━►     스프링 물리 (탄성)     │
│                 ▔▔▔▔▔▔▔▔▔▔▔▔                                 │
│                                                              │
│   withDecay     ━━━━━━━╲            관성 (점점 느려짐)       │
│                         ╲___►                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 세 가지 기본 함수 비교

| 함수 | 특징 | 주요 용도 |
|------|------|----------|
| `withTiming` | 정확한 시간, 예측 가능 | UI 전환, 페이드 |
| `withSpring` | 자연스러운 물리, 탄성 | 버튼, 드래그, 바운스 |
| `withDecay` | 관성, 감속 | 스와이프, 플링 |

---

## 💻 withTiming

### 기본 사용법

```typescript
import { withTiming, Easing } from 'react-native-reanimated';

// 가장 기본적인 형태
opacity.value = withTiming(1);

// 옵션 지정
opacity.value = withTiming(1, {
  duration: 500,      // 지속 시간 (ms)
  easing: Easing.linear,  // 이징 함수
});

// 완료 콜백
opacity.value = withTiming(1, { duration: 500 }, (finished) => {
  'worklet';
  if (finished) {
    console.log('애니메이션 완료!');
  }
});
```

### withTiming 옵션

```typescript
interface TimingConfig {
  duration?: number;     // 기본값: 300ms
  easing?: EasingFunction;  // 기본값: Easing.inOut(Easing.quad)
  reduceMotion?: ReduceMotion;  // 접근성 설정
}
```

### Easing 함수 종류

```typescript
import { Easing } from 'react-native-reanimated';

// 기본 이징
Easing.linear        // 일정한 속도
Easing.ease          // 부드러운 가감속

// 시작/끝 가속
Easing.in(fn)        // 천천히 시작
Easing.out(fn)       // 천천히 끝남
Easing.inOut(fn)     // 천천히 시작하고 끝남

// 기본 곡선 함수
Easing.quad          // x²
Easing.cubic         // x³
Easing.poly(n)       // xⁿ

// 특수 곡선
Easing.sin           // 사인 곡선
Easing.circle        // 원형 곡선
Easing.exp           // 지수 곡선

// 바운스/백
Easing.bounce        // 바운스 효과
Easing.back(s)       // 오버슈트 후 되돌아옴
Easing.elastic(b)    // 탄성 효과

// 베지어 곡선 (커스텀)
Easing.bezier(x1, y1, x2, y2)
```

### Easing 시각화

```
시간 (t) →

Easing.linear
   ┌────────────────────────┐
   │                    ╱   │
   │                ╱       │
   │            ╱           │
   │        ╱               │
   │    ╱                   │
   └────────────────────────┘

Easing.ease (기본)
   ┌────────────────────────┐
   │                  ___── │
   │              _──       │
   │          _─            │
   │      __─               │
   │  __──                  │
   └────────────────────────┘

Easing.out(Easing.cubic)
   ┌────────────────────────┐
   │            ────────────│
   │        ──              │
   │     ─                  │
   │   ─                    │
   │ ─                      │
   └────────────────────────┘

Easing.bounce
   ┌────────────────────────┐
   │              ╭─╮ ╭╮    │
   │            ─╯  ╰─╯╰────│
   │         ──             │
   │      ──                │
   │   ──                   │
   └────────────────────────┘
```

### 실전 예제: 다양한 Easing 비교

```typescript
const EasingShowcase = () => {
  const linear = useSharedValue(0);
  const ease = useSharedValue(0);
  const bounce = useSharedValue(0);
  const elastic = useSharedValue(0);

  const animate = () => {
    const config = { duration: 1000 };

    linear.value = withTiming(200, {
      ...config,
      easing: Easing.linear,
    });

    ease.value = withTiming(200, {
      ...config,
      easing: Easing.out(Easing.cubic),
    });

    bounce.value = withTiming(200, {
      ...config,
      easing: Easing.bounce,
    });

    elastic.value = withTiming(200, {
      ...config,
      easing: Easing.elastic(2),
    });
  };

  // 각각의 animatedStyle 생성...
};
```

### 커스텀 베지어 곡선

```typescript
// CSS의 cubic-bezier와 동일
const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

// 자주 사용되는 베지어 값들
const easings = {
  // Material Design
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),

  // iOS
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),

  // Smooth
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
};

opacity.value = withTiming(1, {
  duration: 300,
  easing: easings.standard,
});
```

---

## 💻 withSpring

### 기본 사용법

```typescript
import { withSpring } from 'react-native-reanimated';

// 가장 기본적인 형태
scale.value = withSpring(1.2);

// 옵션 지정
scale.value = withSpring(1.2, {
  damping: 10,         // 감쇠 (얼마나 빨리 멈추나)
  stiffness: 100,      // 강성 (얼마나 빠르게 움직이나)
  mass: 1,             // 질량
});
```

### withSpring 옵션

```typescript
interface SpringConfig {
  // 물리 기반 파라미터
  damping?: number;      // 기본값: 10, 감쇠 계수
  mass?: number;         // 기본값: 1, 질량
  stiffness?: number;    // 기본값: 100, 스프링 강성

  // 속도 기반 파라미터
  velocity?: number;     // 초기 속도
  overshootClamping?: boolean;  // 오버슈트 방지

  // 종료 조건
  restDisplacementThreshold?: number;  // 정지 거리 임계값
  restSpeedThreshold?: number;         // 정지 속도 임계값

  // 시간 제한
  duration?: number;     // 최대 지속 시간
  reduceMotion?: ReduceMotion;
}
```

### 스프링 파라미터 이해

```
┌─────────────────────────────────────────────────────────────┐
│                    스프링 파라미터 시각화                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  damping (감쇠)                                              │
│  ─────────────                                               │
│  낮음 (2):   ~~~╱╲╱╲╱╲╱╲~~~  많이 흔들림                     │
│  중간 (10):  ~~╱╲╱╲~~        적당히 흔들림                   │
│  높음 (20):  ~╱~~            거의 안 흔들림                  │
│                                                              │
│  stiffness (강성)                                            │
│  ─────────────                                               │
│  낮음 (50):   느리게 도달, 부드러움                          │
│  높음 (200):  빠르게 도달, 날카로움                          │
│                                                              │
│  mass (질량)                                                 │
│  ─────────────                                               │
│  낮음 (0.5):  가볍게 빠르게                                  │
│  높음 (2):    무겁게 천천히                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 자주 사용되는 스프링 설정

```typescript
const springConfigs = {
  // 부드러운 (버튼, UI 요소)
  gentle: {
    damping: 15,
    stiffness: 100,
  },

  // 빠른 반응 (터치 피드백)
  snappy: {
    damping: 20,
    stiffness: 200,
  },

  // 탄성 있는 (재미있는 효과)
  bouncy: {
    damping: 8,
    stiffness: 100,
  },

  // 무거운 (모달, 시트)
  heavy: {
    damping: 20,
    stiffness: 150,
    mass: 1.5,
  },

  // 오버슈트 없음 (정밀한 위치)
  noOvershoot: {
    damping: 20,
    stiffness: 200,
    overshootClamping: true,
  },
};

// 사용
scale.value = withSpring(1.2, springConfigs.snappy);
```

### 실전 예제: 버튼 프레스

```typescript
const SpringButton = ({ children, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
```

---

## 💻 withDecay

### 기본 사용법

```typescript
import { withDecay } from 'react-native-reanimated';

// 현재 속도로부터 감속
position.value = withDecay({
  velocity: velocityFromGesture,  // 제스처에서 얻은 속도
});

// 옵션 지정
position.value = withDecay({
  velocity: 1000,
  deceleration: 0.997,  // 감속 계수 (1에 가까울수록 오래 움직임)
  clamp: [0, 300],      // 범위 제한
});
```

### withDecay 옵션

```typescript
interface DecayConfig {
  velocity: number;         // 필수: 초기 속도
  deceleration?: number;    // 기본값: 0.998, 감속률 (0-1)
  clamp?: [number, number]; // 최소/최대 범위
  velocityFactor?: number;  // 속도 배율
  rubberBandEffect?: boolean;  // 범위 초과 시 고무줄 효과
  rubberBandFactor?: number;   // 고무줄 강도
  reduceMotion?: ReduceMotion;
}
```

### Decay 동작 원리

```
속도

  │
  │╲
  │ ╲
  │  ╲
  │   ╲
  │    ╲
  │     ╲__
  │        ╲___
  │            ╲_____
  │                  ╲___________
  ├─────────────────────────────────► 시간

  deceleration = 0.998 (느린 감속, 멀리 이동)
  deceleration = 0.990 (빠른 감속, 짧게 이동)
```

### 실전 예제: 스와이프 카드

```typescript
const SwipeableCard = () => {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
    })
    .onEnd((event) => {
      // 손을 뗐을 때 현재 속도로 감속
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-200, 200],  // 범위 제한
        rubberBandEffect: true,  // 범위 초과 시 탄성
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]} />
    </GestureDetector>
  );
};
```

---

## 📊 비교

### 세 함수 비교표

| 특성 | withTiming | withSpring | withDecay |
|------|------------|------------|-----------|
| 지속 시간 지정 | ✅ 정확히 지정 | ⚠️ 추정만 가능 | ❌ 속도에 따라 |
| 자연스러움 | 중간 | ✅ 매우 자연스러움 | ✅ 자연스러움 |
| 예측 가능성 | ✅ 높음 | 중간 | 낮음 |
| 제스처 연동 | 가능 | ✅ 최적 | ✅ 필수 |
| 오버슈트 | ❌ 없음 | ✅ 있음 | ❌ 없음 |
| CPU 사용량 | 낮음 | 중간 | 낮음 |

### 언제 무엇을 사용할까?

```typescript
// ✅ withTiming 사용
// - 페이드 인/아웃
// - 정확한 시간이 필요한 전환
// - 로딩 바, 프로그레스

opacity.value = withTiming(1, { duration: 300 });
progress.value = withTiming(1, { duration: 1000 });


// ✅ withSpring 사용
// - 버튼 프레스 피드백
// - 드래그 후 스냅백
// - 토글, 스위치
// - 모달/시트 열기

scale.value = withSpring(1.1, { damping: 15 });
translateY.value = withSpring(0, { damping: 20 });


// ✅ withDecay 사용
// - 스와이프 후 관성 이동
// - 플링 제스처
// - 스크롤 관성

translateX.value = withDecay({
  velocity: gesture.velocityX,
});
```

### 조합 가능성

```typescript
// withDecay + withSpring 조합
position.value = withDecay({
  velocity: event.velocityX,
}, (finished) => {
  'worklet';
  if (finished) {
    // 감속 완료 후 원위치로 스프링
    position.value = withSpring(0);
  }
});
```

---

## ⚠️ 흔한 실수

### ❌ 실수 1: withTiming에 목표값 누락

```typescript
// ❌ 목표값 없이 옵션만 전달
opacity.value = withTiming({ duration: 500 });
// 결과: 에러 또는 예상치 못한 동작
```

### ✅ 올바른 방법

```typescript
// ✅ 첫 번째 인자는 목표값
opacity.value = withTiming(1, { duration: 500 });
```

### ❌ 실수 2: withSpring에서 duration 기대

```typescript
// ❌ duration이 정확히 지켜지지 않음
scale.value = withSpring(1, { duration: 500 });
// withSpring은 물리 기반이라 duration은 힌트일 뿐
```

### ✅ 올바른 이해

```typescript
// ✅ 정확한 시간이 필요하면 withTiming 사용
scale.value = withTiming(1, {
  duration: 500,
  easing: Easing.out(Easing.back(1.5)), // 오버슈트 효과
});

// ✅ 또는 spring 파라미터로 속도 조절
scale.value = withSpring(1, {
  stiffness: 200,  // 높을수록 빠름
  damping: 20,     // 높을수록 빨리 안정
});
```

### ❌ 실수 3: withDecay에 velocity 누락

```typescript
// ❌ velocity 없으면 움직이지 않음
position.value = withDecay({
  deceleration: 0.997,
});
```

### ✅ 올바른 방법

```typescript
// ✅ velocity 필수
position.value = withDecay({
  velocity: event.velocityX, // 제스처에서 얻은 속도
  deceleration: 0.997,
});
```

### ❌ 실수 4: 콜백에서 'worklet' 누락

```typescript
// ❌ 워크릿 지시어 없으면 에러
opacity.value = withTiming(1, { duration: 300 }, (finished) => {
  console.log('완료:', finished); // JS 스레드에서 실행 시도 → 에러
});
```

### ✅ 올바른 방법

```typescript
// ✅ 'worklet' 지시어 추가
opacity.value = withTiming(1, { duration: 300 }, (finished) => {
  'worklet';
  if (finished) {
    runOnJS(console.log)('완료!'); // JS 함수 호출 시 runOnJS 사용
  }
});
```

---

## 💡 성능 팁

### Tip 1: 적절한 spring 설정으로 빠른 수렴

```typescript
// ❌ 너무 낮은 damping - 오래 흔들림
scale.value = withSpring(1, { damping: 2 }); // 수초간 진동

// ✅ 적절한 damping
scale.value = withSpring(1, { damping: 15 }); // 빠르게 안정
```

### Tip 2: Easing 캐싱

```typescript
// ❌ 매번 새 Easing 생성
const animate = () => {
  opacity.value = withTiming(1, {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1), // 매번 생성
  });
};

// ✅ 상수로 정의
const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

const animate = () => {
  opacity.value = withTiming(1, {
    easing: SMOOTH_EASING, // 재사용
  });
};
```

### Tip 3: 불필요한 애니메이션 취소

```typescript
import { cancelAnimation } from 'react-native-reanimated';

// 새 애니메이션 시작 전 기존 것 취소
const startNewAnimation = () => {
  cancelAnimation(offset);
  offset.value = withTiming(100);
};

// 컴포넌트 언마운트 시 정리
useEffect(() => {
  return () => {
    cancelAnimation(offset);
  };
}, []);
```

---

## 🎯 실무 적용

### 패턴 1: 토스트 알림

```typescript
const Toast = ({ message, visible }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toast, animatedStyle]}>
      <Text>{message}</Text>
    </Animated.View>
  );
};
```

### 패턴 2: 탭 인디케이터

```typescript
const TabIndicator = ({ activeIndex, tabWidth }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.indicator, animatedStyle]} />
  );
};
```

### 패턴 3: 풀링 가능한 카드

```typescript
const PullableCard = () => {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // 아래로만 당길 수 있음
      const newValue = context.value.y + event.translationY;
      translateY.value = Math.max(0, newValue);
    })
    .onEnd((event) => {
      if (translateY.value > 100) {
        // 충분히 당겼으면 액션 실행 후 돌아가기
        runOnJS(handleRefresh)();
        translateY.value = withSpring(0, { damping: 15 });
      } else {
        // 원위치로 스프링 백
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>아래로 당겨서 새로고침</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

---

## 🏋️ 연습 문제

### 문제 1: 적절한 함수 선택

다음 상황에서 어떤 애니메이션 함수를 사용해야 할까요?

1. 버튼을 누르면 살짝 축소되었다가 돌아오는 효과
2. 스플래시 화면이 1.5초 후에 사라지는 페이드 아웃
3. 사용자가 카드를 던지면 관성으로 날아가는 효과
4. 모달이 아래에서 올라오는 애니메이션

<details>
<summary>✅ 해답</summary>

1. **withSpring** - 탄성 있는 자연스러운 피드백
2. **withTiming** - 정확한 시간(1.5초) 제어 필요
3. **withDecay** - 관성 기반 움직임
4. **withSpring** - 자연스럽게 열리는 느낌 (또는 withTiming + Easing.out)

</details>

### 문제 2: 스프링 설정

부드러우면서도 빠르게 반응하는 버튼 피드백을 위한 스프링 설정을 작성하세요.

<details>
<summary>✅ 해답</summary>

```typescript
const handlePressIn = () => {
  scale.value = withSpring(0.95, {
    damping: 20,      // 높은 감쇠로 빠르게 안정
    stiffness: 300,   // 높은 강성으로 빠른 반응
  });
};

const handlePressOut = () => {
  scale.value = withSpring(1, {
    damping: 15,      // 약간 낮은 감쇠로 살짝 바운스
    stiffness: 200,   // 중간 강성
  });
};
```

</details>

### 문제 3: Easing 적용

Material Design의 표준 이징(`0.4, 0.0, 0.2, 1`)을 사용하여 300ms 동안 페이드인하는 코드를 작성하세요.

<details>
<summary>✅ 해답</summary>

```typescript
import { Easing, withTiming } from 'react-native-reanimated';

const materialStandardEasing = Easing.bezier(0.4, 0.0, 0.2, 1);

const fadeIn = () => {
  opacity.value = withTiming(1, {
    duration: 300,
    easing: materialStandardEasing,
  });
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **withTiming**: 정확한 시간 제어, Easing으로 곡선 커스터마이징
- **withSpring**: 물리 기반 자연스러움, damping/stiffness로 느낌 조절
- **withDecay**: 관성 기반 감속, 제스처 종료 후 사용
- **Easing 함수**: linear, ease, bounce, elastic, bezier 등 다양한 곡선
- **선택 기준**: 시간 정확도 필요 → withTiming, 자연스러움 → withSpring, 관성 → withDecay
- **콜백**: 반드시 `'worklet'` 지시어 필요

**다음 챕터**: 애니메이션 수정자 - withSequence, withDelay, withRepeat로 복잡한 애니메이션을 조합합니다.
