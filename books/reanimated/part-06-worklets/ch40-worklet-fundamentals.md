# Chapter 40: 워크릿 이해하기

Reanimated의 심장부인 워크릿(Worklet)을 깊이 이해합니다. 워크릿이 무엇인지, 왜 필요한지, 그리고 어떻게 동작하는지 알아보며, 60fps 애니메이션의 비밀을 파헤칩니다.

## 📌 학습 목표

- 워크릿의 개념과 필요성 이해
- JavaScript 스레드와 UI 스레드의 차이
- 'worklet' 지시문의 역할
- 워크릿 함수 작성 규칙
- 워크릿 디버깅 방법

## 📖 왜 워크릿이 필요한가?

### React Native의 스레드 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Native Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐       ┌────────────────────┐            │
│  │   JavaScript       │       │      UI Thread     │            │
│  │      Thread        │       │     (Main Thread)  │            │
│  │                    │       │                    │            │
│  │  • React 렌더링    │       │  • 네이티브 뷰     │            │
│  │  • 비즈니스 로직   │ ───── │  • 터치 처리      │            │
│  │  • 상태 관리      │ 브릿지 │  • 화면 그리기     │            │
│  │                    │       │                    │            │
│  └────────────────────┘       └────────────────────┘            │
│            │                           │                        │
│            │    ~10ms 지연              │                        │
│            │◄──────────────────────────►│                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**문제점:**
- 두 스레드 간 통신에 브릿지 사용
- 브릿지 통신은 비동기적이고 비용이 큼
- 60fps = 16.67ms 프레임 시간
- 브릿지 지연이 프레임 예산을 초과하면 끊김 발생

### 기존 Animated API의 한계

```typescript
// React Native의 기본 Animated - JS 스레드에서 실행
import { Animated } from 'react-native';

// 매 프레임마다 브릿지를 통해 값 전달
Animated.timing(animatedValue, {
  toValue: 100,
  duration: 300,
  useNativeDriver: true, // 일부 해결책
}).start();
```

`useNativeDriver: true`로 일부 애니메이션은 UI 스레드에서 실행되지만:
- 제한된 스타일 속성만 지원 (transform, opacity)
- 레이아웃 속성(width, height) 불가
- 복잡한 조건 로직 불가
- 제스처 연동 어려움

### Reanimated의 해결책: 워크릿

```
┌─────────────────────────────────────────────────────────────────┐
│                   Reanimated Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐       ┌────────────────────┐            │
│  │   JavaScript       │       │      UI Thread     │            │
│  │      Thread        │       │                    │            │
│  │                    │       │  ┌──────────────┐  │            │
│  │  • React 컴포넌트  │       │  │   Worklet    │  │            │
│  │  • 초기 설정      │ ─────►│  │   Runtime    │  │            │
│  │                    │ (1회) │  │              │  │            │
│  │                    │       │  │ • 애니메이션│  │            │
│  └────────────────────┘       │  │ • 제스처    │  │            │
│                               │  │ • 계산      │  │            │
│                               │  └──────────────┘  │            │
│                               │         │          │            │
│                               │    직접 조작       │            │
│                               │         ▼          │            │
│                               │  ┌──────────────┐  │            │
│                               │  │  Native View │  │            │
│                               │  └──────────────┘  │            │
│                               └────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**워크릿의 핵심:**
- UI 스레드에서 직접 실행되는 JavaScript 함수
- 브릿지 없이 네이티브 뷰 조작
- 프레임마다 동기적으로 실행 가능
- 복잡한 로직도 60fps 유지

## 💻 워크릿 기본 문법

### 'worklet' 지시문

```typescript
import { runOnUI, runOnJS } from 'react-native-reanimated';

// 워크릿 함수 선언
function myWorklet(value: number) {
  'worklet'; // 이 지시문이 함수를 워크릿으로 변환

  // UI 스레드에서 실행되는 코드
  return value * 2;
}

