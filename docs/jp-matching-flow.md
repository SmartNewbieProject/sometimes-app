# 한일 매칭 플로우 문서

> **작성일**: 2026-01-28
> **버전**: 1.0
> **상태**: Draft

---

## 1. 전체 플로우 개요

```mermaid
flowchart TB
    subgraph "진입점"
        A[홈 화면 /home]
        B[GO JAPAN 버튼]
    end

    subgraph "JP 온보딩"
        C{JP SMS 인증<br/>완료 여부}
        D[JP SMS 인증 화면]
        E[전화번호 입력]
        F[인증코드 입력]
        G[인증 완료]
    end

    subgraph "JP 매칭 모드"
        H[모드 전환 확인]
        I[JP 모드 활성화]
        J[홈 화면 복귀]
        K[Floating 배너 표시]
        L[JP 매칭 카드]
    end

    subgraph "JP 재매칭"
        M[재매칭 버튼 클릭]
        N[JP 풀에서 매칭]
        O{매칭 결과}
        P[새 매칭 표시]
        Q[Empty State 표시]
    end

    A --> B
    B --> C
    C -->|미완료| D
    C -->|완료| H
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    J --> L
    L --> M
    M --> N
    N --> O
    O -->|성공| P
    O -->|실패| Q
```

---

## 2. 상세 플로우

### 2.1 JP 온보딩 플로우

#### 2.1.1 시퀀스 다이어그램

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Home as 홈 화면
    participant Modal as 온보딩 모달
    participant SMS as JP SMS 인증
    participant API as 서버 API
    participant Store as 상태 저장소

    User->>Home: GO JAPAN 버튼 클릭
    Home->>API: GET /v1/user/jp-matching/eligibility
    API-->>Home: { eligible: false, jpSmsVerified: false }

    Home->>Modal: 온보딩 모달 표시
    Note over Modal: "일본 매칭을 시작하려면<br/>일본 전화번호 인증이 필요합니다"

    User->>Modal: "인증하기" 클릭
    Modal->>SMS: 라우팅 → /auth/jp-sms

    User->>SMS: 일본 전화번호 입력
    SMS->>API: POST /jp/auth/sms/send
    API-->>SMS: { success: true }

    User->>SMS: 인증코드 입력
    SMS->>API: POST /jp/auth/sms/verify
    API-->>SMS: { verified: true }

    SMS->>API: POST /v1/user/matching-mode (mode: JP)
    API-->>SMS: { currentMode: JP }

    SMS->>Store: 매칭 모드 캐시 업데이트
    SMS->>Home: 홈 화면으로 복귀
    Home->>Home: JP 모드 UI 렌더링
```

#### 2.1.2 화면 전환 플로우

```
[홈 화면]
    │
    ▼ GO JAPAN 버튼 클릭
    │
[JP 자격 확인]
    │
    ├─ 인증 완료 ──────────────────────────────────┐
    │                                               │
    ▼ 인증 미완료                                    │
    │                                               │
[온보딩 안내 모달]                                   │
    │                                               │
    ├─ "나중에" ── [모달 닫기] ── [홈 화면]           │
    │                                               │
    ▼ "인증하기"                                     │
    │                                               │
[JP SMS 인증 화면]                                   │
    │ /auth/jp-sms                                  │
    │                                               │
    ├─ Step 1: 전화번호 입력                         │
    │   └─ +81 일본 국가코드                         │
    │                                               │
    ├─ Step 2: 인증코드 입력                         │
    │   └─ 180초 타이머                             │
    │                                               │
    ▼ 인증 성공                                      │
    │                                               │
[모드 전환 확인 모달] ◄────────────────────────────┘
    │
    ├─ "국내 매칭 유지" ── [홈 화면 (DOMESTIC)]
    │
    ▼ "일본 매칭 시작"
    │
[홈 화면 (JP 모드)]
    ├─ Floating 배너: "🇯🇵 일본 매칭 모드"
    └─ JP 매칭 카드 표시
