# 온보딩 기능 통합 가이드

## 개요

React Native Expo 앱의 온보딩 플로우가 구현되었습니다. 11개의 슬라이드와 5개의 특수 애니메이션을 포함하고 있으며, FSD 아키텍처를 준수합니다.

## 구현된 기능

### ✅ 핵심 기능

- [x] 11개 슬라이드 전체 구현
- [x] 수평 슬라이드 전환 애니메이션 (Reanimated 3)
- [x] 상단 프로그레스 바
- [x] AsyncStorage를 통한 온보딩 완료 상태 저장
- [x] Safe Area 처리 (상단 노치)
- [x] 건너뛰기 버튼 (1번 슬라이드만)
- [x] 실시간 카운트다운 (다음 매칭까지)

### ✅ 애니메이션

1. **하트 펄스** (Slide 1) - Scale + Opacity 반복
2. **순차 체크** (Slide 4) - 3개 배지 0.3초 간격 등장
3. **퍼즐 매칭** (Slide 6) - 퍼즐 조각 회전하며 만남
4. **하트 터치** (Slide 7) - 하트 확대 후 사라짐
5. **타이핑 효과** (Slide 8) - 채팅 메시지 타이핑

### ⚙️ 성능 최적화

- 현재 슬라이드 ±1만 렌더링 (메모리 절약)
- Reanimated worklet으로 네이티브 성능 보장
- FontAwesome 아이콘으로 이미지 로딩 시간 제거

## 파일 구조

```
src/features/onboarding/
├── ui/                           # 슬라이드 컴포넌트
│   ├── onboarding-screen.tsx     # 메인 화면
│   ├── slide-container.tsx       # 공통 레이아웃
│   ├── slide-welcome.tsx         # Slide 1
│   ├── slide-story.tsx           # Slide 2
│   ├── slide-matching-time.tsx   # Slide 3
│   ├── slide-verification.tsx    # Slide 4
│   ├── slide-student-only.tsx    # Slide 5
│   ├── slide-ai-matching.tsx     # Slide 6
│   ├── slide-like-guide.tsx      # Slide 7
│   ├── slide-chat-guide.tsx      # Slide 8
│   ├── slide-refund.tsx          # Slide 9
│   ├── slide-region.tsx          # Slide 10
│   └── slide-cta.tsx             # Slide 11
├── components/                   # UI 컴포넌트
│   ├── progress-bar.tsx
│   ├── navigation-buttons.tsx
│   └── skip-button.tsx
├── animations/                   # 애니메이션 컴포넌트
│   ├── heart-pulse.tsx
│   ├── sequential-check.tsx
│   ├── puzzle-match.tsx
│   ├── heart-touch.tsx
│   └── typing-effect.tsx
├── hooks/                        # 커스텀 훅
│   ├── use-onboarding-storage.tsx
│   └── use-countdown-timer.tsx
├── utils/                        # 유틸리티
│   └── calculate-next-match.ts
├── types.ts                      # 타입 정의
└── index.tsx                     # Barrel export

app/onboarding/
└── index.tsx                     # 라우트 진입점
```

## 통합 방법

### 옵션 1: 회원가입 플로우에 통합 (권장)

회원가입 완료 후 온보딩을 보여주는 방식입니다.

**app/auth/signup/complete.tsx** (또는 회원가입 마지막 단계):

```typescript
import { router } from 'expo-router';

const handleSignupComplete = async () => {
  // 회원가입 완료 로직
  await completeSignup();

  // 온보딩으로 이동
  router.replace('/onboarding');
};
```

### 옵션 2: 앱 진입 시 체크

앱 시작 시 온보딩을 봤는지 체크하는 방식입니다.

**app/index.tsx** 수정:

```typescript
import { useOnboardingStorage } from '@/src/features/onboarding';

export default function Home() {
  const { isAuthorized } = useAuth();
  const { checkOnboardingStatus } = useOnboardingStorage();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const seen = await checkOnboardingStatus();
      setHasSeenOnboarding(seen);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (hasSeenOnboarding === null) return; // 로딩 중

    const timer = setTimeout(() => {
      if (!isAuthorized) {
        router.push('/auth/login');
      } else if (!hasSeenOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/home');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthorized, hasSeenOnboarding]);

  return <Loading.Page title={i18n.t("apps.index.loading")} />;
}
```

