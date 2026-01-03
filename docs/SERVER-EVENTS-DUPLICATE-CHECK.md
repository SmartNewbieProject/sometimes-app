# 서버 Mixpanel 이벤트 중복 분석 및 최종 권장사항

**작성일**: 2025-12-29
**목적**: 서버 구현 이벤트와 클라이언트 중복 제거

---

## 📊 서버 현재 구현 현황

### ✅ 구현 완료 (9개)

| 이벤트 | 클라이언트 중복 | 상태 | 권장사항 |
|--------|---------------|------|----------|
| **Matching_Execution_Completed** | ❌ 없음 | ✅ 유지 | 서버 전용 (매칭 파이프라인) |
| **Matching_Pipeline_Step** | ❌ 없음 | ✅ 유지 | 서버 전용 (파이프라인 단계) |
| **Vector_Search_Executed** | ❌ 없음 | ✅ 유지 | 서버 전용 (Qdrant 검색) |
| **Filter_Relaxation_Step** | ❌ 없음 | ✅ 유지 | 서버 전용 (지역 확장) |
| **Bidirectional_Filter_Executed** | ❌ 없음 | ✅ 유지 | 서버 전용 (양방향 필터) |
| **Matching_Pool_Snapshot** | ❌ 없음 | ✅ 유지 | 서버 전용 (풀 건강도) |
| **Matching_Failure_Analyzed** | ❌ 없음 | ✅ 유지 | 서버 전용 (실패 분석) |
| **Invite Click** | ✅ 있음 🚨 | 🔴 중복! | **서버는 로그만, Mixpanel tracking 제거** |
| **Invite Conversion** | ⚠️ 타입만 | 🟡 미구현 | **서버에서 구현 (회원가입 완료 시)** |

---

## 🚨 중복 발견: 초대 이벤트

### 1. Invite_Link_Clicked - 🔴 중복

#### 클라이언트 구현 (이미 있음)
**파일**: `src/features/invite/hooks/use-record-invite-click.ts:35`

```typescript
mixpanelAdapter.track(MIXPANEL_EVENTS.INVITE_LINK_CLICKED, {
  invite_code: variables.inviteCode,
  referrer: variables.referrer,
  device_type: getDeviceType(),
  click_id: data.clickId,
  timestamp: new Date().toISOString(),
});
```

**발송 시점**: API 응답 성공 시 (클라이언트)

#### 서버 구현 (계획 중)
- 현재 로그만 기록 중
- Mixpanel tracking 구현 예정이었음

#### ✅ 권장사항
**→ 서버는 Mixpanel tracking 하지 않음 (로그만 유지)**

**이유**:
1. 클라이언트가 이미 tracking 중
2. 클라이언트가 더 정확함 (실제 클릭 이벤트)
3. 서버는 API 호출만 기록 → 중복됨

**서버 코드**:
```typescript
// ❌ Mixpanel tracking 안 함
// ✅ 로그만 기록
export async function recordInviteClick(inviteCode: string, data: RecordClickRequest) {
  console.log('[Invite] Click recorded:', {
    inviteCode,
    deviceType: data.deviceType,
    referrer: data.referrer,
  });

  // DB에 클릭 기록만 저장
  const click = await InviteClick.create({
    inviteCode,
    deviceType: data.deviceType,
    sessionId: data.sessionId,
    referrer: data.referrer,
  });

  return { clickId: click.id };
}
```

---

### 2. Invite_Conversion_Completed - 🟡 미구현

#### 클라이언트 구현 (없음)
- 타입 정의만 있음 (`InviteLinkEventProperties`)
- 실제 tracking 코드 없음

#### 서버 구현 (필요)
**→ 서버에서 구현 (회원가입 완료 시)**

**이유**:
1. 회원가입 완료는 서버에서 확정
2. 초대 코드 검증도 서버에서 수행
3. 전환율 측정은 서버가 더 정확

**구현 위치**: `POST /api/v1/auth/signup`

