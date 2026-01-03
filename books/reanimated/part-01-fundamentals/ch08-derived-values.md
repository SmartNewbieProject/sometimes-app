# Chapter 8: useDerivedValue와 반응형 값

## 📌 개요

이 챕터에서 배울 내용:
- useDerivedValue의 개념과 역할
- Shared Value로부터 파생 값 계산
- useAnimatedReaction과의 차이
- 복잡한 계산 로직 분리
- 성능 최적화 패턴

**선수 지식**: Chapter 3-7 완료
**예상 학습 시간**: 35분

---

## 📖 개념 이해

### useDerivedValue란?

`useDerivedValue`는 **다른 Shared Value로부터 계산된 새로운 Shared Value**를 생성합니다. 원본 값이 변경될 때마다 자동으로 재계산됩니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    useDerivedValue 개념                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   원본 Shared Value                                          │
│   ┌─────────────┐                                            │
│   │ progress    │ ─── 0.5                                    │
│   │ .value      │                                            │
│   └─────────────┘                                            │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────────────────────────┐                       │
│   │ useDerivedValue(() => {         │                       │
│   │   return progress.value * 100;  │  ◄─ UI 스레드에서 실행 │
│   │ })                              │                       │
│   └─────────────────────────────────┘                       │
│          │                                                   │
│          ▼                                                   │
│   파생 Shared Value                                          │
│   ┌─────────────┐                                            │
│   │ percentage  │ ─── 50                                     │
│   │ .value      │                                            │
│   └─────────────┘                                            │
│                                                              │
│   progress.value = 0.7 → percentage.value = 70 (자동 업데이트)│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 왜 useDerivedValue를 사용하는가?

#### 1. 계산 로직 분리

```typescript
// ❌ useAnimatedStyle 내에서 복잡한 계산
const animatedStyle = useAnimatedStyle(() => {
  const rotationDeg = progress.value * 360;
  const scale = 0.5 + progress.value * 0.5;
  const opacity = Math.min(progress.value * 2, 1);
  const translateX = Math.sin(progress.value * Math.PI) * 100;

  return {
    opacity,
    transform: [
      { rotate: `${rotationDeg}deg` },
      { scale },
      { translateX },
    ],
  };
});

// ✅ useDerivedValue로 분리
const rotationDeg = useDerivedValue(() => progress.value * 360);
const scale = useDerivedValue(() => 0.5 + progress.value * 0.5);
const opacity = useDerivedValue(() => Math.min(progress.value * 2, 1));
const translateX = useDerivedValue(() =>
  Math.sin(progress.value * Math.PI) * 100
);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [
    { rotate: `${rotationDeg.value}deg` },
    { scale: scale.value },
    { translateX: translateX.value },
  ],
}));
```

#### 2. 값 재사용

```typescript
// 하나의 파생 값을 여러 곳에서 사용
const isActive = useDerivedValue(() => progress.value > 0.5);

const boxStyle = useAnimatedStyle(() => ({
  backgroundColor: isActive.value ? '#4CAF50' : '#9E9E9E',
}));

const textStyle = useAnimatedStyle(() => ({
  color: isActive.value ? 'white' : 'black',
}));

const iconStyle = useAnimatedStyle(() => ({
  opacity: isActive.value ? 1 : 0.5,
}));
```

---

## 💻 코드 예제

### 기본 사용법

