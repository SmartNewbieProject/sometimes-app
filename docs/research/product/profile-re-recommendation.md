---
linear_id: "643e5ab9-fcad-49e2-8ed5-4e4598e48b94"
title: "untitled-643e5ab9"
url: "https://linear.app/smartnewbie/document/untitled-f0a41d9e2859"
creator_email: "smartnewb2@gmail.com"
created_at: "2026-01-14T00:09:22.784Z"
updated_at: "2026-01-26T10:31:30.180Z"
---
@deveungi 수정해봤습니다!

> 작성일: 2026-01-14
> 버전: 2.0 (코드베이스 분석 기반 재작성)

---

## 1\. 배경 및 문제 정의

### 현재 문제

* 한번 패스(더 찾아보기)한 유저는 영원히 다시 안 보임
* 상호 좋아요 없이 지나간 유저도 다시 매칭되지 않음
* 시간이 지날수록 유저 풀 고갈 → 추천할 사람 없음
* 프로필 개선해도 이전에 스쳐간 유저에게 어필 기회 없음

### 현재 매칭 로직 (코드 분석 결과)

```
프로필 추천 → GET /v2/matching
    ↓
[좋아요] POST /v1/matching/interactions/like/{connectionId}
    또는
[더 찾아보기/패스] DELETE /v1/matching/interactions/reject/{connectionId}
    ↓
좋아요 → 상대에게 전달 → 상호 좋아요 시 채팅 (status: OPEN)
패스 → 다음 프로필 → 이전 유저는 제외
```

### 목표

* 프로필 업데이트 시 이전 매칭 유저에게 재노출 기회 제공
* 유저 풀 순환으로 매칭 기회 확대
* 프로필 개선 동기 부여 → 서비스 활성화

---

## 2\. 핵심 기능 요구사항

### 2.1 기능 플로우

```
유저 A가 프로필 업데이트 (사진/관심사/성격 등)
    ↓
시스템: 트리거 조건 충족 여부 확인
    ↓
충족 시 → 재노출 대상 선정
    - A에게 좋아요 받았지만 응답 안 한 유저 (ILiked에서 status != OPEN)
    - A가 좋아요 받았지만 거절한 유저 (LikedMe에서 status = REJECTED)
    ↓
대상 유저들에게 푸시 알림 발송
"OO님이 프로필을 업데이트했어요, 한 번 더 봐보세요 👀"
    ↓
대상 유저 앱 접속 시 모달 표시
    ↓
[다시 볼래요] 클릭 → 무료로 재노출 프로필 카드 표시
    ↓
[좋아요] 또는 [더 찾아보기] 선택 (무료 - 남녀 모두)
```

### 2.2 재노출 트리거 조건

프로필 업데이트 시 재노출 발동:

| 업데이트 항목 | 트리거 여부 | 조건 | 현재 시스템 지원 |
| -- | -- | -- | -- |
| 사진 변경/추가 | ✅ | 1장 이상 변경 | ✅ POST /v2/profile/images |
| 관심사 변경 | ✅ | 1개 이상 변경 | ✅ interestIds 필드 |
| 성격 변경 | ✅ | 1개 이상 변경 | ✅ personality 필드 |
| 연애스타일 변경 | ✅ | 1개 이상 변경 | ✅ datingStyleIds 필드 |
| MBTI 변경 | ❌ | 제외 (너무 가벼운 변경) | ✅ mbti 필드 |
| 음주/흡연/문신 | ❌ | 제외 | ✅ drinking/smoking/tattoo |
| 군필 여부 | ❌ | 제외 | ✅ militaryStatus |

> ⚠️ **자기소개 제외**: 현재 프로필 수정 화면에 자기소개 편집 UI가 없음

### 2.3 재노출 대상 범위

**대상 유저 (OR 조건)**

| 조건 | 데이터 소스 | 구현 방법 |
| -- | -- | -- |
| 내가 좋아요 보냈지만 상대가 응답 안 한 유저 | ILiked | status = 'PENDING' |
| 나에게 좋아요 보냈지만 내가 거절한 유저 | LikedMe | status = 'REJECTED' |

**제외 대상**

| 조건 | API |
| -- | -- |
| 상대가 나를 차단한 경우 | /user/{userId}/block |
| 내가 상대를 차단한 경우 | /user/{userId}/block |
| 이미 상호 좋아요 → 채팅한 경우 | status = 'OPEN' or 'IN_CHAT' |

### 2.4 남용 방지

| 제한 | 내용 |
| -- | -- |
| 재노출 쿨다운 | 30일에 1회 (동일 유저 기준) |
| 프로필 변경 최소 기준 | 트리거 조건 충족 필수 |
| 1회 재노출 대상 수 | 최대 50명 |

