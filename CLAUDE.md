# Sometimes App - 개발 가이드

## 프로젝트 개요

**기술 스택**: Expo 54 · React Native 0.81 · TypeScript · Zustand · TanStack Query

---

## 아키텍처 (FSD - Feature-Sliced Design)

```
src/
├── features/       # 비즈니스 로직별 기능 (apis, hooks, queries, ui, types.ts)
├── shared/         # 공통 코드 (ui, hooks, libs, constants, config, providers)
├── widgets/        # 복합 컴포넌트
└── types/          # 타입 정의

app/                # Expo Router 라우팅 (파일 기반)
```

---

## 코딩 컨벤션

### 네이밍 규칙

- **파일/모듈**: `kebab-case` (예: `use-modal.ts`, `profile-card.tsx`)
- **컴포넌트**: `PascalCase` (예: `ProfileCard`)
- **훅**: `use` 접두사 (예: `useModal`)

### API 호출 규칙 ⚠️ 중요

**axiosClient interceptor가 자동으로 `response.data.data` 반환**

```typescript
// ❌ 잘못된 방식 - 이중 .data 접근
const response = await axiosClient.get('/users');
return response.data;

// ✅ 올바른 방식 - interceptor가 이미 데이터 추출
return axiosClient.get('/users');
```

### 색상 사용 규칙

```typescript
import colors from '@/src/shared/constants/colors';

// Semantic 색상 (권장)
colors.brand.primary         // #7A4AE2
colors.surface.background    // #FFFFFF
colors.text.primary          // #000000

// Legacy 색상 (호환성)
colors.primaryPurple, colors.lightPurple, colors.white, colors.black
```

### 모달 사용 규칙

```typescript
import { useModal } from '@/src/shared/hooks/use-modal';

const { showModal } = useModal();
showModal({
  title: '제목',
  children: <CustomComponent />,
  primaryButton: { text: '확인', onClick: () => {} }
});
```

### Safe Area 처리 (필수)

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
const headerStyle = { paddingTop: insets.top + 12 };
```

**공통 컴포넌트 우선 사용**: `HeaderWithNotification`, `Header.Container`

---

## Git Hooks (Biome)

**Pre-commit 자동 검사**: `.git/hooks/pre-commit`

```bash
#!/bin/sh
npx @biomejs/biome check --write ./src
npx @biomejs/biome format --write ./src
```

**수동 실행**:
```bash
npm run format      # Biome 포맷팅
npm run check       # Biome 검사
```

---

## 라우팅 구조 ⚠️ 중요

### app/ 디렉터리 파일 규칙

> **`app/` 내 모든 `.ts/.tsx` 파일은 라우트로 취급됨!**

| 허용 | 금지 |
|-----|-----|
| `page.tsx`, `_layout.tsx`, `_components.tsx` | `types.ts`, `utils.ts`, `constants.ts` |

```typescript
// ❌ 절대 금지
app/auth/signup/types.ts  // 라우트로 인식되어 오류!

// ✅ 올바른 위치
src/features/signup/types.ts
```

**예외**: `_` 접두사 파일은 라우트 제외 (예: `_layout.tsx`)

---

## Quick Reference

### 자주 사용하는 컴포넌트

`Button`, `Input`, `Card`, `Badge`, `BottomSheetPicker`, `Toast`, `Header`, `Divider`

### 자주 사용하는 Hooks

`useModal`, `useToast`, `useTimer`, `useDebounce`, `useInfiniteScroll`, `useUserSession`

### 자주 사용하는 Libs

`axiosClient`, `storage`, `eventBus`, `day`, `logger`

---

## 주요 명령어

```bash
# 개발
npm start                    # Expo 개발 서버
npm run ios / android        # 플랫폼별 실행

# 코드 품질
npm run format               # Biome 포맷팅
npm run check                # Biome 검사

# 테스트
npm test                     # Jest 단위 테스트
npm run test:e2e             # Playwright E2E

# 빌드
npm run build:ios            # iOS Production
npm run build:android        # Android Production
```

---

## 개발 우선순위

1. ✅ `src/shared/` 재사용 컴포넌트 확인
2. ✅ FSD 아키텍처 준수
3. ✅ API 호출 규칙 준수 (interceptor 이해)
4. ✅ app/ 디렉터리 파일 규칙 준수
5. ✅ Safe Area 처리 (모든 신규 페이지)
