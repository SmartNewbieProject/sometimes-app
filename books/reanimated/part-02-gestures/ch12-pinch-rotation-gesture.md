# Chapter 12: Pinch와 Rotation 제스처

## 📌 개요

Pinch와 Rotation은 두 손가락을 사용하는 멀티터치 제스처입니다. 이미지 확대/축소, 지도 줌, 사진 회전 등에서 필수적으로 사용됩니다. 이 장에서는 두 제스처를 개별적으로 이해하고, 함께 조합하는 방법까지 마스터합니다.

### 학습 목표

- Pinch 제스처로 확대/축소 구현
- Rotation 제스처로 회전 구현
- 두 제스처 동시 적용
- 확대/축소 제한(min/max) 설정
- 이미지 뷰어 실전 구현

---

## 📖 Pinch 제스처 기초

### 기본 구조

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function PinchableBox() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // event.scale은 제스처 시작 시점 대비 배율
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### Pinch 이벤트 속성

```typescript
interface PinchGestureEvent {
  // 제스처 시작 대비 현재 배율 (1 = 원본)
  scale: number;

  // 두 손가락 중심점 (화면 기준)
  focalX: number;
  focalY: number;

  // 현재 속도
  velocity: number;

  // 동시 터치 개수 (보통 2)
  numberOfPointers: number;
}
```

---

## 📖 Rotation 제스처 기초

### 기본 구조

```typescript
function RotatableBox() {
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      // event.rotation은 라디안 단위
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}rad` }],
  }));

  return (
    <GestureDetector gesture={rotationGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### Rotation 이벤트 속성

```typescript
interface RotationGestureEvent {
  // 회전 각도 (라디안 단위)
  rotation: number;

  // 두 손가락 중심점
  anchorX: number;
  anchorY: number;

  // 회전 속도 (rad/ms)
  velocity: number;

  // 터치 개수
  numberOfPointers: number;
}
```

### 라디안 ↔ 각도 변환

```typescript
// 라디안 → 각도
const degrees = rotation * (180 / Math.PI);

// 각도 → 라디안
const radians = degrees * (Math.PI / 180);
```

---

## 💻 확대/축소 제한 설정

### 최소/최대 스케일 제한

```typescript
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

function BoundedPinch() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      // clamp로 범위 제한
      scale.value = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### 스냅백 효과 (범위 초과 시 복귀)

```typescript
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function SnapBackPinch() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // 제스처 중에는 범위 초과 허용 (저항감 표현)
      const newScale = savedScale.value * event.scale;

      if (newScale < MIN_SCALE) {
        // 최소값 아래로는 저항 (로그 스케일)
        scale.value = MIN_SCALE - Math.log(MIN_SCALE - newScale + 1) * 0.1;
      } else if (newScale > MAX_SCALE) {
        // 최대값 위로는 저항
        scale.value = MAX_SCALE + Math.log(newScale - MAX_SCALE + 1) * 0.1;
      } else {
        scale.value = newScale;
      }
    })
    .onEnd(() => {
      // 범위 초과 시 스냅백
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE);
        savedScale.value = MAX_SCALE;
      } else {
        savedScale.value = scale.value;
      }
    });

  // ...
}
```

---

## 💻 Pinch + Rotation 동시 적용

### Gesture.Simultaneous() 사용

```typescript
function PinchAndRotate() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // 두 제스처를 동시에 인식
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    rotationGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

---

## 💻 Pan + Pinch + Rotation 조합

### 완전한 변환 제스처

```typescript
function FullTransformable() {
  // Pan
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panContext = useSharedValue({ x: 0, y: 0 });

  // Pinch
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Rotation
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panContext.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = panContext.value.x + event.translationX;
      translateY.value = panContext.value.y + event.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // 모든 제스처 동시 인식
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotationGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

---

## 💻 실전: 이미지 뷰어

### 확대/축소 가능한 이미지 뷰어

```typescript
import { Dimensions, Image } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 5;