```typescript
import {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const BasicDerivedValue = () => {
  const progress = useSharedValue(0);

  // 파생 값 생성
  const percentage = useDerivedValue(() => {
    return Math.round(progress.value * 100);
  });

  const displayText = useDerivedValue(() => {
    return `${percentage.value}%`;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${percentage.value}%`,
  }));

  const animate = () => {
    progress.value = withTiming(progress.value === 0 ? 1 : 0, {
      duration: 1000,
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
      <Button title="애니메이션" onPress={animate} />
    </View>
  );
};
```

### 복잡한 계산

```typescript
const ComplexCalculation = () => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // 거리 계산
  const distance = useDerivedValue(() => {
    return Math.sqrt(x.value ** 2 + y.value ** 2);
  });

  // 각도 계산
  const angle = useDerivedValue(() => {
    return Math.atan2(y.value, x.value) * (180 / Math.PI);
  });

  // 거리 기반 스케일
  const scale = useDerivedValue(() => {
    const maxDistance = 200;
    const normalizedDistance = Math.min(distance.value / maxDistance, 1);
    return 1 + normalizedDistance * 0.5;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${angle.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
};
```

### interpolate와 함께

```typescript
import { interpolate, Extrapolation } from 'react-native-reanimated';

const InterpolatedValues = () => {
  const scrollY = useSharedValue(0);

  // 헤더 높이 (100 → 60)
  const headerHeight = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, 100],
      [100, 60],
      Extrapolation.CLAMP
    );
  });

  // 헤더 투명도 (1 → 0.8)
  const headerOpacity = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.8],
      Extrapolation.CLAMP
    );
  });

  // 타이틀 크기 (24 → 18)
  const titleSize = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, 100],
      [24, 18],
      Extrapolation.CLAMP
    );
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
    opacity: headerOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: titleSize.value,
  }));

  return (
    <View>
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.Text style={[styles.title, titleStyle]}>
          제목
        </Animated.Text>
      </Animated.View>
    </View>
  );
};
```

### 조건부 값

```typescript
const ConditionalDerived = () => {
  const progress = useSharedValue(0);

  // 단계 계산 (0, 1, 2, 3)
  const step = useDerivedValue(() => {
    if (progress.value < 0.25) return 0;
    if (progress.value < 0.5) return 1;
    if (progress.value < 0.75) return 2;
    return 3;
  });

  // 단계별 색상
  const color = useDerivedValue(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    return colors[step.value];
  });

  // 단계별 라벨
  const label = useDerivedValue(() => {
    const labels = ['시작', '진행중', '거의 완료', '완료!'];
    return labels[step.value];
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* 라벨 표시는 별도 처리 필요 */}
    </Animated.View>
  );
};
```

---

## 📊 비교

### useDerivedValue vs 직접 계산

| 항목 | useDerivedValue | 직접 계산 |
|------|-----------------|----------|
| 재사용성 | ✅ 여러 곳에서 사용 가능 | ❌ 매번 재계산 |
| 가독성 | ✅ 로직 분리로 깔끔 | ⚠️ 복잡해질 수 있음 |
| 메모이제이션 | ✅ 값 변경 시에만 재계산 | ⚠️ 매 프레임 재계산 가능 |
| 디버깅 | ✅ 중간 값 확인 용이 | ⚠️ 어려움 |

### useDerivedValue vs useAnimatedReaction

```typescript
// useDerivedValue: 값을 반환
const scale = useDerivedValue(() => {
  return 1 + progress.value * 0.5;
});

// useAnimatedReaction: 부수 효과 (Side Effect)
useAnimatedReaction(
  () => progress.value,
  (current, previous) => {
    if (current > 0.5 && previous <= 0.5) {
      // 0.5를 넘었을 때 뭔가 실행
      runOnJS(playSound)();
    }
  }
);
```

| 항목 | useDerivedValue | useAnimatedReaction |
|------|-----------------|-------------------|
| 용도 | 값 계산 | 부수 효과 실행 |
| 반환값 | SharedValue | 없음 (void) |
| 콜백 인자 | 없음 | (current, previous) |
| 사용 예 | 변환, 계산 | 트리거, 알림 |

---

## ⚠️ 흔한 실수

### ❌ 실수 1: .value 누락

```typescript
// ❌ .value 없이 사용
const double = useDerivedValue(() => {
  return progress * 2;  // progress는 SharedValue 객체!
});
```

### ✅ 올바른 방법

```typescript
// ✅ .value로 접근
const double = useDerivedValue(() => {
  return progress.value * 2;
});
```

### ❌ 실수 2: 비동기 작업 시도

```typescript
// ❌ 워크릿에서 비동기 불가
const asyncValue = useDerivedValue(async () => {
  const data = await fetchData();
  return data.value;
});
```

### ✅ 올바른 방법

```typescript
// ✅ 비동기 결과는 별도 Shared Value로
const fetchedData = useSharedValue(0);

useEffect(() => {
  fetchData().then((data) => {
    fetchedData.value = data.value;
  });
}, []);

const derivedValue = useDerivedValue(() => {
  return fetchedData.value * 2;
});
```

### ❌ 실수 3: 무거운 계산을 매 프레임 실행

```typescript
// ❌ 복잡한 배열 연산
const complexValue = useDerivedValue(() => {
  return items.value
    .map(item => item.value * 2)
    .filter(v => v > 10)
    .reduce((a, b) => a + b, 0);
});
```

### ✅ 올바른 방법

```typescript
// ✅ 필요한 경우 JS 스레드에서 처리
const [result, setResult] = useState(0);

useAnimatedReaction(
  () => items.value,
  (current) => {
    runOnJS(calculateComplex)(current);
  }
);

