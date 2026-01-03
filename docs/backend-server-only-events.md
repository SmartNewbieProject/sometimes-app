# 백엔드 서버 전용 Mixpanel 이벤트 구현 가이드

**작성일**: 2025-12-29
**목적**: 클라이언트 이벤트와 중복 없이 서버 전용 이벤트만 추가

---

## 🎯 중복 방지 원칙

### ✅ 서버에서만 구현하는 이벤트 (절대 중복 없음)
1. **상대방 액션** - 클라이언트는 본인 액션만 tracking
2. **양방향 확인** - 서버에서만 전체 상태 파악
3. **시간 기반 집계** - Cron Job 배치 작업
4. **Webhook 이벤트** - 외부 시스템 콜백
5. **보안 검증** - PG사 검증 등 서버 필수

### ❌ 클라이언트와 중복 가능한 이벤트 (서버 구현 안 함)
- `Like_Sent` - 클라이언트에서 이미 구현됨
- `Chat_Started` - 클라이언트에서 이미 구현됨
- `Payment_Initiated` - 클라이언트에서 이미 구현됨
- 기타 사용자 직접 액션은 모두 클라이언트 tracking

---

## 📊 서버 전용 이벤트 목록 (30개)

### 🔴 최우선 순위 (1-2주) - 7개

| # | 이벤트명 | 구현 위치 | 중복 없는 이유 |
|---|---------|----------|---------------|
| 1 | `Payment_Completed` | 결제 검증 API | ✅ PG사 콜백 검증 후 확정. 보안상 서버 필수 |
| 2 | `Subscription_Renewed` | Webhook/Cron | ✅ 자동 갱신은 서버만 감지 가능 |
| 3 | `Like_Received` | 좋아요 API | ✅ **상대방**이 받음. 클라이언트 불가 |
| 4 | `Like_Match_Created` | 좋아요 API | ✅ 양방향 확인 필요. 서버만 가능 |
| 5 | `Matching_Success` | 매칭 API | ✅ 매칭 알고리즘이 서버에서 실행 |
| 6 | `Day_1/7/30_Retention` | Cron Job | ✅ 시간 기반 집계. 배치 작업 필수 |
| 7 | `Chat_24h_Active` | Cron Job | ✅ 24시간 집계. 배치 작업 필수 |

---

## 💻 구현 코드 (중복 제거 버전)

### 1️⃣ 결제 검증 - Payment_Completed

**⚠️ 중요**: 클라이언트의 `Payment_Completed` 제거 권장 (보안상 서버만 사용)

**파일**: `src/controllers/payment.controller.ts`

```typescript
import { trackEvent } from '@/libs/mixpanel';

/**
 * POST /api/v1/payment/verify
 * PG사 콜백 검증 - 서버만 tracking
 */
export async function verifyPayment(req: Request, res: Response) {
  const { transactionId, paymentId, amount, method, userId } = req.body;

  // 1. PG사 검증
  const verified = await verifyPGCallback({ transactionId, paymentId, amount });
  if (!verified) {
    return res.status(400).json({ success: false, error: 'Verification failed' });
  }

  // 2. DB 업데이트
  await updatePaymentStatus(transactionId, 'completed');

  // 3. 첫 구매 여부 확인
  const isFirstPurchase = await checkIsFirstPurchase(userId);

  // 4. 🎯 서버 전용 tracking (클라이언트와 중복 없음)
  trackEvent(
    isFirstPurchase ? 'Payment_First_Purchase' : 'Payment_Completed',
    userId,
    {
      transaction_id: transactionId,
      payment_id: paymentId,
      total_amount: amount,
      payment_method: method,
      payment_provider: 'portone',
      is_first_purchase: isFirstPurchase,
      verified_at_server: true, // 서버 검증 표시
    }
  );

  res.json({ success: true });
}
```