```typescript
// ✅ 서버에서 구현
export async function signup(req: Request, res: Response) {
  const { inviteCode, ...userData } = req.body;

  // 1. 사용자 생성
  const user = await createUser(userData);

  // 2. 초대 코드 처리
  if (inviteCode) {
    const invite = await validateInviteCode(inviteCode);

    // 초대 코드 사용 기록
    await markInviteCodeUsed(inviteCode, user.id);

    // 🎯 초대 전환 완료 tracking (서버 전용)
    trackEvent('Invite_Conversion_Completed', user.id, {
      invite_code: inviteCode,
      inviter_id: invite.inviterId,
      invited_user_id: user.id,
      device_type: req.body.deviceType,
      signup_method: req.body.authMethod, // 'kakao' | 'apple' | 'pass'
      tracking_source: 'server', // 서버 이벤트 표시
    });

    // 추천인에게 리워드 지급
    await grantReferralReward(invite.inviterId, user.id);

    // 🎯 추천 리워드 지급 tracking
    trackEvent('Referral_Reward_Granted', invite.inviterId, {
      invited_user_id: user.id,
      reward_type: 'gem',
      reward_amount: 10,
    });
  }

  res.json({ success: true, userId: user.id });
}
```

---

## 📋 최종 권장사항

### ✅ 서버에서 유지할 이벤트 (8개)

#### 매칭 파이프라인 (7개) - 이미 구현됨
1. ✅ `Matching_Execution_Completed` - 매칭 성공/실패
2. ✅ `Matching_Pipeline_Step` - 파이프라인 단계
3. ✅ `Vector_Search_Executed` - 벡터 검색
4. ✅ `Filter_Relaxation_Step` - 지역 확장
5. ✅ `Bidirectional_Filter_Executed` - 양방향 필터
6. ✅ `Matching_Pool_Snapshot` - 풀 건강도 (Cron)
7. ✅ `Matching_Failure_Analyzed` - 실패 분석

#### 초대 전환 (1개) - 구현 필요
8. ✅ `Invite_Conversion_Completed` - 회원가입 완료 시

---

### 🔴 서버에서 제거할 이벤트 (1개)

| 이벤트 | 이유 | 대안 |
|--------|------|------|
| ❌ `Invite_Link_Clicked` | 클라이언트에서 이미 tracking | 로그만 기록 |

**수정 코드**:
```typescript
// 서버: src/controllers/invite.controller.ts

// ❌ 제거: Mixpanel tracking
// trackEvent('Invite_Link_Clicked', ...);

// ✅ 유지: DB 기록 및 로그
export async function recordInviteClick(req, res) {
  console.log('[Invite] Click recorded:', req.body);

  const click = await InviteClick.create({
    inviteCode: req.body.inviteCode,
    deviceType: req.body.deviceType,
  });

  // Mixpanel tracking은 클라이언트에서만
  res.json({ success: true, clickId: click.id });
}
```

---

### ✅ 서버에서 추가 구현할 이벤트 (26개)

**앞서 분석한 26개 이벤트**는 모두 유효함:
- Payment_Completed
- Subscription_Renewed
- Like_Received
- Like_Match_Created
- Matching_Success
- Day_1/7/30_Retention
- Chat_24h_Active
- 기타 19개

**+ Invite_Conversion_Completed 추가**

**총 27개** 서버 이벤트 구현 예정

---

## 📊 최종 이벤트 분포

```
총 194개 Mixpanel 이벤트
│
├── 클라이언트 (153개) - 79%
│   ✅ 사용자 액션, UI 이벤트
│   ✅ INVITE_LINK_CLICKED 포함
│
└── 서버 (41개) - 21%
    │
    ├── NestJS - 매칭 파이프라인 (7개) ✅ 구현됨
    │   ├── Matching_Execution_Completed
    │   ├── Matching_Pipeline_Step
    │   ├── Vector_Search_Executed
    │   ├── Filter_Relaxation_Step
    │   ├── Bidirectional_Filter_Executed
    │   ├── Matching_Pool_Snapshot
    │   └── Matching_Failure_Analyzed
    │
    ├── NestJS - 초대 (1개) 🔄 구현 필요
    │   └── Invite_Conversion_Completed
    │
    └── Node.js - 추가 구현 (26개) 🔄 예정
        ├── 최우선 (7개)
        ├── 높은 우선순위 (10개)
        └── 중간 우선순위 (9개)

    제거: Invite_Link_Clicked ❌ (클라이언트 중복)
```

