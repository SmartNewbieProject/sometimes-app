# Chapter 19: 커스텀 레이아웃 트랜지션

## 📌 개요

내장 레이아웃 트랜지션으로 충분하지 않을 때, worklet 함수를 사용해 완전히 커스텀한 애니메이션을 만들 수 있습니다. 이 장에서는 Entering, Exiting, Layout 각각에 대해 커스텀 애니메이션을 정의하는 방법을 배웁니다.

### 학습 목표

- 커스텀 Entering 애니메이션 정의
- 커스텀 Exiting 애니메이션 정의
- 커스텀 Layout 트랜지션 정의
- 키프레임 애니메이션 활용
- 복잡한 시퀀스 애니메이션

---

## 📖 커스텀 애니메이션 구조

### 기본 구조

```typescript
// 커스텀 애니메이션은 worklet 함수로 정의
const customAnimation = () => {
  'worklet';

  return {
    initialValues: {
      // 시작 상태
      opacity: 0,
      transform: [{ scale: 0 }],
    },
    animations: {
      // 최종 상태 (애니메이션으로 도달)
      opacity: 1,
      transform: [{ scale: 1 }],
    },
  };
};

// 사용
<Animated.View entering={customAnimation} />
```

### 애니메이션 값에 withTiming/withSpring 적용

```typescript
import { withTiming, withSpring } from 'react-native-reanimated';

const customEntering = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: -50 }],
    },
    animations: {
      opacity: withTiming(1, { duration: 300 }),
      transform: [
        { translateY: withSpring(0, { damping: 15 }) },
      ],
    },
  };
};
```

---

## 💻 커스텀 Entering 애니메이션

### 기본 예제: 회전하며 나타남

```typescript
const spinInAnimation = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 0,
      transform: [
        { rotate: '-360deg' },
        { scale: 0 },
      ],
    },
    animations: {
      opacity: withTiming(1, { duration: 500 }),
      transform: [
        { rotate: withTiming('0deg', { duration: 500 }) },
        { scale: withSpring(1, { damping: 12 }) },
      ],
    },
  };
};

function SpinInExample() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View>
      <Button title="Toggle" onPress={() => setIsVisible(!isVisible)} />
      {isVisible && (
        <Animated.View
          entering={spinInAnimation}
          style={styles.box}
        />
      )}
    </View>
  );
}
```

### 컨텍스트 값 활용

```typescript
const slideInFromDirection = (direction: 'left' | 'right') => {
  'worklet';

  const translateX = direction === 'left' ? -300 : 300;

  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateX }],
    },
    animations: {
      opacity: withTiming(1),
      transform: [
        { translateX: withSpring(0, { damping: 15 }) },
      ],
    },
  };
};

// 사용
<Animated.View entering={() => slideInFromDirection('left')} />
<Animated.View entering={() => slideInFromDirection('right')} />
```

### 화면 크기 기반 애니메이션

```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const flyInFromCorner = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 0,
      transform: [
        { translateX: -SCREEN_WIDTH },
        { translateY: -SCREEN_HEIGHT },
        { rotate: '-45deg' },
      ],
    },
    animations: {
      opacity: withTiming(1, { duration: 600 }),
      transform: [
        { translateX: withSpring(0, { damping: 20 }) },
        { translateY: withSpring(0, { damping: 20 }) },
        { rotate: withSpring('0deg') },
      ],
    },
  };
};
```

---

## 💻 values 파라미터 활용

### 컴포넌트 레이아웃 정보 접근

```typescript
const customEntering = (values: EntryAnimationsValues) => {
  'worklet';

  // values에서 사용 가능한 정보:
  // - targetOriginX, targetOriginY: 최종 위치
  // - targetWidth, targetHeight: 최종 크기
  // - targetGlobalOriginX, targetGlobalOriginY: 화면 기준 절대 위치

  return {
    initialValues: {
      opacity: 0,
      originX: values.targetOriginX + values.targetWidth / 2,
      originY: values.targetOriginY,
    },
    animations: {
      opacity: withTiming(1),
      originX: withTiming(values.targetOriginX),
      originY: withTiming(values.targetOriginY),
    },
  };
};
```

### 화면 중앙에서 최종 위치로 이동

