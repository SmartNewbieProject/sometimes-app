# Global Matching - Backend API 수정 요청서

> **작성일**: 2026-02-19
> **목적**: 프론트엔드 글로벌 매칭 구현을 위한 백엔드 API 수정/추가 요청
> **핵심 원칙**: 글로벌 매칭은 기존 국내(domestic) 매칭과 **동일한 프로세스**로 동작해야 함

---

## 1. 배경: 왜 API 수정이 필요한가

### 프론트엔드 설계 원칙

글로벌 매칭은 **별도 화면이 아닌 기존 매칭 화면에 "모드 전환"**으로 구현합니다.

```
┌─────────────────────────────────┐
│  홈 화면                         │
│  [국내 매칭]  [글로벌]  ← 세그먼트 컨트롤 │
│                                 │
│  ┌─────────────────────────┐    │
│  │  IdleMatchTimer         │    │
│  │  (국내/글로벌 동일 UI)    │    │
│  │                         │    │
│  │  파트너 카드 (1명)       │    │
│  │  48h 타이머              │    │
│  │  [더보기] 버튼            │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

따라서 글로벌 매칭 API도 기존 domestic API(`GET /v2/matching`)와 **동일한 응답 형태**가 필요합니다.

### 현재 문제

현재 글로벌 매칭 API `GET /api/global-matching/candidates`는 **다수 후보를 배열로 반환**하는 구조입니다. 이는 프론트엔드의 기존 매칭 플로우(1명씩 배정 + 타이머)와 호환되지 않습니다.

---

## 2. 기존 국내 매칭 프로세스 (현재 동작)

### 2.1 매칭 조회 플로우

```
프론트엔드                          백엔드
    │                               │
    │  GET /v2/matching             │
    │──────────────────────────────>│
    │                               │  서버가 1명 배정
    │                               │  endOfView 타이머 설정
    │  MatchDetails 응답             │
    │<──────────────────────────────│
    │                               │
    │  60초마다 자동 갱신             │
    │  (refetchInterval: 60s)       │
    │──────────────────────────────>│
    │                               │
```

### 2.2 GET /v2/matching 응답 구조

```typescript
// 서버 응답 (response.data.data - interceptor 자동 추출)
{
  // 공통 필드
  id: string | null,                    // 매칭 ID
  type: 'open' | 'waiting' | 'not-found' | 'rematching' | 'pending-approval',
  connectionId: string | null,          // 좋아요/상호작용에 사용하는 연결 ID

  // type='open' | 'rematching' 일 때
  endOfView: string | null,            // ISO 8601, 프로필 열람 종료 시각
  partner: UserProfile | null,         // 매칭 파트너 프로필 (아래 상세)
  matchedAt: string,                   // 매칭 시각
  canLetter: boolean,                  // 편지 기능 가능 여부

  // type='waiting' | 'not-found' 일 때
  untilNext: string | null,            // 다음 매칭까지 남은 시간 (예: "3시간 후")

  // type='pending-approval' 일 때
  approvalStatus: 'pending' | 'approved' | 'rejected',
  approvalMessage: string,
  estimatedApprovalTime: string,
  rejectionCategory: string,
  rejectionReason: string,
}
```

### 2.3 UserProfile 구조 (partner 필드)

```typescript
{
  id: string,
  name: string,
  age: number,
  gender: 'MALE' | 'FEMALE',
  mbti: string | null,
  rank: string | null,
  instagramId: string | null,

  profileImages: [
    { id: string, url: string, thumbnail: string, isMain: boolean }
  ],

  universityDetails: {
    name: string,
    code: string,
    department: string,
    isVerified: boolean,
    logoUrl: string,
  } | null,

  preferences: [                    // 선호도 그룹
    { type: string, values: [{ name: string, value: string }] }
  ],
  characteristics: [                // 특성 그룹
    { type: string, values: [{ name: string, value: string }] }
  ],

  introductions: string[],          // 자기소개 문장 배열
  introduction: string | null,      // 한 줄 소개
  keywords: string[] | null,        // 관심사 키워드

  connectionId: string,             // 연결 ID (좋아요 전송 시 사용)
  isLikeSended: number,             // 좋아요 전송 여부 (0/1)
  matchLikeId: string | null,

  isFirstView: boolean,             // 첫 열람 여부 (인트로 모달 표시용)
  matchScore: number,               // 매칭 점수 (0-100)
  isFirstMatch: boolean,            // 첫 매칭 여부
  tier: string,                     // 매칭 티어
  canLetter: boolean,               // 편지 가능 여부

  external: {                       // 외부 매칭 정보 (다른 지역 등)
    region: string,
    matchType: string,
  } | null,

  idealTypeResult: {                // 이상형 테스트 결과
    id: string,
    name: string,
    tags: string[],
  } | null,

  deletedAt: string | null,
  updatedAt: string | null,
  phoneNumber: string,
}
```

### 2.4 상태별 동작 요약

| type | 의미 | partner | endOfView | untilNext |
|------|------|---------|-----------|-----------|
| `open` | 매칭 성공, 프로필 열람 가능 | O | O (48h) | X |
| `rematching` | 리매칭 결과 | O | O | X |
| `waiting` | 다음 매칭 대기 중 | X | X | O |
| `not-found` | 매칭 실패 | X | X | O |
| `pending-approval` | 프로필 심사 중 | X | X | O |

---

## 3. 좋아요 프로세스 (현재 동작)

### 3.1 좋아요 전송

```
POST /v1/matching/interactions/like/{connectionId}