const calculateComplex = (items) => {
  const result = items
    .map(item => item * 2)
    .filter(v => v > 10)
    .reduce((a, b) => a + b, 0);
  setResult(result);
};
```

### ❌ 실수 4: 순환 의존성

```typescript
// ❌ A가 B에 의존하고, B가 A에 의존
const valueA = useDerivedValue(() => valueB.value + 1);
const valueB = useDerivedValue(() => valueA.value - 1);
// 무한 루프 또는 예측 불가능한 동작!
```

### ✅ 올바른 방법

```typescript
// ✅ 단방향 의존성
const baseValue = useSharedValue(0);
const derivedA = useDerivedValue(() => baseValue.value + 1);
const derivedB = useDerivedValue(() => baseValue.value - 1);
```

---

## 💡 성능 팁

### Tip 1: 관련 계산 그룹화

```typescript
// ❌ 비슷한 계산을 여러 번
const sin = useDerivedValue(() => Math.sin(angle.value));
const cos = useDerivedValue(() => Math.cos(angle.value));
const tan = useDerivedValue(() => Math.tan(angle.value));

// ✅ 객체로 그룹화
const trigValues = useDerivedValue(() => ({
  sin: Math.sin(angle.value),
  cos: Math.cos(angle.value),
  tan: Math.tan(angle.value),
}));

// 사용
const x = trigValues.value.cos * radius;
const y = trigValues.value.sin * radius;
```

### Tip 2: 불필요한 의존성 제거

```typescript
// ❌ 사용하지 않는 값에도 의존
const result = useDerivedValue(() => {
  const unused = otherValue.value; // 사용 안 함
  return progress.value * 100;
});

// ✅ 필요한 값만 접근
const result = useDerivedValue(() => {
  return progress.value * 100;
});
```

### Tip 3: interpolate 활용

```typescript
// ❌ 조건문으로 구간 분리
const opacity = useDerivedValue(() => {
  if (progress.value < 0.3) {
    return progress.value / 0.3;
  } else if (progress.value < 0.7) {
    return 1;
  } else {
    return 1 - (progress.value - 0.7) / 0.3;
  }
});