**클라이언트 수정사항**:
```typescript
// ❌ 제거: use-portone.tsx의 Payment_Completed tracking
// 이유: 서버에서만 검증 후 tracking하므로 중복 방지

// ✅ 유지: Payment_Initiated, Payment_Failed, Payment_Cancelled
// 이유: 클라이언트에서만 감지 가능
```

---

### 2️⃣ 좋아요 수신 & 매칭 성사

**클라이언트 vs 서버 역할 구분**:
- 클라이언트: `Like_Sent` (본인이 보냄) ✅ 이미 구현됨
- 서버: `Like_Received` (상대방이 받음) ✅ 서버 전용
- 서버: `Like_Match_Created` (상호 매칭) ✅ 서버 전용

**파일**: `src/controllers/like.controller.ts`

```typescript
import { trackEvent } from '@/libs/mixpanel';

/**
 * POST /api/v1/likes
 * 좋아요 생성 - 서버 전용 이벤트만 tracking
 */
export async function sendLike(req: Request, res: Response) {
  const senderId = req.user.id;
  const { targetUserId, likeType } = req.body;

  // 1. 좋아요 생성
  const like = await createLike({ senderId, targetUserId, likeType });

  // 2. 🎯 상대방 좋아요 수신 tracking (서버 전용)
  trackEvent('Like_Received', targetUserId, {
    source_profile_id: senderId,
    like_type: likeType,
    received_at_server: true, // 서버 이벤트 표시
  });

  // 3. 상호 좋아요 확인
  const isMutualLike = await checkMutualLike(senderId, targetUserId);
  let matchId: string | null = null;

  if (isMutualLike) {
    const match = await createMatch(senderId, targetUserId);
    matchId = match.id;

    // 4. 🎯 매칭 성사 tracking (서버 전용, 양쪽 모두)
    trackEvent('Like_Match_Created', senderId, {
      target_profile_id: targetUserId,
      match_id: matchId,
      is_mutual: true,
      like_type: likeType,
      matched_at_server: true,
    });

    trackEvent('Like_Match_Created', targetUserId, {
      target_profile_id: senderId,
      match_id: matchId,
      is_mutual: true,
      like_type: likeType,
      matched_at_server: true,
    });

    // 5. 🎯 매칭 성공 tracking (서버 전용)
    trackEvent('Matching_Success', senderId, {
      match_id: matchId,
      partner_id: targetUserId,
      matching_type: 'like',
    });

    trackEvent('Matching_Success', targetUserId, {
      match_id: matchId,
      partner_id: senderId,
      matching_type: 'like',
    });
  }

  // ✅ API 응답에 isMatch 포함 (클라이언트가 사용)
  res.json({
    success: true,
    isMatch: isMutualLike,
    matchId,
  });
}
```

**클라이언트는 건드리지 않음**:
```typescript
// ✅ 유지: use-like.tsx의 Like_Sent tracking
// 이유: 본인 액션이므로 클라이언트에서 tracking 적합
```

---

### 3️⃣ 구독 자동 갱신 - Subscription_Renewed

**클라이언트 vs 서버**:
- 클라이언트: `Subscription_Started`, `Subscription_Cancelled` (사용자 직접 액션)
- 서버: `Subscription_Renewed` (자동 갱신, Webhook) ✅ 서버 전용

**파일**: `src/webhooks/subscription.webhook.ts`

```typescript
import { trackEvent } from '@/libs/mixpanel';

/**
 * POST /api/v1/webhooks/subscription/renew
 * PG사 구독 갱신 Webhook - 서버 전용
 */
export async function handleSubscriptionRenew(req: Request, res: Response) {
  const { userId, subscriptionId, billingDate, amount, tier } = req.body;

  // 1. 서명 검증
  const isValid = verifyWebhookSignature(req);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. DB 업데이트
  await updateSubscriptionStatus(subscriptionId, {
    status: 'active',
    nextBillingDate: calculateNextBillingDate(billingDate),
  });

  // 3. 🎯 서버 전용 tracking
  trackEvent('Subscription_Renewed', userId, {
    subscription_id: subscriptionId,
    subscription_tier: tier,
    renewal_amount: amount,
    billing_date: billingDate,
    renewal_count: await getSubscriptionRenewalCount(subscriptionId),
    renewed_via_webhook: true, // Webhook 이벤트 표시
  });

  res.json({ success: true });
}
```

