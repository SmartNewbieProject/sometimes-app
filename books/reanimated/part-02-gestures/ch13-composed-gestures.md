# Chapter 13: 복합 제스처

## 📌 개요

실제 앱에서는 단일 제스처만 사용하는 경우가 드뭅니다. Tap + Pan, Double Tap + Pinch, Long Press + Drag 등 여러 제스처를 조합해야 합니다. React Native Gesture Handler v2는 이를 위한 강력한 조합 API를 제공합니다.

### 학습 목표

- `Gesture.Simultaneous()` - 동시 제스처
- `Gesture.Exclusive()` - 배타적 제스처
- `Gesture.Race()` - 경쟁 제스처
- 제스처 간 상태 공유 패턴
- 복잡한 인터랙션 설계

---

## 📖 제스처 조합 API 개요

### 세 가지 조합 방식

| API | 동작 | 사용 사례 |
|-----|------|----------|
| `Simultaneous` | 동시에 인식 | Pan + Pinch, Pinch + Rotation |
| `Exclusive` | 먼저 활성화된 것만 | Single Tap vs Double Tap |
| `Race` | 먼저 조건 만족한 것만 | Pan vs Long Press |

---

## 💻 Gesture.Simultaneous()

### 동시 인식: 두 제스처가 함께 작동