// 워크릿 호출 (UI 스레드에서)
runOnUI(() => {
  'worklet';
  const result = myWorklet(10);
  console.log(result); // UI 스레드에서 로깅
})();
```

### Babel 변환 과정

```typescript
// 작성한 코드
function calculateOpacity(progress: number) {
  'worklet';
  return Math.min(1, progress * 2);
}

// Babel이 변환한 코드 (개념적 표현)
const calculateOpacity = {
  __worklet: true,
  __location: 'file.ts:1:0',
  __code: 'function(progress){return Math.min(1,progress*2)}',

  // JS 스레드에서 호출 시
  call: (progress) => {
    return Math.min(1, progress * 2);
  },

  // UI 스레드에서 호출 시
  __workletCode: /* 직렬화된 함수 코드 */
};
```

### 자동 워크릿 변환

Reanimated의 일부 API는 콜백을 자동으로 워크릿으로 변환합니다:

```typescript
import {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  useDerivedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

// 자동 워크릿 - 'worklet' 지시문 불필요
const animatedStyle = useAnimatedStyle(() => {
  // 이 함수는 자동으로 워크릿으로 변환됨
  return {
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  };
});

// 자동 워크릿
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    // 자동 워크릿
    scrollY.value = event.contentOffset.y;
  },
});

// 자동 워크릿
const derived = useDerivedValue(() => {
  // 자동 워크릿
  return progress.value * 100;
});
```

## 💻 워크릿 실행 컨텍스트

### runOnUI와 runOnJS

```typescript
import { runOnUI, runOnJS } from 'react-native-reanimated';

// JS 스레드에서 정의된 함수
const showAlert = (message: string) => {
  Alert.alert('알림', message);
};

// 워크릿에서 JS 함수 호출
function myWorklet() {
  'worklet';

  // ❌ 직접 호출 불가 - 다른 스레드
  // showAlert('Hello');

  // ✅ runOnJS로 JS 스레드에서 실행
  runOnJS(showAlert)('Hello');
}

// JS 스레드에서 워크릿 실행
function handlePress() {
  // UI 스레드에서 워크릿 실행
  runOnUI(myWorklet)();
}
```

### 스레드 간 데이터 전달

```typescript
import { runOnUI, runOnJS } from 'react-native-reanimated';

// 복잡한 계산을 UI 스레드에서 수행
function complexCalculation(data: number[]) {
  'worklet';

  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result += Math.sin(data[i]) * Math.cos(data[i]);
  }

  return result;
}

// JS 스레드에서 결과 처리
const handleResult = (result: number) => {
  console.log('계산 결과:', result);
  setCalculatedValue(result);
};

// 실행 체인
function startCalculation() {
  const data = [1, 2, 3, 4, 5];

  runOnUI(() => {
    'worklet';
    const result = complexCalculation(data);
    runOnJS(handleResult)(result);
  })();
}
```

### 워크릿 체이닝

```typescript
// 여러 워크릿을 연결
function step1(value: number) {
  'worklet';
  return value * 2;
}

function step2(value: number) {
  'worklet';
  return value + 10;
}

function step3(value: number) {
  'worklet';
  return Math.round(value);
}

// 체인 실행
function processValue(input: number) {
  'worklet';
  return step3(step2(step1(input)));
}

// 사용
const animatedStyle = useAnimatedStyle(() => {
  const processed = processValue(progress.value);

  return {
    opacity: processed / 100,
  };
});
```

## 💻 워크릿의 제한사항

### 사용 불가능한 것들

```typescript
// ❌ 클로저에서 직접 상태 변경
function BadWorklet() {
  const [count, setCount] = useState(0);

  const worklet = () => {
    'worklet';
    // ❌ React 상태는 워크릿에서 접근 불가
    // setCount(count + 1);
  };
}

// ❌ 비동기 작업
function asyncWorklet() {
  'worklet';
  // ❌ await 사용 불가
  // const data = await fetch('...');
}

// ❌ DOM/브라우저 API
function domWorklet() {
  'worklet';
  // ❌ document, window 등 접근 불가
  // document.getElementById('...');
}

