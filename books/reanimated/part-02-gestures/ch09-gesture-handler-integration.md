# Chapter 9: react-native-gesture-handler 통합

## 📌 개요

이 챕터에서 배울 내용:
- react-native-gesture-handler 소개 및 설치
- Gesture Handler v2 API 이해
- Reanimated와의 완벽한 통합
- GestureDetector와 Gesture 객체
- 기본 제스처 패턴

**선수 지식**: Part 1 완료
**예상 학습 시간**: 40분

---

## 📖 개념 이해

### 왜 Gesture Handler인가?

React Native의 기본 터치 시스템(TouchableOpacity, PanResponder 등)은 **JS 스레드에서 처리**됩니다. 복잡한 제스처에서 성능 문제가 발생합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    터치 처리 비교                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   기본 React Native (PanResponder)                          │
│   ────────────────────────────────                          │
│   터치 → Native → Bridge → JS Thread → 처리 → Bridge → UI   │
│                    ↑                                         │
│                    ⚠️ 병목 발생                              │
│                                                              │
│   Gesture Handler + Reanimated                               │
│   ────────────────────────────                               │
│   터치 → Native → UI Thread → 직접 처리                      │
│                    ↑                                         │
│                    ✅ 60fps 보장                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Gesture Handler v2 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                   Gesture Handler v2 구조                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  GestureDetector                     │   │
│   │  (제스처를 감지하고 처리하는 컴포넌트)                │   │
│   └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    Gesture 객체                      │   │
│   │  Gesture.Tap()  Gesture.Pan()  Gesture.Pinch() ...  │   │
│   └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   이벤트 콜백                        │   │
│   │  .onStart()  .onUpdate()  .onEnd()  .onFinalize()   │   │
│   └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Shared Value 업데이트                   │   │
│   │  (UI 스레드에서 직접 애니메이션 값 변경)              │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 주요 제스처 종류

| 제스처 | 설명 | 주요 사용처 |
|--------|------|------------|
| `Gesture.Tap()` | 탭/더블탭 | 버튼, 선택 |
| `Gesture.Pan()` | 드래그 | 스와이프, 이동 |
| `Gesture.Pinch()` | 핀치 줌 | 이미지 확대 |
| `Gesture.Rotation()` | 회전 | 이미지 회전 |
| `Gesture.LongPress()` | 길게 누르기 | 컨텍스트 메뉴 |
| `Gesture.Fling()` | 빠른 스와이프 | 페이지 넘기기 |

---

## 💻 설치 및 설정

### Expo 프로젝트

```bash
npx expo install react-native-gesture-handler
```

### Bare React Native

```bash
npm install react-native-gesture-handler
cd ios && pod install
```

### 앱 진입점 설정

```typescript
// App.tsx 또는 _layout.tsx (Expo Router)
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 앱의 나머지 부분 */}
    </GestureHandlerRootView>
  );
}
```

> ⚠️ **중요**: `GestureHandlerRootView`로 앱 전체를 감싸야 제스처가 작동합니다.

---

## 💻 코드 예제

### 기본 구조

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const BasicGesture = () => {
  const translateX = useSharedValue(0);

  // 1. 제스처 정의
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    });

  // 2. 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 3. GestureDetector로 감싸기
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
};
```

### 제스처 이벤트 생명주기

```typescript
const panGesture = Gesture.Pan()
  // 제스처가 시작되려 할 때 (조건 체크 가능)
  .onBegin((event) => {
    console.log('Begin:', event);
  })
  // 제스처가 활성화될 때
  .onStart((event) => {
    console.log('Start:', event);
  })
  // 제스처 진행 중 (매 프레임)
  .onUpdate((event) => {
    console.log('Update:', event.translationX, event.translationY);
  })
  // 제스처 종료 시
  .onEnd((event) => {
    console.log('End:', event.velocityX, event.velocityY);
  })
  // 제스처가 완전히 끝났을 때 (성공/실패 무관)
  .onFinalize((event, success) => {
    console.log('Finalize:', success);
  });
```

### 이벤트 객체 구조

```typescript
// Pan 제스처 이벤트
interface PanGestureEvent {
  translationX: number;  // 시작점 대비 X 이동량
  translationY: number;  // 시작점 대비 Y 이동량
  absoluteX: number;     // 화면 기준 X 좌표
  absoluteY: number;     // 화면 기준 Y 좌표
  velocityX: number;     // X 방향 속도
  velocityY: number;     // Y 방향 속도
  x: number;             // 컴포넌트 기준 X 좌표
  y: number;             // 컴포넌트 기준 Y 좌표
}

