# Chapter 7: useAnimatedProps와 네이티브 속성

## 📌 개요

이 챕터에서 배울 내용:
- useAnimatedProps의 역할과 사용법
- style 외의 props 애니메이션
- SVG 속성 애니메이션
- TextInput, ScrollView 등 특수 컴포넌트
- createAnimatedComponent로 커스텀 컴포넌트 지원

**선수 지식**: Chapter 3-6 완료
**예상 학습 시간**: 35분

---

## 📖 개념 이해

### useAnimatedStyle vs useAnimatedProps

`useAnimatedStyle`은 **스타일 속성**만 애니메이션할 수 있습니다. 하지만 때로는 **스타일이 아닌 props**를 애니메이션해야 합니다.

```
┌─────────────────────────────────────────────────────────────┐
│               애니메이션 가능한 속성 비교                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   useAnimatedStyle                useAnimatedProps           │
│   ─────────────────               ─────────────────          │
│                                                              │
│   • opacity                       • SVG: stroke, fill        │
│   • backgroundColor               • SVG: strokeWidth, r      │
│   • transform                     • TextInput: text          │
│   • width, height                 • ScrollView: scrollTo     │
│   • borderRadius                  • 기타 네이티브 props       │
│   • 모든 스타일 속성              │                          │
│                                                              │
│   사용처: style prop              사용처: 기타 props          │
│   <View style={animStyle} />      <Circle {...animProps} />  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### useAnimatedProps 기본 구조

```typescript
import { useAnimatedProps } from 'react-native-reanimated';

const animatedProps = useAnimatedProps(() => {
  return {
    // 스타일이 아닌 props 반환
    someProperty: sharedValue.value,
  };
});

// 사용
<AnimatedComponent {...animatedProps} />
```

---

## 💻 코드 예제

### SVG Circle 애니메이션

가장 흔한 useAnimatedProps 사용 사례입니다:

```typescript
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

// SVG 컴포넌트를 Animated로 감싸기
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedSvgCircle = () => {
  const radius = useSharedValue(30);

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,  // Circle의 반지름 (스타일이 아닌 prop)
  }));

  const grow = () => {
    radius.value = withTiming(radius.value === 30 ? 60 : 30);
  };

  return (
    <View style={styles.container}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <AnimatedCircle
          cx={100}
          cy={100}
          fill="#7A4AE2"
          animatedProps={animatedProps}
        />
      </Svg>
      <Button title="크기 변경" onPress={grow} />
    </View>
  );
};
```

### 프로그레스 링 (Progress Ring)

```typescript
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ progress }: { progress: number }) => {
  const animatedProgress = useSharedValue(0);

  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 프로그레스 원 */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7A4AE2"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.progressText}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
};
```

### TextInput 텍스트 애니메이션

```typescript
import { TextInput } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const CounterDisplay = () => {
  const count = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    text: `Count: ${Math.round(count.value)}`,
    // defaultValue도 사용 가능
  }));

  const increment = () => {
    count.value = withTiming(count.value + 100, { duration: 1000 });
  };

  return (
    <View>
      <AnimatedTextInput
        style={styles.counter}
        editable={false}
        animatedProps={animatedProps}
      />
      <Button title="+100" onPress={increment} />
    </View>
  );
};
```

### 색상 애니메이션 (SVG)

```typescript
import { interpolateColor } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ColorMorphRect = () => {
  const progress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    const fill = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#FF6B6B', '#4ECDC4', '#7A4AE2']
    );

    return { fill };
  });

  const animate = () => {
    progress.value = withTiming(progress.value === 0 ? 1 : 0, {
      duration: 2000,
    });
  };

  return (
    <Pressable onPress={animate}>
      <Svg width={200} height={100}>
        <AnimatedRect
          x={25}
          y={10}
          width={150}
          height={80}
          rx={10}
          animatedProps={animatedProps}
        />
      </Svg>
    </Pressable>
  );
};
```

---

## 📊 비교

### 지원되는 컴포넌트

| 컴포넌트 | 애니메이션 가능 props |
|----------|---------------------|
| SVG Circle | r, cx, cy, fill, stroke, strokeWidth |
| SVG Path | d, stroke, strokeDasharray, strokeDashoffset |
| SVG Rect | x, y, width, height, fill, rx, ry |
| TextInput | text, defaultValue |
| ScrollView | scrollTo (via ref) |
| Image | source (제한적) |

### useAnimatedStyle vs useAnimatedProps

| 항목 | useAnimatedStyle | useAnimatedProps |
|------|-----------------|------------------|
| 용도 | style prop | 기타 props |
| 적용 대상 | Animated.View 등 | createAnimatedComponent |
| 반환값 | 스타일 객체 | props 객체 |
| 적용 방법 | `style={...}` | `animatedProps={...}` 또는 spread |

---

## 💻 createAnimatedComponent

### 기본 사용법

```typescript
import Animated from 'react-native-reanimated';
import { SomeComponent } from 'some-library';

