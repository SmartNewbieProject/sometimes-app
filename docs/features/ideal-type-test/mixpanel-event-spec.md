# 이상형 테스트 Mixpanel 이벤트 설계서

> **작성일**: 2026-02-23
> **목적**: 이상형 테스트 기능의 종합 분석을 위한 Mixpanel 이벤트 체계 설계
> **범위**: 기존 누락 이벤트 등록 + 속성 보강 + 신규 이벤트 추가
> **플랫폼**: Web (비로그인 랜딩) + Mobile (앱 내 auth/moment)

---

## 1. 현황 분석

### 1.1 기존 코드 상태

| 파일 | 상태 | 문제 |
|------|------|------|
| `use-test-analytics.ts` | 8개 트래킹 함수 존재 | `MIXPANEL_EVENTS` 상수 미등록 → 런타임에 `undefined` 전송 |
| `mixpanel-events.ts` | 이상형 테스트 이벤트 0개 | 상수 키 자체가 없음 |
| UI 화면 3개 | 이미 트래킹 호출 중 | 일부 속성 불충분 (time_spent_seconds=0 하드코딩 등) |

### 1.2 기존 참조 중이나 미등록된 이벤트 키

```
IDEAL_TYPE_TEST_ENTRY_CLICKED     → undefined
IDEAL_TYPE_TEST_STARTED           → undefined
IDEAL_TYPE_QUESTION_VIEWED        → undefined
IDEAL_TYPE_QUESTION_ANSWERED      → undefined
IDEAL_TYPE_TEST_COMPLETED         → undefined
IDEAL_TYPE_TEST_SIGNUP_CLICKED    → undefined
IDEAL_TYPE_TEST_RETAKE_CLICKED    → undefined
IDEAL_TYPE_TEST_SHARED            → undefined
IDEAL_TYPE_TEST_ABANDONED         → undefined
```

---

## 2. 분석 목표별 필요 이벤트

### 2.1 목표 A: 회원가입 전환 퍼널

```
[진입] → [테스트 시작] → [질문 응답 ×5] → [결과 확인] → [CTA 클릭] → [Auth 시트] → [가입 완료]
```

**핵심 지표:**
- 진입 → 시작 전환율
- 결과 → CTA 클릭 전환율
- CTA → 가입 완료 전환율
- 전체 퍼널 전환율 (진입 → 가입)

### 2.2 목표 B: 테스트 완주율 최적화

```
[Q1] → [Q2] → [Q3] → [Q4] → [Q5] → [완료]
         ↓       ↓       ↓       ↓
       이탈     이탈    이탈    이탈
```

**핵심 지표:**
- 질문별 이탈률
- 질문별 평균 응답 시간
- 전체 완주율
- 이탈 원인 분석

### 2.3 목표 C: 바이럴/공유 효과

```
[결과 공유] → [공유 링크 클릭] → [랜딩 진입] → [테스트 시작] → [가입]
```

**핵심 지표:**
- 공유율 (결과 확인 대비 공유 수)
- 공유 플랫폼별 분포
- 바이럴 계수 (공유 → 신규 유저)

---

## 3. 전체 이벤트 목록

### 3.1 이벤트 정의 (15개)

