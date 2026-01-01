# Chapter 1: Reanimated 소개 및 아키텍처

## 📌 개요

이 챕터에서 배울 내용:
- Reanimated가 무엇이고 왜 필요한지
- 기존 Animated API와의 차이점
- Reanimated의 내부 아키텍처
- 언제 Reanimated를 사용해야 하는지

**선수 지식**: React Native 기본, JavaScript 이벤트 루프 개념
**예상 학습 시간**: 30분

---

## 📖 개념 이해

### Reanimated란?

React Native Reanimated는 **Software Mansion**에서 개발한 React Native용 애니메이션 라이브러리입니다. 공식 Animated API의 한계를 극복하고, **네이티브 수준의 60fps 애니메이션**을 JavaScript로 작성할 수 있게 해줍니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │   JS Thread     │         │      UI Thread          │   │
│  │                 │         │                         │   │
│  │  React 로직     │  Bridge │  네이티브 뷰 렌더링     │   │
│  │  상태 관리      │ ──────► │  터치 처리              │   │
│  │  비즈니스 로직  │         │  애니메이션 실행 ⭐     │   │
│  └─────────────────┘         └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

핵심 아이디어는 간단합니다: **애니메이션 로직을 UI 스레드에서 직접 실행**하여 JS 스레드의 병목을 완전히 우회합니다.

### 왜 Reanimated가 필요한가?

React Native의 기본 Animated API는 좋은 시작점이지만, 실제 프로덕션에서는 여러 한계에 부딪힙니다:

#### 문제 1: Bridge 병목

```
기존 Animated API의 문제:

JS Thread                    Bridge                 UI Thread
    │                          │                        │
    │  애니메이션 값 계산       │                        │
    ├─────────────────────────►│                        │
    │                          ├───────────────────────►│
    │                          │                        │ 렌더링
    │                          │◄───────────────────────┤
    │◄─────────────────────────┤                        │
    │  다음 프레임 계산         │                        │
    ├─────────────────────────►│                        │
    │         ...              │         ...            │

    ⚠️ 매 프레임마다 Bridge를 거침 = 16ms 안에 처리 불가능할 수 있음
```

#### 문제 2: JS 스레드 블로킹

API 호출, 복잡한 계산 등으로 JS 스레드가 바쁘면 애니메이션이 버벅입니다.

```typescript
// ❌ 이런 상황에서 Animated API는 끊김
const handlePress = () => {
  // 무거운 연산 (JS 스레드 블로킹)
  const result = heavyComputation();

  // 이 애니메이션은 위 연산이 끝날 때까지 멈춤
  Animated.timing(opacity, {
    toValue: 1,
    duration: 300,
  }).start();
};
```

#### Reanimated의 해결책

```
Reanimated의 접근법:

JS Thread                                    UI Thread
    │                                            │
    │  워크릿(Worklet) 정의                      │
    ├───────────────────────────────────────────►│
    │                                            │ 워크릿 저장
    │                                            │
    │  (JS가 아무리 바빠도)                      │ 애니메이션 독립 실행
    │  ████████████████                          │ ⭐ 60fps 유지!
    │                                            │

    ✅ 애니메이션이 JS 스레드와 완전히 독립적으로 실행
```

### Reanimated 아키텍처

Reanimated의 핵심 개념들을 이해해봅시다:

#### 1. Worklet (워크릿)

워크릿은 **UI 스레드에서 실행되는 JavaScript 함수**입니다. 일반 JS 함수와 달리, 컴파일 시점에 UI 스레드용으로 변환됩니다.

```typescript
// 'worklet' 지시어가 있으면 UI 스레드에서 실행
const calculatePosition = (x: number) => {
  'worklet';
  return x * 2 + 100;
};
```

#### 2. Shared Value

JS 스레드와 UI 스레드 **양쪽에서 접근 가능한 값**입니다. 일반 React 상태와 달리, 변경해도 리렌더가 발생하지 않습니다.

```typescript
import { useSharedValue } from 'react-native-reanimated';

const offset = useSharedValue(0);

// UI 스레드에서 직접 수정 가능
offset.value = 100;
```

#### 3. Animated Style

Shared Value의 변화를 **스타일로 변환**합니다. 이 변환 로직도 UI 스레드에서 실행됩니다.

