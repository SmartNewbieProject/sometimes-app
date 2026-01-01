# Chapter 4: useAnimatedStyle 마스터하기

## 📌 개요

이 챕터에서 배울 내용:
- useAnimatedStyle의 동작 원리
- 다양한 스타일 속성 애니메이션
- 조건부 스타일과 분기 처리
- 성능 최적화와 베스트 프랙티스
- 복잡한 transform 조합

**선수 지식**: Chapter 3 (Shared Values) 완료
**예상 학습 시간**: 45분

---

## 📖 개념 이해

### useAnimatedStyle이란?

`useAnimatedStyle`은 **Shared Value의 변화를 스타일 객체로 변환**하는 훅입니다. 이 훅 내부의 콜백은 **UI 스레드에서 실행**되어 60fps 애니메이션을 가능하게 합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                   useAnimatedStyle 동작 흐름                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Shared Value 변경                                          │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────┐               │
│   │  useAnimatedStyle(() => {               │               │
│   │    return {                             │  ◄─ UI 스레드 │
│   │      opacity: opacity.value,            │     에서 실행  │
│   │    };                                   │               │
│   │  });                                    │               │
│   └─────────────────────────────────────────┘               │
│        │                                                     │
│        ▼                                                     │
│   스타일 객체 반환                                            │
│        │                                                     │
│        ▼                                                     │
│   Animated.View에 즉시 적용                                   │
│        │                                                     │
│        ▼                                                     │
│   화면 렌더링 (16ms 이내)                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 특징

#### 1. 자동 워크릿 변환

콜백 함수는 자동으로 **워크릿(Worklet)**으로 변환됩니다:

```typescript
const animatedStyle = useAnimatedStyle(() => {
  // 이 함수 전체가 워크릿으로 변환되어 UI 스레드에서 실행
  return {
    opacity: opacity.value,
  };
});
```

#### 2. 의존성 자동 추적

Shared Value의 `.value`에 접근하면 **자동으로 의존성이 추적**됩니다:

```typescript
const opacity = useSharedValue(1);
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => {
  // opacity.value와 scale.value 변경 시 자동으로 재실행
  return {
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  };
});

// opacity.value = 0.5; → animatedStyle 콜백 자동 재실행
// scale.value = 1.2;   → animatedStyle 콜백 자동 재실행
```

#### 3. 반환값은 스타일 객체

반드시 **React Native 스타일 객체**를 반환해야 합니다:

```typescript
// ✅ 올바른 반환값
return {
  opacity: 0.5,
  backgroundColor: 'red',
  transform: [{ scale: 1.2 }],
};

// ❌ 잘못된 반환값
return 0.5;  // 객체가 아님
return null; // 유효하지 않음
```

---

## 💻 코드 예제

### 기본 사용법

```typescript
import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const BasicAnimatedStyle = () => {
  const opacity = useSharedValue(1);
  const backgroundColor = useSharedValue('#7A4AE2');

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: backgroundColor.value,
  }));

  const toggle = () => {
    opacity.value = withTiming(opacity.value === 1 ? 0.3 : 1);
    backgroundColor.value = withTiming(
      backgroundColor.value === '#7A4AE2' ? '#E24A7A' : '#7A4AE2'
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Pressable style={styles.button} onPress={toggle}>
        <Text style={styles.buttonText}>토글</Text>
      </Pressable>
    </View>
  );
};
```

### Transform 애니메이션

```typescript
const TransformAnimation = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const animate = () => {
    translateX.value = withTiming(100);
    translateY.value = withTiming(50);
    scale.value = withTiming(1.5);
    rotate.value = withTiming(180);
  };

  const reset = () => {
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    scale.value = withTiming(1);
    rotate.value = withTiming(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <View style={styles.buttons}>
        <Pressable onPress={animate}><Text>애니메이션</Text></Pressable>
        <Pressable onPress={reset}><Text>리셋</Text></Pressable>
      </View>
    </View>
  );
};
```

### 조건부 스타일

```typescript
const ConditionalStyle = () => {
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    // 조건에 따라 다른 스타일 반환
    const isHalfway = progress.value >= 0.5;

    return {
      backgroundColor: isHalfway ? '#4AE27A' : '#E24A7A',
      borderRadius: isHalfway ? 50 : 8,
      transform: [
        { scale: 0.5 + progress.value * 0.5 },
      ],
    };
  });

  const animate = () => {
    progress.value = withTiming(progress.value === 0 ? 1 : 0, {
      duration: 1000,
    });
  };

  return (
    <Pressable onPress={animate}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

### interpolate 활용

```typescript
import { interpolate, Extrapolation } from 'react-native-reanimated';