| # | 이벤트 키 | Mixpanel 이벤트명 | 카테고리 | 신규/기존 |
|---|-----------|-------------------|----------|-----------|
| 1 | `IDEAL_TYPE_TEST_ENTRY_CLICKED` | `IdealType_Entry_Clicked` | 퍼널 진입 | 기존(미등록) |
| 2 | `IDEAL_TYPE_TEST_STARTED` | `IdealType_Test_Started` | 퍼널 시작 | 기존(미등록) |
| 3 | `IDEAL_TYPE_QUESTION_VIEWED` | `IdealType_Question_Viewed` | 완주율 | 기존(미등록) |
| 4 | `IDEAL_TYPE_QUESTION_ANSWERED` | `IdealType_Question_Answered` | 완주율 | 기존(미등록) |
| 5 | `IDEAL_TYPE_TEST_COMPLETED` | `IdealType_Test_Completed` | 퍼널 완료 | 기존(미등록) |
| 6 | `IDEAL_TYPE_TEST_ABANDONED` | `IdealType_Test_Abandoned` | 완주율 | 기존(미등록) |
| 7 | `IDEAL_TYPE_RESULT_VIEWED` | `IdealType_Result_Viewed` | 퍼널 결과 | **신규** |
| 8 | `IDEAL_TYPE_TEST_SIGNUP_CLICKED` | `IdealType_Signup_Clicked` | 전환 | 기존(미등록) |
| 9 | `IDEAL_TYPE_AUTH_SHEET_SHOWN` | `IdealType_Auth_Sheet_Shown` | 전환 | **신규** |
| 10 | `IDEAL_TYPE_AUTH_SHEET_DISMISSED` | `IdealType_Auth_Sheet_Dismissed` | 전환 | **신규** |
| 11 | `IDEAL_TYPE_AUTH_METHOD_SELECTED` | `IdealType_Auth_Method_Selected` | 전환 | **신규** |
| 12 | `IDEAL_TYPE_TEST_SHARED` | `IdealType_Test_Shared` | 바이럴 | 기존(미등록) |
| 13 | `IDEAL_TYPE_TEST_RETAKE_CLICKED` | `IdealType_Retake_Clicked` | 재참여 | 기존(미등록) |
| 14 | `IDEAL_TYPE_RETAKE_BLOCKED` | `IdealType_Retake_Blocked` | 재참여 | **신규** |
| 15 | `IDEAL_TYPE_RESULT_CTA_CLICKED` | `IdealType_Result_CTA_Clicked` | 전환 | **신규** |

### 3.2 퍼널 매핑

```
Web Landing            Mobile (auth)           Mobile (moment)
─────────              ─────────               ─────────
Entry_Clicked          Entry_Clicked           Entry_Clicked
     │                      │                       │
Test_Started           Test_Started            Test_Started
     │                      │                       │
Question_Viewed ×5     Question_Viewed ×5      Question_Viewed ×5
Question_Answered ×5   Question_Answered ×5    Question_Answered ×5
     │                      │                       │
Test_Completed         Test_Completed          Test_Completed
     │                      │                       │
Result_Viewed          Result_Viewed           Result_Viewed
     │                      │                       │
Signup_Clicked         Result_CTA_Clicked      Result_CTA_Clicked
     │                      │                       │
Auth_Sheet_Shown       (이미 로그인)            Test_Shared
     │                                              │
Auth_Method_Selected                           Retake_Clicked
     │
(가입 퍼널 진입)
```

---

## 4. 이벤트 상세 속성 (Properties)

### 4.1 공통 속성 (모든 이벤트)

| 속성명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `env` | string | 환경 | `'production'`, `'development'` |
| `source` | string | 플랫폼 | `'web'`, `'mobile'` |
| `entry_source` | string | 진입 경로 | `'auth'`, `'moment'`, `'web_landing'`, `'web_share_link'` |
| `user_type` | string | 유저 상태 | `'guest'`, `'logged_in'` |
| `test_version` | string | 테스트 버전 | `'v2'` |
| `language` | string | 언어 | `'ko'`, `'ja'` |

### 4.2 이벤트별 상세 속성

#### #1 `IdealType_Entry_Clicked`
> 테스트 진입 버튼/링크 클릭

| 속성 | 타입 | 설명 |
|------|------|------|
| `has_existing_result` | boolean | 기존 결과 존재 여부 |
| `referrer` | string? | 유입 경로 (web: UTM/referrer) |

#### #2 `IdealType_Test_Started`
> API 호출하여 세션 생성 완료

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 테스트 세션 ID |
| `total_questions` | number | 총 질문 수 (5) |
| `is_retake` | boolean | 재테스트 여부 |