```typescript
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

function SimultaneousExample() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // 두 제스처가 동시에 인식됨
  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### 3개 이상 동시 인식

```typescript
const composed = Gesture.Simultaneous(
  panGesture,
  pinchGesture,
  rotationGesture
);
```

---

## 💻 Gesture.Exclusive()

### 배타적 인식: 먼저 활성화된 것만 실행

```typescript
function ExclusiveExample() {
  const scale = useSharedValue(1);

  // Single Tap: 살짝 확대
  const singleTap = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(1.2);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  // Double Tap: 크게 확대
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      scale.value = withSpring(2);
    });

  // Double Tap이 먼저 체크됨 (순서 중요!)
  const composed = Gesture.Exclusive(doubleTap, singleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

### Exclusive 순서의 중요성

```typescript
// ✅ 올바른 순서: 더 구체적인 제스처가 먼저
const composed = Gesture.Exclusive(
  doubleTap,  // numberOfTaps(2) - 더 구체적
  singleTap   // numberOfTaps(1) - 덜 구체적
);

// ❌ 잘못된 순서: Single Tap이 항상 먼저 인식됨
const wrong = Gesture.Exclusive(
  singleTap,  // 항상 먼저 매칭
  doubleTap   // 절대 도달하지 못함
);
```

---

## 💻 Gesture.Race()

### 경쟁 인식: 먼저 조건을 만족한 것만 실행

```typescript
function RaceExample() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isLongPressing = useSharedValue(false);

  // Long Press: 선택 모드 활성화
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      isLongPressing.value = true;
      // 햅틱 피드백
    });

  // Pan: 드래그 이동
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (!isLongPressing.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    });

  // Long Press가 인식되면 Pan은 무시됨 (또는 그 반대)
  const composed = Gesture.Race(longPress, pan);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

---

## 💻 Exclusive vs Race 차이

### Exclusive: 순서대로 체크

```typescript
// Double Tap을 먼저 체크하고, 실패하면 Single Tap 체크
Gesture.Exclusive(doubleTap, singleTap);

// 흐름:
// 1. 첫 탭 → "Double Tap일 수 있으니 대기"
// 2. 일정 시간 내 두 번째 탭 있으면 → Double Tap
// 3. 없으면 → Single Tap
```

### Race: 먼저 조건 만족한 것

```typescript
// Pan이나 Long Press 중 먼저 조건을 만족한 것만 인식
Gesture.Race(pan, longPress);

// 흐름:
// 1. 터치 시작
// 2. 이동 발생 → Pan 승리
// 3. 또는 500ms 동안 정지 → Long Press 승리
```

---

## 💻 requireExternalGestureToFail

### 외부 제스처 실패 대기

```typescript
function WaitForFailExample() {
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      console.log('Double Tap!');
    });

  const singleTap = Gesture.Tap()
    .requireExternalGestureToFail(doubleTap) // Double Tap 실패해야 실행
    .onStart(() => {
      console.log('Single Tap!');
    });

  // 각각 별도로 사용 가능
  const composed = Gesture.Simultaneous(doubleTap, singleTap);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.box} />
    </GestureDetector>
  );
}
```

---

## 💻 blocksExternalGesture

### 외부 제스처 차단

```typescript
function BlockingExample() {
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // 드래그 처리
    });

  const longPress = Gesture.LongPress()
    .blocksExternalGesture(pan) // Long Press 중에는 Pan 차단
    .onStart(() => {
      console.log('Long Press started - Pan is blocked');
    })
    .onEnd(() => {
      console.log('Long Press ended - Pan is unblocked');
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.box} />
    </GestureDetector>
  );
}
```

---

## 💻 실전: 이미지 편집 제스처

### Pan + Pinch + Rotation + Double Tap

```typescript
function ImageEditor({ imageUri }: { imageUri: string }) {
  // Transform state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Saved state
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);

  // Double Tap: 확대 토글
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value !== 1) {
        // 원본으로 복귀
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // 2배 확대
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  // Pan
  const pan = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  // Pinch
  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, savedScale.value * event.scale);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Rotation
  const rotate = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // 조합: Double Tap은 배타적, 나머지는 동시
  const simultaneousGestures = Gesture.Simultaneous(pan, pinch, rotate);
  const composed = Gesture.Exclusive(doubleTap, simultaneousGestures);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image
        source={{ uri: imageUri }}
        style={[styles.image, animatedStyle]}
      />
    </GestureDetector>
  );
}
```

---

## 💻 실전: Long Press + Drag (재정렬)

### 길게 누른 후 드래그

```typescript
function LongPressDrag({ children, onDragEnd }) {
  const isActive = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isActive.value = true;
      scale.value = withSpring(1.1); // 살짝 확대
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  const pan = Gesture.Pan()
    .activateAfterLongPress(300) // Long Press 후에만 활성화
    .onUpdate((event) => {
      if (isActive.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (isActive.value) {
        runOnJS(onDragEnd)({
          x: event.absoluteX,
          y: event.absoluteY,
        });
      }
      isActive.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isActive.value ? 100 : 0,
    shadowOpacity: withTiming(isActive.value ? 0.3 : 0),
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 💻 제스처 상태 공유

### Shared Value로 제스처 간 통신

```typescript
function GestureStateSharing() {
  const isZoomed = useSharedValue(false);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onEnd(() => {
      isZoomed.value = scale.value > 1.5;
    });

  const pan = Gesture.Pan()
    .enabled(true) // 항상 활성화
    .onUpdate((event) => {
      // 확대 상태에서만 이동 가능
      if (isZoomed.value) {
        translateX.value = event.translationX;
      }
    });

  // ...
}
```

### manualActivation으로 조건부 활성화

```typescript
const pan = Gesture.Pan()
  .manualActivation(true)
  .onTouchesMove((event, stateManager) => {
    // 조건에 따라 수동으로 활성화
    if (isZoomed.value && event.numberOfTouches === 1) {
      stateManager.activate();
    } else {
      stateManager.fail();
    }
  })
  .onUpdate((event) => {
    translateX.value = event.translationX;
  });
```

---

## 📊 조합 패턴 가이드

| 사용 사례 | 추천 패턴 |
|----------|----------|
| 이미지 뷰어 (Pan + Pinch) | `Simultaneous` |
| 이미지 편집 (Pan + Pinch + Rotate) | `Simultaneous` |
| Single/Double Tap | `Exclusive(doubleTap, singleTap)` |
| Tap vs Long Press | `Exclusive(longPress, tap)` |
| Pan vs Long Press | `Race` |
| 스크롤 안 리스트 아이템 스와이프 | `Race` + activeOffset |
| Double Tap + Pinch 줌 | `Simultaneous` + `requireExternalGestureToFail` |

---

## ⚠️ 흔한 실수와 해결법

### 1. Exclusive 순서 잘못

```typescript
// ❌ Single Tap이 항상 먼저 매칭
Gesture.Exclusive(singleTap, doubleTap)

// ✅ 구체적인 것 먼저
Gesture.Exclusive(doubleTap, singleTap)
```

### 2. Simultaneous에서 충돌

```typescript
// ❌ 수평 Pan과 수평 스크롤 동시 인식
Gesture.Simultaneous(horizontalPan, scrollGesture)

// ✅ 방향 분리 또는 Race 사용
const pan = Gesture.Pan()
  .activeOffsetY([-10, 10]) // 수직 Pan만
  .failOffsetX([-10, 10]);  // 수평은 스크롤에 양보
```

### 3. 제스처 메모이제이션 누락

```typescript
// ❌ 매 렌더마다 새 제스처 생성
function Component() {
  const composed = Gesture.Simultaneous(pan, pinch);
  return <GestureDetector gesture={composed} />;
}

// ✅ useMemo로 메모이제이션
function Component() {
  const composed = useMemo(() =>
    Gesture.Simultaneous(pan, pinch),
    [pan, pinch]
  );
  return <GestureDetector gesture={composed} />;
}
```

---

## 💡 성능 최적화 팁

### 1. 조합 제스처 메모이제이션

```typescript
const composedGesture = useMemo(() => {
  const pan = Gesture.Pan().onUpdate(/*...*/);
  const pinch = Gesture.Pinch().onUpdate(/*...*/);
  return Gesture.Simultaneous(pan, pinch);
}, []); // 의존성 없으면 빈 배열
```

### 2. 불필요한 제스처 비활성화

```typescript
const pan = Gesture.Pan()
  .enabled(isZoomed.value) // 필요할 때만 활성화
  .onUpdate(/*...*/);
```

### 3. 콜백 최적화

```typescript
// ✅ runOnJS 호출 최소화
.onEnd(() => {
  // 여러 작업을 하나로 묶어서 호출
  runOnJS(handleEnd)({
    x: translateX.value,
    y: translateY.value,
    scale: scale.value,
  });
})
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 프로필 사진 순서 변경

```typescript
// src/features/profile/ui/photo-reorder.tsx 참고
function PhotoReorder({ photos, onReorder }) {
  // Long Press로 선택, Pan으로 이동
  const composed = useMemo(() => {
    const longPress = Gesture.LongPress().minDuration(300);
    const pan = Gesture.Pan().activateAfterLongPress(300);
    return Gesture.Simultaneous(longPress, pan);
  }, []);
}
```

### 매칭 카드 스와이프

```typescript
// src/features/matching/ui/card-swipe.tsx 참고
function MatchingCard({ onLike, onPass }) {
  // Pan으로 스와이프, Tap은 상세 보기
  const composed = useMemo(() => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan()
      .activeOffsetX([-10, 10]);

    return Gesture.Race(pan, tap);
  }, []);
}
```

---

## 🏋️ 연습 문제

### 연습 1: Single/Double/Triple Tap
세 가지 Tap을 Exclusive로 조합하세요. Triple Tap > Double Tap > Single Tap 순서로 우선순위를 두세요.

### 연습 2: 이미지 편집기
Pan + Pinch + Rotation을 Simultaneous로 조합한 이미지 편집기를 만드세요. Double Tap으로 원본 복귀 기능도 추가하세요.

### 연습 3: Long Press + Drag
리스트 아이템을 길게 누르면 드래그 모드가 활성화되고, 드래그로 순서를 변경할 수 있게 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
const pan = Gesture.Pan()
  .activateAfterLongPress(300) // 핵심!
  .onUpdate((event) => {
    // 드래그 처리
  });
```

</details>

### 연습 4: 조건부 제스처
확대 상태(scale > 1)에서만 Pan이 작동하도록 구현하세요. 축소 상태에서는 Pan이 무시되어야 합니다.

---

## 📚 요약

### 조합 API 정리

| API | 동작 | 순서 중요 |
|-----|------|----------|
| `Simultaneous` | 동시 인식 | ❌ |
| `Exclusive` | 순서대로 체크, 먼저 매칭된 것 | ✅ |
| `Race` | 먼저 조건 만족한 것 | ❌ |

### 복합 제스처 체크리스트

- [ ] 적절한 조합 API 선택 (Simultaneous/Exclusive/Race)
- [ ] Exclusive는 구체적인 것 먼저
- [ ] 제스처 객체 메모이제이션
- [ ] 충돌 방지 (activeOffset, failOffset)
- [ ] 상태 공유는 Shared Value로

### 다음 장 예고

다음 장에서는 **제스처 상태 머신**을 배웁니다. 복잡한 제스처 로직을 상태 머신으로 관리하여 유지보수성과 확장성을 높이는 방법을 다룹니다.
