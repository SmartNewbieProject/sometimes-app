# Admin Manual Schedule Matching API Specification

> 어드민 수동 스케줄 매칭 - 운영자가 직접 매칭을 생성하는 기능

## Overview

운영 목적으로 특정 유저들을 수동으로 매칭시키는 어드민 전용 API입니다.
자동 매칭 알고리즘 외에 CS 대응, 테스트, 프로모션 등의 상황에서 사용됩니다.

### 사용 시나리오

- **CS 대응**: 유저 불만 해소를 위한 특별 매칭
- **테스트**: 신규 기능 QA를 위한 테스트 매칭
- **프로모션**: 이벤트 당첨자 매칭
- **복구**: 시스템 오류로 누락된 매칭 수동 생성

---

## Data Models

### ManualMatchingRequest

```typescript
interface ManualMatchingRequest {
  // 매칭 대상
  userIds: string[];           // 매칭할 유저 ID 목록 (2명)

  // 매칭 설정
  scheduledAt: string;         // 매칭 예정 시간 (ISO 8601)
  matchType: ManualMatchType;  // 매칭 유형
  reason: string;              // 수동 매칭 사유 (필수)

  // 옵션
  skipValidation?: boolean;    // 유효성 검사 스킵 (주의 필요)
  notifyUsers?: boolean;       // 유저에게 알림 발송 여부 (기본: true)
  priority?: MatchPriority;    // 매칭 우선순위
}
```

### ManualMatchType

```typescript
enum ManualMatchType {
  CS_SUPPORT = 'cs_support',       // CS 대응
  TEST = 'test',                   // 테스트 목적
  PROMOTION = 'promotion',         // 프로모션/이벤트
  RECOVERY = 'recovery',           // 매칭 복구
  VIP = 'vip',                     // VIP 유저 특별 매칭
  OTHER = 'other',                 // 기타
}
```

### MatchPriority

```typescript
enum MatchPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}
```

### ManualMatchingResponse

```typescript
interface ManualMatchingResponse {
  id: string;                      // 매칭 ID
  status: MatchingStatus;          // 매칭 상태
  users: MatchedUser[];            // 매칭된 유저 정보
  scheduledAt: string;             // 예정 시간
  matchType: ManualMatchType;      // 매칭 유형
  reason: string;                  // 수동 매칭 사유
  createdBy: AdminUser;            // 생성한 어드민
  createdAt: string;               // 생성 시간
}
```

### MatchingStatus

```typescript
enum MatchingStatus {
  SCHEDULED = 'scheduled',         // 예약됨
  PROCESSING = 'processing',       // 처리 중
  COMPLETED = 'completed',         // 완료
  FAILED = 'failed',               // 실패
  CANCELLED = 'cancelled',         // 취소됨
}
```

### MatchedUser

```typescript
interface MatchedUser {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  university: string;
  profileImageUrl: string | null;
  matchingStatus: UserMatchingStatus;
}

enum UserMatchingStatus {
  ELIGIBLE = 'eligible',           // 매칭 가능
  ALREADY_MATCHED = 'already_matched',  // 이미 매칭됨
  BLOCKED = 'blocked',             // 차단 관계
  INACTIVE = 'inactive',           // 비활성 유저
}
```

### AdminUser

```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CS_MANAGER = 'cs_manager',
  OPERATOR = 'operator',
}
```

---

## API Endpoints

> **Base Path**: `/api/admin/matching`
>
> **인증**: Admin JWT 토큰 필요 (Bearer Token)
>
> **권한**: `ADMIN` 이상

### 수동 매칭 생성

```http
POST /api/admin/matching/manual
```