Request Body (optional):
{
  "letter": "편지 내용 (선택)"
}

Response: void (200 OK)

비용: 남성 구슬 차감 / 여성 무료
```

### 3.2 좋아요 목록 조회

```
GET /v1/matching/interactions/liked-me       → LikedMe[]   (받은 좋아요)
GET /v1/matching/interactions/i-liked        → ILiked[]    (보낸 좋아요)
```

### 3.3 좋아요 응답 (LikedMe 타입)

```typescript
{
  likeId: string,
  status: 'PENDING' | 'OPEN' | 'REJECTED' | 'IN_CHAT',
  likedAt: string,                   // ISO 8601
  letterContent: string | null,      // 편지 내용
  hasLetter: boolean,

  // 프로필 요약
  nickname: string,
  age: number,
  mainProfileUrl: string,
  mainProfileThumbnail: string | null,
  universityName: string,
  universityCode: string,
  departmentName: string,
  instagram: string | null,

  // 매칭 정보
  matchId: string,
  connectionId: string,
  matchExpiredAt: string,            // 만료 시각
  isExpired: boolean,
  isMutualLike: boolean,
  viewedAt: string | null,
  deletedAt: string | null,

  external: ExternalMatchInfo | null,
}
```

### 3.4 좋아요 수락/거절

```
# 수락 (= 상대에게도 좋아요 전송)
POST /v1/matching/interactions/like/{connectionId}

# 거절
DELETE /v1/matching/interactions/reject/{connectionId}
→ { success: boolean }