// Tap 제스처 이벤트
interface TapGestureEvent {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  numberOfPointers: number;
}

// Pinch 제스처 이벤트
interface PinchGestureEvent {
  scale: number;         // 핀치 스케일 (1 = 원래 크기)
  velocity: number;      // 스케일 변화 속도
  focalX: number;        // 핀치 중심 X
  focalY: number;        // 핀치 중심 Y
}
```

### 드래그 가능한 박스

```typescript
const DraggableBox = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 드래그 시작 시 현재 위치 저장
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      // 저장된 위치 + 이동량
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd((event) => {
      // 속도에 따른 감속 애니메이션
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-150, 150],
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        clamp: [-150, 150],
      });
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

### 제스처 설정 옵션

```typescript
const configuredGesture = Gesture.Pan()
  // 최소 이동 거리 (픽셀)
  .minDistance(10)
  // 활성화 조건
  .activeOffsetX([-20, 20])  // X로 20px 이상 이동 시 활성화
  .activeOffsetY([-20, 20])  // Y로 20px 이상 이동 시 활성화
  // 실패 조건
  .failOffsetX([-50, 50])    // X로 50px 이상 이동 시 실패
  .failOffsetY([-50, 50])    // Y로 50px 이상 이동 시 실패
  // 터치 개수
  .minPointers(1)
  .maxPointers(1)
  // 터치 영역 확장
  .hitSlop({ left: 20, right: 20, top: 20, bottom: 20 })
  // 활성화 여부
  .enabled(true)
  // 네이티브 제스처와의 관계
  .shouldCancelWhenOutside(true);
```

---

## 📊 비교

### v1 vs v2 API

| 항목 | v1 (레거시) | v2 (현재) |
|------|------------|-----------|
| 컴포넌트 | `<PanGestureHandler>` | `<GestureDetector>` |
| 제스처 정의 | props로 전달 | `Gesture.Pan()` 객체 |
| 중첩 제스처 | 복잡한 ref 관리 | 간단한 조합 메서드 |
| 타입 지원 | 제한적 | 완벽한 TypeScript |
| 콜백 | `onGestureEvent` | `.onUpdate()` 체이닝 |

```typescript
// ❌ v1 (레거시) - 더 이상 권장하지 않음
import { PanGestureHandler } from 'react-native-gesture-handler';

<PanGestureHandler onGestureEvent={handleGesture}>
  <Animated.View />
</PanGestureHandler>

// ✅ v2 (권장)
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const gesture = Gesture.Pan().onUpdate(handleUpdate);

<GestureDetector gesture={gesture}>
  <Animated.View />
</GestureDetector>
```

### Gesture Handler vs PanResponder

| 항목 | PanResponder | Gesture Handler |
|------|-------------|-----------------|
| 실행 스레드 | JS Thread | UI Thread |
| 성능 | 중간 | 뛰어남 |
| Reanimated 통합 | 수동 | 자동 |
| 복합 제스처 | 어려움 | 쉬움 |
| 디버깅 | 어려움 | 용이 |
| 권장도 | ❌ | ✅ |

---

## ⚠️ 흔한 실수

### ❌ 실수 1: GestureHandlerRootView 누락

```typescript
// ❌ 제스처가 작동하지 않음
export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <MyGestureComponent />
    </View>
  );
}
```

### ✅ 올바른 방법

```typescript
// ✅ GestureHandlerRootView로 감싸기
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MyGestureComponent />
    </GestureHandlerRootView>
  );
}
```

### ❌ 실수 2: 일반 View를 GestureDetector의 자식으로

```typescript
// ❌ Animated.View가 아니면 애니메이션 안 됨
<GestureDetector gesture={gesture}>
  <View style={animatedStyle} />  {/* 작동 안 함! */}
</GestureDetector>
```

### ✅ 올바른 방법

```typescript
// ✅ Animated.View 사용
<GestureDetector gesture={gesture}>
  <Animated.View style={animatedStyle} />
</GestureDetector>
```

### ❌ 실수 3: 렌더마다 새 Gesture 생성

```typescript
// ❌ 매 렌더마다 새 gesture 객체 생성
const MyComponent = () => {
  const gesture = Gesture.Pan().onUpdate(() => {});  // 매번 새로 생성

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View />
    </GestureDetector>
  );
};
```