```

#### 2.1.3 상태 다이어그램

```mermaid
stateDiagram-v2
    [*] --> NotEligible: 앱 시작

    NotEligible --> SmsInput: GO JAPAN 클릭
    SmsInput --> CodeInput: SMS 발송 성공
    CodeInput --> SmsInput: 재발송 요청
    CodeInput --> Verified: 코드 검증 성공
    CodeInput --> SmsInput: 코드 검증 실패 (3회)

    Verified --> JpModeActive: 모드 전환 확인
    Verified --> DomesticMode: 전환 취소

    JpModeActive --> DomesticMode: 모드 토글
    DomesticMode --> JpModeActive: 모드 토글

    state NotEligible {
        [*] --> Idle
        Idle: JP SMS 인증 미완료
    }

    state Verified {
        [*] --> Ready
        Ready: JP 매칭 자격 획득
    }

    state JpModeActive {
        [*] --> Active
        Active: JP 매칭 진행 중
    }

    state DomesticMode {
        [*] --> Domestic
        Domestic: 국내 매칭 진행 중
    }
```

---

### 2.2 모드 전환 플로우

#### 2.2.1 시퀀스 다이어그램

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Home as 홈 화면
    participant Banner as Floating 배너
    participant Settings as 설정 화면
    participant API as 서버 API
    participant Query as TanStack Query

    Note over User,Query: 케이스 1: Floating 배너에서 전환

    User->>Banner: 배너 탭
    Banner->>Settings: 매칭 모드 설정으로 이동

    User->>Settings: 토글 전환
    Settings->>API: POST /v1/user/matching-mode
    API-->>Settings: { currentMode: DOMESTIC }

    Settings->>Query: invalidateQueries(['latest-matching-v2'])
    Settings->>Query: invalidateQueries(['matching-history-list'])

    Settings->>Home: 홈으로 복귀
    Home->>Home: DOMESTIC 모드 UI 렌더링

    Note over User,Query: 케이스 2: 홈 화면에서 직접 전환

    User->>Home: GO JAPAN 버튼 클릭 (이미 인증됨)
    Home->>API: GET /v1/user/jp-matching/eligibility
    API-->>Home: { eligible: true }

    Home->>Home: 모드 전환 확인 모달

    User->>Home: "일본 매칭 시작" 클릭
    Home->>API: POST /v1/user/matching-mode (mode: JP)
    API-->>Home: { currentMode: JP }

    Home->>Query: invalidateQueries
    Home->>Home: JP 모드 UI 렌더링
```

#### 2.2.2 모드별 UI 상태

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMESTIC 모드 (기본)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Header: [로고] [알림] [젬스토어]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │              [ 국내 매칭 카드 ]                        │   │
│  │                                                       │   │
│  │  서울, 25세                                            │   │
│  │  ENFP · 서울대학교                                     │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [GO JAPAN 배너] 일본 친구를 만나보세요!                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                     [ FloatingSummaryCard ]                 │
│                     "3명이 회원님을 봤어요"                  │
└─────────────────────────────────────────────────────────────┘

                            ▼ 모드 전환

┌─────────────────────────────────────────────────────────────┐
│                       JP 모드 (활성화)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         🇯🇵 일본 매칭 모드  ›                         │   │
│  │         (Floating Banner - 탭하면 설정 이동)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Header: [로고] [알림] [젬스토어]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    🇯🇵 Tokyo                          │   │
│  │              [ JP 매칭 카드 ]                          │   │
│  │                                                       │   │
│  │  Yuki, 24세                                           │   │
│  │  도쿄 · 공통관심사: K-POP, 여행                        │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [국내 매칭으로 돌아가기] (숨김 or 축소)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                     [ FloatingSummaryCard ]                 │
│                     "2명이 회원님을 봤어요"                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 JP 재매칭 플로우