// ✅ interpolate로 간결하게
const opacity = useDerivedValue(() => {
  return interpolate(
    progress.value,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0],
    Extrapolation.CLAMP
  );
});
```

---

## 🎯 실무 적용

### 패턴 1: 스크롤 기반 헤더

```typescript
const ScrollHeader = () => {
  const scrollY = useSharedValue(0);

  const headerHeight = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 100], [120, 60], Extrapolation.CLAMP)
  );

  const titleOpacity = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP)
  );

  const subtitleOpacity = useDerivedValue(() =>
    interpolate(scrollY.value, [30, 80], [1, 0], Extrapolation.CLAMP)
  );

  const avatarScale = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 100], [1, 0.6], Extrapolation.CLAMP)
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.Image
          source={avatar}
          style={[styles.avatar, avatarStyle]}
        />
        <Animated.Text style={[styles.title, titleStyle]}>
          프로필
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          안녕하세요!
        </Animated.Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* 콘텐츠 */}
      </Animated.ScrollView>
    </View>
  );
};
```

### 패턴 2: 드래그 위치 기반 UI

```typescript
const DragIndicator = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 드래그 거리
  const distance = useDerivedValue(() => {
    return Math.sqrt(
      translateX.value ** 2 + translateY.value ** 2
    );
  });

  // 드래그 방향 (각도)
  const direction = useDerivedValue(() => {
    return Math.atan2(translateY.value, translateX.value) * (180 / Math.PI);
  });

  // 거리에 따른 시각적 피드백
  const feedbackScale = useDerivedValue(() => {
    const maxDistance = 150;
    return 1 + Math.min(distance.value / maxDistance, 1) * 0.2;
  });

  const feedbackOpacity = useDerivedValue(() => {
    return interpolate(distance.value, [0, 50, 150], [0.5, 0.8, 1]);
  });

  // 드래그 상태에 따른 색상
  const backgroundColor = useDerivedValue(() => {
    if (distance.value > 100) {
      return '#4CAF50'; // 활성화
    } else if (distance.value > 50) {
      return '#FFC107'; // 경고
    }
    return '#7A4AE2'; // 기본
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: feedbackScale.value },
    ],
    opacity: feedbackOpacity.value,
    backgroundColor: backgroundColor.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.indicator, animatedStyle]} />
    </GestureDetector>
  );
};
```

### 패턴 3: 멀티 스텝 진행률

```typescript
const MultiStepProgress = ({ currentStep, totalSteps }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(currentStep / totalSteps);
  }, [currentStep, totalSteps]);

  // 각 단계별 값
  const steps = Array.from({ length: totalSteps }, (_, i) => {
    return useDerivedValue(() => {
      const stepProgress = (i + 1) / totalSteps;
      if (progress.value >= stepProgress) {
        return 1; // 완료
      } else if (progress.value >= (i / totalSteps)) {
        // 현재 진행 중
        const stepRange = 1 / totalSteps;
        const currentInStep = progress.value - (i / totalSteps);
        return currentInStep / stepRange;
      }
      return 0; // 미시작
    });
  });

  return (
    <View style={styles.stepsContainer}>
      {steps.map((stepProgress, index) => {
        const stepStyle = useAnimatedStyle(() => ({
          backgroundColor: interpolateColor(
            stepProgress.value,
            [0, 1],
            ['#E0E0E0', '#7A4AE2']
          ),
          transform: [{ scale: stepProgress.value > 0 ? 1 : 0.8 }],
        }));

        const fillStyle = useAnimatedStyle(() => ({
          width: `${stepProgress.value * 100}%`,
        }));

        return (
          <View key={index} style={styles.stepWrapper}>
            <Animated.View style={[styles.step, stepStyle]}>
              <Animated.View style={[styles.stepFill, fillStyle]} />
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
};
```

---

## 🏋️ 연습 문제

### 문제 1: 온도 변환기

섭씨 온도 Shared Value로부터 화씨, 켈빈을 계산하는 파생 값을 만드세요.
- 화씨 = 섭씨 × 9/5 + 32
- 켈빈 = 섭씨 + 273.15

<details>
<summary>✅ 해답</summary>

```typescript
const TemperatureConverter = () => {
  const celsius = useSharedValue(25);

  const fahrenheit = useDerivedValue(() => {
    return celsius.value * (9 / 5) + 32;
  });

  const kelvin = useDerivedValue(() => {
    return celsius.value + 273.15;
  });

  const fahrenheitStyle = useAnimatedStyle(() => ({
    // 화씨 기반 색상 (추움 → 더움)
    backgroundColor: interpolateColor(
      fahrenheit.value,
      [32, 68, 100],
      ['#4FC3F7', '#81C784', '#EF5350']
    ),
  }));

  return (
    <View>
      <Animated.View style={[styles.tempCard, fahrenheitStyle]} />
    </View>
  );
};
```

</details>

### 문제 2: 스크롤 진행률

스크롤 위치를 0~1 사이의 진행률로 변환하고, 이를 바탕으로:
- 프로그레스 바 너비 (0% ~ 100%)
- 배경색 (회색 → 보라색)
- 텍스트 ("시작" → "진행 중" → "완료")

<details>
<summary>✅ 해답</summary>

```typescript
const ScrollProgress = ({ contentHeight, viewportHeight }) => {
  const scrollY = useSharedValue(0);

  const maxScroll = contentHeight - viewportHeight;

  const progress = useDerivedValue(() => {
    return Math.min(Math.max(scrollY.value / maxScroll, 0), 1);
  });

  const progressWidth = useDerivedValue(() => {
    return `${progress.value * 100}%`;
  });

  const progressColor = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#9E9E9E', '#7A4AE2', '#4CAF50']
    );
  });

  const status = useDerivedValue(() => {
    if (progress.value < 0.1) return 0;      // 시작
    if (progress.value < 0.9) return 1;      // 진행 중
    return 2;                                 // 완료
  });

  const barStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
    backgroundColor: progressColor.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, barStyle]} />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* 콘텐츠 */}
      </Animated.ScrollView>
    </View>
  );
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **useDerivedValue**는 다른 Shared Value로부터 **새로운 값을 계산**
- 원본 값 변경 시 **자동으로 재계산**
- **복잡한 계산 로직을 분리**하여 가독성과 재사용성 향상
- **interpolate**와 함께 사용하면 더욱 강력
- **순환 의존성 주의** - 단방향 의존성 유지
- **무거운 계산**은 JS 스레드로 분리 고려

---

## 🎉 Part 1 완료!

축하합니다! Part 1 "기초 다지기"를 모두 완료했습니다.

### Part 1에서 배운 내용 정리

| 챕터 | 핵심 개념 |
|------|----------|
| Ch.1 | Reanimated 소개, 아키텍처, 워크릿 |
| Ch.2 | 설치 및 환경 설정, Babel 플러그인 |
| Ch.3 | Shared Values - JS/UI 스레드 공유 값 |
| Ch.4 | useAnimatedStyle - 값 → 스타일 변환 |
| Ch.5 | withTiming, withSpring, withDecay |
| Ch.6 | withSequence, withDelay, withRepeat |
| Ch.7 | useAnimatedProps - 스타일 외 props 애니메이션 |
| Ch.8 | useDerivedValue - 파생 값 계산 |

### 다음 Part 미리보기

**Part 2: 제스처 마스터**에서는:
- react-native-gesture-handler 통합
- Tap, Pan, Pinch, Rotation 제스처
- 복합 제스처 구현
- Tinder 스와이프 카드 실전 프로젝트
- 드래그 앤 드롭 리스트 구현

을 배우게 됩니다!