```typescript
import { useAnimatedStyle } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }],
  };
});
```

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        Reanimated Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   JS Thread                          UI Thread                   │
│   ─────────                          ─────────                   │
│                                                                  │
│   ┌─────────────┐                   ┌─────────────────────────┐ │
│   │ React       │                   │ Worklet Runtime         │ │
│   │ Components  │                   │                         │ │
│   │             │   Shared Values   │  ┌─────────────────┐   │ │
│   │ useShared   │ ◄───────────────► │  │ Animation Logic │   │ │
│   │ Value()     │                   │  └─────────────────┘   │ │
│   │             │                   │           │             │ │
│   │ useAnimated │                   │           ▼             │ │
│   │ Style()     │                   │  ┌─────────────────┐   │ │
│   │             │                   │  │ Style Updates   │   │ │
│   └─────────────┘                   │  └─────────────────┘   │ │
│                                     │           │             │ │
│                                     │           ▼             │ │
│                                     │  ┌─────────────────┐   │ │
│                                     │  │ Native Views    │   │ │
│                                     │  └─────────────────┘   │ │
│                                     └─────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 코드 예제

### 첫 번째 Reanimated 애니메이션

간단한 페이드인 애니메이션을 만들어봅시다:

```typescript
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const FadeInBox = () => {
  // 1. Shared Value 생성 (UI 스레드와 공유)
  const opacity = useSharedValue(0);

  // 2. Animated Style 정의 (UI 스레드에서 실행)
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 3. 애니메이션 트리거
  const fadeIn = () => {
    opacity.value = withTiming(1, { duration: 500 });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Button title="Fade In" onPress={fadeIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { width: 100, height: 100, backgroundColor: '#7A4AE2' },
});
```

### 핵심 포인트 분석

```typescript
// 1️⃣ useSharedValue: 애니메이션 값 저장소
const opacity = useSharedValue(0);
// - 리렌더 없이 값 변경 가능
// - JS/UI 스레드 양쪽에서 접근 가능

// 2️⃣ useAnimatedStyle: 값 → 스타일 변환
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));
// - 콜백 내부는 자동으로 워크릿으로 변환
// - opacity.value가 변경될 때마다 자동 실행

// 3️⃣ withTiming: 애니메이션 적용
opacity.value = withTiming(1, { duration: 500 });
// - 현재값(0)에서 목표값(1)까지 500ms 동안 변화
// - 모든 계산이 UI 스레드에서 수행
```

---

## 📊 비교

### Reanimated vs Animated API

| 항목 | Animated API | Reanimated |
|------|-------------|------------|
| 실행 위치 | JS 스레드 (일부 네이티브 드라이버) | UI 스레드 |
| 성능 | 중간 | 뛰어남 (60fps 보장) |
| 제스처 연동 | 제한적 | 완벽한 통합 |
| 복잡한 로직 | 어려움 | 워크릿으로 가능 |
| 학습 곡선 | 낮음 | 중간 |
| 디버깅 | 쉬움 | 다소 어려움 |
| 번들 크기 | 내장 | 추가 패키지 |

### 언제 무엇을 선택할까?

```
┌─────────────────────────────────────────────────────────────┐
│                    애니메이션 선택 가이드                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  간단한 페이드/슬라이드 ─────► Animated API (충분함)        │
│                                                             │
│  제스처 + 애니메이션 ─────────► Reanimated (필수)           │
│                                                             │
│  복잡한 인터랙션 ─────────────► Reanimated (필수)           │
│                                                             │
│  성능이 중요한 경우 ──────────► Reanimated (권장)           │
│                                                             │
│  스크롤 연동 애니메이션 ──────► Reanimated (필수)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Reanimated vs CSS Animation (Web)

| 항목 | CSS Animation | Reanimated |
|------|--------------|------------|
| 실행 환경 | 브라우저 | React Native |
| 선언 방식 | 스타일시트 | JavaScript |
| 동적 제어 | 제한적 | 완전한 제어 |
| 제스처 연동 | 어려움 | 네이티브 통합 |
| 디버깅 | DevTools | React DevTools |

---

## ⚠️ 흔한 실수

### ❌ 실수 1: 일반 상태로 애니메이션 시도

```typescript
// ❌ 잘못된 방법: useState 사용
const [opacity, setOpacity] = useState(0);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity, // 매 변경마다 리렌더 발생!
}));

// 이렇게 하면 성능 저하 + 버벅임
```

### ✅ 올바른 방법

```typescript
// ✅ 올바른 방법: useSharedValue 사용
const opacity = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value, // .value로 접근
}));

// 리렌더 없이 부드러운 애니메이션
```

### ❌ 실수 2: 일반 View에 animatedStyle 적용

```typescript
// ❌ 작동하지 않음
import { View } from 'react-native';

<View style={animatedStyle} /> // 애니메이션 안 됨!
```

### ✅ 올바른 방법

```typescript
// ✅ Animated.View 사용
import Animated from 'react-native-reanimated';

<Animated.View style={animatedStyle} /> // 정상 작동
```

### ❌ 실수 3: useAnimatedStyle 외부에서 .value 생략

```typescript
// ❌ 콜백 안에서 .value 빼먹기
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity, // .value 빠짐!
}));
```

### ✅ 올바른 방법

```typescript
// ✅ 반드시 .value 사용
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value, // 정상
}));
```

---

## 💡 성능 팁

### Tip 1: Shared Value 변경은 리렌더를 유발하지 않음

```typescript
const offset = useSharedValue(0);