#### 2.3.1 시퀀스 다이어그램

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Card as JP 매칭 카드
    participant Hook as useJpRematch
    participant API as 서버 API
    participant Modal as 모달
    participant Mixpanel as Mixpanel

    User->>Card: 재매칭 버튼 클릭
    Card->>Hook: startJpRematch()

    Hook->>Mixpanel: track('JP_Matching_Queue_Joined')
    Hook->>API: POST /v3/matching/rematch/jp

    alt 매칭 성공
        API-->>Hook: { matchId, match: JpMatchData }
        Hook->>Mixpanel: track('JP_Matching_Success')
        Hook->>Card: 새 매칭 데이터 표시
        Card->>Card: JP 매칭 카드 업데이트
    else 매칭 실패 (USER_NOT_FOUND)
        API-->>Hook: { error: 'USER_NOT_FOUND' }
        Hook->>Mixpanel: track('JP_Matching_Empty')
        Hook->>Modal: Empty State 모달 표시
        Note over Modal: "현재 매칭 가능한 상대가 없습니다<br/>잠시 후 다시 시도해주세요"
        User->>Modal: "확인" 클릭
        Modal->>Card: 이전 상태 유지
    else 자격 없음 (NOT_ELIGIBLE)
        API-->>Hook: { error: 'NOT_ELIGIBLE' }
        Hook->>Modal: JP 인증 필요 모달
        User->>Modal: "인증하기" 클릭
        Modal->>Card: JP 온보딩으로 이동
    end
```

#### 2.3.2 재매칭 상태 플로우

```mermaid
stateDiagram-v2
    [*] --> Idle: JP 모드 활성화

    Idle --> Loading: 재매칭 요청
    Loading --> Success: 매칭 성공
    Loading --> Empty: 매칭 상대 없음
    Loading --> Error: API 에러

    Success --> Idle: 카드 업데이트 완료
    Empty --> Idle: 모달 닫기
    Error --> Idle: 에러 처리 완료

    state Loading {
        [*] --> Searching
        Searching: 일본 매칭 상대를<br/>찾고 있습니다...
    }

    state Success {
        [*] --> Matched
        Matched: 새 매칭 표시
    }

    state Empty {
        [*] --> NoMatch
        NoMatch: Empty State 모달
    }

    state Error {
        [*] --> HandleError
        HandleError: 에러 모달 표시
    }
```

#### 2.3.3 재매칭 UI 상태

```
[재매칭 버튼 클릭]
        │
        ▼
┌───────────────────────┐
│     로딩 상태          │
│                       │
│   ◉ ◉ ◉ (스피너)       │
│                       │
│  "일본 매칭 상대를      │
│   찾고 있습니다..."     │
│                       │
└───────────────────────┘
        │
        ├── 성공 ──────────────────────────┐
        │                                   │
        ▼ 실패                              ▼
┌───────────────────────┐    ┌───────────────────────┐
│     Empty State       │    │     새 매칭 카드       │
│                       │    │                       │
│   😢                   │    │  🇯🇵 Osaka             │
│                       │    │                       │
│  "현재 매칭 가능한      │    │  Sakura, 23세         │
│   상대가 없습니다"      │    │  오사카               │
│                       │    │  공통: 애니메이션      │
│   💡 Tip               │    │                       │
│   잠시 후 다시         │    │  [더보기]             │
│   시도해주세요         │    │                       │
│                       │    └───────────────────────┘
│   [대기하기]           │
│                       │
└───────────────────────┘
```

---

### 2.4 일본인 유저 플로우

#### 2.4.1 일본인 관점 플로우

```mermaid
sequenceDiagram
    autonumber
    actor JP as 일본인 유저
    participant App as Sometimes App (JP)
    participant API as 서버 API

    Note over JP,API: 일본인은 반대로 한국인과 매칭

    JP->>App: GO KOREA 버튼 클릭
    App->>API: GET /v1/user/kr-matching/eligibility

    alt 인증 미완료
        API-->>App: { eligible: false }
        App->>App: KR SMS 인증 안내 모달
        JP->>App: 한국 전화번호 인증 진행
        App->>API: POST /kr/auth/sms/verify
    end

    API-->>App: { eligible: true }
    App->>API: POST /v1/user/matching-mode (mode: KR)
    API-->>App: { currentMode: KR }

    App->>App: KR 모드 UI 렌더링
    Note over App: Floating 배너: "🇰🇷 한국 매칭 모드"

    JP->>App: 재매칭 요청
    App->>API: POST /v3/matching/rematch/kr
    API-->>App: { match: KrMatchData }
    Note over App: 한국인 프로필 카드 표시
