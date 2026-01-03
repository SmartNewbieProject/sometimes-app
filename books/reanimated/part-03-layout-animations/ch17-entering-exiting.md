# Chapter 17: Entering/Exiting 애니메이션 기초

## 📌 개요

컴포넌트가 화면에 나타나거나 사라질 때 애니메이션을 적용하면 사용자 경험이 크게 향상됩니다. Reanimated의 Entering/Exiting 애니메이션은 선언적으로 이를 구현할 수 있게 해줍니다. CSS의 transition과 비슷하지만 훨씬 더 강력합니다.

### 학습 목표

- Entering 애니메이션 적용법
- Exiting 애니메이션 적용법
- 내장 애니메이션 프리셋 활용
- 커스텀 애니메이션 정의
- 콜백과 이벤트 처리

---

## 📖 기본 개념

### Entering/Exiting이란?

| 용어 | 설명 | 시점 |
|-----|------|------|
| Entering | 컴포넌트가 마운트될 때 | 조건부 렌더링으로 나타날 때 |
| Exiting | 컴포넌트가 언마운트될 때 | 조건부 렌더링으로 사라질 때 |
| Layout | 컴포넌트 위치/크기 변경될 때 | 다른 요소 추가/삭제 영향 |

### 왜 필요한가?

```typescript
// ❌ 일반 React: 즉시 나타나고 사라짐
{isVisible && <View style={styles.box} />}

// ✅ Reanimated: 애니메이션과 함께 나타나고 사라짐
{isVisible && (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    style={styles.box}
  />
)}
```

---

## 💻 기본 사용법

### 가장 간단한 예제

```typescript
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

function FadingBox() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View>
      <Button
        title={isVisible ? 'Hide' : 'Show'}
        onPress={() => setIsVisible(!isVisible)}
      />

      {isVisible && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.box}
        />
      )}
    </View>
  );
}
```

### 애니메이션 커스터마이징

```typescript
// 지속 시간 변경
entering={FadeIn.duration(500)}

// 지연 시간 추가
entering={FadeIn.delay(200)}

// 스프링 옵션
entering={FadeIn.springify().damping(15).stiffness(100)}

// 체이닝
entering={FadeIn.delay(200).duration(500)}
```

---

## 📖 내장 Entering 애니메이션

### Fade 계열

```typescript
import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';

// 기본 페이드인
<Animated.View entering={FadeIn} />

// 아래에서 위로 올라오며 페이드인
<Animated.View entering={FadeInUp} />

// 위에서 아래로 내려오며 페이드인
<Animated.View entering={FadeInDown} />

// 왼쪽에서 오른쪽으로 페이드인
<Animated.View entering={FadeInLeft} />

// 오른쪽에서 왼쪽으로 페이드인
<Animated.View entering={FadeInRight} />
```

### Slide 계열

```typescript
import {
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';

// 아래에서 슬라이드인 (opacity 변화 없음)
<Animated.View entering={SlideInDown} />

// 위에서 슬라이드인
<Animated.View entering={SlideInUp} />
```

### Zoom 계열

```typescript
import {
  ZoomIn,
  ZoomInDown,
  ZoomInUp,
  ZoomInLeft,
  ZoomInRight,
  ZoomInRotate,
  ZoomInEasyDown,
  ZoomInEasyUp,
} from 'react-native-reanimated';

// 중앙에서 확대
<Animated.View entering={ZoomIn} />

// 아래에서 확대하며 나타남
<Animated.View entering={ZoomInDown} />

// 회전하며 확대
<Animated.View entering={ZoomInRotate} />
```

### Bounce 계열

```typescript
import {
  BounceIn,
  BounceInDown,
  BounceInUp,
  BounceInLeft,
  BounceInRight,
} from 'react-native-reanimated';

// 바운스 효과와 함께 나타남
<Animated.View entering={BounceIn} />

// 아래에서 바운스하며 나타남
<Animated.View entering={BounceInDown} />
```

### Flip 계열

```typescript
import {
  FlipInXUp,
  FlipInXDown,
  FlipInYLeft,
  FlipInYRight,
  FlipInEasyX,
  FlipInEasyY,
} from 'react-native-reanimated';

// X축 기준 플립
<Animated.View entering={FlipInXUp} />

// Y축 기준 플립
<Animated.View entering={FlipInYLeft} />
```

### Stretch 계열

```typescript
import {
  StretchInX,
  StretchInY,
} from 'react-native-reanimated';

// 수평으로 늘어나며 나타남
<Animated.View entering={StretchInX} />

// 수직으로 늘어나며 나타남
<Animated.View entering={StretchInY} />
```

### Roll 계열

```typescript
import { RollInLeft, RollInRight } from 'react-native-reanimated';

// 왼쪽에서 굴러 들어옴
<Animated.View entering={RollInLeft} />
```

### Rotate 계열