// ❌ 대부분의 외부 라이브러리
function libWorklet() {
  'worklet';
  // ❌ lodash 등 외부 라이브러리 사용 불가
  // _.map(array, fn);
}
```

### 사용 가능한 것들

```typescript
// ✅ 기본 JavaScript 연산
function mathWorklet(a: number, b: number) {
  'worklet';
  return Math.sqrt(a * a + b * b);
}

// ✅ Reanimated 유틸리티
import { interpolate, Extrapolate, interpolateColor } from 'react-native-reanimated';

function interpolateWorklet(progress: number) {
  'worklet';
  return interpolate(progress, [0, 1], [0, 100], Extrapolate.CLAMP);
}

// ✅ Shared Values
function sharedValueWorklet(shared: SharedValue<number>) {
  'worklet';
  shared.value = shared.value + 1;
}

// ✅ 객체와 배열 조작
function objectWorklet(config: { x: number; y: number }) {
  'worklet';
  return {
    ...config,
    z: config.x + config.y,
  };
}

// ✅ 조건문과 반복문
function loopWorklet(values: number[]) {
  'worklet';
  let sum = 0;
  for (const value of values) {
    if (value > 0) {
      sum += value;
    }
  }
  return sum;
}
```

## 💻 실전 워크릿 패턴

### 재사용 가능한 워크릿 라이브러리

```typescript
// src/shared/libs/animation-worklets.ts

/**
 * 부드러운 감속 이징
 */
export function easeOutQuad(t: number) {
  'worklet';
  return t * (2 - t);
}

/**
 * 탄성 이징
 */
export function easeOutElastic(t: number) {
  'worklet';
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * 범위 제한
 */
export function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * 두 값 사이 맵핑
 */
export function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
) {
  'worklet';
  const normalized = (value - inputMin) / (inputMax - inputMin);
  return outputMin + normalized * (outputMax - outputMin);
}

/**
 * 스냅 값으로 반올림
 */
export function snapTo(value: number, snapPoints: number[]) {
  'worklet';
  let closest = snapPoints[0];
  let minDistance = Math.abs(value - closest);

  for (let i = 1; i < snapPoints.length; i++) {
    const distance = Math.abs(value - snapPoints[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = snapPoints[i];
    }
  }

  return closest;
}

/**
 * 지수 감쇠
 */
export function decay(
  velocity: number,
  deceleration: number = 0.998
) {
  'worklet';
  return velocity * deceleration;
}

/**
 * 스프링 물리학
 */
export function spring(
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1
) {
  'worklet';
  const displacement = current - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;

  return {
    position: current + velocity * 0.016 + acceleration * 0.5 * 0.016 * 0.016,
    velocity: velocity + acceleration * 0.016,
  };
}

/**
 * 각도 정규화 (-180 ~ 180)
 */
export function normalizeAngle(angle: number) {
  'worklet';
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}

/**
 * 두 점 사이 거리
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  'worklet';
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 두 점 사이 각도 (라디안)
 */
export function angle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  'worklet';
  return Math.atan2(y2 - y1, x2 - x1);
}
```

### 조건부 스타일 워크릿

```typescript
// 복잡한 조건부 스타일 로직
function useConditionalStyle(
  progress: SharedValue<number>,
  isActive: SharedValue<boolean>
) {
  return useAnimatedStyle(() => {
    const baseOpacity = interpolate(progress.value, [0, 1], [0.5, 1]);

    // 조건부 변환
    const scale = isActive.value
      ? interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1])
      : 1;

    // 조건부 색상
    const backgroundColor = isActive.value
      ? interpolateColor(
          progress.value,
          [0, 1],
          ['#E5E7EB', '#7A4AE2']
        )
      : '#E5E7EB';

    // 조건부 그림자
    const shadowOpacity = isActive.value
      ? interpolate(progress.value, [0, 1], [0, 0.2])
      : 0;

    return {
      opacity: baseOpacity,
      transform: [{ scale }],
      backgroundColor,
      shadowOpacity,
      shadowRadius: shadowOpacity * 10,
      shadowOffset: { width: 0, height: shadowOpacity * 4 },
    };
  });
}
```

### 물리 기반 워크릿

```typescript
import { useDerivedValue, useFrameCallback } from 'react-native-reanimated';

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function usePhysicsSimulation(
  initial: PhysicsState,
  gravity: number = 9.8
) {
  const state = useSharedValue(initial);

  // 프레임마다 물리 계산
  useFrameCallback((frameInfo) => {
    const dt = frameInfo.timeSincePreviousFrame
      ? frameInfo.timeSincePreviousFrame / 1000
      : 0.016;

    state.value = updatePhysics(state.value, gravity, dt);
  });

  return state;
}

