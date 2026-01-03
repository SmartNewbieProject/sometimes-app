# i18n 마이그레이션 가이드

## 🎯 목적

하드코딩된 한글 문자열을 i18n 시스템으로 마이그레이션하여 다국어 지원을 개선합니다.

## 📋 사전 준비

### 1. 의존성 확인
```bash
npm install tsx glob --save-dev
```

### 2. 현재 상태 확인
```bash
# 전체 프로젝트 분석
npm run i18n:extract

# 특정 디렉터리만 분석
npm run i18n:extract -- src/features/auth
```

결과:
- `scripts/i18n-report.json`: 상세 분석 결과
- 콘솔: 요약 정보 및 상위 20개 파일

## 🚀 사용법

### 1. 분석 (Extract)

```bash
# 전체 분석
npm run i18n:extract

# 특정 경로 분석
npm run i18n:extract -- src/features/match
npm run i18n:extract -- app/auth
```

**출력:**
- 한글 문자열이 있는 파일 목록
- 각 문자열의 위치 (라인 번호)
- 추천 i18n 키
- JSON 보고서 (`scripts/i18n-report.json`)

### 2. 마이그레이션 (Migrate)

```bash
# Dry-run (시험 실행 - 파일 변경 안 함)
npm run i18n:migrate -- src/features/match/constants/miho-messages.ts --dry-run

# 실제 마이그레이션
npm run i18n:migrate -- src/features/match/constants/miho-messages.ts
```

**수행 작업:**
1. 한글 문자열 → `t("key")` 변환
2. `useTranslation` import 추가
3. JSON 파일 업데이트 (ko/ja/en)
4. 코드 파일 저장

## 📁 i18n 구조

```
src/shared/libs/locales/
├── ko/                 # 한국어
│   ├── apps/           # app/ 디렉터리 번역
│   ├── features/       # features/ 번역
│   ├── widgets/        # widgets/ 번역
│   ├── shareds/        # shared/ 번역
│   └── global.json     # 전역 번역
├── ja/                 # 일본어 (동일 구조)
└── en/                 # 영어 (동일 구조)
```

## 🔑 키 네이밍 규칙

### 자동 생성 규칙
```
{layer}.{module}.{section}.{text_key}
```

예시:
- `features.auth.hooks.logout_modal_title`
- `apps.home.ui.welcome_message`
- `widgets.gem-store.modals.purchase_confirm`

### 수동 조정 권장
마이그레이션 후 키 이름을 더 의미 있게 수정:

```json
// 자동 생성
"errors.profile_저장에_실패했습니다": "프로필 저장에 실패했습니다"

// 권장 (수동 수정)
"errors.profile_save_failed": "프로필 저장에 실패했습니다"
```

## 📝 예시: miho-messages.ts 마이그레이션

### Before (하드코딩)
```typescript
export const COMMON_MESSAGES = [
  {
    id: 'C2',
    title: '미호가 추천해요',
    lines: ['음.. 뭔가 통할 것 같은', '느낌이 들어요 ✨'],
  }
];
```

### After (i18n)
```typescript
import { useTranslation } from 'react-i18next';

export const useMihoMessages = () => {
  const { t } = useTranslation();

  return {
    common: [
      {
        id: 'C2',
        title: t('features.match.miho_messages.common.C2.title'),
        lines: [
          t('features.match.miho_messages.common.C2.line1'),
          t('features.match.miho_messages.common.C2.line2'),
        ],
      }
    ],
  };
};
```

### JSON (ko/features/match.json)
```json
{
  "miho_messages": {
    "common": {
      "C2": {
        "title": "미호가 추천해요",
        "line1": "음.. 뭔가 통할 것 같은",
        "line2": "느낌이 들어요 ✨"
      }
    }
  }
}
```

## ⚠️ 주의사항

### 1. Hook 사용 제약
Constants 파일에서는 `useTranslation` 사용 불가:

```typescript
// ❌ 불가능 (React Hook outside component)
export const MESSAGES = {
  title: t('key'),
};

// ✅ 가능 (Hook을 사용하는 함수)
export const useMessages = () => {
  const { t } = useTranslation();
  return {
    title: t('key'),
  };
};
```

### 2. 템플릿 리터럴
동적 값이 있는 경우:

```typescript
// Before
const message = `${name}님, 환영합니다!`;

// After
const message = t('welcome_message', { name });

// JSON
{
  "welcome_message": "{{name}}님, 환영합니다!"
}
```

### 3. 제외 대상
- console.log 메시지
- 주석
- 개발자용 디버그 메시지
- 이미 t() 함수로 번역된 문자열

## 🔄 워크플로우

### Phase 1: 분석 및 우선순위 결정
```bash
npm run i18n:extract
# i18n-report.json 검토
```

### Phase 2: 파일별 마이그레이션 (Dry-run)
```bash
# 상위 20개 파일 중 선택
npm run i18n:migrate -- src/features/auth/hooks/use-auth.tsx --dry-run
# 결과 검토
```

### Phase 3: 실제 마이그레이션
```bash
npm run i18n:migrate -- src/features/auth/hooks/use-auth.tsx
# 코드 리뷰
# 테스트
```

### Phase 4: 번역 검토 및 수정
```bash
# JSON 파일 수동 검토
# - 키 이름 최적화
# - 일본어 번역 추가 ([JA] 플레이스홀더 대체)
# - 영어 번역 추가 ([EN] 플레이스홀더 대체)
```

### Phase 5: 테스트
```bash
npm run start
# 앱에서 번역 확인
# 언어 전환 테스트 (ko ↔ ja)
```

## 📊 진행 상황 추적

### 체크리스트

- [ ] Phase 1: 모달/Alert 메시지 (~50개 파일)
- [ ] Phase 2: 에러 메시지 (~80개 파일)
- [ ] Phase 3: UI 라벨 (~150개 파일)
- [ ] Phase 4: 기타 (~113개 파일)

### 파일별 진행 상황
`i18n-report.json`에서 확인:
```json
{
  "summary": {
    "totalFiles": 393,
    "totalStrings": 1247,
    "alreadyTranslated": 142,
    "timestamp": "2025-12-31T..."
  }
}
```

## 🐛 문제 해결

### Q: "Cannot use import statement outside a module" 오류
```bash
# tsx가 설치되어 있는지 확인
npm install tsx --save-dev
```

### Q: JSON 파일이 생성되지 않음
```bash
# 디렉터리 확인
ls -la src/shared/libs/locales/ko/features/

# 없으면 수동 생성
mkdir -p src/shared/libs/locales/{ko,ja,en}/features/
```

### Q: 마이그레이션 후 앱이 깨짐
```bash
# 1. 코드에 useTranslation import 확인
# 2. JSON 파일에 키가 존재하는지 확인
# 3. 콘솔에서 에러 확인
npm run web
```

## 📚 참고 자료

- [i18next 공식 문서](https://www.i18next.com/)
- [react-i18next 문서](https://react.i18next.com/)
- [FSD 아키텍처](https://feature-sliced.design/)
- 프로젝트 문서: `scripts/i18n-migration-analysis.md`

## 💡 팁

1. **작은 단위로 시작**: 한 번에 1-2개 파일씩 마이그레이션
2. **Dry-run 활용**: 항상 --dry-run으로 먼저 확인
3. **키 네이밍 최적화**: 자동 생성된 키를 읽기 쉽게 수정
4. **번역 품질 검토**: 일본어 번역은 네이티브 검토 권장
5. **테스트**: 마이그레이션 후 반드시 앱에서 확인
