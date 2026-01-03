# Chapter 3: Shared Values 완벽 이해

## 📌 개요

이 챕터에서 배울 내용:
- Shared Value가 무엇이고 왜 특별한지
- useSharedValue의 내부 동작 원리
- Shared Value vs React State의 차이
- 다양한 타입의 Shared Value 활용법
- 값 변경과 반응성 이해

**선수 지식**: Chapter 1-2 완료, React useState 훅
**예상 학습 시간**: 40분

---

## 📖 개념 이해

### Shared Value란?

Shared Value는 Reanimated의 가장 핵심적인 개념입니다. **JS 스레드와 UI 스레드 양쪽에서 접근 가능한 특별한 값**으로, 애니메이션 상태를 저장합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                      Shared Value                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   JS Thread                         UI Thread                │
│   ─────────                         ─────────                │
│                                                              │
│   const opacity = useSharedValue(0);                         │
│                                                              │
│   ┌─────────────┐                 ┌─────────────┐           │
│   │ opacity.value │ ◄──────────► │ opacity.value │           │
│   │     = 0       │   동기화      │     = 0       │           │
│   └─────────────┘                 └─────────────┘           │
│          │                               │                   │
│          ▼                               ▼                   │
│   JS에서 읽기/쓰기                 UI에서 읽기/쓰기           │
│   (비즈니스 로직)                  (애니메이션 로직)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 왜 "Shared"인가?

"Shared"라는 이름은 **두 스레드 간에 값을 공유**한다는 의미입니다:

```typescript
const offset = useSharedValue(0);

// JS 스레드에서 접근
const handlePress = () => {
  console.log(offset.value); // JS에서 읽기
  offset.value = 100;         // JS에서 쓰기
};

// UI 스레드에서 접근 (워크릿 내부)
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }], // UI에서 읽기
  };
});
```

### Shared Value의 특별한 점

#### 1. 리렌더를 유발하지 않음

```typescript
// React State - 값 변경 시 리렌더 발생
const [count, setCount] = useState(0);
setCount(1); // 컴포넌트 전체 리렌더!

// Shared Value - 값 변경해도 리렌더 없음
const count = useSharedValue(0);
count.value = 1; // 리렌더 발생하지 않음 ✨
```

#### 2. 동기적으로 업데이트

```typescript
const value = useSharedValue(0);

// 동기적 업데이트 - 다음 줄에서 바로 새 값 사용 가능
value.value = 100;
console.log(value.value); // 100 (즉시 반영)

// vs useState의 비동기 업데이트
const [state, setState] = useState(0);
setState(100);
console.log(state); // 0 (아직 이전 값)
```

#### 3. `.value` 접근자

Shared Value의 실제 값에 접근하려면 반드시 `.value`를 사용해야 합니다:

```typescript
const opacity = useSharedValue(0.5);

// ❌ 잘못된 접근
console.log(opacity);       // SharedValue 객체 출력
opacity = 1;                // 에러! 객체 자체를 덮어쓰려 함

// ✅ 올바른 접근
console.log(opacity.value); // 0.5
opacity.value = 1;          // 정상 작동
```

### 내부 동작 원리

Shared Value가 어떻게 두 스레드를 연결하는지 살펴봅시다:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Value 내부 구조                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   useSharedValue(0) 호출 시:                                     │
│                                                                  │
│   1. JS 측에 SharedValue 객체 생성                               │
│      ┌────────────────────────┐                                 │
│      │ { _value: 0,           │                                 │
│      │   _isSharedValue: true,│                                 │
│      │   get value() {...},   │ ← getter/setter로 접근 제어      │
│      │   set value() {...} }  │                                 │
│      └────────────────────────┘                                 │
│                     │                                            │
│   2. 네이티브 측에 대응하는 값 생성                               │
│                     │                                            │
│                     ▼                                            │
│      ┌────────────────────────┐                                 │
│      │  Native Shared Value   │ ← C++로 구현된 값                │
│      │  (UI Thread 접근 가능)  │                                 │
│      └────────────────────────┘                                 │
│                                                                  │
│   3. 값 변경 시 양쪽 자동 동기화                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 코드 예제

### 기본 사용법

```typescript
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const BasicSharedValue = () => {
  // 숫자 타입 Shared Value
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const moveRight = () => {
    translateX.value = withTiming(translateX.value + 50);
  };

  const reset = () => {
    translateX.value = withTiming(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <View style={styles.buttons}>
        <Button title="→ 오른쪽" onPress={moveRight} />
        <Button title="초기화" onPress={reset} />
      </View>
    </View>
  );
};
```

