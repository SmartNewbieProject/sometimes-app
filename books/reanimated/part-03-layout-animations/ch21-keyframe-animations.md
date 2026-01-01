# Chapter 21: 키프레임 애니메이션

## 📌 개요

키프레임 애니메이션은 여러 중간 상태를 거치는 복잡한 애니메이션을 정의할 때 사용합니다. CSS의 `@keyframes`와 유사하게, 0%~100% 사이의 시점에서 원하는 상태를 지정하면 Reanimated가 자동으로 중간 값을 보간합니다.

### 학습 목표

- Keyframe 클래스 사용법
- 백분율 기반 애니메이션 정의
- 복잡한 시퀀스 애니메이션
- 이징 함수 적용
- 실용적인 UI 애니메이션 패턴

---

## 📖 Keyframe 기본 개념

### CSS @keyframes vs Reanimated Keyframe

```css
/* CSS */
@keyframes bounce {
  0% { transform: translateY(-100px); }
  50% { transform: translateY(0); }
  70% { transform: translateY(-30px); }
  100% { transform: translateY(0); }
}
```

```typescript
// Reanimated
const bounceKeyframe = new Keyframe({
  0: { transform: [{ translateY: -100 }] },
  50: { transform: [{ translateY: 0 }] },
  70: { transform: [{ translateY: -30 }] },
  100: { transform: [{ translateY: 0 }] },
});
```

### 기본 구조

```typescript
import { Keyframe } from 'react-native-reanimated';

const myKeyframe = new Keyframe({
  0: {
    // 시작 상태 (0%)
    opacity: 0,
    transform: [{ scale: 0 }],
  },
  50: {
    // 중간 상태 (50%)
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  100: {
    // 최종 상태 (100%)
    opacity: 1,
    transform: [{ scale: 1 }],
  },
});

// 사용
<Animated.View entering={myKeyframe.duration(600)} />
```

---

## 💻 기본 예제

### 바운스 등장

```typescript
const bounceIn = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: -100 }],
  },
  60: {
    opacity: 1,
    transform: [{ translateY: 20 }],
  },
  80: {
    transform: [{ translateY: -10 }],
  },
  100: {
    transform: [{ translateY: 0 }],
  },
});

function BouncingBox() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View>
      <Button title="Toggle" onPress={() => setIsVisible(!isVisible)} />
      {isVisible && (
        <Animated.View
          entering={bounceIn.duration(800)}
          style={styles.box}
        />
      )}
    </View>
  );
}
```

### 회전하며 등장

```typescript
const spinIn = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ rotate: '-360deg' }, { scale: 0 }],
  },
  50: {
    opacity: 0.5,
    transform: [{ rotate: '-180deg' }, { scale: 0.5 }],
  },
  100: {
    opacity: 1,
    transform: [{ rotate: '0deg' }, { scale: 1 }],
  },
});

<Animated.View entering={spinIn.duration(1000)} />
```

### 펄스 효과 (강조)

```typescript
const pulse = new Keyframe({
  0: {
    transform: [{ scale: 1 }],
  },
  25: {
    transform: [{ scale: 1.1 }],
  },
  50: {
    transform: [{ scale: 1 }],
  },
  75: {
    transform: [{ scale: 1.1 }],
  },
  100: {
    transform: [{ scale: 1 }],
  },
});

// 주의: Keyframe은 한 번만 실행됨
// 반복하려면 다른 방법 필요
```

---

## 💻 셰이크 애니메이션

### 오류 입력 피드백

```typescript
const shake = new Keyframe({
  0: { transform: [{ translateX: 0 }] },
  15: { transform: [{ translateX: -10 }] },
  30: { transform: [{ translateX: 10 }] },
  45: { transform: [{ translateX: -10 }] },
  60: { transform: [{ translateX: 10 }] },
  75: { transform: [{ translateX: -5 }] },
  90: { transform: [{ translateX: 5 }] },
  100: { transform: [{ translateX: 0 }] },
});

function ShakeInput() {
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  const triggerShake = () => {
    setError(true);
    setKey((k) => k + 1); // 강제 리마운트로 애니메이션 재실행
  };

  return (
    <Animated.View
      key={key}
      entering={error ? shake.duration(400) : undefined}
      style={styles.inputContainer}
    >
      <TextInput placeholder="Enter value" style={styles.input} />
    </Animated.View>
  );
}
```