```typescript
const fromCenterAnimation = (values: EntryAnimationsValues) => {
  'worklet';

  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  // 중앙에서 시작
  const startX = centerX - values.targetWidth / 2 - values.targetOriginX;
  const startY = centerY - values.targetHeight / 2 - values.targetOriginY;

  return {
    initialValues: {
      opacity: 0,
      transform: [
        { translateX: startX },
        { translateY: startY },
        { scale: 0.5 },
      ],
    },
    animations: {
      opacity: withTiming(1, { duration: 400 }),
      transform: [
        { translateX: withSpring(0, { damping: 15 }) },
        { translateY: withSpring(0, { damping: 15 }) },
        { scale: withSpring(1, { damping: 12 }) },
      ],
    },
  };
};
```

---

## 💻 커스텀 Exiting 애니메이션

### 기본 예제: 폭발 효과

```typescript
const explodeOutAnimation = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    animations: {
      opacity: withTiming(0, { duration: 300 }),
      transform: [
        { scale: withTiming(2, { duration: 300 }) },
      ],
    },
  };
};

<Animated.View
  entering={ZoomIn}
  exiting={explodeOutAnimation}
/>
```

### 화면 밖으로 날아감

```typescript
const flyOutAnimation = (values: ExitAnimationsValues) => {
  'worklet';

  // 랜덤 방향으로 날아감
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance;

  return {
    initialValues: {
      opacity: 1,
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { rotate: '0deg' },
      ],
    },
    animations: {
      opacity: withTiming(0, { duration: 500 }),
      transform: [
        { translateX: withTiming(targetX, { duration: 500 }) },
        { translateY: withTiming(targetY, { duration: 500 }) },
        { rotate: withTiming('720deg', { duration: 500 }) },
      ],
    },
  };
};
```

### 슬라이드 아웃 + 찌그러짐

```typescript
const squashOutAnimation = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 1,
      transform: [
        { translateY: 0 },
        { scaleX: 1 },
        { scaleY: 1 },
      ],
    },
    animations: {
      opacity: withTiming(0, { duration: 300 }),
      transform: [
        { translateY: withTiming(50, { duration: 300 }) },
        { scaleX: withTiming(1.5, { duration: 300 }) },
        { scaleY: withTiming(0.1, { duration: 300 }) },
      ],
    },
  };
};
```

---

## 💻 커스텀 Layout 트랜지션

### 기본 구조

```typescript
const customLayoutTransition = (values: LayoutAnimationsValues) => {
  'worklet';

  // values에서 사용 가능한 정보:
  // - currentOriginX/Y: 현재 위치
  // - targetOriginX/Y: 목표 위치
  // - currentWidth/Height: 현재 크기
  // - targetWidth/Height: 목표 크기

  return {
    initialValues: {
      originX: values.currentOriginX,
      originY: values.currentOriginY,
      width: values.currentWidth,
      height: values.currentHeight,
    },
    animations: {
      originX: withSpring(values.targetOriginX),
      originY: withSpring(values.targetOriginY),
      width: withSpring(values.targetWidth),
      height: withSpring(values.targetHeight),
    },
  };
};
```

### 아치형 이동

```typescript
const arcTransition = (values: LayoutAnimationsValues) => {
  'worklet';

  const deltaX = values.targetOriginX - values.currentOriginX;
  const deltaY = values.targetOriginY - values.currentOriginY;

  // 중간 지점에서 위로 아치
  const arcHeight = -Math.abs(deltaX) * 0.3;

  return {
    initialValues: {
      originX: values.currentOriginX,
      originY: values.currentOriginY,
    },
    animations: {
      originX: withTiming(values.targetOriginX, { duration: 500 }),
      originY: withSequence(
        // 위로 아치
        withTiming(
          values.currentOriginY + arcHeight,
          { duration: 250 }
        ),
        // 목표 위치로
        withTiming(
          values.targetOriginY,
          { duration: 250 }
        )
      ),
    },
  };
};
```

### 회전하며 이동

```typescript
const spinTransition = (values: LayoutAnimationsValues) => {
  'worklet';

  return {
    initialValues: {
      originX: values.currentOriginX,
      originY: values.currentOriginY,
      transform: [{ rotate: '0deg' }],
    },
    animations: {
      originX: withSpring(values.targetOriginX, { damping: 15 }),
      originY: withSpring(values.targetOriginY, { damping: 15 }),
      transform: [
        { rotate: withTiming('360deg', { duration: 500 }) },
      ],
    },
  };
};
```

---

## 💻 키프레임 애니메이션

### Keyframe 클래스 사용

