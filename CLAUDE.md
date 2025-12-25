# Sometimes App - 개발 가이드

## 프로젝트 개요

React Native + Expo 기반의 소셜 매칭 애플리케이션 (대학생 대상)

**기술 스택**: Expo 54 · React Native 0.81 · TypeScript · Zustand · TanStack Query

---

## 아키텍처 구조 (FSD - Feature-Sliced Design)

### 📁 디렉터리 구조

```
src/
├── auth/           # 인증 관련 설정
├── features/       # 비즈니스 로직별 기능 모듈 (40개)
├── shared/         # 공통 코드
│   ├── ui/         # 재사용 UI 컴포넌트 (41개)
│   ├── hooks/      # 커스텀 훅 (31개)
│   ├── libs/       # 유틸리티 라이브러리 (31개)
│   ├── constants/  # 상수 (colors, etc.)
│   ├── config/     # 설정 관리
│   └── providers/  # 컨텍스트 프로바이더
├── widgets/        # 복합 컴포넌트 (20개)
└── types/          # 타입 정의

app/                # Expo Router 라우팅 (파일 기반)
```

### 🎯 Features 레이어 구조

각 feature는 다음 구조를 따름:

```
features/{feature-name}/
├── apis/       # API 호출 로직
├── hooks/      # 커스텀 훅
├── queries/    # TanStack Query 설정
├── ui/         # 해당 기능 전용 UI 컴포넌트
└── types.ts    # 타입 정의
```

### 주요 Features (40개)

| 핵심 기능 | 소셜 기능 | 부가 기능 |
|----------|----------|----------|
| auth, signup, onboarding | matching, match, like | payment, pass |
| profile, profile-edit | chat, moment | notification |
| home, mypage, my-info | community, post-box | setting |
| university-verification | somemate | event, invite |

---

## 코딩 컨벤션

### 네이밍 규칙

- 파일명/모듈명: `kebab-case` (예: `use-modal.ts`, `profile-card.tsx`)
- 컴포넌트명: `PascalCase` (예: `ProfileCard`)
- 훅: `use` 접두사 (예: `useModal`, `useTimer`)

### UI 컴포넌트 구조

- **배럴 패턴**: `ui/` 디렉터리에서 `index.tsx`로 export
- **Compound Pattern**: `ui/payment/{name}.tsx` → `{Name}.Credit`

### 스타일링 규칙

- **StyleSheet 사용 권장**
- `colors.ts` 상수 활용 권장

### API 호출 규칙

**axiosClient 응답 처리**: interceptor가 자동으로 `response.data.data` 반환

```typescript
// ❌ 잘못된 방식
const response = await axiosClient.get('/users');
return response.data;

// ✅ 올바른 방식 - interceptor가 이미 데이터 추출
return axiosClient.get('/users');
```

> 참고: `src/shared/libs/axios.ts`의 응답 인터셉터가 `{ success, data }` 형태의 응답에서 `data` 필드만 추출

### 색상 사용 규칙

**파일**: `src/shared/constants/colors.ts`

```typescript
import colors from '@/src/shared/constants/colors';

// Legacy 색상 (호환성)
colors.primaryPurple  // #7A4AE2
colors.lightPurple    // #E2D5FF
colors.cardPurple     // #F7F3FF
colors.white          // #FFFFFF
colors.black          // #000000
colors.gray           // #9CA3AF

// Semantic 색상 (권장)
colors.brand.primary     // #7A4AE2
colors.surface.background // #FFFFFF
colors.text.primary      // #000000
colors.state.error       // #FF0000
```

### 모달 사용 규칙

**통합 모달 시스템**: `@/src/shared/hooks/use-modal`

```typescript
import { useModal } from '@/src/shared/hooks/use-modal';

const { showModal } = useModal();

showModal({
  title: '제목',
  children: <CustomComponent />,
  primaryButton: {
    text: '확인',
    onClick: () => { /* 액션 */ }
  },
  secondaryButton: {
    text: '취소',
    onClick: () => {}
  }
});
```

### Safe Area 처리 규칙

**필수**: iOS 노치, Dynamic Island, 상태바 고려

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// Header 스타일
const headerStyle = {
  paddingTop: insets.top + 12,
};