# 취소 (bye)
DELETE /v1/matching/interactions/bye/{connectionId}
```

---

## 4. 요청 사항: 글로벌 매칭 API 수정

### 4.1 핵심 요청: 글로벌 매칭 조회 API (신규)

> 기존 `GET /api/global-matching/candidates` (다수 후보 반환)를 대체하거나,
> 별도 엔드포인트로 domestic `GET /v2/matching`과 **동일한 형태** 제공

```
GET /api/global-matching/matching
```

**응답은 domestic `GET /v2/matching`과 동일한 구조**여야 합니다:

```json
// type='open' 예시 (KR 사용자가 JP 후보를 받은 경우)
{
  "id": "global-match-uuid",
  "type": "open",
  "endOfView": "2026-02-21T04:30:00.000Z",
  "connectionId": "global-connection-uuid",
  "matchedAt": "2026-02-19T04:30:00.000Z",
  "canLetter": true,
  "partner": {
    "id": "jp-profile-uuid",
    "name": "タナカ サクラ",
    "age": 23,
    "gender": "FEMALE",
    "mbti": "ENFP",

    "profileImages": [
      { "id": "img-1", "url": "https://...", "thumbnail": "https://...", "isMain": true }
    ],

    "universityDetails": {
      "name": "東京大学",
      "code": "tokyo-u",
      "department": "文学部",
      "isVerified": true,
      "logoUrl": "https://..."
    },

    "introduction": "音楽が好きです",
    "keywords": ["旅行", "料理"],

    "connectionId": "global-connection-uuid",
    "isLikeSended": 0,
    "isFirstView": true,
    "matchScore": 85,
    "canLetter": true,

    "country": "jp"
  }
}
```

```json
// type='waiting' 예시
{
  "id": null,
  "type": "waiting",
  "endOfView": null,
  "partner": null,
  "untilNext": "3시간 후",
  "connectionId": null
}
```

```json
// type='not-found' 예시
{
  "id": null,
  "type": "not-found",
  "endOfView": null,
  "partner": null,
  "untilNext": "내일 12:00",
  "connectionId": null
}
```

**동작 요구사항:**

| 항목 | 설명 |
|------|------|
| 배정 방식 | 서버가 대상 국가 후보 **1명을 배정** |
| 열람 시간 | `endOfView` = 현재 시각 + 48h (또는 적정 시간) |
| 갱신 주기 | 프론트에서 60초마다 폴링 (domestic 동일) |
| 상태 전환 | `open` → (열람 만료) → `waiting` → (배정) → `open` |
| 후보 필터 | `global_matching_enabled=true`, 반대 성별, 반대 국가, `is_test` 동일 |
| 이미 좋아요 보낸 사용자 제외 | domestic과 동일 |

**partner 필드 추가 요청:**

기존 UserProfile에 아래 필드 추가 (글로벌 매칭 전용):

```typescript
// partner 객체에 추가될 필드
{
  ...기존 UserProfile 필드,

  country: string,  // "kr" | "jp" — 파트너의 국가 코드 (글로벌 매칭에서만 사용)
}
```

> **프론트엔드 번역 처리에 대해**: 프론트엔드는 서버가 반환하는 프로필 데이터를 **그대로 표시**합니다.
> 번역이 필요한 경우 **서버에서 번역된 값을 해당 필드에 직접 넣어주세요**.
> 예: KR 사용자에게 JP 후보를 보여줄 때, `name` 필드에 번역된 이름을, `introduction` 필드에 번역된 소개를 넣어주면 됩니다.
> 별도의 `nameTranslated`, `bioTranslated` 필드는 사용하지 않습니다.

---

### 4.2 글로벌 좋아요 전송 API (수정)

> 기존 `POST /api/global-matching/like`를 domestic과 동일한 인터페이스로 맞춤

```
POST /api/global-matching/like/{connectionId}
```

**Request Body:**
```json
{
  "letter": "はじめまして！素敵なプロフィールですね。"
}
```

**Response (200):**
```json
{
  "success": true,
  "gemsConsumed": 16
}
```

| 변경 사항 | Before | After |
|----------|--------|-------|
| URL 패턴 | `POST /like` + body `targetUserId` | `POST /like/{connectionId}` (domestic 동일) |
| 편지 필드 | `letterContent` | `letter` (domestic 동일) |
| 응답 | `{ success, likeId, gemsConsumed }` | `{ success, gemsConsumed }` (또는 void) |

> **대안**: URL 변경이 어렵다면 기존 `POST /api/global-matching/like` 유지해도 됩니다.
> 프론트에서 `connectionId → targetUserId` 매핑 처리 가능합니다.
> 이 경우 `letterContent` → `letter` 필드명만 통일해주세요.

---

### 4.3 받은 좋아요 API (수정)

> 기존 domestic `GET /v1/matching/interactions/liked-me`에 글로벌 좋아요를 **통합 반환**

**방안 A (권장): 기존 API에 통합**

```
GET /v1/matching/interactions/liked-me
```

응답의 `LikedMe[]`에 글로벌 좋아요도 포함. 구분을 위해 필드 추가:

```typescript
{
  ...기존 LikedMe 필드,

  isGlobalMatch: boolean,     // true면 글로벌 매칭
  country: string | null,     // 발신자 국가 ("kr" | "jp"), 글로벌일 때만
}
```

**방안 B: 별도 API 유지 + 프론트에서 병합**

기존 `GET /api/global-matching/received-likes` 유지.
프론트에서 두 API 응답을 병합하여 표시. (비권장 - 복잡도 증가)

---

### 4.4 좋아요 수락/거절 API (수정)

domestic과 동일한 URL 패턴으로 통일:

```
# 수락
POST /api/global-matching/like/{connectionId}
→ domestic의 POST /v1/matching/interactions/like/{connectionId} 와 동일 패턴