---

### 4️⃣ 리텐션 코호트 - Day_1/7/30_Retention

**클라이언트 vs 서버**:
- 클라이언트: 리텐션 tracking 불가능 (가입일 기준 계산 필요)
- 서버: `Day_1/7/30_Retention` (Cron Job) ✅ 서버 전용

**파일**: `src/jobs/retention.job.ts`

```typescript
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';

/**
 * 매일 오전 3시 실행 - 서버 전용 배치 작업
 */
export function setupRetentionTracking() {
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron] Running retention tracking...');

    const today = new Date();
    const usersToCheck = await User.findAll({
      where: {
        signupDate: {
          $in: [
            calculateDate(today, -1),   // Day 1
            calculateDate(today, -3),   // Day 3
            calculateDate(today, -7),   // Day 7
            calculateDate(today, -30),  // Day 30
          ],
        },
      },
    });

    for (const user of usersToCheck) {
      const days = calculateDaysSinceSignup(user.signupDate);

      const retentionData = {
        days_since_signup: days,
        first_match_achieved: await hasUserMatch(user.id),
        first_message_sent: await hasUserSentMessage(user.id),
        matches_count: await getUserMatchesCount(user.id),
        has_purchased: await hasUserPurchased(user.id),
        tracked_via_cron: true, // Cron Job 표시
      };

      // 🎯 서버 전용 tracking
      if (days === 1) {
        trackEvent('Day_1_Retention', user.id, retentionData);
      } else if (days === 3) {
        trackEvent('Day_3_Retention', user.id, retentionData);
      } else if (days === 7) {
        trackEvent('Day_7_Retention', user.id, retentionData);
      } else if (days === 30) {
        trackEvent('Day_30_Retention', user.id, retentionData);
      }
    }

    console.log(`Retention tracked for ${usersToCheck.length} users`);
  });
}

// 유틸리티 함수
function calculateDate(baseDate: Date, daysOffset: number): Date {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
}

function calculateDaysSinceSignup(signupDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - signupDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
```

**앱 시작 시 등록** (`src/index.ts`):
```typescript
import { setupRetentionTracking } from '@/jobs/retention.job';

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // 🎯 Cron Job 등록 (서버 전용)
  setupRetentionTracking();
});
```

---

### 5️⃣ 24시간 활성 대화 - Chat_24h_Active

**클라이언트 vs 서버**:
- 클라이언트: `Chat_Started`, `Chat_Message_Sent`, `Chat_Ended` (실시간 이벤트)
- 서버: `Chat_24h_Active` (24시간 집계) ✅ 서버 전용

**파일**: `src/jobs/chat-activity.job.ts`