```typescript
import { Keyframe } from 'react-native-reanimated';

const keyframeAnimation = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0 }, { rotate: '-45deg' }],
  },
  30: {
    opacity: 0.5,
    transform: [{ scale: 1.2 }, { rotate: '10deg' }],
  },
  60: {
    opacity: 0.8,
    transform: [{ scale: 0.9 }, { rotate: '-5deg' }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }, { rotate: '0deg' }],
  },
});

// 사용
<Animated.View entering={keyframeAnimation.duration(600)} />
```

### 바운스 키프레임

```typescript
const bounceKeyframe = new Keyframe({
  0: {
    transform: [{ translateY: -100 }],
    opacity: 0,
  },
  20: {
    transform: [{ translateY: 0 }],
    opacity: 1,
  },
  40: {
    transform: [{ translateY: -30 }],
  },
  60: {
    transform: [{ translateY: 0 }],
  },
  80: {
    transform: [{ translateY: -10 }],
  },
  100: {
    transform: [{ translateY: 0 }],
  },
});

<Animated.View entering={bounceKeyframe.duration(800)} />
```

### 펄스 키프레임

```typescript
const pulseKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1 }],
  },
  50: {
    transform: [{ scale: 1.1 }],
  },
  100: {
    transform: [{ scale: 1 }],
  },
});

// 무한 반복은 불가 - 대신 useAnimatedStyle 사용
```

### 셰이크 키프레임

```typescript
const shakeKeyframe = new Keyframe({
  0: { transform: [{ translateX: 0 }] },
  10: { transform: [{ translateX: -10 }] },
  20: { transform: [{ translateX: 10 }] },
  30: { transform: [{ translateX: -10 }] },
  40: { transform: [{ translateX: 10 }] },
  50: { transform: [{ translateX: -10 }] },
  60: { transform: [{ translateX: 10 }] },
  70: { transform: [{ translateX: -10 }] },
  80: { transform: [{ translateX: 5 }] },
  90: { transform: [{ translateX: -5 }] },
  100: { transform: [{ translateX: 0 }] },
});
```

---

## 💻 조합 예제: 카드 뒤집기

```typescript
const flipInAnimation = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 0,
      transform: [
        { perspective: 1000 },
        { rotateY: '-90deg' },
      ],
    },
    animations: {
      opacity: withTiming(1, { duration: 400 }),
      transform: [
        { perspective: 1000 },
        { rotateY: withTiming('0deg', { duration: 400 }) },
      ],
    },
  };
};

const flipOutAnimation = () => {
  'worklet';

  return {
    initialValues: {
      opacity: 1,
      transform: [
        { perspective: 1000 },
        { rotateY: '0deg' },
      ],
    },
    animations: {
      opacity: withTiming(0, { duration: 400 }),
      transform: [
        { perspective: 1000 },
        { rotateY: withTiming('90deg', { duration: 400 }) },
      ],
    },
  };
};

function FlipCard({ frontContent, backContent }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Pressable onPress={() => setIsFlipped(!isFlipped)}>
      {isFlipped ? (
        <Animated.View
          key="back"
          entering={flipInAnimation}
          exiting={flipOutAnimation}
          style={styles.card}
        >
          {backContent}
        </Animated.View>
      ) : (
        <Animated.View
          key="front"
          entering={flipInAnimation}
          exiting={flipOutAnimation}
          style={styles.card}
        >
          {frontContent}
        </Animated.View>
      )}
    </Pressable>
  );
}
```

---

## 💻 조합 예제: 파티클 효과

```typescript
function ParticleEffect({ onComplete }: { onComplete: () => void }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (i / 20) * Math.PI * 2,
      distance: 100 + Math.random() * 100,
      size: 5 + Math.random() * 10,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    })),
    []
  );

  return (
    <View style={styles.particleContainer}>
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          entering={() => {
            'worklet';

            const targetX = Math.cos(particle.angle) * particle.distance;
            const targetY = Math.sin(particle.angle) * particle.distance;

            return {
              initialValues: {
                opacity: 1,
                transform: [
                  { translateX: 0 },
                  { translateY: 0 },
                  { scale: 1 },
                ],
              },
              animations: {
                opacity: withDelay(300, withTiming(0, { duration: 500 })),
                transform: [
                  { translateX: withTiming(targetX, { duration: 800 }) },
                  { translateY: withTiming(targetY, { duration: 800 }) },
                  { scale: withTiming(0, { duration: 800 }) },
                ],
              },
            };
          }}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            },
          ]}
        />
      ))}
    </View>
  );
}
```