### 다양한 타입 지원

Shared Value는 숫자뿐만 아니라 다양한 타입을 지원합니다:

```typescript
// 1. 숫자 (가장 흔함)
const opacity = useSharedValue(1);
const rotation = useSharedValue(0);

// 2. 문자열
const backgroundColor = useSharedValue('#7A4AE2');

// 3. 불리언
const isActive = useSharedValue(false);

// 4. 객체
const position = useSharedValue({ x: 0, y: 0 });

// 5. 배열
const colors = useSharedValue(['#FF0000', '#00FF00', '#0000FF']);
```

### 객체 타입 Shared Value

```typescript
const position = useSharedValue({ x: 0, y: 0 });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: position.value.x },
    { translateY: position.value.y },
  ],
}));

// ⚠️ 객체 업데이트 시 주의점
const updatePosition = () => {
  // ❌ 잘못된 방법 - 프로퍼티 직접 수정
  position.value.x = 100; // 반응하지 않음!

  // ✅ 올바른 방법 - 새 객체로 할당
  position.value = { x: 100, y: position.value.y };

  // ✅ 스프레드 연산자 사용
  position.value = { ...position.value, x: 100 };
};
```

### 애니메이션과 함께 사용

```typescript
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedBox = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // 여러 애니메이션 조합
  const animate = () => {
    // 스케일: 스프링 애니메이션
    scale.value = withSpring(1.2, {
      damping: 10,
      stiffness: 100,
    });

    // 회전: 타이밍 애니메이션
    rotation.value = withTiming(360, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  return (
    <Pressable onPress={animate}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

### 현재 값 읽기

```typescript
const offset = useSharedValue(0);

// JS 스레드에서 현재 값 읽기
const logCurrentValue = () => {
  console.log('현재 offset:', offset.value);
};

// UI 스레드(워크릿)에서 현재 값 읽기
const animatedStyle = useAnimatedStyle(() => {
  const currentOffset = offset.value;
  console.log('UI Thread - offset:', currentOffset); // 콘솔에 출력됨
  return {
    transform: [{ translateX: currentOffset }],
  };
});
```

---

## 📊 비교

### Shared Value vs React State

| 항목 | useSharedValue | useState |
|------|---------------|----------|
| 값 변경 시 리렌더 | ❌ 없음 | ✅ 발생 |
| UI 스레드 접근 | ✅ 가능 | ❌ 불가 |
| 업데이트 타이밍 | 동기 | 비동기 |
| 접근 방법 | `.value` | 직접 |
| 주 용도 | 애니메이션 값 | UI 상태 |
| 메모리 사용 | 네이티브 메모리 | JS 힙 |

### 언제 무엇을 사용할까?

```typescript
// ✅ useSharedValue 사용: 애니메이션 관련 값
const translateX = useSharedValue(0);  // 위치
const opacity = useSharedValue(1);     // 투명도
const scale = useSharedValue(1);       // 크기
const rotation = useSharedValue(0);    // 회전
const progress = useSharedValue(0);    // 진행률

// ✅ useState 사용: UI 로직 관련 값
const [isVisible, setIsVisible] = useState(false);  // 조건부 렌더링
const [items, setItems] = useState([]);             // 리스트 데이터
const [selectedId, setSelectedId] = useState(null); // 선택 상태
const [inputText, setInputText] = useState('');     // 입력값
```

### Shared Value vs useRef

| 항목 | useSharedValue | useRef |
|------|---------------|--------|
| 리렌더 유발 | ❌ | ❌ |
| UI 스레드 접근 | ✅ 가능 | ❌ 불가 |
| 애니메이션 연동 | ✅ 직접 연동 | ❌ 불가 |
| 값 저장 목적 | 애니메이션 상태 | 일반 참조 값 |

```typescript
// useRef: 리렌더 없이 값 저장 (애니메이션과 무관)
const countRef = useRef(0);
countRef.current = 10;

// useSharedValue: 애니메이션에 연동되는 값
const countShared = useSharedValue(0);
countShared.value = withTiming(10); // 애니메이션 가능!
```

---

## ⚠️ 흔한 실수

### ❌ 실수 1: .value 누락

```typescript
const opacity = useSharedValue(0);