// 드롭다운 위치
const dropdownStyle = {
  top: insets.top + 16 + 54, // safe area + padding + header height
};
```

**공통 컴포넌트 우선 사용**: `HeaderWithNotification`, `Header.Container`

### 폼 유효성 검사

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

---

## Quick Reference

### 자주 사용하는 Shared UI 컴포넌트

| 컴포넌트 | 용도 |
|---------|-----|
| `Button` | 버튼 (primary, secondary, outline 등) |
| `Input` | 텍스트 입력 |
| `Card` | 카드 레이아웃 |
| `Badge` | 뱃지/태그 |
| `BottomSheetPicker` | 하단 시트 선택기 |
| `Toast` | 토스트 메시지 |
| `Header` | 페이지 헤더 |
| `Divider` | 구분선 |

### 자주 사용하는 Hooks

| 훅 | 용도 |
|----|-----|
| `useModal` | 모달 표시 |
| `useToast` | 토스트 메시지 |
| `useTimer` | 타이머 |
| `useDebounce` | 디바운스 |
| `useInfiniteScroll` | 무한 스크롤 |
| `useUserSession` | 사용자 세션 |
| `useStorage` | AsyncStorage 래퍼 |

### 자주 사용하는 Libs

| 라이브러리 | 용도 |
|-----------|-----|
| `axiosClient` | API 호출 (인터셉터 포함) |
| `storage` | AsyncStorage 래퍼 |
| `eventBus` | 이벤트 버스 |
| `day` | dayjs 래퍼 |
| `logger` | 로깅 유틸 |

---

## 라우팅 구조 (Expo Router)

**파일 기반 라우팅**: `app/` 디렉터리

### 주요 라우트

```
app/
├── (tabs)/              # 메인 탭 네비게이션
├── auth/login/          # 로그인
├── auth/signup/         # 회원가입
├── chat/                # 채팅
├── community/           # 커뮤니티
├── profile/             # 프로필 보기
├── profile-edit/        # 프로필 편집
├── setting/             # 설정
├── purchase/            # 구매/결제
└── notification/        # 알림
```

---

## 주요 라이브러리

| 분류 | 라이브러리 |
|-----|-----------|
| 프레임워크 | Expo 54, React Native 0.81, TypeScript |
| 상태관리 | Zustand 5.x, TanStack Query 5.x |
| 네비게이션 | Expo Router 6.x, React Navigation 7.x |
| 폼 | React Hook Form 7.x, Zod 3.x |
| 결제 | PortOne SDK |
| 애니메이션 | Reanimated 4.x, Lottie |
| 리스트 | @shopify/flash-list, @legendapp/list |
| 채팅 | react-native-gifted-chat, socket.io-client |
| 분석 | Mixpanel, Sentry, Hotjar |
| 소셜 | Kakao SDK, Facebook SDK |

---

## 빌드 및 테스트 명령어

```bash
# 개발 서버
npm start                    # Expo 개발 서버 (포트 3000)
npm run start:prod           # Production 환경

# 플랫폼별 실행
npm run ios                  # iOS 시뮬레이터
npm run android              # Android 에뮬레이터
npm run web                  # 웹 브라우저

# 캐시 정리
npm run cache:clear          # 캐시 정리
npm run cache:clear:hard     # 강력 캐시 정리

# 테스트
npm test                     # Jest 단위 테스트
npm run test:watch           # Watch 모드
npm run test:e2e             # Playwright E2E 테스트
npm run test:e2e:ui          # E2E UI 모드
npm run test:e2e:headed      # E2E 브라우저 표시

# 빌드
npm run build                # 일반 빌드
npm run build:ios            # iOS Production
npm run build:android        # Android Production
npm run build:ios:preview    # iOS Preview
npm run build:android:preview # Android Preview

# 배포
npm run submit:testflight    # TestFlight 제출

# 코드 품질
npm run lint                 # ESLint 검사
```

---

## 작업 프로세스

### 1. 기능 추가 시

```bash
# 1. feature 디렉터리 생성
mkdir -p src/features/{feature-name}/{apis,hooks,queries,ui}

# 2. 필수 파일 생성
touch src/features/{feature-name}/types.ts
touch src/features/{feature-name}/index.ts
```

### 2. 컴포넌트 작성 전

1. `src/shared/ui/` 에서 재사용 가능한 컴포넌트 확인
2. `src/widgets/` 에서 복합 컴포넌트 확인
3. 없으면 새로 작성

### 3. API 추가 시

```typescript
// src/features/{feature}/apis/{name}.ts
import axiosClient from '@/src/shared/libs/axios';

export const getUsers = () => axiosClient.get<User[]>('/users');
export const createUser = (data: CreateUserDto) =>
  axiosClient.post<User>('/users', data);
```

```typescript
// src/features/{feature}/queries/{name}.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUsers, createUser } from '../apis/{name}';

export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
});

export const useCreateUser = () => useMutation({
  mutationFn: createUser,
});
```

---

## 개발 우선순위

1. ✅ `src/shared/` 재사용 컴포넌트 확인
2. ✅ FSD 아키텍처 준수
3. ✅ StyleSheet 스타일링
4. ✅ 네이밍 컨벤션 준수
5. ✅ 타입 안전성 확보
6. ✅ Safe Area 처리 (모든 신규 페이지)
