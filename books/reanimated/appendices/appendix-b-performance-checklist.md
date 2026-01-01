# 부록 B: 성능 체크리스트

애니메이션 성능을 최적화하기 위한 종합 체크리스트입니다. 개발 중 및 배포 전 점검에 활용하세요.

---

## 🎯 60fps 달성 체크리스트

### 기본 원칙

- [ ] **모든 애니메이션이 UI 스레드에서 실행되는지 확인**
  - `useAnimatedStyle` 사용
  - worklet 함수 사용 (`'worklet'` 디렉티브)
  - `runOnJS` 최소화

- [ ] **JS 스레드 블로킹 방지**
  - 무거운 계산은 UI 스레드로 오프로드
  - 동기 API 호출 피하기
  - 큰 상태 업데이트 배치 처리

### SharedValue 최적화

```typescript
// ✅ 권장
const translateX = useSharedValue(0);

// ❌ 피하기: 복잡한 객체를 자주 업데이트
const state = useSharedValue({
  x: 0, y: 0, scale: 1, rotation: 0,
  // ... 많은 속성
});
```

- [ ] SharedValue를 목적에 맞게 분리
- [ ] 불필요한 중첩 객체 피하기
- [ ] 배열 대신 개별 값 사용

### useAnimatedStyle 최적화

```typescript
// ✅ 권장: 최소한의 계산
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

// ❌ 피하기: 불필요한 계산
const style = useAnimatedStyle(() => {
  const complexCalculation = /* 무거운 연산 */;
  return {
    transform: [{ translateX: complexCalculation }],
  };
});
```

- [ ] 필요한 스타일만 반환
- [ ] 복잡한 계산은 useDerivedValue로 분리
- [ ] 조건부 스타일 최소화

---

## 📱 플랫폼별 체크리스트

### iOS

- [ ] **Shadow 최적화**
  ```typescript
  // 정적 shadow 사용
  const staticShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  };

  // 동적 shadow 피하기
  // shadowOpacity, shadowRadius 애니메이션 지양
  ```

- [ ] **shouldRasterizeIOS 적용**
  ```typescript
  {
    shouldRasterizeIOS: true,
    // 복잡한 뷰 래스터화
  }
  ```

- [ ] **Blur 효과 최적화**
  - `UIBlurEffect` 네이티브 사용
  - 실시간 블러 업데이트 피하기

### Android

- [ ] **Elevation 사용**
  ```typescript
  elevation: 4, // shadow 대신 사용
  ```

- [ ] **Hardware Layer 활성화**
  ```typescript
  renderToHardwareTextureAndroid: true,
  ```

- [ ] **overdraw 최소화**
  - 불필요한 배경색 제거
  - 투명 뷰 최소화

---

## 📋 리스트 성능 체크리스트

### 기본 설정

```typescript
<Animated.FlatList
  scrollEventThrottle={16}        // 60fps
  removeClippedSubviews={true}    // 화면 밖 뷰 제거
  maxToRenderPerBatch={10}        // 배치 렌더링
  windowSize={5}                  // 뷰포트 버퍼
  initialNumToRender={10}         // 초기 렌더 수
  getItemLayout={getItemLayout}   // 고정 높이 시
/>
```

- [ ] `scrollEventThrottle={16}` 설정
- [ ] `removeClippedSubviews` 활성화
- [ ] 적절한 `windowSize` 설정
- [ ] `getItemLayout` 제공 (가능한 경우)

### 아이템 최적화

```typescript
// ✅ 권장: 메모이제이션
const MemoizedItem = React.memo(ListItem);

// ✅ 권장: 뷰포트 내 아이템만 애니메이션
const style = useAnimatedStyle(() => {
  if (!isInViewport.value) {
    return { opacity: 1 }; // 기본 스타일
  }
  return { opacity: animatedOpacity.value };
});
```

- [ ] 아이템 컴포넌트 메모이제이션
- [ ] 뷰포트 기반 애니메이션
- [ ] keyExtractor 최적화
- [ ] 과도한 리렌더 방지

### FlashList 고려

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  estimatedItemSize={80}
  // ... FlashList 설정
/>
```

- [ ] 대규모 리스트에 FlashList 사용
- [ ] `estimatedItemSize` 정확히 설정

---

## 🎨 스타일 최적화 체크리스트

### Transform 최적화

```typescript
// ✅ 권장: GPU 가속 속성만 사용
transform: [
  { translateX: x.value },
  { translateY: y.value },
  { scale: scale.value },
  { rotate: `${rotation.value}deg` },
]