### 옵션 3: 설정에서 다시 보기

설정 화면에 "온보딩 다시 보기" 버튼을 추가할 수 있습니다.

**app/my-info/index.tsx** (또는 설정 화면):

```typescript
import { router } from 'expo-router';

const handleShowOnboarding = () => {
  router.push('/onboarding');
};

// 버튼에 연결
<Button onPress={handleShowOnboarding}>
  온보딩 다시 보기
</Button>
```

## AsyncStorage 키

온보딩 완료 여부는 다음 키에 저장됩니다:

```typescript
Key: '@sometime:user:state'
Value: {
  hasSeenOnboarding: boolean,
  completedAt: string (ISO 8601)
}
```

기존 유저 상태와 통합하려면 `use-onboarding-storage.tsx`의 `ONBOARDING_STORAGE_KEY`를 수정하세요.

## 비즈니스 로직

### 매칭 시간 계산

다음 목요일 또는 일요일 21:00까지 남은 시간을 실시간으로 계산합니다.

- 목요일 21:00 이전 → 오늘 21:00
- 목요일 21:00 이후 → 일요일 21:00
- 일요일 21:00 이전 → 오늘 21:00
- 일요일 21:00 이후 → 목요일 21:00

## 국제화 (i18n)

온보딩은 한국어, 일본어, 영어를 지원합니다.

### 언어 전환 테스트

```typescript
import i18n from '@/src/shared/libs/i18n';

// 일본어로 변경
i18n.changeLanguage('ja');
```

### 번역 수정

```
src/shared/libs/locales/
├── ko/features/onboarding.json    # 한국어
├── ja/features/onboarding.json    # 일본어
└── en/features/onboarding.json    # 영어
```

자세한 내용은 [I18N_GUIDE.md](./I18N_GUIDE.md)를 참고하세요.

## 커스터마이징

### 슬라이드 내용 변경

번역 파일(`src/shared/libs/locales/{언어}/features/onboarding.json`)을 수정하면 됩니다.

### 애니메이션 조정

`src/features/onboarding/animations/` 디렉터리의 파일에서 duration, easing 값을 조정하세요.

### 색상 변경

모든 색상은 `src/shared/constants/colors.ts`에서 관리됩니다.

## 테스트

### 온보딩 초기화 (다시 보기)

AsyncStorage를 초기화하려면:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('@sometime:user:state');
```

또는 앱을 삭제하고 재설치하세요.

### 디버깅

```typescript
import { useOnboardingStorage } from '@/src/features/onboarding';

const { checkOnboardingStatus } = useOnboardingStorage();

const status = await checkOnboardingStatus();
console.log('Has seen onboarding:', status);
```

## 알려진 이슈 및 제한사항

### 현재 구현 (MVP)

- ✅ FontAwesome 아이콘 사용 (커스텀 일러스트 없음)
- ✅ 기본 접근성 지원 (고급 기능 제외)
- ⚠️ 테스트 코드 미포함 (추후 작성)

### 향후 개선 사항

- [ ] 커스텀 일러스트 이미지
- [ ] Lottie 애니메이션
- [ ] 슬라이드 스와이프 제스처
- [ ] 뒤로가기 버튼
- [ ] 하단 도트 인디케이터
- [ ] 슬라이드별 배경 그라디언트

## 문제 해결

### "Cannot find module" 에러

```bash
npm install
npm start -- --reset-cache
```

### 애니메이션이 작동하지 않음

Reanimated 설정을 확인하세요:

```javascript
// babel.config.js
module.exports = {
  plugins: [
    'react-native-reanimated/plugin', // 마지막에 위치해야 함
  ],
};
```

### Safe Area가 제대로 적용되지 않음

`react-native-safe-area-context`가 설치되어 있는지 확인하세요:

```bash
npx expo install react-native-safe-area-context
```

## 지원

문제가 발생하면 다음을 확인하세요:

1. Expo 버전: 53.0.12
2. React Native 버전: 0.79.4
3. Reanimated 버전: 3.x

---

**구현 완료일**: 2025-12-12
**작성자**: Claude Code
**버전**: 1.0.0
