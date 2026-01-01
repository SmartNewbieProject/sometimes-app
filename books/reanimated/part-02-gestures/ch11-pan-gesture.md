# Chapter 11: Pan 제스처와 드래그

## 📌 개요

Pan 제스처는 모바일 앱에서 가장 많이 사용되는 제스처입니다. 드래그 앤 드롭, 스와이프, 슬라이더, 캐러셀 등 거의 모든 터치 기반 인터랙션의 기초가 됩니다. 이 장에서는 Pan 제스처의 모든 것을 마스터합니다.

### 학습 목표

- Pan 제스처의 동작 원리 이해
- translationX/Y와 velocityX/Y 활용
- 드래그 후 원위치 복귀 애니메이션
- 경계 제한(clamping) 구현
- 속도 기반 fling 애니메이션

---

## 📖 Pan 제스처 기초

### 기본 구조

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
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
}
```

### Pan 이벤트 속성

```typescript
interface PanGestureEvent {
  // 시작점으로부터의 이동 거리
  translationX: number;
  translationY: number;

  // 절대 좌표
  absoluteX: number;
  absoluteY: number;

  // 요소 내 상대 좌표
  x: number;
  y: number;

  // 현재 속도 (px/ms)
  velocityX: number;
  velocityY: number;

  // 동시 터치 개수
  numberOfPointers: number;
}
```

---

## 💻 누적 드래그 구현

### 문제: 드래그할 때마다 원점으로 리셋

```typescript
// ❌ 문제: 새 드래그 시작할 때마다 원점에서 시작
const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = event.translationX; // 항상 0부터 시작
  });
```

### 해결: Context로 시작 위치 저장

```typescript
// ✅ 올바른 방법: 이전 위치 기억
function DraggableBoxWithContext() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 드래그 시작 시점의 위치 저장
  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 현재 위치를 context에 저장
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      // context + 이동량 = 새 위치
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
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
}
```

---

## 💻 드래그 후 원위치 복귀

### 스냅백 애니메이션

```typescript
import { withSpring } from 'react-native-reanimated';

function SnapBackBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd(() => {
      // 드래그 끝나면 원위치로 스프링 복귀
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
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
}
```

---

## 💻 드래그 경계 제한

### clamp 함수로 이동 범위 제한

```typescript
import { clamp } from 'react-native-reanimated';

const BOUNDARY = 150; // 최대 이동 거리

function BoundedDragBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      // clamp(value, min, max)로 범위 제한
      translateX.value = clamp(
        context.value.x + event.translationX,
        -BOUNDARY,
        BOUNDARY
      );
      translateY.value = clamp(
        context.value.y + event.translationY,
        -BOUNDARY,
        BOUNDARY
      );
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
}
```

### 화면 크기 기반 경계 설정

```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOX_SIZE = 100;

function ScreenBoundedBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  // 시작 위치 (화면 중앙)
  const startX = (SCREEN_WIDTH - BOX_SIZE) / 2;
  const startY = (SCREEN_HEIGHT - BOX_SIZE) / 2;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      // 화면 밖으로 나가지 않도록 제한
      const newX = context.value.x + event.translationX;
      const newY = context.value.y + event.translationY;

      translateX.value = clamp(
        newX,
        -startX,                    // 왼쪽 경계
        SCREEN_WIDTH - startX - BOX_SIZE  // 오른쪽 경계
      );
      translateY.value = clamp(
        newY,
        -startY,                    // 상단 경계
        SCREEN_HEIGHT - startY - BOX_SIZE  // 하단 경계
      );
    });

  // ...
}
```

---

## 💻 속도 기반 Fling 애니메이션

### withDecay로 관성 구현

```typescript
import { withDecay } from 'react-native-reanimated';

function FlingBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd((event) => {
      // 손을 뗀 순간의 속도로 관성 애니메이션
      translateX.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.995, // 감속률 (1에 가까울수록 오래 감)
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        deceleration: 0.995,
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
}
```

### 경계 내에서 Fling (clamp 옵션)

```typescript
const BOUNDARY = 200;

const panGesture = Gesture.Pan()
  .onEnd((event) => {
    translateX.value = withDecay({
      velocity: event.velocityX,
      deceleration: 0.995,
      clamp: [-BOUNDARY, BOUNDARY], // 경계에서 멈춤
    });
    translateY.value = withDecay({
      velocity: event.velocityY,
      deceleration: 0.995,
      clamp: [-BOUNDARY, BOUNDARY],
    });
  });
```

---

## 💻 실전: 수평 스와이프 액션

### 스와이프로 삭제/아카이브 액션

```typescript
import { runOnJS } from 'react-native-reanimated';

const SWIPE_THRESHOLD = 100;
const ACTION_WIDTH = 80;

function SwipeableRow({
  onDelete,
  onArchive
}: {
  onDelete: () => void;
  onArchive: () => void;
}) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // 수평 10px 이상 이동해야 활성화
    .failOffsetY([-5, 5])     // 수직 5px 이상 이동하면 실패
    .onUpdate((event) => {
      // 왼쪽으로만 스와이프 가능
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      const shouldDelete = translateX.value < -SWIPE_THRESHOLD * 2;
      const shouldShowActions = translateX.value < -SWIPE_THRESHOLD;

      if (shouldDelete) {
        // 화면 밖으로 날리고 삭제
        translateX.value = withTiming(-400, { duration: 200 }, () => {
          runOnJS(onDelete)();
        });
      } else if (shouldShowActions) {
        // 액션 버튼 노출
        translateX.value = withSpring(-ACTION_WIDTH * 2);
      } else {
        // 원위치
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-ACTION_WIDTH * 2, 0],
      [1, 0]
    ),
  }));

  return (
    <View style={styles.container}>
      {/* 액션 버튼 (뒤에 숨겨져 있음) */}
      <Animated.View style={[styles.actions, actionsStyle]}>
        <Pressable onPress={onArchive} style={styles.archiveBtn}>
          <Text>Archive</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Text>Delete</Text>
        </Pressable>
      </Animated.View>

      {/* 스와이프 가능한 행 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, rowStyle]}>
          <Text>Swipe me left</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## 💻 실전: 수직 Bottom Sheet

### 드래그로 열고 닫는 Bottom Sheet

```typescript
const SHEET_HEIGHT = 400;
const SNAP_POINTS = [0, SHEET_HEIGHT * 0.5, SHEET_HEIGHT]; // 닫힘, 중간, 열림

function DraggableBottomSheet() {
  const translateY = useSharedValue(SHEET_HEIGHT); // 처음엔 닫힘
  const context = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      // 0(열림) ~ SHEET_HEIGHT(닫힘) 범위로 제한
      translateY.value = clamp(
        context.value + event.translationY,
        0,
        SHEET_HEIGHT
      );
    })
    .onEnd((event) => {
      // 가장 가까운 snap point로 이동
      const velocity = event.velocityY;
      const currentY = translateY.value;

      // 속도 고려해서 목표 위치 예측
      const projectedY = currentY + velocity * 0.1;

      // 가장 가까운 snap point 찾기
      let closestPoint = SNAP_POINTS[0];
      let minDistance = Math.abs(projectedY - SNAP_POINTS[0]);

      for (const point of SNAP_POINTS) {
        const distance = Math.abs(projectedY - point);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }

      translateY.value = withSpring(closestPoint, {
        velocity: velocity,
        damping: 20,
        stiffness: 200,
      });
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        <Text>Drag me!</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
});
```

---

## 📊 Pan 설정 옵션 비교

| 옵션 | 용도 | 예시 |
|-----|------|------|
| `activeOffsetX` | 수평 활성화 임계값 | `[-10, 10]` |
| `activeOffsetY` | 수직 활성화 임계값 | `[-10, 10]` |
| `failOffsetX` | 수평 실패 임계값 | `[-20, 20]` |
| `failOffsetY` | 수직 실패 임계값 | `[-20, 20]` |
| `minDistance` | 최소 이동 거리 | `10` |
| `minPointers` | 최소 터치 개수 | `1` |
| `maxPointers` | 최대 터치 개수 | `1` |
| `minVelocity` | 최소 속도 | `100` |
| `minVelocityX` | 최소 수평 속도 | `100` |
| `minVelocityY` | 최소 수직 속도 | `100` |

### 수평 전용 스와이프

```typescript
const horizontalPan = Gesture.Pan()
  .activeOffsetX([-10, 10])  // 수평 10px 이동 시 활성화
  .failOffsetY([-5, 5]);     // 수직 5px 이동 시 실패
```

### 수직 전용 스와이프

```typescript
const verticalPan = Gesture.Pan()
  .activeOffsetY([-10, 10])  // 수직 10px 이동 시 활성화
  .failOffsetX([-5, 5]);     // 수평 5px 이동 시 실패
```

---

## ⚠️ 흔한 실수와 해결법

### 1. Context 없이 드래그

```typescript
// ❌ 문제: 매 드래그마다 리셋
.onUpdate((event) => {
  translateX.value = event.translationX;
})

// ✅ 해결: context로 이전 위치 기억
const context = useSharedValue({ x: 0, y: 0 });

.onStart(() => {
  context.value = { x: translateX.value, y: translateY.value };
})
.onUpdate((event) => {
  translateX.value = context.value.x + event.translationX;
})
```

### 2. ScrollView와 충돌

```typescript
// ❌ 문제: 스크롤과 드래그 동시 인식
<ScrollView>
  <GestureDetector gesture={panGesture}>
    <Animated.View />
  </GestureDetector>
</ScrollView>

// ✅ 해결: simultaneousWithExternalGesture 또는 방향 분리
const panGesture = Gesture.Pan()
  .activeOffsetX([-10, 10])  // 수평 드래그만
  .failOffsetY([-5, 5]);     // 수직은 스크롤에 양보
```

### 3. 급격한 움직임

```typescript
// ❌ 문제: 애니메이션 없이 즉시 이동
.onEnd(() => {
  translateX.value = 0;
})

// ✅ 해결: withSpring으로 부드럽게
.onEnd(() => {
  translateX.value = withSpring(0);
})
```

### 4. 제스처 중 애니메이션 충돌

```typescript
// ❌ 문제: 드래그 중 기존 애니메이션이 방해
.onStart(() => {
  // 아무것도 안 함
})

// ✅ 해결: 기존 애니메이션 취소
import { cancelAnimation } from 'react-native-reanimated';

.onStart(() => {
  cancelAnimation(translateX);
  cancelAnimation(translateY);
  context.value = { x: translateX.value, y: translateY.value };
})
```

---

## 💡 성능 최적화 팁

### 1. 불필요한 리렌더 방지

```typescript
// ✅ 좋은 예: 스타일만 변경, 컴포넌트 리렌더 없음
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value },
  ],
}));
```

### 2. 복잡한 계산은 메모이제이션

```typescript
const panGesture = useMemo(() =>
  Gesture.Pan()
    .onStart(() => { /* ... */ })
    .onUpdate((event) => { /* ... */ })
    .onEnd(() => { /* ... */ }),
  [] // 의존성 없으면 빈 배열
);
```

### 3. hitSlop으로 터치 영역 확장

```typescript
<GestureDetector gesture={panGesture}>
  <Animated.View
    style={[styles.smallBox, animatedStyle]}
    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
  />