```typescript
import {
  RotateInDownLeft,
  RotateInDownRight,
  RotateInUpLeft,
  RotateInUpRight,
} from 'react-native-reanimated';

// 왼쪽 아래 모서리를 중심으로 회전하며 나타남
<Animated.View entering={RotateInDownLeft} />
```

### LightSpeed 계열

```typescript
import {
  LightSpeedInLeft,
  LightSpeedInRight,
} from 'react-native-reanimated';

// 왼쪽에서 빠르게 슬라이드인
<Animated.View entering={LightSpeedInLeft} />
```

### Pinwheel

```typescript
import { PinwheelIn } from 'react-native-reanimated';

// 바람개비처럼 회전하며 나타남
<Animated.View entering={PinwheelIn} />
```

---

## 📖 내장 Exiting 애니메이션

### 대응 관계

| Entering | Exiting |
|----------|---------|
| FadeIn | FadeOut |
| FadeInUp | FadeOutUp |
| FadeInDown | FadeOutDown |
| SlideInDown | SlideOutDown |
| ZoomIn | ZoomOut |
| BounceIn | BounceOut |
| FlipInXUp | FlipOutXUp |

```typescript
import { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={FadeOut}
  style={styles.box}
/>
```

### 다른 조합 사용

```typescript
// 아래에서 올라왔다가 위로 사라짐
<Animated.View
  entering={SlideInDown}
  exiting={SlideOutUp}
/>

// 확대되며 나타났다가 축소되며 사라짐
<Animated.View
  entering={ZoomIn}
  exiting={ZoomOut}
/>
```

---

## 💻 애니메이션 수정자

### duration: 지속 시간

```typescript
// 500ms 동안 페이드인
entering={FadeIn.duration(500)}

// 1초 동안 슬라이드인
entering={SlideInDown.duration(1000)}
```

### delay: 지연 시간

```typescript
// 200ms 후에 시작
entering={FadeIn.delay(200)}

// 여러 아이템 순차 등장
{items.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={FadeInUp.delay(index * 100)}
  />
))}
```

### springify: 스프링 물리

```typescript
// 기본 스프링
entering={FadeIn.springify()}

// 커스텀 스프링 설정
entering={FadeIn.springify().damping(10).stiffness(100).mass(0.5)}

// 바운시한 느낌
entering={ZoomIn.springify().damping(8).stiffness(200)}
```

### easing: 이징 함수

```typescript
import { Easing } from 'react-native-reanimated';

entering={FadeIn.easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
entering={SlideInDown.easing(Easing.elastic(1))}
```

### 체이닝

```typescript
// 여러 수정자 조합
entering={FadeInUp
  .delay(200)
  .duration(500)
  .springify()
  .damping(15)
}
```

---

## 💻 콜백과 이벤트

### withCallback

```typescript
import { runOnJS } from 'react-native-reanimated';

function AnimatedComponent() {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
    // 다음 동작 실행
  };

  return (
    <Animated.View
      entering={FadeIn.withCallback((finished) => {
        'worklet';
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      })}
    />
  );
}
```

### Exiting 콜백

```typescript
<Animated.View
  exiting={FadeOut.withCallback((finished) => {
    'worklet';
    if (finished) {
      runOnJS(onExitComplete)();
    }
  })}
/>
```

---

## 💻 실전 예제: 알림 토스트

```typescript
import { useState, useEffect } from 'react';
import Animated, {
  FadeInUp,
  FadeOutUp,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  message: string;
  duration?: number;
  onHide?: () => void;
}

function Toast({ message, duration = 3000, onHide }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) {
    // Exiting 콜백에서 onHide 호출
    return (
      <Animated.View
        exiting={FadeOutUp.duration(300).withCallback((finished) => {
          'worklet';
          if (finished && onHide) {
            runOnJS(onHide)();
          }
        })}
        style={styles.toast}
      >
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify()}
      style={styles.toast}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
```

---

## 💻 실전 예제: 리스트 아이템 등장

```typescript
function AnimatedList({ items }: { items: Item[] }) {
  return (
    <ScrollView>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInUp
            .delay(index * 50)  // 순차 등장
            .duration(400)
            .springify()
            .damping(15)
          }
          style={styles.listItem}
        >
          <Text>{item.title}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

---

## 💻 실전 예제: 모달 등장/퇴장

```typescript
function Modal({
  isVisible,
  onClose,
  children,
}: {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* 배경 페이드 */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* 모달 컨텐츠 */}
      <Animated.View
        entering={ZoomIn.duration(300).springify().damping(15)}
        exiting={ZoomOut.duration(200)}
        style={styles.modalContent}
      >
        {children}
      </Animated.View>
    </View>
  );
}
```

---

## 📊 애니메이션 선택 가이드

| 상황 | 추천 Entering | 추천 Exiting |
|-----|--------------|--------------|
| 토스트/알림 | FadeInUp | FadeOutUp |
| 모달/팝업 | ZoomIn | ZoomOut |
| 드롭다운 | FadeInDown | FadeOutUp |
| 사이드 메뉴 | SlideInLeft | SlideOutLeft |
| 리스트 아이템 | FadeInUp + delay | FadeOut |
| 카드 | ZoomIn + springify | FadeOut |
| 플로팅 버튼 | BounceIn | BounceOut |

---

## ⚠️ 흔한 실수와 해결법

### 1. 일반 View에 적용

```typescript
// ❌ View에는 entering/exiting 불가
<View entering={FadeIn} />