// ✅ 이 코드는 리렌더를 발생시키지 않음
offset.value = 100;

// 반면 useState는 리렌더 발생
const [offset, setOffset] = useState(0);
setOffset(100); // 리렌더 발생!
```

### Tip 2: 무거운 연산도 안전

```typescript
const handleHeavyTask = () => {
  // 이 연산이 아무리 오래 걸려도
  const result = veryHeavyComputation();

  // 애니메이션은 영향받지 않음 (UI 스레드에서 독립 실행)
  // 버튼 눌렀을 때의 시각적 피드백은 부드럽게 유지됨
};
```

### Tip 3: 60fps 달성 조건

```
60fps = 1초에 60프레임 = 프레임당 16.67ms

Reanimated가 60fps를 보장하는 이유:
1. 애니메이션 로직이 UI 스레드에서 실행
2. JS 스레드 병목과 무관
3. Bridge 통신 없음

단, 워크릿 내부 연산이 16ms를 초과하면 드롭 발생
→ 워크릿은 가볍게 유지!
```

---

## 🎯 실무 적용

### 실제 프로젝트에서 Reanimated가 필수인 경우

1. **스와이프 카드 UI** (Tinder 스타일)
   - 드래그에 따른 카드 회전/이동
   - 놓았을 때 스냅 또는 dismiss

2. **바텀 시트**
   - 드래그로 높이 조절
   - 스냅 포인트 지원

3. **이미지 갤러리**
   - 핀치 줌
   - 더블탭 줌
   - 팬 제스처

4. **리스트 아이템 스와이프**
   - 스와이프하여 삭제/아카이브
   - 스와이프 거리에 따른 액션 힌트

5. **헤더 스크롤 연동**
   - 스크롤에 따른 헤더 축소/확대
   - 패럴랙스 효과

---

## 🏋️ 연습 문제

### 문제 1: 개념 확인

다음 중 Reanimated의 핵심 특징이 **아닌** 것은?

1. 애니메이션 로직이 UI 스레드에서 실행된다
2. useState를 사용하여 애니메이션 값을 관리한다
3. 워크릿(Worklet)을 통해 JS 코드를 UI 스레드에서 실행한다
4. Bridge를 거치지 않고 애니메이션을 수행한다

<details>
<summary>💡 힌트</summary>

Reanimated는 React의 일반 상태 관리와 다른 방식을 사용합니다. `useSharedValue`라는 특별한 훅을 떠올려보세요.

</details>

<details>
<summary>✅ 해답</summary>

**정답: 2번**

Reanimated는 `useState` 대신 `useSharedValue`를 사용합니다. `useState`를 사용하면 값이 변경될 때마다 컴포넌트가 리렌더되어 성능이 저하됩니다. `useSharedValue`는 리렌더 없이 UI 스레드에서 직접 값을 업데이트합니다.

</details>

### 문제 2: 코드 분석

다음 코드에서 잘못된 부분을 찾고 수정하세요:

```typescript
import { View } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const MyComponent = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale }],
  }));

  const handlePress = () => {
    scale.value = withTiming(1.2);
  };

  return <View style={animatedStyle} onPress={handlePress} />;
};
```

<details>
<summary>💡 힌트</summary>

세 가지 문제가 있습니다:
1. View 타입
2. `.value` 사용
3. `onPress` props

</details>

<details>
<summary>✅ 해답</summary>

```typescript
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Pressable } from 'react-native';

const MyComponent = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }], // 1. .value 추가
  }));

  const handlePress = () => {
    scale.value = withTiming(1.2);
  };

  // 2. Animated.View 사용
  // 3. Pressable로 감싸서 onPress 처리
  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
};
```

**수정 사항:**
1. `scale` → `scale.value`: Shared Value는 항상 `.value`로 접근
2. `View` → `Animated.View`: 애니메이션 스타일은 Animated 컴포넌트에만 적용
3. `onPress`: View는 onPress를 지원하지 않으므로 Pressable로 감싸기

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **Reanimated는 UI 스레드에서 애니메이션을 실행**하여 60fps를 보장합니다
- **Shared Value**는 JS/UI 스레드 간 공유되는 값으로, 리렌더 없이 업데이트됩니다
- **워크릿(Worklet)**은 UI 스레드에서 실행되는 JavaScript 함수입니다
- **useAnimatedStyle**은 Shared Value를 스타일로 변환합니다
- 기존 Animated API 대비 **제스처 연동, 복잡한 로직, 성능** 면에서 우수합니다

**다음 챕터**: 개발 환경 설정 - Reanimated를 프로젝트에 설치하고 구성하는 방법을 알아봅니다.
