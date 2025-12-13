# 온보딩 기능

React Native Expo 앱의 온보딩 플로우 구현

## 빠른 시작

### 1. 기본 사용법

```typescript
import { OnboardingScreen } from '@/src/features/onboarding';

// 온보딩 화면 표시
<OnboardingScreen />
```

### 2. 라우팅

```typescript
// app/onboarding/index.tsx에 이미 구현됨
router.push('/onboarding');
```

### 3. 상태 확인

```typescript
import { useOnboardingStorage } from '@/src/features/onboarding';

const { checkOnboardingStatus, saveOnboardingComplete } = useOnboardingStorage();

// 온보딩을 봤는지 확인
const hasSeen = await checkOnboardingStatus(); // true | false

// 온보딩 완료 저장
await saveOnboardingComplete();
```

## 주요 기능

### 📱 11개 슬라이드
1. 환영 (하트 펄스 애니메이션)
2. 스토리
3. 매칭 시간 (실시간 카운트다운)
4. 인증 시스템 (순차 체크 애니메이션)
5. 대학생 전용
6. AI 매칭 (퍼즐 애니메이션)
7. 좋아요 가이드 (하트 터치 애니메이션)
8. 채팅 가이드 (타이핑 애니메이션)
9. 환불 정책
10. 지역 매칭
11. CTA (시작하기)

### 🎨 애니메이션 (Reanimated 3)
- 하트 펄스
- 순차 체크
- 퍼즐 매칭
- 하트 터치
- 타이핑 효과
- 슬라이드 전환

### 📊 프로그레스
- 상단 프로그레스 바
- 자동 슬라이드 전환 애니메이션

### 💾 영속성
- AsyncStorage로 완료 상태 저장
- 키: `@sometime:user:state`

## 기술 스택

- React Native 0.79.4
- Expo 53.0.12
- Reanimated 3.x
- TypeScript
- AsyncStorage
- i18next (국제화)

## 국제화 (i18n)

온보딩은 3개 언어를 지원합니다:

- 🇰🇷 한국어 (ko) - 기본
- 🇯🇵 일본어 (ja)
- 🇬🇧 영어 (en)

기기 언어 설정에 따라 자동으로 전환됩니다.

자세한 내용은 [I18N_GUIDE.md](./I18N_GUIDE.md)를 참고하세요.

## 통합 가이드

자세한 통합 방법은 [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)를 참고하세요.

## 아키텍처

FSD (Feature-Sliced Design) 아키텍처를 따릅니다:

- `ui/` - 슬라이드 컴포넌트
- `components/` - 재사용 가능한 UI 컴포넌트
- `animations/` - 애니메이션 컴포넌트
- `hooks/` - 커스텀 훅
- `utils/` - 유틸리티 함수
- `types.ts` - 타입 정의

## 스타일링

- ✅ StyleSheet.create 사용
- ✅ colors.ts 상수 활용
- ✅ Safe Area 처리
- ❌ Tailwind/NativeWind 사용 안 함

## 성능

- 현재 슬라이드 ±1만 렌더링
- Reanimated worklet으로 60fps 보장
- FontAwesome 아이콘 (이미지 로딩 없음)

## 라이선스

프로젝트 라이선스를 따름