---

## 💻 위글 애니메이션

### 주의 끌기

```typescript
const wiggle = new Keyframe({
  0: { transform: [{ rotate: '0deg' }] },
  20: { transform: [{ rotate: '-3deg' }] },
  40: { transform: [{ rotate: '3deg' }] },
  60: { transform: [{ rotate: '-3deg' }] },
  80: { transform: [{ rotate: '3deg' }] },
  100: { transform: [{ rotate: '0deg' }] },
});

function AttentionButton({ children, onPress }) {
  const [shouldWiggle, setShouldWiggle] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // 5초마다 위글
    const interval = setInterval(() => {
      setShouldWiggle(true);
      setKey((k) => k + 1);
      setTimeout(() => setShouldWiggle(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      key={key}
      entering={shouldWiggle ? wiggle.duration(500) : undefined}
    >
      <Pressable onPress={onPress} style={styles.button}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
```

---

## 💻 플립 애니메이션

### 카드 뒤집기

```typescript
const flipIn = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ perspective: 1000 }, { rotateY: '90deg' }],
  },
  50: {
    opacity: 0.5,
    transform: [{ perspective: 1000 }, { rotateY: '45deg' }],
  },
  100: {
    opacity: 1,
    transform: [{ perspective: 1000 }, { rotateY: '0deg' }],
  },
});

const flipOut = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ perspective: 1000 }, { rotateY: '0deg' }],
  },
  50: {
    opacity: 0.5,
    transform: [{ perspective: 1000 }, { rotateY: '-45deg' }],
  },
  100: {
    opacity: 0,
    transform: [{ perspective: 1000 }, { rotateY: '-90deg' }],
  },
});

function FlipCard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Pressable onPress={() => setIsFlipped(!isFlipped)}>
      {isFlipped ? (
        <Animated.View
          key="back"
          entering={flipIn.duration(500)}
          exiting={flipOut.duration(500)}
          style={styles.card}
        >
          {back}
        </Animated.View>
      ) : (
        <Animated.View
          key="front"
          entering={flipIn.duration(500)}
          exiting={flipOut.duration(500)}
          style={styles.card}
        >
          {front}
        </Animated.View>
      )}
    </Pressable>
  );
}
```

---

## 💻 이징 함수 적용

### 키프레임별 이징

```typescript
import { Easing } from 'react-native-reanimated';

const customEasing = new Keyframe({
  0: {
    transform: [{ translateY: -200 }],
    easing: Easing.out(Easing.quad), // 이 구간에 적용
  },
  50: {
    transform: [{ translateY: 0 }],
    easing: Easing.bounce, // 이 구간에 적용
  },
  100: {
    transform: [{ translateY: 0 }],
  },
});
```

### 전체 애니메이션 이징

```typescript
// duration과 함께 전체 이징 적용
const smoothBounce = bounceIn
  .duration(800)
  .reduceMotion(ReduceMotion.Never);
```

---

## 💻 다중 속성 애니메이션

### 복합 효과

```typescript
const complexEntry = new Keyframe({
  0: {
    opacity: 0,
    transform: [
      { translateY: -50 },
      { scale: 0.8 },
      { rotate: '-10deg' },
    ],
    backgroundColor: '#ff0000',
  },
  30: {
    opacity: 0.5,
    transform: [
      { translateY: 10 },
      { scale: 1.1 },
      { rotate: '5deg' },
    ],
    backgroundColor: '#ffff00',
  },
  60: {
    opacity: 0.8,
    transform: [
      { translateY: -5 },
      { scale: 0.95 },
      { rotate: '-2deg' },
    ],
    backgroundColor: '#00ff00',
  },
  100: {
    opacity: 1,
    transform: [
      { translateY: 0 },
      { scale: 1 },
      { rotate: '0deg' },
    ],
    backgroundColor: '#0000ff',
  },
});

<Animated.View
  entering={complexEntry.duration(1000)}
  style={styles.box}
/>
```

