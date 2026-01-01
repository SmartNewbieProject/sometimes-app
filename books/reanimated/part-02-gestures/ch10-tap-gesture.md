# Chapter 10: Tap 제스처와 피드백

## 📌 개요

이 챕터에서 배울 내용:
- Tap 제스처 기본 사용법
- 더블탭 구현
- 롱프레스 제스처
- 버튼 프레스 피드백 패턴
- 탭 위치 활용

**선수 지식**: Chapter 9 완료
**예상 학습 시간**: 35분

---

## 📖 개념 이해

### Tap 제스처 종류

```
┌─────────────────────────────────────────────────────────────┐
│                     Tap 제스처 종류                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Gesture.Tap()                                              │
│   ─────────────                                              │
│   ┌──┐                                                       │
│   │👆│ → 단일 탭                                             │
│   └──┘                                                       │
│                                                              │
│   Gesture.Tap().numberOfTaps(2)                              │
│   ─────────────────────────────                              │
│   ┌──┐ ┌──┐                                                  │
│   │👆│→│👆│ → 더블 탭                                        │
│   └──┘ └──┘                                                  │
│                                                              │
│   Gesture.LongPress()                                        │
│   ───────────────────                                        │
│   ┌──────────┐                                               │
│   │👆────────│ → 길게 누르기 (500ms 이상)                    │
│   └──────────┘                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 제스처 상태 흐름

```
Tap 제스처 상태:

UNDETERMINED → BEGAN → ACTIVE → END
                 │              │
                 └── FAILED ◄───┘
                 (시간 초과, 이동 등)

타임라인:
───────────────────────────────────────►
    │          │                    │
  터치 시작   활성화              터치 끝
  (onBegin)  (onStart)           (onEnd)