---

## 3\. 사용자 플로우

### 3.1 프로필 업데이트 유저 (발신자)

```
프로필 수정 화면 (/app/profile-edit/profile.tsx)
    ↓
사진/관심사/성격/연애스타일 변경
    ↓
[저장] 클릭 → PATCH /preferences/self
    ↓
프론트: 변경 필드 감지 (initialSnapshot vs currentValues)
    ↓
트리거 조건 충족 시 → POST /re-exposure/trigger
    ↓
성공 시 모달 표시:
"프로필이 업데이트되었어요! 🎉
이전에 스쳐간 N명에게 다시 노출됩니다."
```

### 3.2 재노출 대상 유저 (수신자)

**핵심 원칙**: 앱 접속 시 홈 화면에서 모달로 한 명씩 표시

```
푸시 알림 수신 (Expo Push Notification)
"OO님이 프로필을 업데이트했어요, 한 번 더 봐보세요 👀"
    ↓
앱 접속 → 홈 화면 진입
    ↓
GET /re-exposure/pending → 대기 목록 중 1명 조회
    ↓
모달로 프로필 카드 직접 표시 (useModal)
┌─────────────────────────────────────────┐
│                                         │
│   💫 다시 만난 인연                      │
│                                         │
│   ┌───────────────────────────────┐     │
│   │                               │     │
│   │   [프로필 사진]                │     │
│   │                               │     │
│   │   한밭대학교 · 23세 · ENFP     │     │
│   │                               │     │
│   │   ✨ 새로 바뀐 부분            │     │
│   │   • 사진 2장 추가             │     │
│   │   • 관심사 수정               │     │
│   │                               │     │
│   └───────────────────────────────┘     │
│                                         │
│   ┌──────────┐       ┌──────────┐       │
│   │더 찾아보기│       │   ❤️     │       │
│   │  (무료)  │       │좋아요    │       │
│   │          │       │  (무료)  │       │
│   └──────────┘       └──────────┘       │
│                                         │
│              다음에 볼게요               │  ← 모달 닫기 (skip)
│                                         │
└─────────────────────────────────────────┘
    ↓
[좋아요] → POST /re-exposure/{id}/action (type: 'like')
    또는
[더 찾아보기] → POST /re-exposure/{id}/action (type: 'pass')
    또는
[다음에 볼게요] → POST /re-exposure/{id}/skip
    ↓
모달 닫힘 → 기존 홈 화면 유지 (프로필 카드 그대로)
```

### 3.3 여러 명의 재노출 대상 처리

**정책**: 앱 접속 시 한 명씩만 모달로 표시

| 옵션 | 설명 | 비고 |
| -- | -- | -- |
| **옵션 A** | 하루 최대 1회만 모달 표시 | 보수적 접근 |
| **옵션 B** | 하루 최대 3회까지 모달 표시 | 적극적 접근 |

> **개발자 선택 가능**: 서버 설정값으로 조절
>
> * 환경변수: `RE_EXPOSURE_DAILY_MODAL_LIMIT` (기본값: 1 또는 3)
> * 추후 A/B 테스트로 최적값 결정 가능

**동작 방식**:

1. 앱 접속 시 `GET /re-exposure/pending?limit=1` 호출
2. 대기 목록이 있고, 오늘 모달 표시 횟수 < limit이면 모달 표시
3. 모달에서 액션(좋아요/패스/스킵) 후 모달 닫힘
4. 다음 앱 접속 시 다음 대상 표시 (limit 내에서)

### 3.4 재노출 모달 UI (신규 컴포넌트)

> **핵심**: 모달 안에서 프로필 확인 + 좋아요/패스 처리. 기존 홈 화면 프로필 카드는 영향 없음.

```
┌─────────────────────────────────────────┐
│                                         │
│   💫 다시 만난 인연                      │
│                                         │
│   ┌───────────────────────────────┐     │
│   │                               │     │
│   │   [프로필 사진 - 큰 이미지]     │     │
│   │                               │     │
│   └───────────────────────────────┘     │
│                                         │
│   한밭대학교 · 23세 · ENFP               │
│                                         │
│   ✨ 새로 바뀐 부분                      │
│   • 사진 2장 추가                       │
│   • 관심사 수정                         │
│                                         │
│   ┌──────────┐       ┌──────────┐       │
│   │더 찾아보기│       │   ❤️     │       │
│   │  (무료)  │       │좋아요    │       │
│   └──────────┘       └──────────┘       │
│                                         │
│              다음에 볼게요               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 4\. 기술 요구사항

### 4.1 백엔드 - DB 스키마 (신규)

```sql
-- 프로필 업데이트 이력 테이블
CREATE TABLE profile_update_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  update_type VARCHAR(50) NOT NULL,  -- 'photo', 'interest', 'personality', 'dating_style'
  updated_at TIMESTAMP DEFAULT NOW(),
  re_exposure_triggered BOOLEAN DEFAULT false,
  re_exposure_count INT DEFAULT 0
);

