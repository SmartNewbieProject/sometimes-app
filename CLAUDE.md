# Sometimes App - Dev Guide

## Overview

**Stack**: Expo 54 · React Native 0.81 · TypeScript · Zustand · TanStack Query

---

## Architecture (FSD - Feature-Sliced Design)

```
src/
├── features/       # Business logic per feature (apis, hooks, queries, ui, types.ts)
├── shared/         # Common code (ui, hooks, libs, constants, config, providers)
├── widgets/        # Composite components
└── types/          # Type definitions

app/                # Expo Router file-based routing
```

---

## Coding Conventions

### Naming

- **Files/modules**: `kebab-case` (e.g. `use-modal.ts`, `profile-card.tsx`)
- **Components**: `PascalCase` (e.g. `ProfileCard`)
- **Hooks**: `use` prefix (e.g. `useModal`)

### API Call Rules — IMPORTANT

**axiosClient interceptor auto-returns `response.data.data`**

```typescript
// WRONG — double .data access
const response = await axiosClient.get('/users');
return response.data;

// CORRECT — interceptor already extracts data
return axiosClient.get('/users');
```

### Colors

```typescript
import colors from '@/src/shared/constants/colors';

// Semantic (preferred)
colors.brand.primary         // #7A4AE2
colors.surface.background    // #FFFFFF
colors.text.primary          // #000000

// Legacy (compat)
colors.primaryPurple, colors.lightPurple, colors.white, colors.black
```

### Modal

```typescript
import { useModal } from '@/src/shared/hooks/use-modal';

const { showModal } = useModal();
showModal({
  title: 'Title',
  children: <CustomComponent />,
  primaryButton: { text: 'OK', onClick: () => {} }
});
```

### Safe Area (required)

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
const headerStyle = { paddingTop: insets.top + 12 };
```

**Prefer shared components**: `HeaderWithNotification`, `Header.Container`

---

## Git Hooks (Biome)

**Pre-commit auto-check**: `.git/hooks/pre-commit`

```bash
#!/bin/sh
npx @biomejs/biome check --write ./src
npx @biomejs/biome format --write ./src
```

**Manual**:
```bash
npm run format      # Biome format
npm run check       # Biome lint
```

---

## qmd — Dynamic Route Files

Expo Router 동적 라우트 파일명(`[id].tsx`)의 `[]`는 glob 문자 클래스로 해석되므로 반드시 이스케이프:

```bash
# WRONG — [id] 가 glob 패턴으로 해석되어 파일 못 찾음
qmd get "sometimes-app/app/partner/view/[id].tsx"

# CORRECT — 브래킷 이스케이프
qmd get "sometimes-app/app/partner/view/\[id\].tsx"

# 또는 디렉토리 목록으로 확인 후 조회
qmd ls sometimes-app/app/partner/view
```

---

## Routing — IMPORTANT

### app/ directory file rules

> **Every `.ts/.tsx` file in `app/` is treated as a route!**

| Allowed | Forbidden |
|---------|-----------|
| `page.tsx`, `_layout.tsx`, `_components.tsx` | `types.ts`, `utils.ts`, `constants.ts` |

```typescript
// NEVER — recognized as route, causes errors
app/auth/signup/types.ts

// CORRECT location
src/features/signup/types.ts
```

**Exception**: `_` prefixed files are excluded from routes (e.g. `_layout.tsx`)

---

## Quick Reference

### Common Components

`Button`, `Input`, `Card`, `Badge`, `BottomSheetPicker`, `Toast`, `Header`, `Divider`

### Common Hooks

`useModal`, `useToast`, `useTimer`, `useDebounce`, `useInfiniteScroll`, `useUserSession`

### Common Libs

`axiosClient`, `storage`, `eventBus`, `day`, `logger`

---

## Commands

```bash
# Dev
npm start                    # Expo dev server
npm run ios / android        # Platform-specific run

# Code quality
npm run format               # Biome format
npm run check                # Biome lint

# Test
npm test                     # Jest unit tests
npm run test:e2e             # Playwright E2E

# Build
npm run build:ios            # iOS production
npm run build:android        # Android production
```

---

## Dev Priorities

1. Check `src/shared/` for reusable components first
2. Follow FSD architecture
3. Follow API call rules (understand interceptor)
4. Follow app/ directory file rules
5. Handle Safe Area on all new pages