// 커스텀 컴포넌트를 Animated로 래핑
const AnimatedSomeComponent = Animated.createAnimatedComponent(SomeComponent);

// 사용
<AnimatedSomeComponent
  animatedProps={animatedProps}
  style={animatedStyle}
/>
```

### 자주 사용되는 래핑

```typescript
import Animated from 'react-native-reanimated';
import { TextInput, Image, FlatList } from 'react-native';
import { Circle, Path, Rect, G, Svg } from 'react-native-svg';
import { BlurView } from 'expo-blur';

// React Native 기본 컴포넌트
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// SVG 컴포넌트
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

// 서드파티 컴포넌트
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
```

### 주의: 이미 Animated인 컴포넌트

```typescript
// ❌ 불필요 - 이미 Animated 버전 제공
const AnimatedView = Animated.createAnimatedComponent(View);

// ✅ 내장 Animated 컴포넌트 사용
Animated.View
Animated.Text
Animated.Image
Animated.ScrollView
Animated.FlatList
```

---

## ⚠️ 흔한 실수

### ❌ 실수 1: 스타일 속성을 animatedProps에 넣기

```typescript
// ❌ 스타일 속성은 useAnimatedStyle 사용
const animatedProps = useAnimatedProps(() => ({
  opacity: opacity.value,  // 스타일 속성!
  backgroundColor: 'red',  // 스타일 속성!
}));
```

### ✅ 올바른 방법

```typescript
// ✅ 스타일은 useAnimatedStyle
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  backgroundColor: 'red',
}));

// ✅ props는 useAnimatedProps
const animatedProps = useAnimatedProps(() => ({
  r: radius.value,  // SVG prop
}));

<AnimatedCircle
  style={animatedStyle}
  animatedProps={animatedProps}
/>
```

### ❌ 실수 2: createAnimatedComponent 없이 사용

```typescript
import { Circle } from 'react-native-svg';

// ❌ 일반 Circle에 animatedProps 사용 불가
const animatedProps = useAnimatedProps(() => ({ r: radius.value }));

<Circle animatedProps={animatedProps} />  // 작동 안 함!
```

### ✅ 올바른 방법

```typescript
// ✅ createAnimatedComponent로 래핑
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

<AnimatedCircle animatedProps={animatedProps} />
```

### ❌ 실수 3: 함수 컴포넌트 직접 래핑

```typescript
// ❌ 함수 컴포넌트를 직접 래핑하면 문제 발생
const MyComponent = (props) => <View {...props} />;
const AnimatedMyComponent = Animated.createAnimatedComponent(MyComponent);
```

### ✅ 올바른 방법

```typescript
// ✅ forwardRef로 ref 전달 필요
const MyComponent = React.forwardRef((props, ref) => (
  <View ref={ref} {...props} />
));
const AnimatedMyComponent = Animated.createAnimatedComponent(MyComponent);
```

---

## 💡 성능 팁

### Tip 1: 컴포넌트 생성은 외부에서

```typescript
// ❌ 컴포넌트 내부에서 생성 - 매 렌더마다 새로 생성
const MyComponent = () => {
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  // ...
};

// ✅ 컴포넌트 외부에서 한 번만 생성
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MyComponent = () => {
  // AnimatedCircle 재사용
};
```

### Tip 2: 필요한 props만 애니메이션

```typescript
// ❌ 불필요한 속성 포함
const animatedProps = useAnimatedProps(() => ({
  r: radius.value,
  cx: 100,  // 고정값은 불필요
  cy: 100,  // 고정값은 불필요
}));

// ✅ 변하는 값만 포함
const animatedProps = useAnimatedProps(() => ({
  r: radius.value,
}));

<AnimatedCircle
  cx={100}  // 고정값은 일반 prop으로
  cy={100}
  animatedProps={animatedProps}
/>
```

### Tip 3: useDerivedValue로 계산 분리

```typescript
// ❌ animatedProps 내부에서 복잡한 계산
const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset: 2 * Math.PI * 50 * (1 - progress.value),
}));

// ✅ useDerivedValue로 분리
const circumference = 2 * Math.PI * 50;
const strokeDashoffset = useDerivedValue(() => {
  return circumference * (1 - progress.value);
});