### ✅ 올바른 방법

```typescript
// ✅ useMemo 또는 컴포넌트 외부에서 정의
// (Gesture 객체는 Shared Value를 사용하므로 보통 괜찮지만, 복잡한 경우 useMemo 권장)
const MyComponent = () => {
  const translateX = useSharedValue(0);

  // Shared Value가 변하지 않으면 gesture도 안정적
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View />
    </GestureDetector>
  );
};
```

### ❌ 실수 4: runOnJS 없이 JS 함수 호출

```typescript
// ❌ 워크릿에서 직접 JS 함수 호출
const gesture = Gesture.Pan()
  .onEnd(() => {
    console.log('End!');  // 에러 발생 가능
    setState(newValue);    // 에러!
  });
```

### ✅ 올바른 방법

```typescript
import { runOnJS } from 'react-native-reanimated';

// ✅ runOnJS로 감싸서 호출
const handleEnd = () => {
  console.log('End!');
  setState(newValue);
};

const gesture = Gesture.Pan()
  .onEnd(() => {
    runOnJS(handleEnd)();
  });
```

---

## 💡 성능 팁

### Tip 1: 불필요한 업데이트 방지

```typescript
// ❌ 모든 업데이트에서 runOnJS 호출
const gesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
    runOnJS(logPosition)(e.translationX);  // 매 프레임 JS 호출!
  });

// ✅ 필요할 때만 JS 호출
const gesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
  })
  .onEnd((e) => {
    runOnJS(logFinalPosition)(e.translationX);  // 끝날 때만
  });
```

### Tip 2: activeOffset으로 의도적 지연

```typescript
// 너무 민감하면 스크롤과 충돌할 수 있음
const swipeGesture = Gesture.Pan()
  .activeOffsetX([-10, 10])  // 10px 이상 움직여야 활성화
  .onUpdate((e) => {
    translateX.value = e.translationX;
  });
```

### Tip 3: hitSlop으로 터치 영역 확장

```typescript
// 작은 버튼도 쉽게 터치
const tapGesture = Gesture.Tap()
  .hitSlop({ top: 20, bottom: 20, left: 20, right: 20 })
  .onEnd(() => {
    // 터치 처리
  });
```

---

## 🎯 실무 적용

### 패턴 1: 스와이프 삭제

```typescript
const SwipeToDelete = ({ onDelete, children }) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(60);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // 왼쪽으로만 스와이프
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      const shouldDelete = translateX.value < -100;

      if (shouldDelete) {
        translateX.value = withTiming(-300);
        itemHeight.value = withTiming(0);
        opacity.value = withTiming(0, {}, (finished) => {
          if (finished) {
            runOnJS(onDelete)();
          }
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
```

### 패턴 2: 풀 투 리프레시

```typescript
const PullToRefresh = ({ onRefresh, children }) => {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0 && !isRefreshing.value) {
        // 저항감 있는 당김
        translateY.value = e.translationY * 0.5;
      }
    })
    .onEnd(() => {
      if (translateY.value > 80) {
        isRefreshing.value = true;
        translateY.value = withTiming(60);
        runOnJS(onRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const finishRefresh = () => {
    isRefreshing.value = false;
    translateY.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
```

---

## 🏋️ 연습 문제

### 문제 1: 기본 드래그

박스를 드래그하면 따라다니고, 놓으면 원래 위치로 스프링 애니메이션과 함께 돌아가는 컴포넌트를 만드세요.

<details>
<summary>✅ 해답</summary>

```typescript
const SnapBackBox = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
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

</details>

### 문제 2: 스케일 피드백

박스를 누르고 있으면 0.9로 축소되고, 놓으면 1로 돌아오는 컴포넌트를 만드세요.

<details>
<summary>✅ 해답</summary>

```typescript
const ScaleFeedbackBox = () => {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **react-native-gesture-handler**는 네이티브 수준의 제스처 처리 제공
- **Gesture Handler v2**는 `Gesture.Pan()` 등 체이닝 API 사용
- **GestureDetector**로 제스처를 컴포넌트에 연결
- 콜백은 **UI 스레드**에서 실행되어 Shared Value 직접 업데이트 가능
- JS 함수 호출 시 **runOnJS** 필수
- **GestureHandlerRootView**로 앱 전체를 감싸야 함

**다음 챕터**: Tap 제스처와 피드백 - 탭, 더블탭, 롱프레스의 상세 구현을 배웁니다.