---

## 💻 구현 코드

### ✅ Invite_Conversion_Completed 추가 (서버)

**파일**: 백엔드 회원가입 API

```typescript
import { trackEvent } from '@/libs/mixpanel';

/**
 * POST /api/v1/auth/signup
 * 회원가입 API - 초대 전환 tracking 추가
 */
export async function signup(req: Request, res: Response) {
  try {
    const { inviteCode, authMethod, deviceType, ...userData } = req.body;

    // 1. 사용자 생성
    const user = await createUser(userData);

    // 2. 기본 회원가입 완료 tracking
    trackEvent('Signup_done', user.id, {
      signup_method: authMethod,
      profile_completion_rate: calculateCompletionRate(user),
      has_invite_code: !!inviteCode,
    });

    // 3. 초대 코드 처리
    if (inviteCode) {
      try {
        // 초대 코드 검증
        const invite = await validateInviteCode(inviteCode);

        // 초대 코드 사용 기록
        await markInviteCodeUsed(inviteCode, user.id);

        // 🎯 초대 전환 완료 tracking (서버 전용)
        trackEvent('Invite_Conversion_Completed', user.id, {
          invite_code: inviteCode,
          inviter_id: invite.inviterId,
          invited_user_id: user.id,
          device_type: deviceType || 'unknown',
          signup_method: authMethod,
          tracking_source: 'server', // 서버 이벤트 표시
        });

        // 추천인에게 리워드 지급
        await grantReferralReward(invite.inviterId, user.id);

        // 🎯 추천 리워드 지급 tracking
        trackEvent('Referral_Reward_Granted', invite.inviterId, {
          invited_user_id: user.id,
          invite_code: inviteCode,
          reward_type: 'gem',
          reward_amount: 10,
        });

        console.log('[Invite] Conversion completed:', {
          userId: user.id,
          inviteCode,
          inviterId: invite.inviterId,
        });
      } catch (inviteError) {
        // 초대 코드 오류는 회원가입 자체는 진행
        console.error('[Invite] Code validation failed:', inviteError);
      }
    }

    res.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
```

---

### ❌ Invite_Link_Clicked 제거 (서버)

**현재 상태**: 로그만 기록 중
**권장사항**: Mixpanel tracking 추가하지 않음

```typescript
// 서버: POST /api/v1/invite/click

// ✅ 현재 상태 유지 (로그 + DB 기록만)
export async function recordInviteClick(req: Request, res: Response) {
  const { inviteCode, deviceType, sessionId, referrer } = req.body;

  // DB에 클릭 기록 저장
  const click = await InviteClick.create({
    inviteCode,
    deviceType,
    sessionId,
    referrer,
    clickedAt: new Date(),
  });

  console.log('[Invite] Click recorded:', {
    clickId: click.id,
    inviteCode,
    deviceType,
  });

  // ❌ Mixpanel tracking 안 함 (클라이언트에서 이미 함)
  // 이유: 클라이언트가 API 응답 받은 후 tracking (use-record-invite-click.ts:35)

  res.json({
    success: true,
    clickId: click.id,
  });
}
```

---

## 📊 중복 분석 상세

### Invite_Link_Clicked 중복 분석

**클라이언트 흐름**:
```
1. 사용자가 초대 링크 클릭
2. 앱 실행 (Deep Link)
3. API 호출: POST /api/v1/invite/click
4. API 응답 성공
5. 🎯 클라이언트에서 Mixpanel tracking (use-record-invite-click.ts:35)
```

**서버 흐름**:
```
1. API 호출 받음: POST /api/v1/invite/click
2. DB에 클릭 기록 저장
3. 응답 반환
4. ❌ Mixpanel tracking 안 함 (중복 방지)
```

**결론**: 클라이언트 tracking으로 충분. 서버는 DB 기록만.

---

### Invite_Conversion_Completed 분석

**클라이언트 구현**: ❌ 없음 (타입만 정의됨)

**서버 구현 필요성**:
- ✅ 회원가입 완료는 서버에서 확정
- ✅ 초대 코드 검증은 서버에서 수행
- ✅ 리워드 지급도 서버에서 처리

**결론**: 서버에서 구현 필요 ✅