---

## ⚠️ 흔한 실수와 해결법

### 1. worklet 디렉티브 누락

```typescript
// ❌ 에러 발생
const customAnimation = () => {
  return { /* ... */ };
};

// ✅ worklet 필수
const customAnimation = () => {
  'worklet';
  return { /* ... */ };
};
```

### 2. transform 배열 구조 오류

```typescript
// ❌ 잘못된 구조
transform: { translateX: 0, translateY: 0 }

// ✅ 올바른 구조
transform: [
  { translateX: 0 },
  { translateY: 0 },
]
```

### 3. 애니메이션 함수 누락

```typescript
// ❌ 즉시 변경 (애니메이션 없음)
animations: {
  opacity: 1,
}

// ✅ 애니메이션 함수 사용
animations: {
  opacity: withTiming(1),
}
```

### 4. Keyframe 백분율 범위

```typescript
// ❌ 0~100 범위 벗어남
new Keyframe({
  0: { opacity: 0 },
  150: { opacity: 1 }, // 에러!
})

// ✅ 0~100 범위 사용
new Keyframe({
  0: { opacity: 0 },
  100: { opacity: 1 },
})
```

---

## 💡 성능 최적화 팁

### 1. 복잡한 계산 미리 수행

```typescript
// 컴포넌트 외부에서 미리 계산
const PARTICLE_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  angle: (i / 20) * Math.PI * 2,
  x: Math.cos((i / 20) * Math.PI * 2) * 100,
  y: Math.sin((i / 20) * Math.PI * 2) * 100,
}));

const particleAnimation = (index: number) => {
  'worklet';

  const { x, y } = PARTICLE_POSITIONS[index];

  return {
    initialValues: { transform: [{ translateX: 0 }, { translateY: 0 }] },
    animations: {
      transform: [
        { translateX: withTiming(x) },
        { translateY: withTiming(y) },
      ],
    },
  };
};
```

### 2. 애니메이션 팩토리 메모이제이션

```typescript
const createSlideAnimation = useMemo(() => {
  return (direction: 'left' | 'right') => {
    'worklet';

    const translateX = direction === 'left' ? -300 : 300;
    return {
      initialValues: { transform: [{ translateX }] },
      animations: { transform: [{ translateX: withSpring(0) }] },
    };
  };
}, []);
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 매칭 성공 애니메이션

```typescript
// src/features/matching/ui/match-celebration.tsx 참고
const matchCelebrationAnimation = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0 }, { rotate: '-180deg' }],
  },
  50: {
    opacity: 1,
    transform: [{ scale: 1.2 }, { rotate: '10deg' }],
  },
  70: {
    transform: [{ scale: 0.9 }, { rotate: '-5deg' }],
  },
  85: {
    transform: [{ scale: 1.05 }, { rotate: '2deg' }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }, { rotate: '0deg' }],
  },
});
```

---

## 🏋️ 연습 문제

### 연습 1: 스핀 인
360도 회전하며 나타나는 커스텀 entering 애니메이션을 만드세요.

### 연습 2: 폭발 아웃
중심에서 퍼지며 사라지는 exiting 애니메이션을 만드세요.

### 연습 3: 아치형 이동
위로 아치를 그리며 이동하는 layout 트랜지션을 만드세요.

<details>
<summary>힌트 보기</summary>

```typescript
animations: {
  originY: withSequence(
    withTiming(current - 50, { duration: 250 }),
    withTiming(target, { duration: 250 })
  ),
}
```

</details>

### 연습 4: 바운스 키프레임
위에서 떨어져 바닥에서 2~3번 튀는 키프레임 애니메이션을 만드세요.

---

## 📚 요약

### 커스텀 애니메이션 구조

```typescript
const customAnimation = (values) => {
  'worklet';

  return {
    initialValues: { /* 시작 상태 */ },
    animations: { /* 최종 상태 + 애니메이션 함수 */ },
  };
};
```

### 핵심 포인트

| 요소 | 설명 |
|-----|------|
| worklet | 필수 디렉티브 |
| initialValues | 시작 상태 정의 |
| animations | 최종 상태 + withTiming/withSpring |
| values | 레이아웃 정보 (위치, 크기) |
| Keyframe | 다단계 애니메이션 |

### 다음 장 예고

다음 장에서는 **공유 엘리먼트 트랜지션**을 배웁니다. 화면 전환 시 동일한 요소가 자연스럽게 이동하는 애니메이션을 구현합니다.