function ImageViewer({ imageUri }: { imageUri: string }) {
  // Transform values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panContext = useSharedValue({ x: 0, y: 0 });

  // Focal point for pinch
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Double tap to zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      if (scale.value > 1) {
        // 확대 상태면 원본으로
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        // 원본이면 2배 확대
        scale.value = withSpring(2);
        savedScale.value = 2;
        // 탭한 위치를 중심으로 확대
        translateX.value = withSpring(
          (SCREEN_WIDTH / 2 - event.x) * 2
        );
        translateY.value = withSpring(
          (SCREEN_HEIGHT / 2 - event.y) * 2
        );
      }
    });

  // Pinch to zoom
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = clamp(newScale, MIN_SCALE * 0.5, MAX_SCALE * 1.5);
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE);
        savedScale.value = MAX_SCALE;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan when zoomed
  const panGesture = Gesture.Pan()
    .onStart(() => {
      panContext.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      if (scale.value <= 1) return; // 확대 상태에서만 이동

      const maxTranslateX = ((scale.value - 1) * SCREEN_WIDTH) / 2;
      const maxTranslateY = ((scale.value - 1) * SCREEN_HEIGHT) / 2;

      translateX.value = clamp(
        panContext.value.x + event.translationX,
        -maxTranslateX,
        maxTranslateX
      );
      translateY.value = clamp(
        panContext.value.y + event.translationY,
        -maxTranslateY,
        maxTranslateY
      );
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        <Animated.Image
          source={{ uri: imageUri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
```

---

## 💻 Focal Point 기준 확대/축소

### 핀치 중심점 기준으로 확대

```typescript
function FocalPointPinch() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(newScale, 5));

      // 핀치 중심점을 기준으로 이동 보정
      const centerX = SCREEN_WIDTH / 2;
      const centerY = SCREEN_HEIGHT / 2;

      const focusX = event.focalX - centerX;
      const focusY = event.focalY - centerY;

      const scaleDiff = scale.value - savedScale.value;

      translateX.value = savedTranslateX.value - focusX * scaleDiff;
      translateY.value = savedTranslateY.value - focusY * scaleDiff;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // ...
}
```

---

## 📊 Pinch vs Rotation 비교

| 특성 | Pinch | Rotation |
|-----|-------|----------|
| 목적 | 확대/축소 | 회전 |
| 주요 속성 | `scale` | `rotation` |
| 단위 | 배율 (1 = 원본) | 라디안 |
| 중심점 | `focalX/Y` | `anchorX/Y` |
| 속도 | `velocity` | `velocity` |

---

## ⚠️ 흔한 실수와 해결법

### 1. savedValue 없이 사용

```typescript
// ❌ 문제: 제스처 끝나면 리셋
.onUpdate((event) => {
  scale.value = event.scale; // 항상 1부터 시작
})

// ✅ 해결: savedValue로 이전 값 기억
.onUpdate((event) => {
  scale.value = savedScale.value * event.scale;
})
.onEnd(() => {
  savedScale.value = scale.value;
})
```

### 2. transform 순서 무시

```typescript
// ❌ 문제: scale 후 translate하면 이동 거리도 확대됨
transform: [
  { scale: scale.value },
  { translateX: translateX.value }, // scale 영향 받음
]

// ✅ 해결: translate 먼저
transform: [
  { translateX: translateX.value },
  { translateY: translateY.value },
  { scale: scale.value },
]
```

### 3. 멀티 제스처 동시 인식 안 됨

```typescript
// ❌ 문제: 개별 GestureDetector
<GestureDetector gesture={pinchGesture}>
  <GestureDetector gesture={rotationGesture}>
    <View />
  </GestureDetector>
</GestureDetector>

// ✅ 해결: Gesture.Simultaneous로 합치기
const combined = Gesture.Simultaneous(pinchGesture, rotationGesture);
<GestureDetector gesture={combined}>
  <View />
</GestureDetector>
```

### 4. 회전 단위 혼동

```typescript
// ❌ 문제: 라디안인데 deg 단위 사용
{ rotate: `${rotation.value}deg` }

// ✅ 해결: 올바른 단위 사용
{ rotate: `${rotation.value}rad` }
// 또는 변환
{ rotate: `${rotation.value * (180 / Math.PI)}deg` }
```

---

## 💡 성능 최적화 팁

### 1. 제스처 객체 메모이제이션

```typescript
const pinchGesture = useMemo(() =>
  Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    }),
  []
);
```

### 2. 복잡한 계산 최소화

```typescript
// ❌ onUpdate에서 복잡한 계산
.onUpdate((event) => {
  // 매 프레임마다 실행되는 복잡한 계산...
  const result = heavyComputation(event);
})

