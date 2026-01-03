# i18n 마이그레이션 진행 보고서

## 📊 전체 현황

- **시작일**: 2025-12-31
- **총 발견 파일**: 393개 (src: 337개, app: 56개)
- **총 한글 문자열**: ~1,200개 (예상)
- **완료 파일**: 5개
- **완료 문자열**: 8개

## ✅ 완료된 파일

### app/moment (6개 문자열)

| 파일 | 문자열 수 | 상태 |
|------|----------|------|
| `_layout.tsx` | 3 | ✅ 완료 |
| `my-moment.tsx` | 1 | ✅ 완료 |
| `my-moment-record.tsx` | 1 | ✅ 완료 |
| `my-answers.tsx` | 1 | ✅ 완료 |

**변환 내역**:
- "나의 모먼트" → `t("common.my_moment")`
- "모먼트 보고서" → `t("common.weekly_report")`
- "데일리 룰렛" → `t("common.daily_roulette")`
- "모먼트 질문함" → `t("common.moment_questions")`
- "나의 모먼트 기록" → `t("common.my_moment_record")`
- "내 답변 기록" → `t("common.my_answers_record")`

**번역 추가**:
- ✅ 한국어 (`ko/apps/moment.json`)
- ✅ 일본어 (`ja/apps/moment.json`)
- ✅ 영어 (`en/apps/moment.json`)

### app/purchase (2개 문자열)

| 파일 | 문자열 수 | 상태 |
|------|----------|------|
| `gem-store.tsx` | 2 | ✅ 완료 |

**변환 내역**:
- `orderName="구슬"` → `orderName={t("apps.purchase.gem_store.gem")}`
- `productName="구슬"` → `productName={t("apps.purchase.gem_store.gem")}`

**번역 추가**:
- ✅ 한국어: "구슬"
- ✅ 일본어: "ジェム"
- ⏳ 영어: 추가 필요

## 📋 남은 작업

### 우선순위 1: 간단한 파일 (예상 20개 파일, ~40개 문자열)

- [ ] `app/_layout.tsx` (2개)
- [ ] `app/auth/signup/done.tsx` (1개)
- [ ] `app/community/write.tsx` (2개)
- [ ] 기타 간단한 header/title 파일들

### 우선순위 2: 폼 유효성 검사 (예상 30개 파일, ~100개 문자열)

- [ ] `app/profile-edit/profile.tsx` (7개)
- [ ] `app/my-info/military.tsx` (7개)
- [ ] `app/my-info/tattoo.tsx` (6개)
- [ ] 기타 폼 관련 파일들

### 우선순위 3: 에러 메시지 (예상 50개 파일, ~80개 문자열)

- [ ] `app/profile-edit/interest.tsx` (에러 메시지)
- [ ] `app/community/report/[id].tsx` (에러 메시지)
- [ ] 기타 에러 처리 파일들

### 우선순위 4: src/features (예상 250개 파일, ~1,000개 문자열)

- [ ] `src/features/match/constants/miho-messages.ts` (54개) - **이미 i18n 지원 완료**
- [ ] `src/features/auth/` 디렉터리
- [ ] `src/features/payment/` 디렉터리
- [ ] 기타 features

## 🔧 사용 도구

### 1. 분석 도구
```bash
npm run i18n:extract -- <path>
```
- 한글 문자열 자동 추출
- JSON 보고서 생성 (`scripts/i18n-report.json`)

### 2. 마이그레이션 도구
```bash
# Dry-run (시험 실행)
npm run i18n:migrate -- <file-path> --dry-run

# 실제 마이그레이션
npm run i18n:migrate -- <file-path>
```

## 📝 마이그레이션 패턴

### 패턴 1: Stack.Screen 헤더

**Before**:
```typescript
<Stack.Screen
  options={{
    headerTitle: "나의 모먼트"
  }}
/>
```

**After**:
```typescript
import { useTranslation } from 'react-i18next';

export default function Component() {
  const { t } = useTranslation();

  return (
    <Stack.Screen
      options={{
        headerTitle: t("common.my_moment")
      }}
    />
  );
}
```

### 패턴 2: 컴포넌트 Props

**Before**:
```typescript
<PaymentView
  orderName="구슬"
  productName="구슬"
/>
```

**After**:
```typescript
const { t } = useTranslation();

<PaymentView
  orderName={t("apps.purchase.gem_store.gem")}
  productName={t("apps.purchase.gem_store.gem")}
/>
```

## ⚠️ 주의사항

### 1. Constants 파일
- React Hook 사용 불가
- `export const` → `export const use...()` 함수로 변경 필요
- 예: `src/features/match/constants/miho-messages.ts`

### 2. 서버 데이터 매칭
- switch/case에서 서버 데이터와 비교하는 경우
- 번역 대신 서버 ID 기반 비교로 변경 필요
- 예: `app/interest/age.tsx`

### 3. 동적 문자열
- 템플릿 리터럴 사용 시 i18next 보간법 사용
- `{{variable}}` 형식으로 JSON 작성

## 🚀 다음 단계

### 단기 목표 (이번 주)
1. ✅ 도구 및 인프라 구축 완료
2. ✅ 샘플 마이그레이션 (5개 파일) 완료
3. ⏳ 간단한 파일 20개 마이그레이션
4. ⏳ 폼 관련 파일 10개 마이그레이션

### 중기 목표 (다음 주)
1. app 디렉터리 전체 완료 (56개 파일)
2. 주요 features 마이그레이션 (auth, payment, match)
3. 일본어 번역 품질 검토

### 장기 목표
1. 전체 393개 파일 마이그레이션 완료
2. 자동화 스크립트 개선
3. CI/CD에 i18n 검증 추가

## 📈 진행률

```
전체: [▓░░░░░░░░░] 2.0% (8/400 문자열)
app: [▓▓░░░░░░░░] 13.1% (8/61 문자열)
src: [░░░░░░░░░░] 0.0% (0/~1200 문자열)
```

## 💡 개선 사항

### 스크립트 개선 필요
1. ✅ Hook 위치 자동 추가 - **수동 조정 필요**
2. ✅ 키 네이밍 최적화 - **한글 → 영어 키로 수동 변경 권장**
3. ⏳ JSON merge 기능 개선
4. ⏳ 자동 번역 API 연동 (Google Translate)

### 프로세스 개선
1. ✅ Dry-run 먼저 실행
2. ✅ 파일별 검토 후 커밋
3. ⏳ PR 단위로 관리 (10-20개 파일씩)
4. ⏳ 번역 품질 리뷰 프로세스

---

**마지막 업데이트**: 2025-12-31
**작성자**: Claude Code i18n Migration Tool