// ✅ Animated.View 사용
<Animated.View entering={FadeIn} />
```

### 2. key 없이 리스트 렌더링

```typescript
// ❌ key 없으면 애니메이션 오작동
{items.map((item) => (
  <Animated.View entering={FadeIn}>{item.title}</Animated.View>
))}

// ✅ 고유 key 필수
{items.map((item) => (
  <Animated.View key={item.id} entering={FadeIn}>
    {item.title}
  </Animated.View>
))}
```

### 3. 조건부 렌더링 외부 사용

```typescript
// ❌ 항상 렌더링되면 entering 한 번만 실행
<Animated.View
  entering={FadeIn}
  style={{ opacity: isVisible ? 1 : 0 }}
/>

// ✅ 조건부 렌더링으로 마운트/언마운트
{isVisible && (
  <Animated.View entering={FadeIn} exiting={FadeOut} />
)}
```

### 4. 무한 루프

```typescript
// ❌ 상태 변경이 리렌더 → 애니메이션 → 상태 변경 반복
<Animated.View
  entering={FadeIn.withCallback(() => {
    runOnJS(setIsVisible)(true); // 무한 루프!
  })}
/>

// ✅ 올바른 상태 관리
const [hasAnimated, setHasAnimated] = useState(false);

<Animated.View
  entering={FadeIn.withCallback((finished) => {
    'worklet';
    if (finished && !hasAnimated) {
      runOnJS(setHasAnimated)(true);
    }
  })}
/>
```

---

## 💡 성능 최적화 팁

### 1. 많은 아이템의 순차 등장

```typescript
// ✅ 최대 지연 제한
const maxDelay = 500;
const delayPerItem = Math.min(50, maxDelay / items.length);

{items.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={FadeInUp.delay(index * delayPerItem)}
  />
))}
```

### 2. 복잡한 애니메이션 메모이제이션

```typescript
const enteringAnimation = useMemo(() =>
  FadeInUp
    .delay(200)
    .duration(500)
    .springify()
    .damping(15),
  []
);

<Animated.View entering={enteringAnimation} />
```

### 3. 불필요한 애니메이션 비활성화

```typescript
// 접근성 설정에서 모션 감소 요청 시
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

<Animated.View
  entering={reduceMotion ? undefined : FadeIn}
/>
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 매칭 결과 알림

```typescript
// src/features/matching/ui/match-notification.tsx 참고
function MatchNotification({ match, onClose }) {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <Animated.Image
        entering={FadeIn.delay(200)}
        source={{ uri: match.photo }}
        style={styles.photo}
      />
      <Animated.Text
        entering={FadeInUp.delay(300)}
        style={styles.message}
      >
        It's a Match!
      </Animated.Text>
    </Animated.View>
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 Entering
버튼을 누르면 박스가 FadeInUp으로 나타나고, 다시 누르면 FadeOutDown으로 사라지게 구현하세요.

### 연습 2: 순차 등장 리스트
5개의 아이템이 100ms 간격으로 순차적으로 나타나게 구현하세요.

### 연습 3: 토스트 알림
화면 상단에 나타났다가 3초 후 사라지는 토스트 알림을 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
useEffect(() => {
  const timer = setTimeout(() => setVisible(false), 3000);
  return () => clearTimeout(timer);
}, []);
```

</details>

### 연습 4: 커스텀 스프링 효과
BounceIn보다 더 탄력 있는 스프링 효과를 만들어보세요.

---

## 📚 요약

### 핵심 개념

| 개념 | 설명 |
|-----|------|
| entering | 마운트 시 애니메이션 |
| exiting | 언마운트 시 애니메이션 |
| duration | 지속 시간 설정 |
| delay | 시작 지연 |
| springify | 스프링 물리 적용 |
| withCallback | 완료 콜백 |

### Entering/Exiting 체크리스트

- [ ] Animated.View 사용
- [ ] 조건부 렌더링으로 마운트/언마운트
- [ ] 고유 key 제공
- [ ] 적절한 duration/delay
- [ ] 필요시 콜백 처리

### 다음 장 예고

다음 장에서는 **Layout 애니메이션 심화**를 배웁니다. 컴포넌트의 위치나 크기가 변경될 때 자동으로 애니메이션을 적용하는 Layout Transition을 다룹니다.
