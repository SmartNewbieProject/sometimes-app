# 부록 E: 용어집

React Native Reanimated 및 관련 기술에서 사용되는 주요 용어를 정리했습니다.

---

## A

### Animation Callback
애니메이션 완료 시 호출되는 함수. `withTiming`, `withSpring` 등의 마지막 파라미터로 전달됨.
```typescript
withTiming(100, { duration: 300 }, (finished) => {
  // finished: boolean
});
```

### Animated Component
Reanimated가 제공하는 애니메이션 가능한 컴포넌트. `Animated.View`, `Animated.Text`, `Animated.Image` 등.

### AnimatedRef
`useAnimatedRef`로 생성되는 참조. `measure()` 함수와 함께 사용하여 컴포넌트의 레이아웃 정보를 얻을 수 있음.

### Animated Style
`useAnimatedStyle`로 생성되는 스타일 객체. SharedValue가 변경될 때 자동으로 업데이트됨.

---

## B

### Bridge
React Native에서 JavaScript와 네이티브 코드 간의 통신 채널. 기존 아키텍처에서 성능 병목의 주요 원인.

---

## C

### cancelAnimation
실행 중인 애니메이션을 취소하는 함수. 메모리 누수 방지를 위해 cleanup에서 사용.
```typescript
cancelAnimation(sharedValue);
```

### Clamp
값을 지정된 범위 내로 제한하는 것. `Extrapolate.CLAMP` 또는 `clamp()` 함수 사용.

### Composition
여러 제스처를 조합하는 것. `Gesture.Simultaneous`, `Gesture.Exclusive`, `Gesture.Race`.

---

## D

### Damping
스프링 애니메이션에서 진동을 억제하는 정도. 값이 클수록 빠르게 안정됨.
```typescript
withSpring(100, { damping: 15 });
```

### Decay Animation
감속 애니메이션. 초기 속도에서 시작하여 점점 느려지며 멈춤. 스크롤 관성에 사용.
```typescript
withDecay({ velocity: 1000, deceleration: 0.997 });
```

### Derived Value
다른 SharedValue로부터 계산된 값. `useDerivedValue`로 생성.

---

## E

### Easing
애니메이션의 시간에 따른 진행 곡선. 선형, 이즈인, 이즈아웃, 베지어 등.
```typescript
Easing.bezier(0.25, 0.1, 0.25, 1)
```

### Entering Animation
컴포넌트가 마운트될 때 실행되는 애니메이션. `FadeIn`, `SlideInUp` 등.

### Exiting Animation
컴포넌트가 언마운트될 때 실행되는 애니메이션. `FadeOut`, `SlideOutDown` 등.

### Extrapolation
`interpolate`에서 입력 범위를 벗어난 값의 처리 방식.
- `EXTEND`: 외삽 (기본값)
- `CLAMP`: 범위 제한
- `IDENTITY`: 입력값 그대로 반환

---

## F

### Frame Callback
매 프레임(보통 1/60초)마다 실행되는 콜백. `useFrameCallback`으로 등록.

### FPS (Frames Per Second)
초당 렌더링되는 프레임 수. 부드러운 애니메이션을 위해 60fps 유지가 목표.

---

## G

### Gesture
사용자의 터치 인터랙션. Pan, Tap, Pinch, Rotation, LongPress 등.

### Gesture Detector
제스처를 감지하는 컴포넌트. `<GestureDetector gesture={...}>` 형태로 사용.

### Gesture Handler
React Native Gesture Handler 라이브러리. Reanimated와 함께 사용하여 부드러운 제스처 처리.

---

## H

### Hardware Acceleration
GPU를 활용한 렌더링 가속. transform 속성(translateX/Y, scale, rotate)이 하드웨어 가속됨.

### Hermes
Facebook이 개발한 React Native용 JavaScript 엔진. 시작 시간 및 메모리 사용량 개선.

---

## I

### Interpolate
값을 한 범위에서 다른 범위로 매핑하는 함수.
```typescript
interpolate(value, [0, 100], [0, 1])
```

### Interpolate Color
색상을 보간하는 함수.
```typescript
interpolateColor(progress, [0, 1], ['#FFF', '#000'])
```

---

## J

### Jank
프레임 드롭으로 인한 끊김 현상. 16.67ms 이상 소요되는 프레임이 발생할 때 나타남.

### JS Thread
JavaScript 코드가 실행되는 스레드. 비즈니스 로직, 상태 관리 등 담당.

### JSI (JavaScript Interface)
새로운 아키텍처에서 JavaScript와 네이티브 코드 간 직접 통신을 가능하게 하는 인터페이스.

---

## L

### Layout Animation
레이아웃 변경 시 적용되는 애니메이션. `layout` prop으로 설정.
```typescript
<Animated.View layout={LinearTransition}>
```

### Layout Transition
레이아웃이 변경될 때의 전환 효과. `LinearTransition`, `SequencedTransition` 등.

---

## M