const InterpolationExample = () => {
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    // progress: 0 → 1 일 때
    // opacity: 0 → 1
    // scale: 0.5 → 1.5
    // rotate: 0 → 360

    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],      // 입력 범위
      [0, 1, 0.8],      // 출력 범위
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.5, 1.5]
    );

    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 360]
    );

    return {
      opacity,
      transform: [
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.box, animatedStyle]} />
  );
};
```

### 여러 useAnimatedStyle 조합

```typescript
const MultipleStyles = () => {
  const position = useSharedValue(0);
  const appearance = useSharedValue(1);

  // 위치 관련 스타일
  const positionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value },
    ],
  }));

  // 외형 관련 스타일
  const appearanceStyle = useAnimatedStyle(() => ({
    opacity: appearance.value,
    backgroundColor: `rgba(122, 74, 226, ${appearance.value})`,
  }));

  return (
    // 여러 animated style을 배열로 조합
    <Animated.View
      style={[
        styles.box,
        positionStyle,
        appearanceStyle,
      ]}
    />
  );
};
```

---

## 📊 비교

### 지원되는 스타일 속성

| 속성 | 지원 | 예시 |
|------|------|------|
| opacity | ✅ | `opacity: 0.5` |
| backgroundColor | ✅ | `backgroundColor: '#FF0000'` |
| transform | ✅ | `transform: [{ scale: 1.5 }]` |
| width/height | ✅ | `width: 100` |
| borderRadius | ✅ | `borderRadius: 20` |
| shadowOpacity | ✅ (iOS) | `shadowOpacity: 0.5` |
| elevation | ✅ (Android) | `elevation: 5` |
| flex | ⚠️ 제한적 | 레이아웃 재계산 필요 |
| position | ⚠️ 제한적 | 변경 시 레이아웃 영향 |

### transform 속성 비교

| Transform | 설명 | 예시 |
|-----------|------|------|
| translateX/Y | 이동 | `{ translateX: 100 }` |
| scale/scaleX/Y | 크기 | `{ scale: 1.5 }` |
| rotate | 회전 (문자열) | `{ rotate: '45deg' }` |
| rotateX/Y/Z | 3D 회전 | `{ rotateY: '180deg' }` |
| skewX/Y | 기울임 | `{ skewX: '10deg' }` |
| perspective | 원근감 | `{ perspective: 1000 }` |

### Transform 순서의 중요성

```typescript
// ❗ 순서에 따라 결과가 다름!

// 1. 먼저 회전 → 그 다음 이동
// 회전된 축을 기준으로 이동
transform: [
  { rotate: '45deg' },
  { translateX: 100 },
]

// 2. 먼저 이동 → 그 다음 회전
// 원래 위치 기준으로 이동 후 회전
transform: [
  { translateX: 100 },
  { rotate: '45deg' },
]
```

```
Transform 순서 시각화:

[ rotate: 45deg, translateX: 100 ]
┌──────┐      회전      ◇          이동        ◇→
│      │      ───→                 ───→         (대각선 이동)
└──────┘

[ translateX: 100, rotate: 45deg ]
┌──────┐      이동      ┌──────┐   회전    ◇
│      │      ───→      │      │   ───→
└──────┘                └──────┘          (오른쪽으로 이동 후 제자리 회전)
```

---

## ⚠️ 흔한 실수

### ❌ 실수 1: 일반 View에 animatedStyle 적용

```typescript
import { View } from 'react-native';

const style = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

// ❌ 작동하지 않음!
return <View style={style} />;
```

### ✅ 올바른 방법

```typescript
import Animated from 'react-native-reanimated';

// ✅ Animated.View 사용
return <Animated.View style={style} />;

// ✅ 다른 Animated 컴포넌트들
<Animated.Text style={style} />
<Animated.Image style={style} />
<Animated.ScrollView style={style} />
```

### ❌ 실수 2: 콜백 외부에서 .value 접근 결과 캐싱

```typescript
const opacity = useSharedValue(1);

