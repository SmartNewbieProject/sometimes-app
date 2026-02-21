# Auto Build & Version Management Specification

## Overview

커밋 시 자동 프로덕션 빌드 + 버전 관리 CLI 도구

---

## 1. Post-Commit Auto Build

### Trigger Conditions
- **브랜치**: `main`, `release/*`
- **타이밍**: 커밋 완료 후 백그라운드 비동기 실행

### Build Configuration
- **iOS**: Production IPA (EAS local build)
- **Android**: Production AAB (EAS local build)
- **실행 방식**: iOS/Android 병렬 빌드

### Notifications (macOS)
- ✅ 빌드 시작 알림
- ✅ 빌드 성공 알림 (소요 시간 포함)
- ✅ 빌드 실패 알림

### Technical Implementation
- **Hook**: `.git/hooks/post-commit`
- **Script**: `scripts/auto-build.sh`
- **환경 파일**: `.env.production`

---

## 2. sometimes-next-version CLI

### Installation
```bash
# 글로벌 설치
npm link  # 프로젝트 루트에서 실행
```

### Usage
```bash
sometimes-next-version
```

### Version Increment Rules
- **patch 증가**: 0.1.5 → 0.1.6
- **patch overflow**: 0.0.9 → 0.1.0
- **minor overflow**: 0.9.9 → 1.0.0
- **buildNumber**: 항상 +1

### Files Modified
- `app.config.ts`: version, buildNumber

---

## Decisions

| Item | Decision |
|------|----------|
| 빌드 타이밍 | 백그라운드 비동기 |
| 브랜치 조건 | main + release/* |
| 버전 증가 | patch (overflow 시 minor/major) |
| CLI 위치 | 글로벌 (npm link) |
| 실패 처리 | OS 알림만 |
| 빌드 방식 | iOS/Android 병렬 |

---

## File Structure

```
scripts/
├── auto-build.sh          # 백그라운드 빌드 스크립트
├── setup-auto-build.sh    # Git hook 설치 스크립트
└── sometimes-next-version # 글로벌 CLI 스크립트

.git/hooks/
└── post-commit            # Git hook (auto-build.sh 호출)
```