#### #3 `IdealType_Question_Viewed`
> 각 질문 화면 노출

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `question_index` | number | 질문 순서 (0~4) |
| `question_id` | string | 질문 ID (`Q1`~`Q5`) |
| `total_questions` | number | 총 질문 수 |

#### #4 `IdealType_Question_Answered`
> 질문에 답변 선택

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `question_index` | number | 질문 순서 |
| `question_id` | string | 질문 ID |
| `selected_option_id` | string | 선택한 옵션 ID |
| `selected_option_index` | number | 선택 위치 (0~2) |
| `time_spent_seconds` | number | 해당 질문 소요 시간 |

#### #5 `IdealType_Test_Completed`
> 마지막 답변 제출 후 결과 수신

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `result_type_id` | ResultTypeId | 결과 타입 (`romantic_emotional` 등) |
| `result_name` | string | 결과명 (로컬 언어) |
| `total_time_seconds` | number | 전체 소요 시간 |
| `is_retake` | boolean | 재테스트 여부 |

#### #6 `IdealType_Test_Abandoned`
> 테스트 중도 이탈 (뒤로가기, 앱 종료 등)

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `abandoned_at_question` | number | 이탈 시점 질문 번호 (1~5) |
| `total_answered` | number | 답변 완료 수 |
| `time_spent_seconds` | number | 이탈까지 소요 시간 |
| `abandon_trigger` | string | 이탈 원인 (`back_button`, `app_background`, `session_expired`) |

#### #7 `IdealType_Result_Viewed` (신규)
> 결과 화면 노출 (완료 직후 or 기존 결과 조회)

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string? | 세션 ID (신규 결과 시) |
| `result_type_id` | ResultTypeId | 결과 타입 |
| `result_name` | string | 결과명 |
| `view_type` | string | `'new_result'` / `'existing_result'` |
| `match_count` | number | "N명이 활동중" 표시 수치 |

#### #8 `IdealType_Signup_Clicked`
> 비로그인 유저의 "가입하기" CTA 클릭

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `result_type_id` | ResultTypeId | 결과 타입 |
| `match_count` | number | 표시된 매칭 인원 수 |

#### #9 `IdealType_Auth_Sheet_Shown` (신규)
> 인증 바텀시트 노출

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `result_type_id` | ResultTypeId | 결과 타입 |

#### #10 `IdealType_Auth_Sheet_Dismissed` (신규)
> 인증 바텀시트 닫기

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `time_on_sheet_seconds` | number | 시트 노출 시간 |

#### #11 `IdealType_Auth_Method_Selected` (신규)
> 인증 방법 선택 (카카오 등)

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string | 세션 ID |
| `auth_method` | string | `'kakao'`, `'pass'`, `'apple'` |
| `result_type_id` | ResultTypeId | 결과 타입 |

#### #12 `IdealType_Test_Shared`
> 결과 공유

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string? | 세션 ID |
| `result_type_id` | ResultTypeId | 결과 타입 |
| `share_method` | string | `'native'`, `'link_copy'` |

#### #13 `IdealType_Retake_Clicked`
> 재테스트 버튼 클릭

| 속성 | 타입 | 설명 |
|------|------|------|
| `previous_result_type_id` | ResultTypeId | 이전 결과 타입 |

#### #14 `IdealType_Retake_Blocked` (신규)
> 쿨다운으로 재테스트 차단

| 속성 | 타입 | 설명 |
|------|------|------|
| `remaining_days` | number | 남은 일수 |
| `previous_result_type_id` | ResultTypeId | 이전 결과 타입 |

#### #15 `IdealType_Result_CTA_Clicked` (신규)
> 로그인 유저의 결과 화면 CTA (공유/재테스트 외 메인 CTA)

| 속성 | 타입 | 설명 |
|------|------|------|
| `session_id` | string? | 세션 ID |
| `result_type_id` | ResultTypeId | 결과 타입 |
| `cta_type` | string | `'view_matches'`, `'go_home'` |