// ❌ 잘못된 코드
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity, // .value 빠짐!
}));
// 결과: 객체가 스타일 값으로 들어가서 오류
```

### ✅ 올바른 코드

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value, // .value 필수!
}));
```

### ❌ 실수 2: 객체 프로퍼티 직접 수정

```typescript
const position = useSharedValue({ x: 0, y: 0 });

// ❌ 반응하지 않음 - 프로퍼티만 수정
position.value.x = 100;
position.value.y = 200;
// useAnimatedStyle이 이 변경을 감지하지 못함!
```

### ✅ 올바른 방법

```typescript
// ✅ 새 객체로 할당
position.value = { x: 100, y: 200 };

// ✅ 스프레드 연산자 활용
position.value = { ...position.value, x: 100 };
```

### ❌ 실수 3: 조건부 렌더링에 Shared Value 사용

```typescript
const isVisible = useSharedValue(false);

// ❌ 작동하지 않음 - shared value는 리렌더를 유발하지 않음
return (
  <View>
    {isVisible.value && <Text>보이는 텍스트</Text>}
  </View>
);
// isVisible.value가 true로 바뀌어도 컴포넌트가 리렌더되지 않음!
```

### ✅ 올바른 방법

```typescript
// 방법 1: useState 사용 (조건부 렌더링용)
const [isVisible, setIsVisible] = useState(false);

return (
  <View>
    {isVisible && <Text>보이는 텍스트</Text>}
  </View>
);

// 방법 2: 애니메이션으로 숨기기 (Shared Value 활용)
const opacity = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

return (
  <Animated.Text style={animatedStyle}>
    항상 렌더되지만 투명도로 숨김
  </Animated.Text>
);
```

### ❌ 실수 4: 렌더 함수 내에서 값 변경

```typescript
const MyComponent = () => {
  const offset = useSharedValue(0);

  // ❌ 렌더마다 값이 변경됨!
  offset.value = Math.random() * 100;

  return <Animated.View style={animatedStyle} />;
};
```

### ✅ 올바른 방법

```typescript
const MyComponent = () => {
  const offset = useSharedValue(0);

  // ✅ 이벤트 핸들러에서 변경
  const handlePress = () => {
    offset.value = Math.random() * 100;
  };

  // ✅ 또는 useEffect에서 초기화
  useEffect(() => {
    offset.value = withTiming(100);
  }, []);

  return <Animated.View style={animatedStyle} />;
};
```

---

## 💡 성능 팁

### Tip 1: 필요한 만큼만 Shared Value 생성

```typescript
// ❌ 비효율적 - 너무 많은 Shared Value
const x = useSharedValue(0);
const y = useSharedValue(0);
const width = useSharedValue(100);
const height = useSharedValue(100);
const rotation = useSharedValue(0);
const opacity = useSharedValue(1);

// ✅ 효율적 - 관련 값들을 객체로 묶기
const transform = useSharedValue({
  x: 0,
  y: 0,
  rotation: 0,
});
const size = useSharedValue({
  width: 100,
  height: 100,
});
const opacity = useSharedValue(1);
```

### Tip 2: 불필요한 업데이트 방지

```typescript
const offset = useSharedValue(0);

// ❌ 불필요한 업데이트
const handleScroll = (scrollY: number) => {
  offset.value = scrollY; // 매 스크롤마다 업데이트
};

// ✅ 변화가 있을 때만 업데이트
const handleScroll = (scrollY: number) => {
  if (Math.abs(offset.value - scrollY) > 1) {
    offset.value = scrollY;
  }
};
```

### Tip 3: 복잡한 계산은 useDerivedValue로

```typescript
const progress = useSharedValue(0);

// ❌ useAnimatedStyle 내에서 복잡한 계산
const animatedStyle = useAnimatedStyle(() => {
  const complexValue = Math.sin(progress.value * Math.PI) * 100;
  const anotherComplex = Math.cos(progress.value * Math.PI) * 50;
  return {
    transform: [
      { translateX: complexValue },
      { translateY: anotherComplex },
    ],
  };
});

// ✅ useDerivedValue로 계산 분리 (다음 챕터에서 자세히)
const translateX = useDerivedValue(() => {
  return Math.sin(progress.value * Math.PI) * 100;
});
const translateY = useDerivedValue(() => {
  return Math.cos(progress.value * Math.PI) * 50;
});

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value },
  ],
}));
```

---

## 🎯 실무 적용