const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset: strokeDashoffset.value,
}));
```

---

## 🎯 실무 적용

### 패턴 1: 애니메이션 체크박스

```typescript
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedCheckbox = ({ checked }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0);
  }, [checked]);

  const animatedProps = useAnimatedProps(() => {
    // 체크마크 path의 길이 조절
    const strokeDashoffset = 24 * (1 - progress.value);
    return { strokeDashoffset };
  });

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#E0E0E0', '#7A4AE2']
    ),
  }));

  return (
    <Animated.View style={[styles.checkbox, backgroundStyle]}>
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <AnimatedPath
          d="M4 12l5 5L20 6"
          stroke="white"
          strokeWidth={3}
          strokeDasharray={24}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedProps}
        />
      </Svg>
    </Animated.View>
  );
};
```

### 패턴 2: 원형 타이머

```typescript
const CircularTimer = ({ duration, isRunning }) => {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      progress.value = withTiming(0, {
        duration: duration * 1000,
        easing: Easing.linear,
      });
    } else {
      cancelAnimation(progress);
    }
  }, [isRunning]);

  const circumference = 2 * Math.PI * 45;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const remainingTime = useDerivedValue(() => {
    return Math.ceil(progress.value * duration);
  });

  const textProps = useAnimatedProps(() => ({
    text: `${remainingTime.value}`,
  }));

  return (
    <View style={styles.container}>
      <Svg width={100} height={100}>
        <Circle
          cx={50}
          cy={50}
          r={45}
          stroke="#E0E0E0"
          strokeWidth={8}
          fill="none"
        />
        <AnimatedCircle
          cx={50}
          cy={50}
          r={45}
          stroke="#7A4AE2"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin="50, 50"
          animatedProps={animatedProps}
        />
      </Svg>
      <AnimatedTextInput
        style={styles.timerText}
        editable={false}
        animatedProps={textProps}
      />
    </View>
  );
};
```

### 패턴 3: 웨이브 애니메이션

```typescript
const WaveAnimation = () => {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    return () => cancelAnimation(phase);
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const points = [];
    const width = 300;
    const height = 100;
    const amplitude = 20;
    const frequency = 2;

    for (let x = 0; x <= width; x += 5) {
      const y = height / 2 + amplitude *
        Math.sin((x / width) * frequency * 2 * Math.PI + phase.value);
      points.push(`${x},${y}`);
    }

    return {
      points: points.join(' '),
    };
  });

  return (
    <Svg width={300} height={100}>
      <AnimatedPolyline
        fill="none"
        stroke="#7A4AE2"
        strokeWidth={2}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
```

---

## 🏋️ 연습 문제

### 문제 1: 배터리 인디케이터

배터리 충전 상태를 표시하는 SVG 컴포넌트를 만드세요.
- Rect로 배터리 외곽
- 내부 Rect로 충전량 표시 (width 애니메이션)
- 충전량에 따라 색상 변경 (빨강 → 노랑 → 초록)

<details>
<summary>💡 힌트</summary>

- `useAnimatedProps`로 내부 Rect의 width와 fill 애니메이션
- `interpolate`로 width 계산
- `interpolateColor`로 색상 계산

</details>

<details>
<summary>✅ 해답</summary>

```typescript
import Svg, { Rect } from 'react-native-svg';
import { interpolate, interpolateColor } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BatteryIndicator = ({ level }: { level: number }) => {
  const animatedLevel = useSharedValue(0);

  useEffect(() => {
    animatedLevel.value = withTiming(level, { duration: 500 });
  }, [level]);

  const animatedProps = useAnimatedProps(() => {
    const width = interpolate(
      animatedLevel.value,
      [0, 100],
      [0, 60]
    );

    const fill = interpolateColor(
      animatedLevel.value,
      [0, 30, 70, 100],
      ['#FF4444', '#FF8800', '#FFCC00', '#44CC44']
    );

    return { width, fill };
  });

  return (
    <Svg width={80} height={40} viewBox="0 0 80 40">
      {/* 배터리 외곽 */}
      <Rect
        x={2}
        y={5}
        width={68}
        height={30}
        rx={4}
        stroke="#333"
        strokeWidth={2}
        fill="none"
      />
      {/* 배터리 단자 */}
      <Rect x={70} y={12} width={6} height={16} rx={2} fill="#333" />
      {/* 충전량 */}
      <AnimatedRect
        x={6}
        y={9}
        height={22}
        rx={2}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};
```

</details>

### 문제 2: 로딩 도넛

중앙이 빈 원형 로딩 인디케이터를 구현하세요.
- 원호가 회전하면서 로딩 표시
- strokeDasharray와 strokeDashoffset 활용

<details>
<summary>✅ 해답</summary>

```typescript
const LoadingDonut = () => {
  const rotation = useSharedValue(0);
  const dashOffset = useSharedValue(0);

  const circumference = 2 * Math.PI * 35;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );

    dashOffset.value = withRepeat(
      withSequence(
        withTiming(circumference * 0.75, { duration: 500 }),
        withTiming(circumference * 0.25, { duration: 500 })
      ),
      -1
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(dashOffset);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={80} height={80}>
        <AnimatedCircle
          cx={40}
          cy={40}
          r={35}
          stroke="#7A4AE2"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
    </Animated.View>
  );
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **useAnimatedProps**는 스타일 외의 **props를 애니메이션**
- **createAnimatedComponent**로 커스텀 컴포넌트 래핑 필요
- SVG 애니메이션에 특히 유용 (stroke, fill, r, strokeDashoffset 등)
- TextInput의 텍스트 애니메이션도 가능
- 래핑은 **컴포넌트 외부**에서 한 번만 수행
- 스타일 속성은 **useAnimatedStyle**, props는 **useAnimatedProps**로 분리

**다음 챕터**: useDerivedValue와 반응형 값 - Shared Value에서 파생된 값을 효율적으로 계산하는 방법을 배웁니다.