---

## 5. Mixpanel 대시보드 구성 권장

### 5.1 퍼널 리포트

**퍼널 1: 전체 전환 (비로그인)**
```
Entry_Clicked (guest) → Test_Started → Test_Completed → Signup_Clicked → Auth_Method_Selected
```

**퍼널 2: 질문 완주율**
```
Question_Viewed (Q1) → Question_Answered (Q1) → ... → Question_Answered (Q5) → Test_Completed
```

**퍼널 3: 바이럴 루프**
```
Test_Shared → Entry_Clicked (web_share_link) → Test_Started → Test_Completed
```

### 5.2 분석 보드

| 보드 | 차트 | 이벤트/속성 |
|------|------|-------------|
| 전환 퍼널 | Funnel | Entry → Started → Completed → Signup |
| 질문별 이탈 | Bar Chart | `Abandoned.abandoned_at_question` 분포 |
| 질문별 소요시간 | Line Chart | `Question_Answered.time_spent_seconds` by `question_index` |
| 결과 타입 분포 | Pie Chart | `Test_Completed.result_type_id` |
| 공유 플랫폼 | Bar Chart | `Test_Shared.share_method` |
| Web vs Mobile | Segmentation | 모든 이벤트 by `source` |
| 일별 전환율 추이 | Line Chart | Completed / Started |

---

## 6. 구현 체크리스트

### 6.1 `mixpanel-events.ts` 추가 (상수 + 타입)

- [ ] `MIXPANEL_EVENTS`에 15개 이벤트 키 추가
- [ ] `IdealTypeTestEventProperties` 인터페이스 정의
- [ ] `KpiEventTypePropertiesMap`에 매핑 추가

### 6.2 `use-test-analytics.ts` 보강

- [ ] 기존 8개 함수: 속성 보강 (time tracking, option index 등)
- [ ] 신규 6개 함수 추가:
  - `trackResultViewed`
  - `trackAuthSheetShown`
  - `trackAuthSheetDismissed`
  - `trackAuthMethodSelected`
  - `trackRetakeBlocked`
  - `trackResultCtaClicked`

### 6.3 UI 코드 수정

- [ ] `test-start-screen.tsx`: `is_retake`, `has_existing_result` 속성 추가
- [ ] `test-questions-screen.tsx`: 실제 `time_spent_seconds` 측정 (useRef 타이머)
- [ ] `test-result-screen.tsx`: `trackResultViewed` 호출 추가
- [ ] `auth-bottom-sheet.tsx`: 시트 노출/닫기/인증방법 선택 트래킹 추가
- [ ] `use-share-test-result.ts`: `share_method` 속성명 통일

### 6.4 시간 측정 구현

- [ ] 질문별 타이머: `useRef<number>` → 질문 전환 시 `Date.now()` 차이 계산
- [ ] 전체 테스트 타이머: 시작 시점 저장 → 완료 시점에서 차이 계산
- [ ] Auth 시트 노출 시간: 시트 오픈 시점 → 닫기/선택 시점 차이

---

## 7. 구현 우선순위

| 우선순위 | 작업 | 영향도 |
|----------|------|--------|
| P0 (즉시) | MIXPANEL_EVENTS 상수 등록 | 기존 트래킹이 전부 undefined로 전송 중 |
| P0 (즉시) | 속성 타입 정의 | 타입 안전성 확보 |
| P1 (높음) | time_spent_seconds 실측 | 현재 0 하드코딩 → 실제 값 필요 |
| P1 (높음) | Result_Viewed 이벤트 | 퍼널 중간 단계 누락 |
| P2 (중간) | Auth 시트 이벤트 3개 | 전환 병목 분석 |
| P2 (중간) | Retake_Blocked 이벤트 | 재참여 분석 |
| P3 (낮음) | 대시보드 구성 | Mixpanel UI 작업 |