---

## 💻 실전: 알림 배지

```typescript
const badgePop = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0 }],
  },
  50: {
    opacity: 1,
    transform: [{ scale: 1.3 }],
  },
  70: {
    transform: [{ scale: 0.9 }],
  },
  85: {
    transform: [{ scale: 1.1 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
});

function NotificationBadge({ count }: { count: number }) {
  const [prevCount, setPrevCount] = useState(count);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (count > prevCount) {
      setKey((k) => k + 1); // 애니메이션 트리거
    }
    setPrevCount(count);
  }, [count]);

  if (count === 0) return null;

  return (
    <Animated.View
      key={key}
      entering={badgePop.duration(400)}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>{count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

---

## 💻 실전: 성공/실패 피드백

```typescript
// 성공 체크마크
const successAnimation = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0 }, { rotate: '-45deg' }],
  },
  50: {
    opacity: 1,
    transform: [{ scale: 1.2 }, { rotate: '10deg' }],
  },
  70: {
    transform: [{ scale: 0.9 }, { rotate: '-5deg' }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }, { rotate: '0deg' }],
  },
});

// 실패 X 마크
const failureAnimation = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0 }] },
  20: { opacity: 1, transform: [{ scale: 1 }] },
  25: { transform: [{ translateX: -5 }] },
  35: { transform: [{ translateX: 5 }] },
  45: { transform: [{ translateX: -5 }] },
  55: { transform: [{ translateX: 5 }] },
  65: { transform: [{ translateX: -3 }] },
  75: { transform: [{ translateX: 3 }] },
  100: { transform: [{ translateX: 0 }] },
});

function FeedbackIcon({ type }: { type: 'success' | 'failure' }) {
  return type === 'success' ? (
    <Animated.View
      entering={successAnimation.duration(600)}
      style={[styles.icon, styles.successIcon]}
    >
      <Text style={styles.iconText}>✓</Text>
    </Animated.View>
  ) : (
    <Animated.View
      entering={failureAnimation.duration(600)}
      style={[styles.icon, styles.failureIcon]}
    >
      <Text style={styles.iconText}>✕</Text>
    </Animated.View>
  );
}
```

---

## 💻 실전: 로딩 스피너

```typescript
// 점 3개 로딩
function DotLoading() {
  const dotAnimation = (delay: number) =>
    new Keyframe({
      0: { opacity: 0.3, transform: [{ scale: 0.8 }] },
      50: { opacity: 1, transform: [{ scale: 1.2 }] },
      100: { opacity: 0.3, transform: [{ scale: 0.8 }] },
    }).delay(delay);

  return (
    <View style={styles.dotsContainer}>
      {[0, 150, 300].map((delay, index) => (
        <Animated.View
          key={index}
          entering={dotAnimation(delay).duration(900)}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

// 주의: Keyframe은 한 번만 실행됨
// 무한 반복이 필요하면 useAnimatedStyle + withRepeat 사용
```

---

## 📊 Keyframe 메서드

| 메서드 | 설명 | 예시 |
|-------|------|------|
| `.duration(ms)` | 총 지속 시간 | `.duration(500)` |
| `.delay(ms)` | 시작 지연 | `.delay(200)` |
| `.reduceMotion()` | 모션 감소 설정 | `.reduceMotion(ReduceMotion.System)` |
| `.withCallback()` | 완료 콜백 | `.withCallback(fn)` |

---

## ⚠️ 흔한 실수와 해결법

### 1. 백분율 범위 초과

```typescript
// ❌ 100 초과
new Keyframe({
  0: { opacity: 0 },
  150: { opacity: 1 }, // 에러!
})

// ✅ 0-100 범위
new Keyframe({
  0: { opacity: 0 },
  100: { opacity: 1 },
})
```

### 2. transform 배열 구조

```typescript
// ❌ 잘못된 구조
{ transform: { translateX: 100 } }

// ✅ 올바른 구조
{ transform: [{ translateX: 100 }] }
```

### 3. 재실행 안 됨

```typescript
// ❌ 같은 컴포넌트는 entering이 한 번만 실행
<Animated.View entering={shake} />

// ✅ key를 변경하여 리마운트
const [key, setKey] = useState(0);
const triggerShake = () => setKey(k => k + 1);

<Animated.View key={key} entering={shake} />
```

### 4. 무한 반복 불가

```typescript
// ❌ Keyframe은 무한 반복 지원 안 함
entering={pulse} // 한 번만 실행

// ✅ 무한 반복이 필요하면 useAnimatedStyle 사용
const style = useAnimatedStyle(() => ({
  transform: [{
    scale: withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1
    )
  }]
}));
```

---

## 💡 성능 최적화 팁

### 1. Keyframe 재사용

```typescript
// ✅ 컴포넌트 외부에서 정의 (한 번만 생성)
const fadeInBounce = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -20 }] },
  60: { opacity: 1, transform: [{ translateY: 5 }] },
  100: { transform: [{ translateY: 0 }] },
});