# 거절
DELETE /api/global-matching/reject/{connectionId}
→ domestic의 DELETE /v1/matching/interactions/reject/{connectionId} 와 동일 패턴
```

**Response:**
```json
// 수락 시
{ "success": true, "chatRoomId": "chatroom-uuid" }

// 거절 시
{ "success": true }
```

> **대안**: 기존 `POST /api/global-matching/accept` + `DELETE /api/global-matching/decline` 유지해도 됩니다.
> 프론트에서 글로벌 여부에 따라 API를 분기 호출합니다.

---

### 4.5 온보딩 API (변경 없음)

```
POST /api/global-matching/onboarding
GET /api/global-matching/status
```

현재 스펙 그대로 사용합니다. 변경 불필요.

---

### 4.6 파트너 상세 조회 API (추가 필요)

domestic에서 `GET /matching/history/{matchId}`로 파트너 상세 정보를 조회합니다.
글로벌 매칭에서도 동일한 조회가 필요합니다.

```
GET /api/global-matching/history/{matchId}
```

**응답**: `UserProfile` (4.1의 partner 필드와 동일 구조 + `country` 필드)

> **대안**: 기존 `GET /matching/history/{matchId}`에서 글로벌 매칭 ID도 처리 가능하다면 별도 엔드포인트 불필요.

---

## 5. 요약: API 변경 우선순위

| 우선순위 | API | 유형 | 설명 |
|---------|-----|------|------|
| **P0 (필수)** | `GET /api/global-matching/matching` | 신규 | domestic `GET /v2/matching` 동일 형태, 1명 배정 + endOfView |
| **P0 (필수)** | UserProfile에 `country` 필드 추가 | 수정 | 글로벌 매칭 파트너의 국가 코드 |
| **P1 (권장)** | `GET /v1/matching/interactions/liked-me` 통합 | 수정 | 글로벌 좋아요 포함 + `isGlobalMatch`, `country` 필드 |
| **P1 (권장)** | `GET /v1/matching/interactions/i-liked` 통합 | 수정 | 글로벌 좋아요 포함 + `isGlobalMatch`, `country` 필드 |
| P2 | 좋아요 전송 URL 통일 | 선택 | `connectionId` 기반 URL 패턴 (or 기존 유지) |
| P2 | 수락/거절 URL 통일 | 선택 | domestic 패턴 (or 기존 유지) |
| P2 | 파트너 상세 조회 | 확인 | 기존 API 호환 가능 여부 확인 |

---

## 6. 에러 처리 (domestic과 동일하게)

| Status | 에러 코드 | 상황 | 프론트 처리 |
|--------|----------|------|-----------|
| 403 | `PAYMENT.FORBIDDEN_INSUFFICIENT_GEMS` | 구슬 부족 | 구슬 충전 모달 |
| 403 | `TICKET_INSUFFICIENT` | 좋아요 한도 도달 | 안내 모달 |
| 403 | - | 테스트↔일반 혼합 | 에러 모달 |
| 409 | `COMMUNICATION_RESTRICTED` | 소통 제한 | 에러 모달 |
| 409 | - | 중복 좋아요 | 에러 모달 |
| 400 | - | 만료된 좋아요 수락 | 에러 모달 |
| 404 | - | 대상 사용자 없음 | 에러 모달 |

---

## 7. 채팅 관련 (확인 사항)

글로벌 채팅방은 기존 채팅 목록 API에 포함되어야 합니다.

```
GET /api/chat/rooms/cursor?limit=10
```

기존 응답의 chat room 객체에 아래 필드가 포함되어야 합니다:

```typescript
{
  ...기존 ChatRoom 필드,

  isGlobalChat: boolean,              // 글로벌 채팅 여부
  // 메시지 객체에:
  contentTranslated: string | null,   // 번역된 메시지
  translatedLanguage: string | null,  // "ko" | "ja"
}
```

이미 DB 스키마에 `is_global_chat`, `content_translated`, `translated_language` 필드가 있으므로, API 응답에 포함만 해주시면 됩니다.

---

## 8. 전체 플로우 다이어그램

```
[KR 사용자]                                    [Backend]                                [JP 사용자]