```typescript
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';

/**
 * 매일 오전 4시 실행 - 서버 전용 배치 작업
 */
export function setupChatActivityTracking() {
  cron.schedule('0 4 * * *', async () => {
    console.log('[Cron] Running chat activity tracking...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 어제 생성된 채팅방 조회
    const chatRooms = await ChatRoom.findAll({
      where: {
        createdAt: { $gte: yesterday, $lt: today },
      },
    });

    for (const room of chatRooms) {
      const { userId1, userId2, matchId } = room;

      // 24시간 내 메시지 조회
      const messages = await Message.findAll({
        where: {
          chatRoomId: room.id,
          createdAt: { $gte: yesterday, $lt: today },
        },
      });

      const user1Messages = messages.filter((m) => m.senderId === userId1);
      const user2Messages = messages.filter((m) => m.senderId === userId2);

      const isActive = messages.length > 0;
      const isMutual = user1Messages.length > 0 && user2Messages.length > 0;

      let activityStatus: 'inactive' | 'active' | 'mutual' | 'one_sided';
      if (!isActive) {
        activityStatus = 'inactive';
      } else if (isMutual) {
        activityStatus = 'mutual';
      } else {
        activityStatus = 'one_sided';
      }

      const baseData = {
        chat_room_id: room.id,
        match_id: matchId,
        is_active: isActive,
        is_mutual_conversation: isMutual,
        activity_status: activityStatus,
        total_message_count: messages.length,
        tracking_source: 'batch', // 배치 작업 표시
      };

      // 🎯 서버 전용 tracking (양쪽 모두)
      trackEvent('Chat_24h_Active', userId1, {
        ...baseData,
        chat_partner_id: userId2,
        my_message_count: user1Messages.length,
        partner_message_count: user2Messages.length,
      });

      trackEvent('Chat_24h_Active', userId2, {
        ...baseData,
        chat_partner_id: userId1,
        my_message_count: user2Messages.length,
        partner_message_count: user1Messages.length,
      });
    }

    console.log(`Chat activity tracked for ${chatRooms.length} rooms`);
  });
}
```

---

## 📋 중복 방지 체크리스트

### ✅ 서버만 구현 (클라이언트와 절대 중복 없음)

| 이벤트 | 클라이언트 | 서버 | 이유 |
|--------|-----------|------|------|
| `Payment_Completed` | ❌ 제거 권장 | ✅ 구현 | PG사 검증은 서버만 가능 |
| `Subscription_Renewed` | ❌ 불가능 | ✅ 구현 | Webhook/Cron 전용 |
| `Like_Received` | ❌ 불가능 | ✅ 구현 | 상대방 액션 |
| `Like_Match_Created` | ❌ 불가능 | ✅ 구현 | 양방향 확인 필요 |
| `Matching_Success` | ❌ 불가능 | ✅ 구현 | 매칭 알고리즘 서버 실행 |
| `Day_1/7/30_Retention` | ❌ 불가능 | ✅ 구현 | Cron Job 전용 |
| `Chat_24h_Active` | ❌ 불가능 | ✅ 구현 | 시간 집계 필요 |

### ✅ 클라이언트만 구현 (서버 구현 안 함)

| 이벤트 | 클라이언트 | 서버 | 이유 |
|--------|-----------|------|------|
| `Like_Sent` | ✅ 구현됨 | ❌ 안 함 | 본인 액션, 실시간 |
| `Chat_Started` | ✅ 구현됨 | ❌ 안 함 | 본인 액션, 실시간 |
| `Chat_Message_Sent` | ✅ 구현됨 | ❌ 안 함 | 본인 액션, 실시간 |
| `Payment_Initiated` | ✅ 구현됨 | ❌ 안 함 | 본인 액션, 실시간 |
| `Payment_Failed` | ✅ 구현됨 | ❌ 안 함 | 클라이언트만 감지 |
| `Payment_Cancelled` | ✅ 구현됨 | ❌ 안 함 | 본인 액션 |

---

## 🔧 클라이언트 수정사항 (선택적)

### 1. Payment_Completed 제거 (권장)

**파일**: `src/features/payment/hooks/use-portone.tsx`

```typescript
// ❌ 제거: 중복 방지
// paymentEvents.trackPaymentCompleted(...)

// ✅ 유지: 클라이언트 전용 이벤트
// Payment_Initiated - 결제 시작
// Payment_Failed - 결제 실패
// Payment_Cancelled - 결제 취소
```

**이유**:
- `Payment_Completed`는 서버에서 PG사 검증 후 tracking
- 클라이언트는 조작 가능하므로 보안상 서버만 사용
- 중복 tracking 방지

---

## 📊 서버 전용 이벤트 전체 목록