function updatePhysics(
  state: PhysicsState,
  gravity: number,
  dt: number
): PhysicsState {
  'worklet';

  // 중력 적용
  const newVy = state.vy + gravity * dt;

  // 위치 업데이트
  const newX = state.x + state.vx * dt;
  const newY = state.y + newVy * dt;

  // 바닥 충돌 체크
  if (newY > 400) {
    return {
      x: newX,
      y: 400,
      vx: state.vx * 0.8, // 마찰
      vy: -newVy * 0.6, // 반발
    };
  }

  return {
    x: newX,
    y: newY,
    vx: state.vx,
    vy: newVy,
  };
}
```

## 💻 워크릿 디버깅

### console.log 사용

```typescript
import { runOnJS } from 'react-native-reanimated';

// JS 스레드 로깅 함수
const log = (message: string, value: any) => {
  console.log(`[Worklet] ${message}:`, value);
};

function debugWorklet(value: number) {
  'worklet';

  // 워크릿 내부에서 로깅
  runOnJS(log)('Progress value', value);

  const result = value * 2;
  runOnJS(log)('Calculated result', result);

  return result;
}
```

### 개발용 디버그 훅

```typescript
// 개발 환경에서만 활성화되는 디버그 훅
function useAnimatedDebug(
  name: string,
  value: SharedValue<number>
) {
  const debugLog = (val: number) => {
    if (__DEV__) {
      console.log(`[${name}]`, val.toFixed(2));
    }
  };

  useDerivedValue(() => {
    runOnJS(debugLog)(value.value);
    return value.value;
  });
}

// 사용
function MyComponent() {
  const progress = useSharedValue(0);

  useAnimatedDebug('progress', progress);

  // ...
}
```

### 성능 측정

```typescript
import { useFrameCallback } from 'react-native-reanimated';