const MyComponent = () => {
  // ❌ 렌더 시점의 값이 캐싱됨
  const currentOpacity = opacity.value;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: currentOpacity, // 항상 같은 값!
  }));
};
```

### ✅ 올바른 방법

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  // ✅ 콜백 내부에서 .value 접근
  opacity: opacity.value,
}));
```

### ❌ 실수 3: 비동기 작업 시도

```typescript
// ❌ 워크릿에서 비동기 작업 불가
const animatedStyle = useAnimatedStyle(async () => {
  const data = await fetchData(); // 에러!
  return { opacity: data.opacity };
});
```

### ✅ 올바른 방법

```typescript
// ✅ 비동기 결과는 Shared Value로 전달
const opacity = useSharedValue(1);

useEffect(() => {
  fetchData().then((data) => {
    opacity.value = withTiming(data.opacity);
  });
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));
```

### ❌ 실수 4: 불필요한 객체 생성

```typescript
// ❌ 매번 새 배열 생성
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value },
    { translateY: y.value },
    { scale: 1 },        // 항상 1인데 포함
    { rotate: '0deg' },  // 항상 0인데 포함
  ],
}));
```

### ✅ 올바른 방법

```typescript
// ✅ 필요한 transform만 포함
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value },
    { translateY: y.value },
  ],
}));
```

### ❌ 실수 5: rotate에 숫자 직접 사용

```typescript
// ❌ rotate는 문자열이어야 함
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { rotate: rotation.value }, // 숫자면 에러!
  ],
}));
```

### ✅ 올바른 방법

```typescript
// ✅ 템플릿 리터럴로 단위 추가
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { rotate: `${rotation.value}deg` },
    // 또는 rad 단위
    { rotate: `${rotation.value}rad` },
  ],
}));
```

---

## 💡 성능 팁

### Tip 1: useAnimatedStyle 분리

```typescript
// ❌ 하나의 거대한 animatedStyle
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  backgroundColor: bg.value,
  transform: [
    { translateX: x.value },
    { translateY: y.value },
    { scale: scale.value },
    { rotate: `${rotate.value}deg` },
  ],
  shadowOpacity: shadow.value,
  // ... 더 많은 속성
}));

// ✅ 관련 속성끼리 분리
const transformStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value },
    { translateY: y.value },
  ],
}));

const appearanceStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  backgroundColor: bg.value,
}));

// 사용
<Animated.View style={[styles.box, transformStyle, appearanceStyle]} />
```

**왜 분리하는 게 좋은가?**
- `x` 값만 변경되면 `transformStyle`만 재계산
- `opacity`만 변경되면 `appearanceStyle`만 재계산
- 불필요한 계산 감소

### Tip 2: 복잡한 계산은 useDerivedValue로