-- 재노출 큐 테이블
CREATE TABLE re_exposure_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id UUID NOT NULL,      -- 프로필 업데이트한 유저
  target_user_id UUID NOT NULL,      -- 재노출 받을 유저
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,              -- created_at + 7일
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'viewed', 'actioned', 'expired', 'skipped'
  notification_sent BOOLEAN DEFAULT false,
  action_type VARCHAR(10),           -- 'like', 'pass' (action 후 기록)
  actioned_at TIMESTAMP,
  changes JSONB                      -- 변경된 항목 목록 {"photo": 2, "interest": true}
);

-- 재노출 쿨다운 테이블
CREATE TABLE re_exposure_cooldown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  last_exposed_at TIMESTAMP DEFAULT NOW(),
  next_available_at TIMESTAMP,       -- last_exposed_at + 30일
  UNIQUE(source_user_id, target_user_id)
);

-- 인덱스
CREATE INDEX idx_re_exposure_queue_target ON re_exposure_queue(target_user_id, status);
CREATE INDEX idx_re_exposure_queue_source ON re_exposure_queue(source_user_id);
CREATE INDEX idx_re_exposure_cooldown_pair ON re_exposure_cooldown(source_user_id, target_user_id);
```

### 4.2 백엔드 - API 엔드포인트 (신규)

| Method | Endpoint | 설명 | Request | Response |
| -- | -- | -- | -- | -- |
| POST | /re-exposure/trigger | 프로필 업데이트 시 재노출 트리거 | `{ changes: { photo?: number, interest?: boolean, personality?: boolean, datingStyle?: boolean } }` | `{ triggered: boolean, targetCount: number }` |
| GET | /re-exposure/pending | 내가 받은 재노출 1건 조회 | `?limit=1` | `{ item: ReExposureItem \| null, todayShownCount: number, dailyLimit: number }` |
| POST | /re-exposure/{id}/skip | 재노출 스킵 ("다음에 볼게요") | * 

 | `{ success: boolean }` |
| POST | /re-exposure/{id}/action | 좋아요 또는 패스 | `{ type: 'like' \| 'pass' }` | `{ success: boolean, isMutualLike?: boolean }` |

**GET /re-exposure/pending 응답 상세**:

```typescript
{
  item: ReExposureItem | null,  // 표시할 재노출 1건 (없으면 null)
  todayShownCount: number,      // 오늘 표시한 횟수
  dailyLimit: number,           // 서버 설정 일일 제한 (1 또는 3)
}
// 클라이언트는 todayShownCount < dailyLimit && item !== null 일 때만 모달 표시
```

### 4.3 백엔드 - 재노출 트리거 로직

```typescript
async function triggerReExposure(userId: string, changes: ProfileChanges) {
  // 1. 쿨다운 체크 (최근 30일 내 트리거 했는지 - 전체 기준)
  const lastTrigger = await getLastTriggerDate(userId);
  if (lastTrigger && daysSince(lastTrigger) < 30) {
    return { triggered: false, reason: 'cooldown' };
  }

  // 2. 재노출 대상 조회
  const targets = await getReExposureTargets(userId);
  // 조건:
  // - ILiked: 내가 좋아요 보냈지만 상대가 응답 안 한 유저 (status = 'PENDING')
  // - LikedMe: 나에게 좋아요 보냈지만 내가 거절한 유저 (status = 'REJECTED')
  // 제외:
  // - 상호 차단된 유저
  // - 이미 채팅 중인 유저 (status = 'OPEN' or 'IN_CHAT')

  // 3. 개별 쿨다운 필터링 (동일 유저 30일 제한)
  const filteredTargets = await filterByCooldown(userId, targets, 30);

  // 4. 최대 50명 제한
  const finalTargets = filteredTargets.slice(0, 50);

  // 5. 재노출 큐에 추가
  await addToReExposureQueue(userId, finalTargets, changes);

  // 6. 푸시 알림 발송
  await sendReExposureNotifications(userId, finalTargets);

  return { triggered: true, targetCount: finalTargets.length };
}
```

### 4.4 프론트엔드 - 신규 Feature 구조

```
src/features/re-exposure/
├── apis/
│   └── index.ts                    # API 호출 함수
├── hooks/
│   ├── use-re-exposure-trigger.ts  # 프로필 저장 시 트리거
│   ├── use-re-exposure-pending.ts  # 수신한 재노출 목록 조회
│   └── use-re-exposure-action.ts   # 좋아요/패스 액션
├── queries/
│   └── index.ts                    # TanStack Query 설정
├── types/
│   └── index.ts                    # 타입 정의
├── ui/
│   ├── re-exposure-modal.tsx       # "다시 만난 인연" 모달
│   ├── re-exposure-badge.tsx       # 프로필 카드 배지
│   └── re-exposure-changes.tsx     # 변경 사항 하이라이트
└── index.ts
```

### 4.5 프론트엔드 - 수정 필요 파일

| 파일 | 변경 내용 |
| -- | -- |
| `app/profile-edit/profile.tsx` | onFinish()에 재노출 트리거 로직 추가 |
| `app/home/index.tsx` | 재노출 모달 표시 로직 추가 (홈 진입 시 pending 조회) |
| `src/features/notification/types/notification.ts` | NotificationSubType에 'profile_update_re_exposure' 추가 |
| `src/shared/libs/notifications.ts` | 재노출 알림 딥링크 처리 추가 |
| `src/shared/constants/mixpanel-events.ts` | 재노출 관련 이벤트 추가 |

> ⚠️ **참고**: `partner.tsx` 수정 불필요 - 모달에서 직접 프로필 표시하므로 기존 홈 화면 프로필 카드 변경 없음

### 4.6 프론트엔드 - 타입 정의

```typescript
// src/features/re-exposure/types/index.ts