#### Request Headers

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "userIds": [
    "019ac935-4b4c-7db7-a9ae-a57176cec1a6",
    "019ac935-5c5d-8ec8-b0bf-b68287ded2b7"
  ],
  "scheduledAt": "2025-02-06T18:00:00+09:00",
  "matchType": "cs_support",
  "reason": "CS 티켓 #12345 - 매칭 누락 보상",
  "notifyUsers": true,
  "priority": "high"
}
```

#### Response (201 Created)

```json
{
  "data": {
    "id": "match-550e8400-e29b-41d4-a716-446655440000",
    "status": "scheduled",
    "users": [
      {
        "id": "019ac935-4b4c-7db7-a9ae-a57176cec1a6",
        "name": "김**",
        "gender": "MALE",
        "university": "서울대학교",
        "profileImageUrl": "https://cdn.sometime.app/profiles/001.jpg",
        "matchingStatus": "eligible"
      },
      {
        "id": "019ac935-5c5d-8ec8-b0bf-b68287ded2b7",
        "name": "이**",
        "gender": "FEMALE",
        "university": "연세대학교",
        "profileImageUrl": "https://cdn.sometime.app/profiles/002.jpg",
        "matchingStatus": "eligible"
      }
    ],
    "scheduledAt": "2025-02-06T18:00:00+09:00",
    "matchType": "cs_support",
    "reason": "CS 티켓 #12345 - 매칭 누락 보상",
    "createdBy": {
      "id": "admin-001",
      "email": "admin@sometime.app",
      "name": "운영자",
      "role": "admin"
    },
    "createdAt": "2025-02-05T15:30:00+09:00"
  }
}
```

---

### 유저 매칭 가능 여부 검증

매칭 생성 전 유저들의 매칭 가능 여부를 사전 검증합니다.

```http
POST /api/admin/matching/validate
```

#### Request Body

```json
{
  "userIds": [
    "019ac935-4b4c-7db7-a9ae-a57176cec1a6",
    "019ac935-5c5d-8ec8-b0bf-b68287ded2b7"
  ]
}
```

#### Response (200 OK)

```json
{
  "data": {
    "isValid": true,
    "users": [
      {
        "id": "019ac935-4b4c-7db7-a9ae-a57176cec1a6",
        "name": "김**",
        "matchingStatus": "eligible",
        "warnings": []
      },
      {
        "id": "019ac935-5c5d-8ec8-b0bf-b68287ded2b7",
        "name": "이**",
        "matchingStatus": "eligible",
        "warnings": ["최근 7일 내 매칭 3회 이상"]
      }
    ],
    "blockedReasons": []
  }
}
```

#### Response (유효하지 않은 경우)

```json
{
  "data": {
    "isValid": false,
    "users": [
      {
        "id": "019ac935-4b4c-7db7-a9ae-a57176cec1a6",
        "name": "김**",
        "matchingStatus": "eligible",
        "warnings": []
      },
      {
        "id": "019ac935-5c5d-8ec8-b0bf-b68287ded2b7",
        "name": "이**",
        "matchingStatus": "blocked",
        "warnings": []
      }
    ],
    "blockedReasons": [
      "두 유저 간 차단 관계가 존재합니다."
    ]
  }
}
```

---

### 수동 매칭 목록 조회

```http
GET /api/admin/matching/manual
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | MatchingStatus | No | - | 상태 필터 |
| matchType | ManualMatchType | No | - | 유형 필터 |
| createdBy | string | No | - | 생성자 ID 필터 |
| startDate | string | No | - | 생성일 시작 (ISO 8601) |
| endDate | string | No | - | 생성일 종료 (ISO 8601) |
| page | number | No | 1 | 페이지 번호 |
| limit | number | No | 20 | 페이지당 개수 (max: 100) |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "match-550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "users": [...],
      "scheduledAt": "2025-02-06T18:00:00+09:00",
      "matchType": "cs_support",
      "reason": "CS 티켓 #12345",
      "createdBy": {...},
      "createdAt": "2025-02-05T15:30:00+09:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "hasNext": true
  }
}
```

---

### 수동 매칭 상세 조회

```http
GET /api/admin/matching/manual/:id
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "match-550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "users": [...],
    "scheduledAt": "2025-02-06T18:00:00+09:00",
    "executedAt": "2025-02-06T18:00:05+09:00",
    "matchType": "cs_support",
    "reason": "CS 티켓 #12345 - 매칭 누락 보상",
    "createdBy": {...},
    "createdAt": "2025-02-05T15:30:00+09:00",
    "updatedAt": "2025-02-06T18:00:05+09:00",
    "logs": [
      {
        "timestamp": "2025-02-05T15:30:00+09:00",
        "action": "created",
        "actor": "admin@sometime.app",
        "details": "수동 매칭 생성"
      },
      {
        "timestamp": "2025-02-06T18:00:00+09:00",
        "action": "processing",
        "actor": "system",
        "details": "매칭 처리 시작"
      },
      {
        "timestamp": "2025-02-06T18:00:05+09:00",
        "action": "completed",
        "actor": "system",
        "details": "매칭 완료, 채팅방 생성됨"
      }
    ]
  }
}
```

---

### 수동 매칭 취소

예약된 매칭을 취소합니다. `scheduled` 상태에서만 가능합니다.

```http
DELETE /api/admin/matching/manual/:id
```

#### Request Body

```json
{
  "reason": "고객 요청으로 취소"
}
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "match-550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled",
    "cancelledAt": "2025-02-05T16:00:00+09:00",
    "cancelledBy": {
      "id": "admin-001",
      "email": "admin@sometime.app"
    },
    "cancelReason": "고객 요청으로 취소"
  }
}
```

---

### 즉시 매칭 실행

예약된 매칭을 즉시 실행합니다.

```http
POST /api/admin/matching/manual/:id/execute
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "match-550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "executedAt": "2025-02-05T16:05:00+09:00",
    "chatRoomId": "chatroom-123456"
  }
}
```

---

## Validation Rules

### 필수 검증 (skipValidation: false)

| 규칙 | 설명 |
|------|------|
| 유저 수 | 정확히 2명이어야 함 |
| 성별 | 서로 다른 성별이어야 함 |
| 활성 상태 | 두 유저 모두 활성 상태여야 함 |
| 차단 관계 | 서로 차단하지 않은 상태여야 함 |
| 기존 매칭 | 이미 매칭된 적 없어야 함 |
| 예약 시간 | 현재 시간 이후여야 함 |

### 스킵 가능 검증 (skipValidation: true)

| 규칙 | 설명 |
|------|------|
| 매칭 빈도 | 최근 매칭 횟수 제한 |
| 선호도 | 이상형 조건 매칭 여부 |
| 대학 제한 | 동일 대학 매칭 제한 |

> ⚠️ **주의**: `skipValidation: true`는 `SUPER_ADMIN` 권한에서만 사용 가능

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_USER_COUNT | 400 | 유저 수가 2명이 아님 |
| SAME_GENDER | 400 | 동일 성별 매칭 불가 |
| USER_NOT_FOUND | 404 | 유저를 찾을 수 없음 |
| USER_INACTIVE | 400 | 비활성 유저 포함 |
| USERS_BLOCKED | 400 | 차단 관계 존재 |
| ALREADY_MATCHED | 400 | 이미 매칭된 유저들 |
| INVALID_SCHEDULE_TIME | 400 | 과거 시간 예약 불가 |
| MATCHING_NOT_FOUND | 404 | 매칭을 찾을 수 없음 |
| CANNOT_CANCEL | 400 | 취소 불가 상태 |
| INSUFFICIENT_PERMISSION | 403 | 권한 부족 |

---

## Audit Log

모든 수동 매칭 작업은 감사 로그에 기록됩니다.

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  action: 'create' | 'cancel' | 'execute' | 'update';
  resourceType: 'manual_matching';
  resourceId: string;
  actor: {
    id: string;
    email: string;
    role: AdminRole;
    ip: string;
  };
  changes: Record<string, { before: any; after: any }>;
  metadata: Record<string, any>;
}
```

---

## Rate Limits

| 엔드포인트 | 제한 |
|-----------|------|
| POST /manual | 100/hour per admin |
| GET /manual | 1000/hour per admin |
| POST /validate | 500/hour per admin |

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-02-05 | 초기 스펙 정의 |