</GestureDetector>
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 프로필 사진 드래그 정렬

```typescript
// src/features/profile/ui/photo-grid.tsx 참고
function DraggablePhotoGrid({ photos, onReorder }) {
  const positions = useSharedValue(
    photos.map((_, i) => ({ x: i % 3, y: Math.floor(i / 3) }))
  );

  const activeIndex = useSharedValue(-1);
  const activePosition = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 드래그 시작 시 선택된 사진 감지
    })
    .onUpdate((event) => {
      // 드래그 중 위치 업데이트
      // 다른 사진과 위치 교환 감지
    })
    .onEnd(() => {
      // 최종 위치로 스냅
      // onReorder 콜백 호출
    });
}
```

### 채팅 메시지 스와이프 답장

```typescript
// src/features/chat/ui/message/chat-message.tsx 참고
function SwipeableMessage({ message, onReply }) {
  const translateX = useSharedValue(0);
  const REPLY_THRESHOLD = 60;

  const panGesture = Gesture.Pan()
    .activeOffsetX([10, 100]) // 오른쪽으로만
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      // 최대 답장 임계값까지만 이동
      translateX.value = Math.min(event.translationX, REPLY_THRESHOLD);
    })
    .onEnd(() => {
      if (translateX.value >= REPLY_THRESHOLD) {
        runOnJS(onReply)(message);
      }
      translateX.value = withSpring(0);
    });
}
```

---

## 🏋️ 연습 문제

### 연습 1: 자유 드래그 박스
Context를 사용해 드래그 가능한 박스를 만들고, 손을 떼면 마지막 위치에 머무르게 하세요.

### 연습 2: 경계 제한 드래그
화면 밖으로 나가지 않는 드래그 가능 박스를 구현하세요.

### 연습 3: 스냅 그리드
50px 간격의 그리드에 스냅되는 드래그를 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
const GRID_SIZE = 50;

.onEnd(() => {
  const snapX = Math.round(translateX.value / GRID_SIZE) * GRID_SIZE;
  const snapY = Math.round(translateY.value / GRID_SIZE) * GRID_SIZE;

  translateX.value = withSpring(snapX);
  translateY.value = withSpring(snapY);
});
```

</details>

### 연습 4: 속도 기반 플링
관성 물리를 사용해 플링 애니메이션을 구현하세요. 속도가 충분히 빠르면 화면 끝까지 날아가게 하세요.

---

## 📚 요약

### 핵심 개념

| 개념 | 설명 |
|-----|------|
| Context | 드래그 시작 위치 저장으로 누적 이동 구현 |
| clamp | 이동 범위 제한 |
| withDecay | 속도 기반 관성 애니메이션 |
| activeOffset | 제스처 활성화 임계값 |
| failOffset | 제스처 실패 조건 |

### Pan 제스처 체크리스트

- [ ] Context로 시작 위치 저장
- [ ] 필요시 경계 제한 (clamp)
- [ ] 종료 시 적절한 애니메이션 (spring/decay)
- [ ] 방향 제한으로 스크롤 충돌 방지
- [ ] 기존 애니메이션 취소 처리

### 다음 장 예고

다음 장에서는 **Pinch와 Rotation 제스처**를 배웁니다. 두 손가락을 사용한 확대/축소와 회전 제스처를 마스터하고, 이미지 뷰어를 구현해봅니다.