export interface ReExposureItem {
  id: string;
  sourceUser: {
    id: string;
    name: string;
    age: number;
    mainProfileUrl: string;
    universityName: string;
  };
  changes: {
    photo?: number;        // 변경된 사진 수
    interest?: boolean;
    personality?: boolean;
    datingStyle?: boolean;
  };
  createdAt: string;
  expiresAt: string;
}

export interface ReExposureProfile extends UserProfile {
  reExposureId: string;
  changes: ReExposureItem['changes'];
  isFreeAction: true;      // 무료 표시용
}

export type ReExposureActionType = 'like' | 'pass';
```

---

## 5\. 알림 설계

### 5.1 알림 타입 추가

```typescript
// src/features/notification/types/notification.ts

type NotificationSubType =
  | 'profile_view'
  | 'match_success'
  | 'new_profile'
  | 'chat_message'
  | 'chat_room_created'
  | 'system'
  | 'community_comment'
  | 'community_like'
  | 'match_like'
  | 'match_connection'
  | 'user_approval'
  | 'user_rejection'
  | 'profile_image_approved'
  | 'profile_image_rejected'
  | 'roulette_reminder'
  | 'profile_update_re_exposure';  // 신규 추가
```

### 5.2 푸시 알림 메시지

| 상황 | 메시지 |
| -- | -- |
| 기본 | "OO님이 프로필을 업데이트했어요, 한 번 더 봐보세요 👀" |
| 사진 변경 | "OO님이 새 사진을 올렸어요! 다시 확인해볼까요? 📸" |
| 관심사/성격 변경 | "OO님이 프로필을 바꿨어요. 어떻게 달라졌을까요? ✨" |

### 5.3 알림 빈도 제한

* 동일 유저로부터 → 30일 내 1회
* 전체 재노출 알림 → 1일 최대 3회

### 5.4 알림 딥링크

```typescript
// 알림 클릭 시 라우팅
redirectUrl: '/home?re_exposure_id={id}'
```

---

## 6\. Mixpanel 이벤트

```typescript
// src/shared/constants/mixpanel-events.ts 추가

