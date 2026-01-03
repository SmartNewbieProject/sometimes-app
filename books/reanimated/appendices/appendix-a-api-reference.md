# 부록 A: API 레퍼런스

이 부록은 React Native Reanimated의 핵심 API를 빠르게 참조할 수 있도록 정리한 레퍼런스입니다.

## 목차

1. [Hooks](#hooks)
2. [Animations](#animations)
3. [Utilities](#utilities)
4. [Components](#components)
5. [Layout Animations](#layout-animations)
6. [Gesture Handler 2](#gesture-handler-2)

---

## Hooks

### useSharedValue

공유 값을 생성합니다. UI 스레드와 JS 스레드 간에 동기화됩니다.

```typescript
function useSharedValue<T>(initialValue: T): SharedValue<T>;

// 사용 예시
const translateX = useSharedValue(0);
const config = useSharedValue({ x: 0, y: 0 });

// 값 읽기/쓰기
translateX.value = 100;
const current = translateX.value;
```

**파라미터:**
| 이름 | 타입 | 설명 |
|------|------|------|
| initialValue | T | 초기값 (숫자, 객체, 배열 등) |

**반환값:** `SharedValue<T>` - `.value`로 접근 가능한 공유 값 객체

---

### useAnimatedStyle

애니메이션 스타일을 생성합니다. SharedValue가 변경될 때 자동으로 업데이트됩니다.

```typescript
function useAnimatedStyle<T extends ViewStyle | TextStyle | ImageStyle>(
  updater: () => T,
  dependencies?: DependencyList
): AnimatedStyleProp<T>;

// 사용 예시
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
  opacity: opacity.value,
}));

// 의존성 배열 사용 (선택사항)
const style = useAnimatedStyle(() => ({
  backgroundColor: theme === 'dark' ? '#000' : '#fff',
}), [theme]);
```

**파라미터:**
| 이름 | 타입 | 설명 |
|------|------|------|
| updater | () => T | 스타일 객체를 반환하는 worklet 함수 |
| dependencies | DependencyList? | 선택적 의존성 배열 |

---

### useDerivedValue

다른 SharedValue로부터 파생된 값을 생성합니다.

```typescript
function useDerivedValue<T>(
  processor: () => T,
  dependencies?: DependencyList
): DerivedValue<T>;

// 사용 예시
const scale = useDerivedValue(() => {
  return interpolate(progress.value, [0, 1], [0.5, 1]);
});

// 복합 계산
const position = useDerivedValue(() => ({
  x: translateX.value + offsetX.value,
  y: translateY.value + offsetY.value,
}));
```

---

### useAnimatedScrollHandler

스크롤 이벤트 핸들러를 생성합니다.

```typescript
function useAnimatedScrollHandler<T extends Record<string, unknown>>(
  handlers: ScrollHandler<T> | ScrollHandlers<T>,
  dependencies?: DependencyList
): (event: NativeScrollEvent) => void;

// 사용 예시
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
  onBeginDrag: () => {
    isDragging.value = true;
  },
  onEndDrag: () => {
    isDragging.value = false;
  },
  onMomentumBegin: () => {},
  onMomentumEnd: () => {},
});

<Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} />
```

**핸들러 이벤트:**
| 이벤트 | 설명 |
|--------|------|
| onScroll | 스크롤 중 호출 |
| onBeginDrag | 드래그 시작 |
| onEndDrag | 드래그 종료 |
| onMomentumBegin | 모멘텀 스크롤 시작 |
| onMomentumEnd | 모멘텀 스크롤 종료 |

---

### useAnimatedRef

컴포넌트 참조를 생성합니다. measure()와 함께 사용합니다.

```typescript
function useAnimatedRef<T extends Component>(): AnimatedRef<T>;

// 사용 예시
const viewRef = useAnimatedRef<Animated.View>();

const handlePress = () => {
  const measurement = measure(viewRef);
  if (measurement) {
    console.log(measurement.width, measurement.height);
  }
};

<Animated.View ref={viewRef} />
```

---

### useAnimatedReaction

SharedValue 변경에 반응하여 사이드 이펙트를 실행합니다.

```typescript
function useAnimatedReaction<T>(
  prepare: () => T,
  react: (prepared: T, previous: T | null) => void,
  dependencies?: DependencyList
): void;

// 사용 예시
useAnimatedReaction(
  () => translateX.value,
  (currentValue, previousValue) => {
    if (currentValue > 100 && previousValue <= 100) {
      runOnJS(triggerHaptic)();
    }
  }
);

// 복합 조건
useAnimatedReaction(
  () => ({
    x: translateX.value,
    y: translateY.value,
  }),
  (current, previous) => {
    if (current.x !== previous?.x || current.y !== previous?.y) {
      // 위치 변경 감지
    }
  }
);
```

---

### useFrameCallback

매 프레임마다 콜백을 실행합니다.

```typescript
function useFrameCallback(
  callback: FrameCallback,
  autostart?: boolean
): FrameCallbackRegistration;

type FrameCallback = (frameInfo: FrameInfo) => void;

interface FrameInfo {
  timestamp: number;      // 현재 타임스탬프 (ms)
  timeSincePreviousFrame: number | null;  // 이전 프레임과의 시간차
  timeSinceFirstFrame: number;  // 첫 프레임부터의 경과 시간
}

// 사용 예시
const { setActive } = useFrameCallback((info) => {
  // 매 프레임 실행
  rotation.value += info.timeSincePreviousFrame * 0.001;
}, true);

// 시작/정지 제어
setActive(false); // 정지
setActive(true);  // 시작
```

---

## Animations

### withTiming

시간 기반 애니메이션을 생성합니다.

```typescript
function withTiming<T extends AnimatableValue>(
  toValue: T,
  config?: WithTimingConfig,
  callback?: AnimationCallback
): T;

interface WithTimingConfig {
  duration?: number;      // 기본값: 300ms
  easing?: EasingFunction;
  reduceMotion?: ReduceMotion;
}

// 사용 예시
translateX.value = withTiming(100);

translateX.value = withTiming(100, {
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});

// 완료 콜백
translateX.value = withTiming(100, { duration: 300 }, (finished) => {
  if (finished) {
    runOnJS(onComplete)();
  }
});
```

---

### withSpring

스프링 물리 기반 애니메이션을 생성합니다.

```typescript
function withSpring<T extends AnimatableValue>(
  toValue: T,
  config?: WithSpringConfig,
  callback?: AnimationCallback
): T;

interface WithSpringConfig {
  damping?: number;        // 기본값: 10 (감쇠)
  mass?: number;           // 기본값: 1 (질량)
  stiffness?: number;      // 기본값: 100 (강성)
  overshootClamping?: boolean;  // 오버슈트 방지
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
  velocity?: number;       // 초기 속도
  reduceMotion?: ReduceMotion;
}

// 사용 예시
translateX.value = withSpring(100);

translateX.value = withSpring(100, {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
});

// 제스처 속도 전달
translateX.value = withSpring(0, {
  velocity: event.velocityX,
});
```

---

### withDecay

감속 애니메이션을 생성합니다. 주로 제스처 종료 후 관성 효과에 사용됩니다.

```typescript
function withDecay(
  config?: WithDecayConfig,
  callback?: AnimationCallback
): number;

interface WithDecayConfig {
  velocity?: number;       // 초기 속도
  deceleration?: number;   // 기본값: 0.998
  clamp?: [number, number]; // 범위 제한
  velocityFactor?: number;
  rubberBandEffect?: boolean;
  rubberBandFactor?: number;
}

// 사용 예시
translateX.value = withDecay({
  velocity: event.velocityX,
  clamp: [0, 300],
});
```

---

### withSequence

순차적 애니메이션을 생성합니다.

```typescript
function withSequence<T extends AnimatableValue>(
  ...animations: T[]
): T;

// 사용 예시
scale.value = withSequence(
  withTiming(1.2, { duration: 100 }),
  withTiming(0.9, { duration: 100 }),
  withTiming(1, { duration: 100 })
);

// shake 효과
translateX.value = withSequence(
  withTiming(-10, { duration: 50 }),
  withTiming(10, { duration: 50 }),
  withTiming(-10, { duration: 50 }),
  withTiming(0, { duration: 50 })
);
```

---

### withDelay

애니메이션 시작을 지연시킵니다.

```typescript
function withDelay<T extends AnimatableValue>(
  delayMs: number,
  animation: T
): T;

// 사용 예시
opacity.value = withDelay(500, withTiming(1));

// 시퀀스와 함께
translateY.value = withDelay(
  200,
  withSequence(
    withTiming(-20),
    withTiming(0)
  )
);
```

---

### withRepeat

반복 애니메이션을 생성합니다.

```typescript
function withRepeat<T extends AnimatableValue>(
  animation: T,
  numberOfReps?: number,  // -1 = 무한
  reverse?: boolean,
  callback?: (finished: boolean, current?: T) => void
): T;

// 사용 예시
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1,  // 무한 반복
  false
);

// 왕복 애니메이션
scale.value = withRepeat(
  withTiming(1.2, { duration: 500 }),
  4,    // 4회 반복
  true  // 역방향 포함
);
```

---

### cancelAnimation

실행 중인 애니메이션을 취소합니다.

```typescript
function cancelAnimation<T>(sharedValue: SharedValue<T>): void;

// 사용 예시
cancelAnimation(translateX);

// cleanup에서 사용
useEffect(() => {
  return () => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
  };
}, []);
```

---

## Utilities

### interpolate

값을 다른 범위로 매핑합니다.

```typescript
function interpolate(
  value: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  extrapolation?: Extrapolation
): number;

enum Extrapolation {
  EXTEND = 'extend',   // 범위 밖 외삽
  CLAMP = 'clamp',     // 범위 제한
  IDENTITY = 'identity'
}

// 사용 예시
const opacity = interpolate(
  progress.value,
  [0, 0.5, 1],
  [0, 1, 1],
  Extrapolation.CLAMP
);

const scale = interpolate(
  scrollY.value,
  [-100, 0, 100],
  [1.2, 1, 0.8]
);
```

---

### interpolateColor

색상을 보간합니다.

```typescript
function interpolateColor(
  value: number,
  inputRange: readonly number[],
  outputRange: readonly string[],
  colorSpace?: 'RGB' | 'HSV'
): string;

// 사용 예시
const backgroundColor = interpolateColor(
  progress.value,
  [0, 1],
  ['#FF0000', '#00FF00']
);

const color = interpolateColor(
  scrollY.value,
  [0, 100, 200],
  ['#FFFFFF', '#7A4AE2', '#000000'],
  'HSV'
);
```

---

### clamp

값을 범위 내로 제한합니다.

```typescript
function clamp(value: number, min: number, max: number): number;

// 사용 예시
const limitedValue = clamp(translateX.value, -100, 100);
```

---

### measure

컴포넌트의 레이아웃 정보를 측정합니다.

```typescript
function measure(
  animatedRef: AnimatedRef<Component>
): MeasuredDimensions | null;

interface MeasuredDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

// 사용 예시
const viewRef = useAnimatedRef<Animated.View>();

const getMeasurement = () => {
  'worklet';
  const measurement = measure(viewRef);
  if (measurement) {
    console.log(`Width: ${measurement.width}, Height: ${measurement.height}`);
  }
};
```

---

### runOnJS

worklet에서 JS 함수를 호출합니다.

```typescript
function runOnJS<T extends (...args: any[]) => any>(fn: T): T;

// 사용 예시
const showAlert = (message: string) => {
  Alert.alert('Alert', message);
};

// worklet 내에서
'worklet';
runOnJS(showAlert)('Animation complete!');
```

---

### runOnUI

JS 스레드에서 worklet을 실행합니다.

```typescript
function runOnUI<T extends (...args: any[]) => any>(fn: T): T;

// 사용 예시
const updateSharedValue = (newValue: number) => {
  'worklet';
  sharedValue.value = withSpring(newValue);
};

// JS에서 호출
runOnUI(updateSharedValue)(100);
```

---

## Components

### Animated.View

애니메이션 가능한 View 컴포넌트입니다.

```typescript
<Animated.View
  style={animatedStyle}
  entering={FadeIn}
  exiting={FadeOut}
  layout={LinearTransition}
/>
```

### Animated.Text

애니메이션 가능한 Text 컴포넌트입니다.

```typescript
<Animated.Text style={animatedTextStyle}>
  Animated Text
</Animated.Text>
```

### Animated.Image

애니메이션 가능한 Image 컴포넌트입니다.

```typescript
<Animated.Image
  source={{ uri: 'https://example.com/image.png' }}
  style={animatedImageStyle}
/>
```

### Animated.ScrollView

애니메이션 가능한 ScrollView 컴포넌트입니다.

```typescript
<Animated.ScrollView
  onScroll={scrollHandler}
  scrollEventThrottle={16}
>
  {content}
</Animated.ScrollView>
```

### Animated.FlatList

애니메이션 가능한 FlatList 컴포넌트입니다.

```typescript
<Animated.FlatList
  data={items}
  renderItem={renderItem}
  onScroll={scrollHandler}
  scrollEventThrottle={16}
/>
```

---

## Layout Animations

### Entering Animations

컴포넌트가 마운트될 때 실행됩니다.

| 애니메이션 | 설명 |
|-----------|------|
| FadeIn | 페이드 인 |
| FadeInUp | 아래에서 페이드 인 |
| FadeInDown | 위에서 페이드 인 |
| FadeInLeft | 왼쪽에서 페이드 인 |
| FadeInRight | 오른쪽에서 페이드 인 |
| SlideInUp | 아래에서 슬라이드 |
| SlideInDown | 위에서 슬라이드 |
| SlideInLeft | 왼쪽에서 슬라이드 |
| SlideInRight | 오른쪽에서 슬라이드 |
| ZoomIn | 확대되며 나타남 |
| BounceIn | 바운스 효과 |
| FlipInX | X축 플립 |
| FlipInY | Y축 플립 |
| RotateIn | 회전하며 나타남 |
| StretchIn | 늘어나며 나타남 |
| LightSpeedIn | 빠른 슬라이드 |

```typescript
<Animated.View entering={FadeInUp.duration(500).springify()}>
  {content}
</Animated.View>
```

### Exiting Animations

컴포넌트가 언마운트될 때 실행됩니다.

| 애니메이션 | 설명 |
|-----------|------|
| FadeOut | 페이드 아웃 |
| FadeOutUp | 위로 페이드 아웃 |
| FadeOutDown | 아래로 페이드 아웃 |
| SlideOutUp | 위로 슬라이드 |
| SlideOutDown | 아래로 슬라이드 |
| ZoomOut | 축소되며 사라짐 |
| BounceOut | 바운스 아웃 |

```typescript
<Animated.View exiting={FadeOutDown.duration(300)}>
  {content}
</Animated.View>
```

### Layout Transitions

레이아웃 변경 시 실행됩니다.

| 애니메이션 | 설명 |
|-----------|------|
| LinearTransition | 선형 전환 |
| SequencedTransition | 순차 전환 |
| FadingTransition | 페이드 전환 |
| JumpingTransition | 점프 전환 |
| CurvedTransition | 곡선 전환 |

```typescript
<Animated.View layout={LinearTransition.springify()}>
  {content}
</Animated.View>
```

---

## Gesture Handler 2

### Gesture.Pan

팬(드래그) 제스처를 생성합니다.

```typescript
const panGesture = Gesture.Pan()
  .onStart((event) => { /* 시작 */ })
  .onUpdate((event) => { /* 업데이트 */ })
  .onEnd((event) => { /* 종료 */ })
  .onFinalize((event, success) => { /* 완료 */ })
  .activeOffsetX([-20, 20])    // 수평 활성화 오프셋
  .activeOffsetY([-20, 20])    // 수직 활성화 오프셋
  .failOffsetX([-10, 10])      // 수평 실패 오프셋
  .failOffsetY([-10, 10])      // 수직 실패 오프셋
  .minDistance(10)             // 최소 거리
  .minPointers(1)              // 최소 포인터 수
  .maxPointers(2);             // 최대 포인터 수
```

### Gesture.Tap

탭 제스처를 생성합니다.

```typescript
const tapGesture = Gesture.Tap()
  .onStart((event) => { /* 시작 */ })
  .onEnd((event) => { /* 종료 */ })
  .numberOfTaps(2)             // 더블 탭
  .maxDuration(500)            // 최대 지속 시간
  .maxDelay(200);              // 최대 지연
```

### Gesture.LongPress

길게 누르기 제스처를 생성합니다.

```typescript
const longPressGesture = Gesture.LongPress()
  .onStart((event) => { /* 시작 */ })
  .onEnd((event) => { /* 종료 */ })
  .minDuration(500);           // 최소 지속 시간
```

### Gesture.Pinch

핀치 제스처를 생성합니다.

```typescript
const pinchGesture = Gesture.Pinch()
  .onStart((event) => { /* 시작 */ })
  .onUpdate((event) => {
    scale.value = event.scale;
  })
  .onEnd((event) => { /* 종료 */ });
```

### Gesture.Rotation

회전 제스처를 생성합니다.

```typescript
const rotationGesture = Gesture.Rotation()
  .onUpdate((event) => {
    rotation.value = event.rotation;
  });
```

### Gesture.Simultaneous

동시 제스처를 생성합니다.

```typescript
const composed = Gesture.Simultaneous(
  panGesture,
  pinchGesture,
  rotationGesture
);
```

### Gesture.Exclusive

배타적 제스처를 생성합니다.

```typescript
const exclusive = Gesture.Exclusive(
  doubleTapGesture,  // 우선순위 높음
  singleTapGesture   // 우선순위 낮음
);
```

### Gesture.Race

경쟁 제스처를 생성합니다.

```typescript
const race = Gesture.Race(
  horizontalPan,
  verticalPan
);
```

---

## Easing Functions

| 함수 | 설명 |
|------|------|
| Easing.linear | 선형 |
| Easing.ease | 기본 이징 |
| Easing.quad | 2차 함수 |
| Easing.cubic | 3차 함수 |
| Easing.poly(n) | n차 함수 |
| Easing.sin | 사인 함수 |
| Easing.circle | 원형 |
| Easing.exp | 지수 함수 |
| Easing.elastic(n) | 탄성 |
| Easing.back(n) | 되돌아가기 |
| Easing.bounce | 바운스 |
| Easing.bezier(x1, y1, x2, y2) | 베지어 곡선 |
| Easing.in(fn) | 가속 |
| Easing.out(fn) | 감속 |
| Easing.inOut(fn) | 가속 후 감속 |

```typescript
// 사용 예시
withTiming(100, { easing: Easing.out(Easing.cubic) });
withTiming(100, { easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
```