1. 홈 → 글로벌 탭 클릭
   (온보딩 미완료 시)
   → 온보딩 페이지 이동

2. POST /global-matching/onboarding ──────────>  onboarding 처리
                                                 global_matching_enabled = true
   <── { isEnabled: true, targetCountry: "JP" }

3. GET /global-matching/matching ──────────────>  JP 후보 1명 배정
                                                  endOfView 설정 (48h)
   <── { type: "open", partner: {..., country: "jp"}, endOfView: "..." }

4. 홈에서 매칭 카드 표시 (domestic과 동일 UI)
   → "더보기" 클릭
   → partner/view/[id] 이동

5. 프로필 확인 → 좋아요 버튼 클릭
   POST /global-matching/like ─────────────────>  좋아요 생성 (16구슬 차감)
                                                  match_likes INSERT
   <── { success: true, gemsConsumed: 16 }

6.                                                                    GET /v1/matching/interactions/liked-me
                                                 <──────────────────  (또는 /global-matching/received-likes)
                                                  liked-me에 KR 좋아요 포함 ──>
                                                  (isGlobalMatch: true, country: "kr")

7.                                                                    POST /global-matching/accept
                                                 <──────────────────  { likeId: "..." }
                                                  양쪽 스키마 채팅방 생성
                                                  match_likes.status → ACCEPTED
                                                 ──────────────────>  { success: true, chatRoomId: "..." }

8. GET /chat/rooms/cursor ─────────────────────>  글로벌 채팅방 포함
   <── chatRooms: [{ ..., isGlobalChat: true }]

   채팅 메시지 전송 시:
   content + content_translated 양쪽 저장
```

---

## 9. 질문/논의 사항

1. **매칭 배정 주기**: 글로벌 매칭도 domestic과 동일한 배정 주기(하루 N회)를 적용할지, 아니면 별도 주기를 설정할지?

2. **리매칭**: domestic의 리매칭 기능(`type='rematching'`)을 글로벌에도 적용할지?

3. **매칭 알고리즘**: 글로벌 후보 배정 시 `compatibilityScore`(궁합 점수)를 기준으로 배정할지, 다른 로직을 사용할지?

4. **liked-me 통합 vs 분리**: 방안 A(통합)과 방안 B(별도 API) 중 백엔드 구현 편의상 어느 쪽이 나은지?

5. **프로필 번역 타이밍**: 매칭 배정 시 미리 번역해두는지, 조회 시 실시간 번역하는지?

6. **편지 번역**: 좋아요에 첨부된 편지(letter)도 자동 번역하여 `letterContentTranslated` 필드로 제공할지?