// ✅ 미리 계산 가능한 것은 밖에서
const precomputed = useMemo(() => heavyComputation(), []);
.onUpdate((event) => {
  scale.value = precomputed * event.scale;
})
```

### 3. 불필요한 리렌더 방지

```typescript
// ✅ useAnimatedStyle은 Shared Value만 참조
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: scale.value },
    { rotate: `${rotation.value}rad` },
  ],
}));
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 프로필 사진 확대 보기

```typescript
// src/features/profile/ui/photo-viewer.tsx 참고
function ProfilePhotoViewer({ photos, initialIndex }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <Modal visible={true} transparent>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        initialScrollIndex={initialIndex}
        renderItem={({ item }) => (
          <ImageViewer imageUri={item.url} />
        )}
      />
    </Modal>
  );
}
```

### 채팅 이미지 뷰어

```typescript
// src/features/chat/ui/image-viewer.tsx 참고
function ChatImageViewer({ imageUrl, onClose }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // 배경 투명도 (축소하면 투명해짐)
  const backgroundOpacity = useDerivedValue(() =>
    interpolate(scale.value, [0.5, 1], [0, 1])
  );

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 0.8) {
        // 많이 축소하면 닫기
        runOnJS(onClose)();
      } else if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // ...
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 Pinch
Pinch 제스처로 확대/축소되는 박스를 만드세요. 최소 0.5배, 최대 3배로 제한하세요.

### 연습 2: 회전 + 스냅
Rotation 제스처로 회전하고, 손을 떼면 가장 가까운 90도 단위로 스냅되게 하세요.

<details>
<summary>힌트 보기</summary>

```typescript
.onEnd(() => {
  const degrees = rotation.value * (180 / Math.PI);
  const snappedDegrees = Math.round(degrees / 90) * 90;
  const snappedRadians = snappedDegrees * (Math.PI / 180);
  rotation.value = withSpring(snappedRadians);
  savedRotation.value = snappedRadians;
})
```

</details>

### 연습 3: 완전한 이미지 뷰어
Pan + Pinch + Double Tap을 조합한 이미지 뷰어를 구현하세요. Double Tap하면 2배 확대/원본 토글되어야 합니다.

### 연습 4: 회전 잠금
Pinch 제스처 중에는 rotation이 잠기고, rotation 제스처 중에는 pinch가 잠기게 구현하세요.

---

## 📚 요약

### 핵심 개념

| 제스처 | 주요 값 | 활용 |
|-------|--------|------|
| Pinch | `scale`, `focalX/Y` | 확대/축소, 이미지 뷰어 |
| Rotation | `rotation`, `anchorX/Y` | 회전, 스티커 편집 |

### Pinch/Rotation 체크리스트

- [ ] savedValue로 이전 상태 기억
- [ ] transform 순서 확인 (translate → scale → rotate)
- [ ] 범위 제한 설정 (min/max)
- [ ] Gesture.Simultaneous로 동시 인식
- [ ] 스냅백 애니메이션 적용

### 다음 장 예고

다음 장에서는 **복합 제스처**를 배웁니다. Gesture.Race(), Gesture.Exclusive(), Gesture.Simultaneous()를 활용해 여러 제스처를 조합하는 고급 패턴을 마스터합니다.