```

#### 2.4.2 양방향 매칭 구조

```
┌─────────────────────────────────────────────────────────────┐
│                       매칭 풀 구조                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐                    ┌─────────────┐       │
│   │   한국인     │                    │   일본인     │       │
│   │   유저 풀    │                    │   유저 풀    │       │
│   │             │                    │             │       │
│   │  JP 모드    │ ─────매칭─────▶   │  (대상)     │       │
│   │  활성화     │                    │             │       │
│   │             │                    │             │       │
│   └─────────────┘                    └─────────────┘       │
│         ▲                                   │               │
│         │                                   │               │
│         └──────────매칭──────────────────────┘               │
│                                   KR 모드 활성화            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   정리:                                                     │
│   • 한국인(JP모드) → 일본인에게 매칭됨                        │
│   • 일본인(KR모드) → 한국인에게 매칭됨                        │
│   • 단방향 매칭: 본인이 선택한 모드의 상대국 유저만 표시       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 에러 처리 플로우

### 3.1 에러 시나리오별 처리

```mermaid
flowchart TB
    subgraph "API 에러"
        A[API 호출]
        B{에러 타입}
        C[USER_NOT_FOUND]
        D[NOT_ELIGIBLE]
        E[RATE_LIMITED]
        F[NETWORK_ERROR]
        G[SERVER_ERROR]
    end

    subgraph "처리 방식"
        H[Empty State 모달]
        I[인증 필요 모달]
        J[재시도 안내]
        K[네트워크 에러 토스트]
        L[일반 에러 토스트]
    end

    subgraph "다음 액션"
        M[대기하기]
        N[JP 인증 시작]
        O[재시도 버튼]
        P[앱 재시작 안내]
        Q[고객센터 문의]
    end

    A --> B
    B --> C --> H --> M
    B --> D --> I --> N
    B --> E --> J --> O
    B --> F --> K --> P
    B --> G --> L --> Q
```

### 3.2 에러 메시지 정의

| 에러 코드 | 제목 | 메시지 | CTA |
|----------|-----|-------|-----|
| `USER_NOT_FOUND` | 매칭 대기 | 현재 매칭 가능한 상대가 없습니다 | 대기하기 |
| `NOT_ELIGIBLE` | JP 인증 필요 | 일본 매칭을 위해 인증이 필요합니다 | 인증하기 |
| `RATE_LIMITED` | 잠시 후 시도 | 요청이 너무 많습니다. 잠시 후 다시 시도해주세요 | 확인 |
| `NETWORK_ERROR` | 연결 오류 | 네트워크 연결을 확인해주세요 | 재시도 |
| `SERVER_ERROR` | 오류 발생 | 일시적인 오류가 발생했습니다 | 다시 시도 |

---

## 4. 라우팅 구조

### 4.1 관련 라우트

```
app/
├── home/
│   └── index.tsx              # 홈 화면 (JP 모드 통합)
├── auth/
│   └── jp-sms/
│       └── index.tsx          # JP SMS 인증 (기존)
├── settings/
│   └── matching-mode/
│       └── index.tsx          # 매칭 모드 설정 (신규)
└── profile/
    └── [userId]/
        └── index.tsx          # 프로필 상세 (국적 표시 추가)
```

### 4.2 네비게이션 플로우

```mermaid
graph LR
    A[/home] --> B[GO JAPAN 클릭]
    B --> C{인증 여부}
    C -->|미인증| D[/auth/jp-sms]
    C -->|인증됨| E[모드 전환 모달]
    D --> F[인증 완료]
    F --> E
    E --> G[/home JP모드]

    G --> H[배너 클릭]
    H --> I[/settings/matching-mode]
    I --> J[토글 전환]
    J --> K[/home DOMESTIC모드]

    G --> L[매칭 카드 클릭]
    L --> M[/profile/userId]
```

---

## 5. 데이터 플로우