```typescript
const progress = useSharedValue(0);

// ❌ useAnimatedStyle 내부에서 복잡한 계산
const animatedStyle = useAnimatedStyle(() => {
  const complexCalc = Math.sin(progress.value * Math.PI) *
                      Math.cos(progress.value * Math.PI / 2) *
                      100;
  return {
    transform: [{ translateX: complexCalc }],
  };
});

// ✅ useDerivedValue로 계산 분리
const translateX = useDerivedValue(() => {
  return Math.sin(progress.value * Math.PI) *
         Math.cos(progress.value * Math.PI / 2) *
         100;
});

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### Tip 3: interpolate 캐싱

```typescript
// ❌ 매번 interpolate 호출
const animatedStyle = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [0, 1], [0, 1]),
  transform: [
    { scale: interpolate(progress.value, [0, 1], [0.5, 1.5]) },
    { rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg` },
  ],
}));

// ✅ 필요한 경우 useDerivedValue로 분리
const opacity = useDerivedValue(() =>
  interpolate(progress.value, [0, 1], [0, 1])
);
const scale = useDerivedValue(() =>
  interpolate(progress.value, [0, 1], [0.5, 1.5])
);
const rotation = useDerivedValue(() =>
  interpolate(progress.value, [0, 1], [0, 360])
);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [
    { scale: scale.value },
    { rotate: `${rotation.value}deg` },
  ],
}));
```

---

## 🎯 실무 적용

### 패턴 1: 버튼 프레스 피드백

```typescript
const AnimatedButton = ({ onPress, children }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
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

### 패턴 2: 카드 플립

```typescript
const FlipCard = ({ front, back }) => {
  const rotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 1],
      [0, 180]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 1],
      [180, 360]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
    };
  });

  const flip = () => {
    rotation.value = withTiming(isFlipped ? 0 : 1, { duration: 500 });
    setIsFlipped(!isFlipped);
  };

  return (
    <Pressable onPress={flip} style={styles.cardContainer}>
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        {front}
      </Animated.View>
      <Animated.View style={[styles.card, backAnimatedStyle]}>
        {back}
      </Animated.View>
    </Pressable>
  );
};
```

### 패턴 3: 스켈레톤 로딩

```typescript
const SkeletonLoader = ({ width, height }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1, // 무한 반복
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 스타일 완성

다음 코드를 완성하여 버튼을 누르면 박스가 오른쪽으로 100px 이동하면서 동시에 투명도가 0.5로 바뀌는 애니메이션을 만드세요.

```typescript
const MoveFadeBox = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    // 여기를 완성하세요
  }));

  const animate = () => {
    // 여기를 완성하세요
  };

  return (
    <Pressable onPress={animate}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

<details>
<summary>✅ 해답</summary>

```typescript
const MoveFadeBox = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const animate = () => {
    translateX.value = withTiming(100, { duration: 500 });
    opacity.value = withTiming(0.5, { duration: 500 });
  };

  return (
    <Pressable onPress={animate}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

</details>

### 문제 2: interpolate 활용

progress (0~1)에 따라:
- 0일 때: opacity 0, scale 0.5, 빨간색
- 0.5일 때: opacity 1, scale 1, 보라색
- 1일 때: opacity 0.8, scale 1.2, 파란색

으로 변하는 animatedStyle을 작성하세요.

<details>
<summary>💡 힌트</summary>

`interpolate`는 입력 범위와 출력 범위를 배열로 받습니다. 색상은 `interpolateColor`를 사용해야 합니다.

</details>

<details>
<summary>✅ 해답</summary>

```typescript
import {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

const progress = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => {
  const opacity = interpolate(
    progress.value,
    [0, 0.5, 1],
    [0, 1, 0.8]
  );

  const scale = interpolate(
    progress.value,
    [0, 0.5, 1],
    [0.5, 1, 1.2]
  );

  const backgroundColor = interpolateColor(
    progress.value,
    [0, 0.5, 1],
    ['#FF0000', '#7A4AE2', '#0000FF']
  );

  return {
    opacity,
    backgroundColor,
    transform: [{ scale }],
  };
});
```

</details>

### 문제 3: 버그 수정

다음 코드에서 문제점을 찾고 수정하세요:

```typescript
const BrokenAnimation = () => {
  const rotation = useSharedValue(0);
  const currentRotation = rotation.value;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: currentRotation },
    ],
  }));

  const spin = () => {
    rotation.value = withTiming(360);
  };

  return (
    <Pressable onPress={spin}>
      <View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

<details>
<summary>✅ 해답</summary>

세 가지 문제가 있습니다:

```typescript
const FixedAnimation = () => {
  const rotation = useSharedValue(0);
  // ❌ currentRotation 제거 - 캐싱 문제

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      // ✅ 콜백 내부에서 .value 접근
      // ✅ rotate는 문자열 + 단위 필요
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const spin = () => {
    rotation.value = withTiming(360);
  };

  return (
    <Pressable onPress={spin}>
      {/* ✅ Animated.View 사용 */}
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

**수정 사항:**
1. `currentRotation` 변수 제거 - 렌더 시점 값이 캐싱되어 변하지 않음
2. `rotate` 값에 `deg` 단위 추가
3. `View` → `Animated.View`로 변경

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- `useAnimatedStyle`은 **Shared Value를 스타일 객체로 변환**하는 훅
- 콜백 내부는 **UI 스레드**에서 실행되어 60fps 보장
- **Shared Value의 .value에 접근**하면 자동으로 의존성 추적
- **Animated.View** 등 Animated 컴포넌트에만 적용 가능
- **transform 순서**에 따라 결과가 달라짐
- **rotate**는 반드시 문자열 + 단위 (`'45deg'`)
- 복잡한 계산은 **useDerivedValue로 분리**하면 성능 향상

**다음 챕터**: 기본 애니메이션 함수 - withTiming, withSpring, withDecay의 상세 사용법을 알아봅니다.