function useFramePerformance() {
  const frameCount = useSharedValue(0);
  const lastSecond = useSharedValue(Date.now());
  const fps = useSharedValue(0);

  const logFps = (currentFps: number) => {
    console.log(`Current FPS: ${currentFps}`);
  };

  useFrameCallback((info) => {
    frameCount.value += 1;

    const now = Date.now();
    if (now - lastSecond.value >= 1000) {
      fps.value = frameCount.value;
      runOnJS(logFps)(frameCount.value);
      frameCount.value = 0;
      lastSecond.value = now;
    }
  });

  return fps;
}
```

## 📱 sometimes-app 적용 사례

### 채팅 입력창 워크릿 로직

```typescript
// src/features/chat/hooks/use-input-animation.ts
import { useSharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { clamp, interpolate } from 'react-native-reanimated';

// 재사용 워크릿 함수
function calculateInputHeight(
  textHeight: number,
  minHeight: number,
  maxHeight: number
) {
  'worklet';
  return clamp(textHeight + 24, minHeight, maxHeight);
}

function calculateToolbarOpacity(
  inputFocused: boolean,
  textLength: number
) {
  'worklet';
  if (!inputFocused) return 0;
  return textLength > 0 ? 0.5 : 1;
}

function calculateSendButtonScale(textLength: number) {
  'worklet';
  return textLength > 0 ? 1 : 0;
}

export function useChatInputAnimation() {
  const textHeight = useSharedValue(40);
  const inputFocused = useSharedValue(false);
  const textLength = useSharedValue(0);

  const MIN_HEIGHT = 48;
  const MAX_HEIGHT = 120;

  // 복합 워크릿 계산
  const containerStyle = useAnimatedStyle(() => {
    const height = calculateInputHeight(
      textHeight.value,
      MIN_HEIGHT,
      MAX_HEIGHT
    );

    const borderColor = inputFocused.value
      ? '#7A4AE2'
      : '#E5E7EB';

    const borderWidth = inputFocused.value ? 2 : 1;

    return {
      height,
      borderColor,
      borderWidth,
    };
  });

  const toolbarStyle = useAnimatedStyle(() => ({
    opacity: calculateToolbarOpacity(
      inputFocused.value,
      textLength.value
    ),
    transform: [
      {
        translateY: interpolate(
          inputFocused.value ? 1 : 0,
          [0, 1],
          [20, 0]
        ),
      },
    ],
  }));

  const sendButtonStyle = useAnimatedStyle(() => {
    const scale = calculateSendButtonScale(textLength.value);
    const opacity = scale;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return {
    textHeight,
    inputFocused,
    textLength,
    containerStyle,
    toolbarStyle,
    sendButtonStyle,
  };
}
```

### 프로필 카드 3D 회전 워크릿

```typescript
// src/features/profile/hooks/use-card-rotation.ts
import { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withDecay } from 'react-native-reanimated';

// 3D 회전 워크릿 유틸리티
function rotationToTransform(
  rotateX: number,
  rotateY: number,
  perspective: number = 1000
) {
  'worklet';

  // 회전 각도 제한
  const clampedX = clamp(rotateX, -30, 30);
  const clampedY = clamp(rotateY, -30, 30);

  return [
    { perspective },
    { rotateX: `${clampedX}deg` },
    { rotateY: `${clampedY}deg` },
  ];
}

function calculateShadow(rotateX: number, rotateY: number) {
  'worklet';

  // 회전에 따른 그림자 위치
  const shadowOffsetX = -rotateY * 0.5;
  const shadowOffsetY = rotateX * 0.5 + 4;
  const shadowOpacity = 0.15 + Math.abs(rotateX + rotateY) * 0.002;

  return {
    shadowOffset: { width: shadowOffsetX, height: shadowOffsetY },
    shadowOpacity: clamp(shadowOpacity, 0, 0.3),
    shadowRadius: 8 + Math.abs(rotateX + rotateY) * 0.1,
  };
}

function calculateGlare(rotateX: number, rotateY: number) {
  'worklet';

  // 빛 반사 위치
  const glareX = 50 + rotateY * 2;
  const glareY = 50 - rotateX * 2;
  const glareOpacity = (Math.abs(rotateX) + Math.abs(rotateY)) * 0.01;

  return {
    x: `${clamp(glareX, 0, 100)}%`,
    y: `${clamp(glareY, 0, 100)}%`,
    opacity: clamp(glareOpacity, 0, 0.3),
  };
}

export function useCardRotation() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      // 터치 위치를 회전으로 변환
      rotateY.value = (event.x - 150) * 0.1;
      rotateX.value = -(event.y - 200) * 0.1;
    },
    onEnd: () => {
      // 스프링으로 원위치
      rotateX.value = withSpring(0, { damping: 15 });
      rotateY.value = withSpring(0, { damping: 15 });
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const transform = rotationToTransform(rotateX.value, rotateY.value);
    const shadow = calculateShadow(rotateX.value, rotateY.value);

    return {
      transform,
      ...shadow,
      shadowColor: '#000',
    };
  });

  const glareStyle = useAnimatedStyle(() => {
    const glare = calculateGlare(rotateX.value, rotateY.value);

    return {
      opacity: glare.opacity,
      background: `radial-gradient(circle at ${glare.x} ${glare.y}, white, transparent)`,
    };
  });

  return {
    gestureHandler,
    cardStyle,
    glareStyle,
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 클로저 캡처 문제

```typescript
// ❌ 잘못된 방법 - 클로저가 초기값만 캡처
function BadComponent({ initialValue }) {
  const [value, setValue] = useState(initialValue);

  const animatedStyle = useAnimatedStyle(() => {
    // value는 항상 초기값
    return { opacity: value };
  });
}

// ✅ 올바른 방법 - Shared Value 사용
function GoodComponent({ initialValue }) {
  const value = useSharedValue(initialValue);

  const animatedStyle = useAnimatedStyle(() => {
    return { opacity: value.value };
  });

  // 외부에서 업데이트
  const updateValue = (newValue: number) => {
    value.value = newValue;
  };
}
```

### 2. runOnJS 누락

```typescript
// ❌ 잘못된 방법 - JS 함수 직접 호출
function BadWorklet(onComplete: () => void) {
  'worklet';
  // 에러 발생!
  onComplete();
}

// ✅ 올바른 방법 - runOnJS 사용
function GoodWorklet(onComplete: () => void) {
  'worklet';
  runOnJS(onComplete)();
}
```

### 3. 무거운 연산

```typescript
// ❌ 잘못된 방법 - 매 프레임 무거운 연산
const animatedStyle = useAnimatedStyle(() => {
  // 매 프레임 수천 번 계산
  let result = 0;
  for (let i = 0; i < 10000; i++) {
    result += Math.sin(i);
  }
  return { opacity: result };
});

// ✅ 올바른 방법 - 캐싱 또는 단순화
const precomputed = useMemo(() => {
  let result = 0;
  for (let i = 0; i < 10000; i++) {
    result += Math.sin(i);
  }
  return result;
}, []);

const animatedStyle = useAnimatedStyle(() => {
  return { opacity: progress.value * precomputed };
});
```

## 💡 성능 최적화 팁

### 1. 워크릿 함수 분리

```typescript
// 재사용 가능한 워크릿은 컴포넌트 외부에 정의
function calculateTransform(progress: number, config: TransformConfig) {
  'worklet';
  return {
    scale: interpolate(progress, [0, 1], [config.minScale, config.maxScale]),
    rotation: progress * config.maxRotation,
  };
}

// 컴포넌트에서 사용
function MyComponent() {
  const config = { minScale: 0.8, maxScale: 1.2, maxRotation: 360 };

  const animatedStyle = useAnimatedStyle(() => {
    const { scale, rotation } = calculateTransform(progress.value, config);
    return {
      transform: [{ scale }, { rotate: `${rotation}deg` }],
    };
  });
}
```

### 2. 메모이제이션 활용

```typescript
// 정적 값은 useMemo로 캐싱
const staticConfig = useMemo(() => ({
  snapPoints: [0, 100, 200, 300],
  dampingRatio: 0.8,
  stiffness: 100,
}), []);

const animatedStyle = useAnimatedStyle(() => {
  const snapped = snapTo(position.value, staticConfig.snapPoints);
  return { translateY: snapped };
});
```

## 🏋️ 연습 문제

### 과제 1: 커스텀 이징 워크릿
베지어 곡선 기반의 커스텀 이징 함수를 워크릿으로 구현하세요.

### 과제 2: 물리 시뮬레이션
탄성 충돌을 시뮬레이션하는 워크릿을 작성하세요.

### 과제 3: 워크릿 디버거
개발 환경에서 워크릿 실행을 추적하고 시각화하는 유틸리티를 만드세요.

## 📚 이 장에서 배운 내용

1. **워크릿의 필요성**: 브릿지 병목 해결과 60fps 달성
2. **'worklet' 지시문**: 함수를 UI 스레드 실행 가능하게 변환
3. **스레드 간 통신**: runOnUI, runOnJS 사용법
4. **제한사항**: 비동기, DOM API, 외부 라이브러리 제약
5. **디버깅**: 워크릿 내 로깅과 성능 측정

## 다음 장 예고

**Chapter 41: Shared Values 심화**에서는 워크릿 간 데이터 공유의 핵심인 Shared Values를 깊이 탐구합니다. 다양한 타입의 Shared Values, 성능 최적화, 그리고 복잡한 상태 관리 패턴을 배웁니다.