### Mass
스프링 애니메이션에서 물체의 질량. 값이 클수록 움직임이 느리고 무거움.

### Measure
컴포넌트의 레이아웃 정보(위치, 크기)를 측정하는 함수.
```typescript
const measurement = measure(animatedRef);
```

---

## N

### Native Driver
애니메이션을 네이티브 스레드에서 실행하는 방식. Reanimated는 기본적으로 네이티브 드라이버 사용.

### New Architecture
React Native의 새로운 아키텍처. Fabric, TurboModules, JSI 등 포함.

---

## O

### Overdraw
같은 픽셀을 여러 번 그리는 현상. 성능 저하의 원인이 될 수 있음.

---

## P

### Pan Gesture
드래그 제스처. 손가락으로 화면을 누르고 이동하는 동작.

### Pinch Gesture
핀치(두 손가락으로 벌리거나 오므리는) 제스처. 주로 확대/축소에 사용.

---

## R

### Rasterization
복잡한 뷰를 비트맵으로 캐싱하는 것. iOS의 `shouldRasterizeIOS` 속성.

### Rotation Gesture
회전 제스처. 두 손가락으로 회전하는 동작.

### runOnJS
worklet에서 JavaScript 스레드의 함수를 호출하는 함수.
```typescript
runOnJS(callback)();
```

### runOnUI
JavaScript 스레드에서 UI 스레드의 worklet을 호출하는 함수.
```typescript
runOnUI(workletFunction)();
```

---

## S

### Shared Value
Reanimated의 핵심 개념. UI 스레드와 JS 스레드 간에 공유되는 값.
```typescript
const translateX = useSharedValue(0);
translateX.value = 100;
```

### Simultaneous Gesture
동시에 인식되는 제스처. `Gesture.Simultaneous`로 조합.

### Spring Animation
스프링 물리를 기반으로 한 애니메이션. 자연스러운 감속과 바운스 효과.
```typescript
withSpring(100, { damping: 15, stiffness: 100 });
```

### Stiffness
스프링 애니메이션에서 강성. 값이 클수록 빠르고 강하게 움직임.

---

## T

### Tap Gesture
탭(터치) 제스처. 싱글 탭, 더블 탭 등.

### Timing Animation
시간 기반 애니메이션. 지정된 duration 동안 값이 변화.
```typescript
withTiming(100, { duration: 300 });
```

### Transform
요소의 변환. translateX/Y, scale, rotate, skew 등. GPU 가속됨.

---

## U

### UI Thread
화면 렌더링을 담당하는 스레드. 60fps 유지를 위해 16.67ms 이내에 작업 완료 필요.

### useAnimatedReaction
SharedValue 변경에 반응하여 사이드 이펙트를 실행하는 훅.
```typescript
useAnimatedReaction(
  () => sharedValue.value,
  (current, previous) => { /* 반응 로직 */ }
);
```

### useAnimatedScrollHandler
애니메이션 스크롤 핸들러를 생성하는 훅. UI 스레드에서 실행됨.

### useAnimatedStyle
애니메이션 스타일을 생성하는 훅. SharedValue 변경 시 자동 업데이트.

### useDerivedValue
다른 SharedValue로부터 파생된 값을 생성하는 훅.

### useFrameCallback
매 프레임마다 콜백을 실행하는 훅. 연속 애니메이션에 유용.

### useSharedValue
공유 값을 생성하는 훅. Reanimated의 가장 기본적인 훅.

---

## V

### Velocity
속도. 제스처 종료 시 제공되는 속도 값을 애니메이션에 전달하여 자연스러운 이어짐.

---

## W

### withDelay
애니메이션 시작을 지연시키는 함수.
```typescript
withDelay(500, withTiming(100));
```

### withRepeat
애니메이션을 반복하는 함수.
```typescript
withRepeat(animation, -1, true); // 무한 왕복
```

### withSequence
순차적 애니메이션을 생성하는 함수.
```typescript
withSequence(withTiming(100), withTiming(0));
```

### Worklet
UI 스레드에서 실행되는 JavaScript 함수. `'worklet'` 디렉티브로 표시.
```typescript
function myWorklet() {
  'worklet';
  // UI 스레드에서 실행
}
```

---

## 숫자/기호

### 60fps
초당 60프레임. 부드러운 애니메이션의 표준 목표. 각 프레임은 16.67ms.

### 16.67ms
60fps에서 한 프레임에 허용되는 시간. 이 시간 내에 렌더링이 완료되어야 함.

---

## 약어

| 약어 | 전체 명칭 | 설명 |
|------|----------|------|
| FPS | Frames Per Second | 초당 프레임 수 |
| GPU | Graphics Processing Unit | 그래픽 처리 장치 |
| JSI | JavaScript Interface | JS-네이티브 직접 통신 인터페이스 |
| OOM | Out of Memory | 메모리 부족 |
| UI | User Interface | 사용자 인터페이스 |
| UX | User Experience | 사용자 경험 |
