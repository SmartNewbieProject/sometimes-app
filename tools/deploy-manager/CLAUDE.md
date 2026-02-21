# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sometimes Deploy Manager** — Sometimes App의 빌드/배포/모니터링을 위한 macOS 데스크톱 도구.

**기술 스택**: Electron 34 · electron-vite 3 · React 18 · TypeScript · Zustand 5 · Ant Design 5 · better-sqlite3

---

## Commands

```bash
npm run dev         # Electron 개발 모드 (HMR)
npm run build       # 프로덕션 빌드 (out/ 디렉터리)
npm run preview     # 프로덕션 빌드 프리뷰
npm run rebuild     # better-sqlite3 네이티브 모듈 리빌드 (Electron 버전 변경 후 필수)
```

---

## Architecture

### 3-Layer Electron 구조

```
src/
├── main/              # Main process (Node.js)
│   ├── index.ts           # BrowserWindow 생성, 앱 라이프사이클
│   ├── ipc-handlers.ts    # 모든 IPC 핸들러 등록 (renderer ↔ main 통신 허브)
│   ├── services/          # 비즈니스 로직
│   │   ├── database.ts        # SQLite DB (설정, 배포 히스토리, 빌드 로그) — 싱글톤 `db`
│   │   ├── config-store.ts    # AppConfig CRUD (database.ts 위임)
│   │   ├── build-service.ts   # EAS CLI 로컬 빌드 프로세스 관리 (EventEmitter)
│   │   ├── asc-api.ts         # App Store Connect API (JWT 인증, 빌드→심사 제출)
│   │   ├── google-play-api.ts # Google Play Developer API (서비스 계정, AAB 업로드)
│   │   ├── release-notes.ts   # Git 커밋 기반 릴리즈 노트 생성 (수동/AI)
│   │   └── version-reader.ts  # app.config.ts 버전 읽기/증분
│   └── utils/
│       ├── logger.ts          # 파일 기반 로거 (userData/logs/)
│       └── notify.ts          # macOS 네이티브 알림
├── preload/
│   └── index.ts           # contextBridge API — renderer에서 window.api로 접근
└── renderer/              # Renderer process (React)
    ├── App.tsx                # 사이드바 네비게이션 (5 페이지)
    ├── main.tsx               # React 진입점 + ErrorBoundary
    ├── env.d.ts               # window.api 타입 선언
    ├── pages/
    │   ├── DashboardPage.tsx   # 버전 정보 + 스토어 상태 요약
    │   ├── BuildPage.tsx       # EAS 로컬 빌드 UI
    │   ├── DeployPage.tsx      # iOS/Android 배포 워크플로우
    │   ├── MonitorPage.tsx     # 스토어 심사 상태 모니터링
    │   └── SettingsPage.tsx    # API 키, 경로 설정
    ├── stores/                 # Zustand 상태 관리
    │   ├── build-store.ts
    │   ├── deploy-store.ts
    │   └── monitor-store.ts
    ├── components/             # 공유 컴포넌트
    └── styles/global.css       # Glassmorphism 테마
```

### IPC 통신 패턴

모든 main↔renderer 통신은 `ipc-handlers.ts`에서 등록하고, `preload/index.ts`에서 `window.api`로 노출.

```typescript
// Main: ipcMain.handle('channel', handler)
// Preload: ipcRenderer.invoke('channel', args)
// Renderer: window.api.namespace.method()
```

IPC 채널 네임스페이스: `config:`, `version:`, `build:`, `deploy:`, `release-notes:`, `monitor:`, `system:`

실시간 이벤트(빌드 로그, 배포 진행)는 `event.sender.send()`로 push하고, renderer에서 `onLog`, `onProgress` 리스너로 수신.

### 데이터 저장

- **SQLite** (`deploy-manager.db`): 설정, 배포 히스토리, 빌드 세션/로그 — `database.ts`의 싱글톤 `db`
- DB 위치: Electron `userData` 디렉터리
- WAL 모드, 외래 키 활성화
- 구 JSON 파일(`config.json`, `deploy-history.json`)은 첫 실행 시 자동 마이그레이션

### 외부 API 인증

- **App Store Connect**: ES256 JWT (API Key `.p8` 파일) — `asc-api.ts`
- **Google Play**: RS256 JWT → OAuth2 토큰 교환 (서비스 계정 JSON) — `google-play-api.ts`
- 두 API 모두 Node.js `https` 모듈 직접 사용 (외부 HTTP 라이브러리 없음)

---

## Key Conventions

### Path Alias

- Renderer: `@/` → `src/renderer/` (tsconfig.web.json, electron.vite.config.ts)

### UI 테마

- Glassmorphism 디자인: `global.css`의 `.glass-*` 클래스
- 배경 그라데이션: `#667eea → #764ba2 → #f093fb`
- 카드/입력: 반투명 배경 + backdrop-filter blur
- macOS `hiddenInset` 타이틀바 + 커스텀 드래그 영역

### 빌드 서비스

`BuildService`는 `EventEmitter` 기반으로 EAS CLI(`eas build --local`)를 `spawn`하고, stdout 파싱으로 진행률 추정. 빌드 완료 시 아티팩트(.ipa/.aab)를 `buildDir`로 자동 이동.
