# Gemini Code Assistant Project Overview: sometimes

## 1. 프로젝트 개요

이 프로젝트는 "sometimes"라는 이름의 모바일 애플리케이션으로, React Native와 Expo 프레임워크를 기반으로 개발되었습니다. Expo Router를 사용한 파일 시스템 기반의 라우팅 구조를 채택하고 있으며, TypeScript를 통해 타입 안정성을 확보하고 있습니다.

주요 기능으로는 사용자 인증(로그인, 회원가입), 커뮤니티, 이벤트, 프로필 관리 등이 있으며, `app` 디렉토리 내에서 각 기능별로 라우트가 구성되어 있습니다.

## 2. 기술 스택

- **프레임워크:** Expo, React Native
- **언어:** TypeScript
- **라우팅:** Expo Router
- **스타일링:** NativeWind (Tailwind CSS for React Native)
- **상태 관리:** Zustand, Tanstack Query
- **폼 처리:** React Hook Form, Zod (스키마 검증)
- **테스트:** Jest, React Native Testing Library
- **코드 스타일 및 포맷팅:** Biome

## 3. 실행 및 주요 스크립트

프로젝트의 주요 스크립트는 `package.json`에 정의되어 있습니다.

- **개발 서버 시작:**
  ```bash
  npm start
  ```
- **Android 앱 실행:**
  ```bash
  npm run android
  ```
- **iOS 앱 실행:**
  ```bash
  npm run ios
  ```
- **웹 버전 실행:**
  ```bash
  npm run web
  ```
- **테스트 실행:**
  ```bash
  npm test
  ```
- **린트 실행:**
  ```bash
  npm run lint
  ```

## 4. 프로젝트 구조

- **`app/`**: Expo Router의 파일 시스템 기반 라우팅이 적용된 핵심 디렉토리입니다. 각 파일과 폴더가 앱의 라우트를 정의합니다.
    - `(tabs)/`: 탭 기반 네비게이션 레이아웃을 정의합니다.
    - `auth/`: 로그인, 회원가입 등 사용자 인증 관련 화면이 위치합니다.
    - `community/`: 커뮤니티 게시판 관련 기능이 위치합니다.
    - `home/`: 앱의 메인 화면입니다.
    - `profile-edit/`: 사용자 프로필 수정 기능이 위치합니다.
- **`src/`**: 비즈니스 로직, 커스텀 훅, 타입 정의, 공용 컴포넌트 등이 위치합니다.
    - `features/`: 기능별(도메인별) 로직이 그룹화되어 있습니다.
    - `shared/`: 여러 기능에서 공통으로 사용되는 유틸리티, 컴포넌트 등이 위치합니다.
- **`assets/`**: 폰트, 이미지, 아이콘 등 정적 에셋 파일이 위치합니다.
- **`__tests__/`**: Jest를 사용한 단위/컴포넌트 테스트 코드가 위치합니다.
- **`package.json`**: 프로젝트의 의존성 및 스크립트가 정의된 파일입니다.
- **`tailwind.config.js`**: NativeWind (Tailwind CSS) 설정 파일입니다.
- **`tsconfig.json`**: TypeScript 컴파일러 설정 파일입니다.