---

## 🎯 최종 서버 이벤트 목록

### ✅ 이미 구현됨 (7개 + 0개)

| 이벤트 | 구현 위치 | 중복 |
|--------|----------|------|
| Matching_Execution_Completed | NestJS | ✅ 없음 |
| Matching_Pipeline_Step | NestJS | ✅ 없음 |
| Vector_Search_Executed | NestJS | ✅ 없음 |
| Filter_Relaxation_Step | NestJS | ✅ 없음 |
| Bidirectional_Filter_Executed | NestJS | ✅ 없음 |
| Matching_Pool_Snapshot | NestJS | ✅ 없음 |
| Matching_Failure_Analyzed | NestJS | ✅ 없음 |

**제거**: Invite_Link_Clicked ❌

---

### 🔄 구현 예정 (27개)

#### 최우선 (7개 + 1개 = 8개)
1. Payment_Completed
2. Subscription_Renewed
3. Like_Received
4. Like_Match_Created
5. Matching_Success
6. Day_1/7/30_Retention
7. Chat_24h_Active
8. **Invite_Conversion_Completed** ⭐ 추가

#### 높은 우선순위 (10개 - 1개 = 9개)
- First_Message_Received
- Chat_Response
- Match_Conversation_Rate
- Signup_done
- University_Verification_Started
- University_Verification_Completed
- Account_Reactivated
- **~~Referral_Signup_Completed~~** (Invite_Conversion과 동일, 중복)
- Referral_Reward_Granted
- Match_Request_Sent

#### 중간 우선순위 (9개)
- Rematch_Purchased
- Subscription_Started
- Subscription_Cancelled
- Revenue_Per_User
- Community_Daily_Active_Users
- Community_Feed_Viewed
- Community_Post_Reported
- Community_Post_Deleted
- User_Metrics_Updated

**총 27개** (8 + 9 + 9 + 1개 NestJS 추가)

---

## 🔧 수정 액션 플랜

### 1. 서버 코드 수정

#### NestJS - Invite Click 제거
**파일**: 백엔드 초대 API

```typescript
// ❌ 제거할 코드 (있다면)
// trackEvent('Invite_Link_Clicked', ...);

// ✅ 유지할 코드
console.log('[Invite] Click recorded');
await InviteClick.create({ ... });
```

#### NestJS - Invite Conversion 추가
**파일**: 백엔드 회원가입 API

```typescript
// ✅ 추가할 코드
if (inviteCode) {
  trackEvent('Invite_Conversion_Completed', user.id, {
    invite_code: inviteCode,
    inviter_id: invite.inviterId,
    signup_method: authMethod,
  });
}
```

---

### 2. 클라이언트 수정 (없음)

**결론**: 클라이언트는 수정 불필요 ✅
- `INVITE_LINK_CLICKED`는 그대로 유지
- `INVITE_CONVERSION_COMPLETED`는 타입만 정의됨 (사용 안 함)

---

## 📊 중복 제거 전/후 비교

### Before (중복 있음)

| 이벤트 | 클라이언트 | 서버 | 중복 |
|--------|-----------|------|------|
| Invite_Link_Clicked | ✅ tracking | 🔄 tracking 계획 | 🔴 중복! |
| Invite_Conversion_Completed | ❌ 없음 | ❌ 없음 | - |

### After (중복 제거)

| 이벤트 | 클라이언트 | 서버 | 중복 |
|--------|-----------|------|------|
| Invite_Link_Clicked | ✅ tracking | ❌ 로그만 | ✅ 없음 |
| Invite_Conversion_Completed | ❌ 없음 | ✅ tracking | ✅ 없음 |

---

## 🚀 구현 우선순위 (수정)

### Phase 1: 최우선 (1-2주) - **8개**

| # | 이벤트 | 구현 위치 | 변경사항 |
|---|--------|----------|----------|
| 1 | Payment_Completed | 결제 검증 API | - |
| 2 | Subscription_Renewed | Webhook/Cron | - |
| 3 | Like_Received | 좋아요 API | - |
| 4 | Like_Match_Created | 좋아요 API | - |
| 5 | Matching_Success | 매칭 API | - |
| 6 | Day_1/7/30_Retention | Cron (3AM) | - |
| 7 | Chat_24h_Active | Cron (4AM) | - |
| 8 | **Invite_Conversion_Completed** | 회원가입 API | ⭐ 추가 |