export const RE_EXPOSURE_EVENTS = {
  // 발신자 (프로필 업데이트한 유저)
  RE_EXPOSURE_TRIGGERED: 're_exposure_triggered',

  // 수신자 (재노출 받은 유저)
  RE_EXPOSURE_NOTIFICATION_RECEIVED: 're_exposure_notification_received',
  RE_EXPOSURE_MODAL_SHOWN: 're_exposure_modal_shown',
  RE_EXPOSURE_ACCEPTED: 're_exposure_accepted',      // "다시 볼래요"
  RE_EXPOSURE_SKIPPED: 're_exposure_skipped',        // "다음에 볼게요"
  RE_EXPOSURE_LIKED: 're_exposure_liked',
  RE_EXPOSURE_PASSED: 're_exposure_passed',
  RE_EXPOSURE_MUTUAL_LIKE: 're_exposure_mutual_like', // 재노출로 상호 좋아요 성사
};
```

| 이벤트명 | 트리거 | 속성 |
| -- | -- | -- |
| re_exposure_triggered | 프로필 업데이트로 재노출 발동 | update_types\[\], target_count |
| re_exposure_notification_received | 푸시 알림 수신 | source_user_id |
| re_exposure_modal_shown | 재노출 모달 표시 | source_user_id |
| re_exposure_accepted | "다시 볼래요" 클릭 | source_user_id, changes |
| re_exposure_skipped | "다음에 볼게요" 클릭 | source_user_id |
| re_exposure_liked | 재노출 프로필에 좋아요 | source_user_id |
| re_exposure_passed | 재노출 프로필에 패스 | source_user_id |
| re_exposure_mutual_like | 재노출 통해 상호 좋아요 | source_user_id |

---

## 7\. 성공 지표

| 지표 | 목표 | 측정 방법 |
| -- | -- | -- |
| 재노출 수락률 | 40% 이상 | accepted / modal_shown |
| 재노출 → 좋아요 전환율 | 20% 이상 | liked / accepted |
| 재노출 → 상호 좋아요 | 10% 이상 | mutual_like / liked |
| 프로필 업데이트 증가 | 30% 증가 | 기능 런칭 전후 비교 |

---

## 8\. 리스크 및 대응

| 리스크 | 대응 방안 |
| -- | -- |
| 재노출 스팸 느낌 | 30일 쿨다운 + 1일 3회 알림 제한 |
| 프로필 살짝만 바꾸고 남용 | 최소 변경 기준 (사진 1장 또는 관심사/성격/연애스타일 중 1개 이상) |
| 재노출해도 또 패스 → 허탈감 | "새로 바뀐 부분" 하이라이트로 변화 강조 |
| 알림 피로도 | 설정에서 OFF 가능 + 빈도 제한 |
| 재노출 대상 없음 (신규 유저) | 조용히 무시 (토스트나 에러 없음) |

---

## 9\. 구현 우선순위

### Phase 1: 백엔드 기반 작업

1. DB 스키마 생성 (profile_update_history, re_exposure_queue, re_exposure_cooldown)
2. 재노출 트리거 API 개발 (POST /re-exposure/trigger)
3. 재노출 목록 조회 API 개발 (GET /re-exposure/pending)
4. 재노출 액션 API 개발 (view, skip, action)
5. 푸시 알림 발송 로직 추가

### Phase 2: 프론트엔드 기능 개발

1. src/features/re-exposure 모듈 생성
2. 재노출 모달 컴포넌트 개발
3. 프로필 수정 화면에 트리거 연동
4. 홈 화면에 재노출 모달 표시 로직 추가

### Phase 3: UI/UX 개선

1. 재노출 프로필 카드 배지 추가
2. 변경 사항 하이라이트 UI
3. 무료 표시 UI

### Phase 4: 분석 및 마무리

1. Mixpanel 이벤트 추가
2. 알림 타입 추가
3. QA 및 테스트

---

## 10\. 원본 PRD 대비 수정/보완 사항

| 항목 | 원본 PRD | 수정본 |
| -- | -- | -- |
| 자기소개 트리거 | ✅ 20자 이상 변경 | ❌ 제외 (편집 UI 없음) |
| 패스 이력 조회 | API 가정 | ✅ ILiked/LikedMe status 활용 |
| 구슬 무료 | 남성 좋아요 무료 | ✅ 남녀 모두 무료 확정 |
| 알림 서브타입 | 미정의 | ✅ 'profile_update_re_exposure' 추가 |
| 프론트 파일 구조 | 미정의 | ✅ FSD 아키텍처 기반 정의 |
| API 스펙 | 대략적 | ✅ Request/Response 구체화 |
| 기존 코드 연동 | 미정의 | ✅ 수정 필요 파일 목록화 |
| 표시 방식 | 확인 모달 → 프로필 카드 | ✅ 모달에서 직접 프로필 + 액션 처리 |
| 여러 명 처리 | 미정의 | ✅ 앱 접속 시 1명씩, 일일 제한 설정 가능 (1회 또는 3회) |
| 재노출 통계 | 추후 고려 | ✅ 프로필 저장 성공 시 모달로 "N명에게 다시 노출됩니다" 표시 |

---

## 11\. 추가 고려사항 (추후 버전)

* **재노출 프리미엄**: 유료로 쿨다운 단축 (30일 → 7일)
* **선택적 재노출**: 특정 유저에게만 재노출 (구슬 소비)
* **재노출 알림 설정**: 별도 ON/OFF 토글 추가