### 패턴 1: 제스처와 함께 사용

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const DraggableBox = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 제스처 이벤트에서 직접 Shared Value 업데이트
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
};
```

### 패턴 2: 스크롤 연동

```typescript
const HeaderAnimation = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: Math.max(60, 120 - scrollY.value),
    opacity: 1 - scrollY.value / 200,
  }));

  return (
    <View>
      <Animated.View style={[styles.header, headerStyle]} />
      <Animated.ScrollView onScroll={scrollHandler}>
        {/* 콘텐츠 */}
      </Animated.ScrollView>
    </View>
  );
};
```

### 패턴 3: 여러 컴포넌트 간 값 공유

```typescript
// 상위 컴포넌트에서 Shared Value 생성
const ParentComponent = () => {
  const progress = useSharedValue(0);

  return (
    <View>
      <ProgressBar progress={progress} />
      <ControlButton progress={progress} />
    </View>
  );
};

// 자식 컴포넌트에서 같은 Shared Value 사용
const ProgressBar = ({ progress }: { progress: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const ControlButton = ({ progress }: { progress: SharedValue<number> }) => {
  const handlePress = () => {
    progress.value = withTiming(progress.value + 0.1);
  };

  return <Button title="증가" onPress={handlePress} />;
};
```

---

## 🏋️ 연습 문제

### 문제 1: 타입 선택

다음 상황에서 어떤 것을 사용해야 할까요?

1. 버튼의 scale 애니메이션 값: `useState` / `useSharedValue`
2. 모달의 열림/닫힘 상태: `useState` / `useSharedValue`
3. 드래그 중인 아이템의 위치: `useState` / `useSharedValue`
4. 리스트의 아이템 데이터: `useState` / `useSharedValue`

<details>
<summary>✅ 해답</summary>

1. **useSharedValue** - 애니메이션 값이므로
2. **useState** - 조건부 렌더링(모달 표시/숨김)에 필요
3. **useSharedValue** - 드래그 제스처 중 60fps 업데이트 필요
4. **useState** - 리스트 리렌더가 필요한 데이터

</details>

### 문제 2: 버그 수정

다음 코드에서 버그를 찾고 수정하세요:

```typescript
const BoxAnimation = () => {
  const size = useSharedValue({ width: 100, height: 100 });

  const grow = () => {
    size.value.width = 200;
    size.value.height = 200;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value.width,
    height: size.value.height,
  }));

  return (
    <Pressable onPress={grow}>
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
};
```

<details>
<summary>💡 힌트</summary>

객체 타입 Shared Value의 프로퍼티를 직접 수정하면 어떻게 될까요?

</details>

<details>
<summary>✅ 해답</summary>

```typescript
const BoxAnimation = () => {
  const size = useSharedValue({ width: 100, height: 100 });

  const grow = () => {
    // ✅ 새 객체로 할당해야 반응함
    size.value = { width: 200, height: 200 };

    // 또는 애니메이션과 함께
    // size.value = withTiming({ width: 200, height: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value.width,
    height: size.value.height,
  }));

  return (
    <Pressable onPress={grow}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
};
```

**문제점**: 객체의 프로퍼티만 수정하면 Reanimated가 변경을 감지하지 못합니다. 반드시 새 객체를 `.value`에 할당해야 합니다.

</details>

### 문제 3: 코드 작성

`useSharedValue`를 사용하여 버튼을 누를 때마다 박스가 오른쪽으로 50px씩 이동하는 컴포넌트를 작성하세요. 이동 시 스프링 애니메이션을 적용하세요.

<details>
<summary>✅ 해답</summary>

```typescript
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const MovingBox = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const moveRight = () => {
    translateX.value = withSpring(translateX.value + 50, {
      damping: 15,
      stiffness: 100,
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Button title="오른쪽으로 이동" onPress={moveRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: '#7A4AE2',
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default MovingBox;
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **Shared Value**는 JS 스레드와 UI 스레드 **양쪽에서 접근 가능**한 값
- 값에 접근할 때는 반드시 **`.value`** 사용
- 값 변경 시 **리렌더가 발생하지 않음** (useState와 다름)
- 객체 타입은 **새 객체로 할당**해야 변경이 감지됨
- **조건부 렌더링**에는 useState, **애니메이션**에는 useSharedValue 사용
- 여러 컴포넌트에서 **같은 Shared Value를 공유**할 수 있음

**다음 챕터**: useAnimatedStyle 마스터하기 - Shared Value를 스타일로 변환하는 핵심 훅을 깊이 있게 다룹니다.
