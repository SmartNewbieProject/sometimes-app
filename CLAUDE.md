# Sometimes App - 개발 가이드

## 프로젝트 개요

React Native + Expo 기반의 소셜 매칭 애플리케이션

## 아키텍처 구조 (FSD - Feature-Sliced Design)

### 📁 디렉터리 구조

```
src/
├── auth/           # 인증 관련 설정
├── features/       # 비즈니스 로직별 기능 모듈
├── shared/         # 공통 코드 (UI, 유틸리티, 훅 등)
├── widgets/        # 복합 컴포넌트
└── types/          # 타입 정의
```

### 🎯 Features 레이어

각 feature는 다음 구조를 따름:

- `apis/` - API 호출 로직
- `hooks/` - 커스텀 훅
- `queries/` - TanStack Query 설정
- `ui/` - 해당 기능 전용 UI 컴포넌트
- `types.ts` - 타입 정의

### 🔧 Shared 레이어

- `ui/` - 재사용 가능한 UI 컴포넌트 (26개)
- `hooks/` - 공통 커스텀 훅 (11개)
- `libs/` - 유틸리티 라이브러리 (15개)
- `config/` - 설정 관리
- `providers/` - 컨텍스트 프로바이더

### 🧩 Widgets 레이어

복합 컴포넌트들: `checkbox-label`, `chip-selector`, `form`, `header`, `mbti-selector` 등

## 코딩 컨벤션

### 네이밍 규칙

- 모든 컴포넌트 파일명: `kebab-case`
- 모듈명: `kebab-case`
- 컴포넌트명: `PascalCase`

### UI 컴포넌트 구조

- 배럴 패턴: `ui/` 디렉터리에서 `index.tsx`로 export
- Compound Pattern 사용: `ui/payment/{name}.tsx` → `{name}.Credit`

### 스타일링 규칙

- **StyleSheet 사용** - Tailwind/NativeWind 사용 금지
- 발견 시 StyleSheet로 즉시 리팩토링

### 폼 유효성 검사

- `react-hook-form` + `zod` 조합 사용

### API 호출 규칙

- **axiosClient 응답 처리**: `response.data` 반환 불필요
    - ❌ 잘못된 방식: `const response = await axiosClient.get(); return response.data;`
    - ✅ 올바른 방식: `return axiosClient.get();`
    - 이유: axios interceptor에서 이미 `response.data`를 반환하도록 설정됨

### 색상 사용 규칙

- **색상 정의**: `src/shared/constants/colors.ts` 참조
- 하드코딩된 색상 값 대신 상수 사용 권장
- 주요 색상: `primaryPurple`, `lightPurple`, `darkPurple`, `white`, `black`, `gray` 등

### 모달 사용 규칙

- **통합 모달 시스템**: `@/src/shared/hooks/use-modal` 활용
- 커스텀 Modal 컴포넌트 대신 showModal() 함수 사용
- **기본 사용법**:
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
- **복잡한 컴포넌트**: 별도 컴포넌트로 작성 후 children에서 호출
- **에러 모달**: `showErrorModal(error, 'error')` 사용

## 주요 라이브러리

### 기본 스택

- React Native 0.79.4
- Expo 53.0.12
- TypeScript

### 상태관리

- Zustand 5.x
- TanStack Query 5.x

### 네비게이션

- React Navigation 7.x

### 폼 관리

- React Hook Form 7.x
- Zod 3.x

### 결제

- PortOne SDK

### 애니메이션

- Reanimated 3.x
- Lottie

## 작업 프로세스

1. **기능 추가 시**
    - `features/{기능명}/` 디렉터리 생성
    - FSD 아키텍처에 따라 하위 구조 생성

2. **컴포넌트 작성 전**
    - `src/shared/ui/` 에서 재사용 가능한 컴포넌트 확인
    - 기존 컴포넌트 활용 우선

3. **스타일링**
    - StyleSheet 사용
    - Tailwind 코드 발견 시 즉시 리팩토링

## 빌드 및 테스트 명령어

```bash
# 개발 서버 실행
npm start

# 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트
npm run lint
```

## 개발 우선순위

1. `src/shared/` 재사용 컴포넌트 확인
2. FSD 아키텍처 준수
3. StyleSheet 스타일링
4. 네이밍 컨벤션 준수
5. 타입 안전성 확보