---

### Phase 2: 높은 우선순위 (2-3주) - **9개**

| # | 이벤트 | 변경사항 |
|---|--------|----------|
| 1 | First_Message_Received | - |
| 2 | Chat_Response | - |
| 3 | Match_Conversation_Rate | - |
| 4 | Signup_done | - |
| 5 | University_Verification_Started | - |
| 6 | University_Verification_Completed | - |
| 7 | Account_Reactivated | - |
| 8 | Referral_Reward_Granted | - |
| 9 | Match_Request_Sent | - |

**제거**: ~~Referral_Signup_Completed~~ (Invite_Conversion과 중복)

---

## 📋 체크리스트

### ✅ 서버 수정사항
- [ ] Invite Click API에서 Mixpanel tracking 제거 확인
- [ ] 회원가입 API에 Invite_Conversion_Completed 추가
- [ ] Referral_Reward_Granted tracking 추가

### ✅ 클라이언트 확인사항
- [x] INVITE_LINK_CLICKED 구현 확인 완료
- [x] 중복 없음 확인 완료

---

## 💡 추가 분석 필요 사항

### 1. 사용자 프로필 속성 (People API)

**서버 구현 내용** (전달받은 정보):
- 사용자 프로필 자동 업데이트
- total_matches++, successful_matches++
- 리텐션 속성 자동 저장

**클라이언트와 중복 여부**: 확인 필요

```typescript
// 서버: 사용자 프로필 업데이트
mixpanel.people.set(userId, {
  $name: user.name,
  $email: user.email,
  total_matches: count,
  successful_matches: successCount,
  day_1_retention: true,
});
```

**권장사항**:
- ✅ 서버에서만 People API 사용
- 이유: 일관성, 보안, 집계 정확성
- 클라이언트는 이벤트만 tracking

---

### 2. Referral_Signup_Completed vs Invite_Conversion_Completed

**분석**:
- `Invite_Conversion_Completed` - 초대 링크로 가입 완료
- `Referral_Signup_Completed` - 추천 프로그램으로 가입 완료

**차이점**:
- 같은 의미로 보임 (초대 = 추천)
- 중복 가능성 높음

**권장사항**:
- ✅ `Invite_Conversion_Completed` 사용 (이미 정의됨)
- ❌ `Referral_Signup_Completed` 제거 (중복)

---

## 📄 최종 정리 문서

### 서버 전용 이벤트 (최종)

**이미 구현됨 (7개)**:
1. Matching_Execution_Completed
2. Matching_Pipeline_Step
3. Vector_Search_Executed
4. Filter_Relaxation_Step
5. Bidirectional_Filter_Executed
6. Matching_Pool_Snapshot
7. Matching_Failure_Analyzed

**추가 구현 필요 (27개)**:
- Phase 1: 8개 (Invite_Conversion 추가)
- Phase 2: 9개 (Referral_Signup 제거)
- Phase 3: 9개

**제거 (1개)**:
- ❌ Invite_Link_Clicked (클라이언트 중복)

**총 34개** 서버 이벤트 (7 + 27)

---

## 🚀 다음 단계

### 즉시 수정
```typescript
// 1. 서버: Invite Click API
// ❌ Mixpanel tracking 제거 (또는 추가하지 않음)

// 2. 서버: 회원가입 API
// ✅ Invite_Conversion_Completed tracking 추가
```

### Week 1 구현
- Payment_Completed
- Like_Received, Like_Match_Created, Matching_Success
- **Invite_Conversion_Completed** ⭐

### Week 2 구현
- Subscription_Renewed
- Day_1/7/30_Retention
- Chat_24h_Active

---

**요약**:
- ✅ **7개 매칭 이벤트**: 클라이언트 중복 없음, 그대로 유지
- ❌ **Invite Click**: 클라이언트 중복, 서버 tracking 안 함
- ✅ **Invite Conversion**: 서버 구현 필요 (Phase 1에 추가)
- **최종 서버 이벤트**: 34개 (7 구현됨 + 27 예정)