```

---

## 💻 코드 예제

### 기본 Tap 제스처

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const BasicTap = () => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('#7A4AE2');

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      // 터치가 시작되면 (아직 탭이 확정되지 않음)
      scale.value = withSpring(0.95);
    })
    .onEnd(() => {
      // 탭이 성공적으로 완료됨
      backgroundColor.value = withTiming(
        backgroundColor.value === '#7A4AE2' ? '#4CAF50' : '#7A4AE2'
      );
    })
    .onFinalize(() => {
      // 탭 성공/실패 무관하게 항상 실행
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.buttonText}>탭하세요</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 더블탭

```typescript
const DoubleTap = () => {
  const scale = useSharedValue(1);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)  // 더블탭 설정
    .maxDuration(300) // 두 탭 사이 최대 시간
    .onEnd(() => {
      scale.value = withSequence(
        withSpring(1.5),
        withSpring(1)
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={doubleTapGesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text>더블탭</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 단일탭 + 더블탭 조합

```typescript
const SingleAndDoubleTap = () => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('#7A4AE2');

  // 더블탭 (우선순위 높음)
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );
    });

  // 단일탭 (더블탭 실패 시 실행)
  const singleTap = Gesture.Tap()
    .onEnd(() => {
      backgroundColor.value = withTiming(
        backgroundColor.value === '#7A4AE2' ? '#E24A7A' : '#7A4AE2'
      );
    });

  // Exclusive: 더블탭이 먼저 시도되고, 실패하면 단일탭
  const composed = Gesture.Exclusive(doubleTap, singleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text>단일탭: 색상 변경</Text>
        <Text>더블탭: 확대 효과</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 롱프레스

```typescript
const LongPressExample = () => {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)  // 최소 500ms 누르기
    .maxDistance(10)   // 최대 이동 거리 (넘으면 취소)
    .onBegin(() => {
      scale.value = withTiming(0.95);
      progress.value = withTiming(1, { duration: 500 });
    })
    .onEnd((_, success) => {
      if (success) {
        // 롱프레스 성공
        runOnJS(showContextMenu)();
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      progress.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
        <Text>길게 누르세요</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 탭 위치 활용

```typescript
const TapLocation = () => {
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      // 탭 위치에서 리플 효과 시작
      rippleX.value = event.x;
      rippleY.value = event.y;
      rippleScale.value = 0;
      rippleOpacity.value = 0.3;
    })
    .onEnd(() => {
      rippleScale.value = withTiming(4, { duration: 400 });
      rippleOpacity.value = withTiming(0, { duration: 400 });
    });

  const rippleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: rippleX.value - 25,
    top: rippleY.value - 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={styles.rippleContainer}>
        <Animated.View style={rippleStyle} />
        <Text>탭하면 리플 효과</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

---

## 📊 비교

### Tap 제스처 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `numberOfTaps` | 1 | 필요한 탭 횟수 |
| `maxDuration` | 500ms | 탭 완료까지 최대 시간 |
| `maxDelay` | 500ms | 연속 탭 사이 최대 간격 |
| `maxDistance` | 10 | 탭 중 최대 이동 거리 (px) |
| `minPointers` | 1 | 최소 터치 포인트 수 |
| `maxPointers` | 1 | 최대 터치 포인트 수 |

### LongPress 제스처 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `minDuration` | 500ms | 롱프레스 인식 최소 시간 |
| `maxDistance` | 10 | 허용 최대 이동 거리 (px) |

### 이벤트 콜백 비교

| 콜백 | Tap | LongPress | 설명 |
|------|-----|-----------|------|
| `onBegin` | ✅ | ✅ | 터치 시작 |
| `onStart` | ✅ | ✅ | 제스처 활성화 |
| `onEnd` | ✅ | ✅ | 제스처 성공 종료 |
| `onFinalize` | ✅ | ✅ | 제스처 완전 종료 |

---

## ⚠️ 흔한 실수

### ❌ 실수 1: onBegin과 onStart 혼동

```typescript
// ❌ onBegin에서 최종 액션 실행
const tapGesture = Gesture.Tap()
  .onBegin(() => {
    runOnJS(submitForm)();  // 탭이 취소되어도 실행됨!
  });
```

### ✅ 올바른 방법

```typescript
// ✅ onBegin은 시각적 피드백, onEnd에서 액션
const tapGesture = Gesture.Tap()
  .onBegin(() => {
    scale.value = withSpring(0.95);  // 피드백만
  })
  .onEnd(() => {
    runOnJS(submitForm)();  // 탭 성공 시에만
  })
  .onFinalize(() => {
    scale.value = withSpring(1);  // 원복
  });
```

### ❌ 실수 2: 더블탭 감지 안 됨

```typescript
// ❌ 단일탭이 먼저 처리되어 더블탭 감지 불가
const singleTap = Gesture.Tap().onEnd(() => { /* ... */ });
const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => { /* ... */ });

// 둘 다 독립적으로 등록
<GestureDetector gesture={singleTap}>
  <GestureDetector gesture={doubleTap}>  {/* 중첩은 복잡함 */}
    <Animated.View />
  </GestureDetector>
</GestureDetector>
```

### ✅ 올바른 방법

```typescript
// ✅ Exclusive로 조합
const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => { /* ... */ });
const singleTap = Gesture.Tap().onEnd(() => { /* ... */ });

const composed = Gesture.Exclusive(doubleTap, singleTap);

<GestureDetector gesture={composed}>
  <Animated.View />
</GestureDetector>
```

### ❌ 실수 3: 롱프레스 중 이동하면 취소되는 것 모름

```typescript
// ❌ maxDistance 기본값이 작아서 쉽게 취소됨
const longPress = Gesture.LongPress()
  .minDuration(1000)
  .onEnd(() => {
    // 손가락이 조금만 움직여도 여기 도달 못함
  });
```

### ✅ 올바른 방법

```typescript
// ✅ maxDistance 늘리기
const longPress = Gesture.LongPress()
  .minDuration(1000)
  .maxDistance(50)  // 50px까지 허용
  .onEnd(() => {
    // 더 관대하게 인식
  });
```

---

## 💡 성능 팁

### Tip 1: 피드백은 onBegin에서, 액션은 onEnd에서

```typescript
const tapGesture = Gesture.Tap()
  .onBegin(() => {
    // 즉각적인 시각 피드백 (사용자에게 응답성 제공)
    scale.value = withSpring(0.95);
  })
  .onEnd(() => {
    // 실제 액션 (네트워크 요청, 상태 변경 등)
    runOnJS(handleTap)();
  })
  .onFinalize(() => {
    // 상태 원복
    scale.value = withSpring(1);
  });
```

### Tip 2: hitSlop으로 터치 영역 확장

```typescript
// 작은 아이콘도 쉽게 터치
const tapGesture = Gesture.Tap()
  .hitSlop({ top: 20, bottom: 20, left: 20, right: 20 })
  .onEnd(() => {
    // ...
  });
```

### Tip 3: 연속 탭 디바운싱

```typescript
const lastTapTime = useSharedValue(0);

const tapGesture = Gesture.Tap()
  .onEnd(() => {
    const now = Date.now();
    if (now - lastTapTime.value > 300) {  // 300ms 디바운스
      lastTapTime.value = now;
      runOnJS(handleTap)();
    }
  });
```

---

## 🎯 실무 적용

### 패턴 1: Material Design 버튼

```typescript
const MaterialButton = ({ onPress, children }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15 });
      opacity.value = withTiming(0.8, { duration: 100 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 100 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.materialButton, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
```

### 패턴 2: Instagram 좋아요 (더블탭)

```typescript
const InstagramLike = ({ imageUrl, onLike }) => {
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // 하트 애니메이션
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1, { damping: 10 });

      // 하트 사라지기
      heartOpacity.value = withDelay(
        500,
        withTiming(0, { duration: 300 })
      );

      runOnJS(onLike)();
    });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Animated.View style={[styles.heartOverlay, heartStyle]}>
          <HeartIcon size={80} color="white" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
```

### 패턴 3: 컨텍스트 메뉴 (롱프레스)

```typescript
const ContextMenuItem = ({ item, onContextMenu }) => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('#FFFFFF');

  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onBegin(() => {
      scale.value = withSpring(0.98);
      backgroundColor.value = withTiming('#F0F0F0');
    })
    .onEnd((_, success) => {
      if (success) {
        runOnJS(onContextMenu)(item);
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      backgroundColor.value = withTiming('#FFFFFF');
    });

  const tap = Gesture.Tap()
    .onEnd(() => {
      runOnJS(item.onPress)();
    });

  const composed = Gesture.Race(longPress, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.menuItem, animatedStyle]}>
        <Text>{item.title}</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

---

## 🏋️ 연습 문제

### 문제 1: 좋아요 버튼

하트 아이콘을 탭하면:
- 탭 시 스케일이 0.9로 줄어들고
- 탭 성공 시 색상이 회색 ↔ 빨간색 토글
- 놓으면 스케일이 1.1로 커졌다가 1로 돌아옴

<details>
<summary>✅ 해답</summary>

```typescript
const LikeButton = () => {
  const scale = useSharedValue(1);
  const isLiked = useSharedValue(false);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onEnd(() => {
      isLiked.value = !isLiked.value;
      scale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
    })
    .onFinalize(() => {
      // onEnd에서 이미 처리했으므로 여기선 추가 작업 없음
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    color: isLiked.value ? '#FF3B30' : '#8E8E93',
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={animatedStyle}>
        <Animated.Text style={[styles.heart, heartStyle]}>
          ❤️
        </Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

</details>

### 문제 2: 트리플 탭

세 번 탭하면 "비밀 메뉴" 알림을 표시하는 컴포넌트를 만드세요.

<details>
<summary>✅ 해답</summary>

```typescript
const SecretTripleTap = () => {
  const scale = useSharedValue(1);

  const tripleTap = Gesture.Tap()
    .numberOfTaps(3)
    .maxDelay(400)
    .onEnd(() => {
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      runOnJS(Alert.alert)('🎉', '비밀 메뉴를 발견했습니다!');
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tripleTap}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text>세 번 탭해보세요</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **Gesture.Tap()**: 단일/다중 탭 감지
- **Gesture.LongPress()**: 길게 누르기 감지
- **onBegin**: 터치 시작 (피드백용)
- **onEnd**: 제스처 성공 완료 (액션용)
- **onFinalize**: 성공/실패 무관 종료 (상태 복구용)
- **Gesture.Exclusive()**: 더블탭과 단일탭 조합
- **numberOfTaps()**: 필요한 탭 횟수 설정
- **hitSlop**: 터치 영역 확장

**다음 챕터**: Pan 제스처와 드래그 - 드래그, 스와이프의 상세 구현을 배웁니다.