### 5.1 상태 관리 구조

```mermaid
flowchart TB
    subgraph "서버 상태 (Source of Truth)"
        A[(User Profile<br/>matchingMode)]
        B[(JP Eligibility<br/>jpSmsVerified)]
    end

    subgraph "TanStack Query (캐시)"
        C[useMatchingMode]
        D[useJpMatchingEligibility]
        E[useLatestMatching]
        F[useMatchingHistoryList]
    end

    subgraph "Zustand (로컬 상태)"
        G[cachedMode]
        H[currentJpMatch]
    end

    subgraph "UI 컴포넌트"
        I[JpModeFloatingBanner]
        J[JpModeToggle]
        K[JpMatchingCard]
        L[MatchingHistoryList]
    end

    A --> C
    B --> D
    C --> G
    C --> I
    C --> J
    D --> J
    E --> K
    E --> H
    F --> L

    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#fff3e0
    style G fill:#f3e5f5
    style H fill:#f3e5f5
```

### 5.2 쿼리 무효화 전략

```typescript
// 모드 전환 시 무효화할 쿼리
const invalidateOnModeSwitch = [
  'latest-matching-v2',      // 현재 매칭 정보
  'matching-history-list',   // 매칭 히스토리
  'home-summary',            // 홈 요약 (나를 본 사람)
];

// JP 재매칭 성공 시 무효화할 쿼리
const invalidateOnJpRematch = [
  'latest-matching-v2',
  'gem:current',             // 구슬 잔액 (재매칭권 사용 시)
];
```

---

## 6. Mixpanel 이벤트 플로우

### 6.1 이벤트 트래킹 포인트

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Mixpanel

    Note over User,Mixpanel: 온보딩 플로우
    User->>App: GO JAPAN 클릭
    App->>Mixpanel: JP_Onboarding_Start

    User->>App: SMS 인증 완료
    App->>Mixpanel: JP_Onboarding_Complete

    Note over User,Mixpanel: 모드 전환
    User->>App: 모드 토글
    App->>Mixpanel: JP_Mode_Switch {from, to}

    Note over User,Mixpanel: 재매칭
    User->>App: 재매칭 클릭
    App->>Mixpanel: JP_Matching_Queue_Joined

    alt 성공
        App->>Mixpanel: JP_Matching_Success {match_id}
    else 실패
        App->>Mixpanel: JP_Matching_Empty
    end

    Note over User,Mixpanel: 프로필 조회
    User->>App: JP 매칭 카드 클릭
    App->>Mixpanel: JP_Profile_Viewed {nationality}
```

### 6.2 이벤트 목록

| 이벤트명 | 트리거 | 속성 |
|---------|-------|-----|
| `JP_Onboarding_Start` | GO JAPAN 버튼 클릭 (미인증) | - |
| `JP_Onboarding_Complete` | JP SMS 인증 완료 | - |
| `JP_Mode_Switch` | 모드 전환 | `from_mode`, `to_mode` |
| `JP_Matching_Queue_Joined` | 재매칭 요청 | - |
| `JP_Matching_Success` | 매칭 성공 | `match_id` |
| `JP_Matching_Empty` | 매칭 상대 없음 | - |
| `JP_Profile_Viewed` | 프로필 카드 클릭 | `nationality`, `match_id` |

---

## 7. 구현 우선순위

### Phase 1: 기본 플로우 (MVP)
1. ✅ JP SMS 인증 (기존 재사용)
2. 🔲 매칭 모드 API 연동
3. 🔲 JP 모드 Floating 배너
4. 🔲 모드 전환 토글

### Phase 2: 매칭 기능
5. 🔲 JP 재매칭 API 연동
6. 🔲 JP 매칭 카드 컴포넌트
7. 🔲 Empty State 처리

### Phase 3: 히스토리 & 분석
8. 🔲 매칭 히스토리 모드 필터
9. 🔲 Mixpanel 이벤트
10. 🔲 일본인 유저 플로우 (대칭 구현)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 내용 |
|-----|-----|-------|-----|
| 1.0 | 2026-01-28 | - | 초안 작성 |