function MyComponent() {
  return <Animated.View entering={fadeInBounce.duration(400)} />;
}
```

### 2. 동적 Keyframe 메모이제이션

```typescript
const getDelayedAnimation = useMemo(() => {
  return (delay: number) =>
    new Keyframe({
      0: { opacity: 0 },
      100: { opacity: 1 },
    }).delay(delay);
}, []);
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 매칭 성공 셀레브레이션

```typescript
// src/features/matching/ui/match-celebration.tsx 참고
const celebrationAnimation = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0 }, { rotate: '-180deg' }],
  },
  40: {
    opacity: 1,
    transform: [{ scale: 1.3 }, { rotate: '15deg' }],
  },
  60: {
    transform: [{ scale: 0.9 }, { rotate: '-10deg' }],
  },
  80: {
    transform: [{ scale: 1.1 }, { rotate: '5deg' }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }, { rotate: '0deg' }],
  },
});
```

---

## 🏋️ 연습 문제

### 연습 1: 바운스 버튼
탭하면 눌렸다가 튀어오르는 버튼을 Keyframe으로 구현하세요.

### 연습 2: 셰이크 입력
유효성 검사 실패 시 입력 필드가 흔들리게 구현하세요.

### 연습 3: 하트 펌프
좋아요 버튼을 누르면 하트가 커졌다 작아지는 효과를 만드세요.

<details>
<summary>힌트 보기</summary>

```typescript
const heartPump = new Keyframe({
  0: { transform: [{ scale: 1 }] },
  30: { transform: [{ scale: 1.3 }] },
  60: { transform: [{ scale: 0.9 }] },
  100: { transform: [{ scale: 1 }] },
});
```

</details>

### 연습 4: 스텝 진행
1, 2, 3, 4 단계를 거치는 진행 표시기를 Keyframe으로 구현하세요.

---

## 📚 요약

### Keyframe 핵심 구조

```typescript
new Keyframe({
  0: { /* 시작 상태 */ },
  50: { /* 중간 상태 */ },
  100: { /* 최종 상태 */ },
}).duration(ms)
```

### 핵심 포인트

| 요소 | 설명 |
|-----|------|
| 백분율 키 | 0-100 범위의 타임라인 위치 |
| transform | 항상 배열 형태 |
| duration() | 총 애니메이션 시간 |
| delay() | 시작 지연 |
| 재실행 | key 변경으로 리마운트 필요 |

### 다음 장 예고

다음 장에서는 **리스트 아이템 애니메이션**을 배웁니다. FlatList, FlashList 등 가상화된 리스트에서 아이템 등장/삭제/재정렬 애니메이션을 적용하는 방법을 다룹니다.