// ❌ 피하기: 레이아웃 트리거 속성
// width, height, top, left 애니메이션
```

- [ ] translateX/Y, scale, rotate 우선 사용
- [ ] width/height 애니메이션 대신 scale 사용
- [ ] top/left 대신 translate 사용

### 색상 애니메이션

```typescript
// ✅ 권장: opacity 사용
opacity: interpolate(progress, [0, 1], [0, 1])

// ⚠️ 주의: 색상 보간은 비용이 높을 수 있음
backgroundColor: interpolateColor(progress, [0, 1], ['#FFF', '#000'])
```

- [ ] 가능하면 opacity 사용
- [ ] 색상 보간 최소화
- [ ] 그라데이션 애니메이션 피하기

---

## 🧠 메모리 최적화 체크리스트

### Cleanup

```typescript
useEffect(() => {
  return () => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
  };
}, []);
```

- [ ] 컴포넌트 언마운트 시 애니메이션 취소
- [ ] setInterval/setTimeout 정리
- [ ] 이벤트 리스너 제거

### SharedValue 관리

```typescript
// ✅ 권장: 필요한 만큼만 생성
const translateX = useSharedValue(0);
const translateY = useSharedValue(0);

// ❌ 피하기: 동적 생성
const values = items.map(() => useSharedValue(0)); // 훅 규칙 위반
```

- [ ] SharedValue 재사용
- [ ] 불필요한 SharedValue 제거
- [ ] 동적 SharedValue 생성 피하기

### 이미지 최적화

- [ ] 적절한 해상도 사용
- [ ] 이미지 캐싱 활용
- [ ] 지연 로딩 구현

---

## 🔧 디버깅 체크리스트

### 개발 중

```typescript
// FPS 모니터링
useFrameCallback((info) => {
  if (info.timeSincePreviousFrame > 20) {
    console.warn('Frame drop detected');
  }
});
```

- [ ] FPS 모니터 활성화
- [ ] 프레임 드롭 로깅
- [ ] 성능 프로파일러 사용

### 프로덕션 전

- [ ] Flipper 성능 플러그인 확인
- [ ] Hermes 엔진 사용 확인
- [ ] 릴리스 빌드에서 테스트
- [ ] 저사양 기기에서 테스트

---

## 📊 성능 기준

### 목표 수치

| 메트릭 | 목표 | 허용 범위 |
|--------|------|----------|
| FPS | 60 | ≥55 |
| 프레임 타임 | 16.67ms | ≤18ms |
| JS 스레드 블로킹 | 0ms | ≤5ms |
| 메모리 증가 | 0 | ≤10MB/분 |

### 측정 도구

```typescript
// 프레임 타임 측정
const startTime = performance.now();
// ... 작업
const duration = performance.now() - startTime;

// 메모리 사용량 (Hermes)
if (global.HermesInternal) {
  const stats = global.HermesInternal.getRuntimeProperties();
  console.log('Heap size:', stats['js_heapSize']);
}
```

---

## ✅ 배포 전 최종 점검

### 기능 테스트

- [ ] 모든 애니메이션 정상 동작
- [ ] 제스처 충돌 없음
- [ ] 메모리 누수 없음
- [ ] 크래시 없음

### 성능 테스트

- [ ] iOS 저사양 기기 (iPhone SE, iPhone 8)
- [ ] Android 저사양 기기 (2GB RAM 이하)
- [ ] 장시간 사용 테스트 (30분+)
- [ ] 배터리 소모 측정

### 접근성

- [ ] Reduce Motion 설정 존중
- [ ] 애니메이션 비활성화 옵션
- [ ] 충분한 터치 영역

---

## 🚀 Quick Wins

즉시 성능을 개선할 수 있는 빠른 팁:

1. **scrollEventThrottle={16}** 설정
2. **removeClippedSubviews={true}** 활성화
3. **React.memo** 적용
4. **cancelAnimation** 추가
5. **useNativeDriver** 확인 (legacy)
6. **Hermes 엔진** 사용
7. **FlashList** 도입
8. **이미지 최적화**

---

## 📝 성능 개선 로그 템플릿

```markdown
## 성능 개선 기록

### 날짜: YYYY-MM-DD

#### 문제
- 증상:
- 영향 범위:
- 재현 방법:

#### 분석
- 원인:
- 측정 결과:

#### 해결
- 적용 변경:
- 개선 결과:

#### 검증
- 테스트 환경:
- 성능 지표:
```