### 최우선 (7개) - 즉시 구현
1. ✅ `Payment_Completed` - 결제 검증 API
2. ✅ `Subscription_Renewed` - Webhook/Cron
3. ✅ `Like_Received` - 좋아요 API
4. ✅ `Like_Match_Created` - 좋아요 API
5. ✅ `Matching_Success` - 매칭 API
6. ✅ `Day_1/7/30_Retention` - Cron Job
7. ✅ `Chat_24h_Active` - Cron Job

### 높은 우선순위 (10개) - 2-3주
8. `First_Message_Received` - WebSocket
9. `Chat_Response` - WebSocket
10. `Match_Conversation_Rate` - Cron
11. `Signup_done` - 회원가입 API
12. `University_Verification_Started` - 인증 API
13. `University_Verification_Completed` - 인증 API
14. `Account_Reactivated` - 계정 API
15. `Referral_Signup_Completed` - 추천 API
16. `Referral_Reward_Granted` - 리워드 API
17. `Match_Request_Sent` - 매칭 API

### 중간 우선순위 (13개) - 1개월
18-30. 나머지 서버 이벤트 (구독, 커뮤니티, 매칭 등)

---

## 🚀 구현 순서

### Week 1: API Tracking (4개)
```bash
# 1. 결제 검증
src/controllers/payment.controller.ts
→ verifyPayment() 함수에 trackEvent() 추가

# 2. 좋아요 & 매칭
src/controllers/like.controller.ts
→ sendLike() 함수에 Like_Received, Like_Match_Created 추가

src/controllers/matching.controller.ts
→ createMatching() 함수에 Matching_Success 추가
```

### Week 2: Webhook & Cron Jobs (3개)
```bash
# 3. 구독 갱신 Webhook
src/webhooks/subscription.webhook.ts
→ handleSubscriptionRenew() 생성

# 4. 리텐션 Cron Job
src/jobs/retention.job.ts
→ setupRetentionTracking() 생성
→ src/index.ts에 등록

# 5. 채팅 활성도 Cron Job
src/jobs/chat-activity.job.ts
→ setupChatActivityTracking() 생성
→ src/index.ts에 등록
```

---

## ✅ 검증 방법

### 1. 중복 확인
```typescript
// Mixpanel에서 동일 이벤트 검색
// distinct_id와 timestamp가 거의 동일하면 중복

// 서버 이벤트 확인 필드
{
  verified_at_server: true,
  received_at_server: true,
  matched_at_server: true,
  tracked_via_cron: true,
  renewed_via_webhook: true,
}
```

### 2. 로그 확인
```bash
# 서버 로그
[Mixpanel] Tracking "Payment_Completed" for user "user-123"
[Mixpanel] Properties: { verified_at_server: true, ... }

# 클라이언트 로그 (제거 확인)
# Payment_Completed 로그가 없어야 함
```

### 3. Mixpanel Live View
1. Mixpanel → Live View
2. 이벤트 필터: `Payment_Completed`
3. 속성 확인: `verified_at_server: true` 있는지
4. 중복 확인: 동일 user + timestamp 없는지

---

## 📞 요약

### 서버에서 구현할 것 (30개)
- ✅ 최우선 7개 (1-2주)
- 🟡 높은 우선순위 10개 (2-3주)
- 🟢 중간 우선순위 13개 (1개월)

### 클라이언트는 건드리지 않음
- ✅ 기존 123개 이벤트 그대로 유지
- ❌ `Payment_Completed`만 선택적으로 제거 (보안상 권장)

### 중복 방지 전략
- ✅ 서버 전용 필드 추가 (`verified_at_server`, `tracked_via_cron` 등)
- ✅ 클라이언트는 실시간 액션만
- ✅ 서버는 상대방 액션, 양방향 확인, 시간 집계만

---

**다음 스텝**: Week 1 코드부터 복사-붙여넣기로 구현 시작! 🚀
