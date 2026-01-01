# 서버 전용 Mixpanel 이벤트 최종 목록 (중복 제거 완료)

**작성일**: 2025-12-29
**상태**: ✅ 클라이언트 중복 제거 완료
**총 이벤트**: 26개 (클라이언트와 완전히 분리됨)

---

## ✅ 중복 제거 완료

### 제거한 클라이언트 코드 (4곳)

| 파일 | 제거한 이벤트 | Line |
|------|-------------|------|
| `src/features/payment/hooks/use-portone.tsx` | `Payment_Completed` (2번) | 102-116 |
| `src/features/payment/ui/apple-gem-store/apple-gem-store.tsx` | `Payment_Completed` | 68-74 |
| `src/features/payment/ui/port-one-payment.tsx` | `Payment_Completed` | 71-76 |
| `src/features/like/hooks/use-like.tsx` | `Matching_Success` | 41-44 |

### 수정한 클라이언트 코드 (1곳)

| 파일 | 수정 내용 | Line |
|------|----------|------|
| `src/features/like/queries/use-liked-me-query.tsx` | `tracking_source: 'client_polling'` 추가 | 40 |

---

## 🎯 서버에서만 구현할 이벤트 (26개)

### 🔴 최우선 순위 (즉시 구현 - 7개)

#### 1. 결제 도메인 (2개)

| 이벤트 | API 엔드포인트 | 구현 내용 |
|--------|---------------|----------|
| **Payment_Completed** | `POST /api/v1/payment/verify` | PG사 콜백 검증 후 tracking<br>**중복 제거됨**: 클라이언트 3곳 제거 완료 ✅ |
| **Subscription_Renewed** | Webhook 또는 Cron | 자동 갱신 시 tracking |

```typescript
// POST /api/v1/payment/verify
export async function verifyPayment(req, res) {
  const verified = await verifyPGCallback(transactionId);

  if (verified) {
    await updatePaymentStatus(transactionId, 'completed');

    // 🎯 서버 전용 tracking (클라이언트 중복 제거됨)
    const isFirstPurchase = await checkIsFirstPurchase(userId);
    trackEvent(
      isFirstPurchase ? 'Payment_First_Purchase' : 'Payment_Completed',
      userId,
      {
        transaction_id: transactionId,
        total_amount: amount,
        payment_method: method,
        is_first_purchase: isFirstPurchase,
        verified_at_server: true,
      }
    );
  }
}
```

---

#### 2. 좋아요/매칭 도메인 (3개)

| 이벤트 | API 엔드포인트 | 구현 내용 |
|--------|---------------|----------|
| **Like_Received** | `POST /api/v1/likes` | 상대방 좋아요 수신 (실시간)<br>**병행**: 클라이언트 polling도 유지 (구분자로 관리) |
| **Like_Match_Created** | `POST /api/v1/likes` | 상호 좋아요 매칭 성사 |
| **Matching_Success** | `POST /api/v1/likes` (매칭 시) | 매칭 성공<br>**중복 제거됨**: 클라이언트 제거 완료 ✅ |

```typescript
// POST /api/v1/likes
export async function sendLike(req, res) {
  const senderId = req.user.id;
  const { targetUserId, likeType } = req.body;

  // 좋아요 생성
  await createLike({ senderId, targetUserId, likeType });

  // 🎯 상대방 좋아요 수신 tracking (서버 전용)
  trackEvent('Like_Received', targetUserId, {
    source_profile_id: senderId,
    like_type: likeType,
    tracking_source: 'server_realtime', // 클라이언트와 구분
  });

  // 상호 좋아요 확인
  const isMutualLike = await checkMutualLike(senderId, targetUserId);

  if (isMutualLike) {
    const match = await createMatch(senderId, targetUserId);

    // 🎯 매칭 성사 tracking (서버 전용, 양쪽)
    trackEvent('Like_Match_Created', senderId, {
      match_id: match.id,
      is_mutual: true,
      like_type: likeType,
    });

    trackEvent('Like_Match_Created', targetUserId, {
      match_id: match.id,
      is_mutual: true,
      like_type: likeType,
    });

    // 🎯 매칭 성공 tracking (서버 전용, 양쪽)
    // 중복 제거: 클라이언트 use-like.tsx 제거 완료
    trackEvent('Matching_Success', senderId, {
      match_id: match.id,
      partner_id: targetUserId,
      matching_type: 'like',
    });

    trackEvent('Matching_Success', targetUserId, {
      match_id: match.id,
      partner_id: senderId,
      matching_type: 'like',
    });
  }

  res.json({
    success: true,
    isMatch: isMutualLike, // ✅ 클라이언트에서 사용
    matchId,
  });
}
```

---

#### 3. 리텐션 도메인 (2개)

| 이벤트 | 구현 방법 | 구현 내용 |
|--------|----------|----------|
| **Day_1/7/30_Retention** | Cron Job (매일 3AM) | 코호트별 리텐션 계산 |
| **Chat_24h_Active** | Cron Job (매일 4AM) | 24시간 활성 대화 집계<br>**병행**: 클라이언트도 유지 (앱 실행 시) |

```typescript
// Cron Job: 매일 오전 3시
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';

export function setupRetentionTracking() {
  cron.schedule('0 3 * * *', async () => {
    const users = await getUsersForRetentionCheck();

    for (const user of users) {
      const days = calculateDaysSinceSignup(user.signupDate);

      if ([1, 3, 7, 30].includes(days)) {
        // 🎯 리텐션 tracking (서버 전용)
        trackEvent(`Day_${days}_Retention`, user.id, {
          days_since_signup: days,
          first_match_achieved: await hasMatch(user.id),
          first_message_sent: await hasSentMessage(user.id),
          matches_count: await getMatchesCount(user.id),
          has_purchased: await hasPurchased(user.id),
          tracked_via_cron: true,
        });
      }
    }
  });
}
```

---

### 🟡 높은 우선순위 (2-3주) - 10개

#### 4. 채팅 도메인 (3개 추가)

| 이벤트 | 구현 위치 |
|--------|----------|
| **First_Message_Received** | WebSocket 이벤트 |
| **Chat_Response** | WebSocket 이벤트 |
| **Match_Conversation_Rate** | Cron Job (매칭 후 24시간) |

```typescript
// WebSocket: 메시지 수신
io.on('connection', (socket) => {
  socket.on('message:sent', async (data) => {
    await saveMessage(data);
    socket.to(data.chatRoomId).emit('message:received', data);

    // 🎯 첫 메시지 수신 tracking
    const isFirst = await checkIsFirstMessage(data.recipientId);
    if (isFirst) {
      trackEvent('First_Message_Received', data.recipientId, {
        sender_id: data.senderId,
        chat_room_id: data.chatRoomId,
        tracking_source: 'server_websocket',
      });
    }
  });
});
```

---

#### 5. 회원가입/인증 (4개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **Signup_done** | `POST /api/v1/auth/signup` |
| **University_Verification_Started** | `POST /api/v1/verification/start` |
| **University_Verification_Completed** | `POST /api/v1/verification/complete` |
| **Account_Reactivated** | `POST /api/v1/account/reactivate` |

```typescript
// POST /api/v1/auth/signup
export async function signup(req, res) {
  const user = await createUser(req.body);

  // 🎯 회원가입 완료 tracking (서버 전용)
  trackEvent('Signup_done', user.id, {
    signup_method: req.body.authMethod,
    profile_completion_rate: calculateCompletionRate(user),
    has_invite_code: !!req.body.inviteCode,
  });

  res.json({ success: true, userId: user.id });
}
```

---

#### 6. 추천 도메인 (2개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **Referral_Signup_Completed** | `POST /api/v1/auth/signup` |
| **Referral_Reward_Granted** | `POST /api/v1/rewards/referral` |

```typescript
// POST /api/v1/auth/signup (추천 코드 있을 때)
if (inviteCode) {
  const referrer = await validateInviteCode(inviteCode);

  // 🎯 추천 가입 완료 tracking
  trackEvent('Referral_Signup_Completed', user.id, {
    referrer_id: referrer.id,
    invite_code: inviteCode,
  });

  // 리워드 지급
  await grantReferralReward(referrer.id, user.id);

  // 🎯 추천 리워드 지급 tracking
  trackEvent('Referral_Reward_Granted', referrer.id, {
    invited_user_id: user.id,
    reward_type: 'gem',
    reward_amount: 10,
  });
}
```

---

#### 7. 매칭 추가 (1개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **Match_Request_Sent** | `POST /api/v1/matching/request` |

---

### 🟢 중간 우선순위 (1개월) - 9개

#### 8. 결제/수익 추가 (4개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **Rematch_Purchased** | `POST /api/v1/payment/rematch` |
| **Subscription_Started** | `POST /api/v1/subscription/start` |
| **Subscription_Cancelled** | `DELETE /api/v1/subscription` |
| **Revenue_Per_User** | Cron Job (Daily) |

---

#### 9. 커뮤니티 (4개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **Community_Daily_Active_Users** | Cron Job (Daily) |
| **Community_Feed_Viewed** | `GET /api/v1/community/feed` |
| **Community_Post_Reported** | `POST /api/v1/community/:id/report` |
| **Community_Post_Deleted** | `DELETE /api/v1/community/:id` |

---

#### 10. 기타 (1개)

| 이벤트 | 구현 위치 |
|--------|----------|
| **User_Metrics_Updated** | Cron Job (Hourly) |

---

## 📊 최종 요약

### ✅ 중복 제거 결과

| 항목 | Before | After | 결과 |
|-----|--------|-------|------|
| **Payment_Completed** | 클라이언트 4곳 + 서버 계획 | 서버만 | ✅ 중복 완전 제거 |
| **Matching_Success** | 클라이언트 1곳 + 서버 계획 | 서버만 | ✅ 중복 완전 제거 |
| **Like_Received** | 클라이언트 1곳 + 서버 계획 | 양쪽 유지 (구분자) | ✅ 구분자로 관리 |
| **Chat_24h_Active** | 클라이언트 1곳 + 서버 계획 | 양쪽 유지 (구분자) | ✅ 이미 구분됨 |

---

## 🚀 서버 구현 우선순위

### Phase 1: 최우선 (1-2주) - 7개 이벤트

#### 결제 검증 (2개)
```typescript
// 1. Payment_Completed
POST /api/v1/payment/verify
→ PG사 검증 후 tracking

// 2. Subscription_Renewed
POST /api/v1/webhooks/subscription/renew
→ 자동 갱신 Webhook
```

#### 좋아요/매칭 (3개)
```typescript
// 3. Like_Received
POST /api/v1/likes
→ 상대방 좋아요 수신 (실시간)
→ tracking_source: 'server_realtime'

// 4. Like_Match_Created
POST /api/v1/likes (상호 좋아요 시)
→ 양쪽 모두 tracking

// 5. Matching_Success
POST /api/v1/likes (상호 좋아요 시)
→ 양쪽 모두 tracking
```

#### 리텐션 (2개)
```typescript
// 6. Day_1/7/30_Retention
Cron Job: 매일 3AM
→ 코호트별 리텐션 계산

// 7. Chat_24h_Active (선택)
Cron Job: 매일 4AM
→ 앱 미실행 사용자만 tracking
→ tracking_source: 'batch'
```

---

### Phase 2: 높은 우선순위 (2-3주) - 10개

| 도메인 | 이벤트 수 | 주요 이벤트 |
|--------|----------|-----------|
| 채팅 | 3개 | First_Message_Received, Chat_Response, Match_Conversation_Rate |
| 회원가입 | 4개 | Signup_done, University_Verification |
| 추천 | 2개 | Referral_Signup_Completed, Referral_Reward_Granted |
| 매칭 | 1개 | Match_Request_Sent |

---

### Phase 3: 중간 우선순위 (1개월) - 9개

| 도메인 | 이벤트 수 | 주요 이벤트 |
|--------|----------|-----------|
| 결제/수익 | 4개 | Rematch_Purchased, Subscription_Started/Cancelled, Revenue_Per_User |
| 커뮤니티 | 4개 | Daily_Active_Users, Feed_Viewed, Post_Reported/Deleted |
| 기타 | 1개 | User_Metrics_Updated |

---

## 💻 구현 템플릿

### API 핸들러 템플릿
```typescript
import { trackEvent } from '@/libs/mixpanel';

export async function yourApiHandler(req, res) {
  try {
    // 1. 비즈니스 로직
    const result = await yourBusinessLogic(req.body);

    // 2. DB 업데이트
    await updateDatabase(result);

    // 3. 🎯 Mixpanel Tracking (서버 전용)
    trackEvent('Your_Event_Name', userId, {
      // 이벤트 속성
      property1: value1,
      property2: value2,
      // 서버 이벤트 표시
      verified_at_server: true,
      tracking_source: 'server',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Cron Job 템플릿
```typescript
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';

export function setupYourCronJob() {
  // 매일 특정 시간 실행
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron] Running your job...');

    try {
      const items = await getItemsToProcess();

      for (const item of items) {
        // 🎯 Mixpanel Tracking (배치 작업)
        trackEvent('Your_Event_Name', item.userId, {
          // 이벤트 속성
          property1: item.value1,
          // 배치 작업 표시
          tracking_source: 'batch',
          tracked_via_cron: true,
        });
      }

      console.log(`Processed ${items.length} items`);
    } catch (error) {
      console.error('[Cron] Error:', error);
    }
  });
}
```

### Webhook 템플릿
```typescript
import { trackEvent } from '@/libs/mixpanel';

export async function handleWebhook(req, res) {
  // 1. 서명 검증
  const isValid = verifyWebhookSignature(req);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { userId, eventData } = req.body;

  // 2. DB 업데이트
  await updateDatabase(eventData);

  // 3. 🎯 Mixpanel Tracking (Webhook)
  trackEvent('Your_Event_Name', userId, {
    // 이벤트 속성
    ...eventData,
    // Webhook 표시
    tracking_source: 'webhook',
    webhook_provider: 'portone',
  });

  res.json({ success: true });
}
```

---

## 📋 구현 체크리스트

### ✅ 클라이언트 중복 제거 (완료)
- [x] use-portone.tsx - Payment_Completed 제거
- [x] apple-gem-store.tsx - Payment_Completed 제거
- [x] port-one-payment.tsx - Payment_Completed 제거
- [x] use-like.tsx - Matching_Success 제거
- [x] use-liked-me-query.tsx - tracking_source 추가

### 🔄 서버 구현 (진행 예정)

#### Week 1: API Tracking (4개)
- [ ] `src/libs/mixpanel.ts` 생성 (초기화 코드)
- [ ] `src/controllers/payment.controller.ts`
  - [ ] `verifyPayment()` - Payment_Completed
- [ ] `src/controllers/like.controller.ts`
  - [ ] `sendLike()` - Like_Received, Like_Match_Created, Matching_Success
- [ ] 테스트 및 검증

#### Week 2: Webhook & Cron (3개)
- [ ] `src/webhooks/subscription.webhook.ts`
  - [ ] `handleSubscriptionRenew()` - Subscription_Renewed
- [ ] `src/jobs/retention.job.ts`
  - [ ] `setupRetentionTracking()` - Day_1/7/30_Retention
- [ ] `src/jobs/chat-activity.job.ts` (선택)
  - [ ] `setupChatActivityTracking()` - Chat_24h_Active (앱 미실행 사용자)
- [ ] `src/index.ts` - Cron Job 등록

---

## 🎯 중복 방지 보장

### tracking_source 구분자

| tracking_source | 의미 | 사용처 |
|----------------|------|--------|
| `server` | 서버 API 핸들러 | 일반 API |
| `server_realtime` | 서버 실시간 | Like_Received |
| `batch` | 서버 배치 작업 | Cron Job |
| `webhook` | Webhook 이벤트 | PG사 콜백 |
| `client_polling` | 클라이언트 polling | Like_Received |
| `app` | 클라이언트 앱 | Chat_24h_Active |

### Mixpanel에서 중복 확인
```sql
-- Mixpanel JQL 쿼리: 동일 유저, 동일 시간 이벤트 찾기
SELECT
  distinct_id,
  time,
  tracking_source,
  COUNT(*) as duplicate_count
FROM events
WHERE event = 'Payment_Completed'
  AND time > '2025-12-29'
GROUP BY distinct_id, time
HAVING COUNT(*) > 1
```

---

## 📞 최종 확인사항

### 클라이언트 팀
✅ **완료**: 중복 제거 (4곳), tracking_source 추가 (1곳)

### 백엔드 팀
🔄 **진행**: 서버 전용 26개 이벤트 구현
- Week 1: 최우선 7개
- Week 2-3: 높은 우선순위 10개
- Month 2: 중간 우선순위 9개

### 검증 방법
1. Mixpanel Live View에서 이벤트 실시간 확인
2. tracking_source 필드로 출처 구분
3. 동일 user + timestamp 중복 확인

---

**결론**: 클라이언트 중복 완전 제거 완료 ✅ 서버는 26개 이벤트만 구현하면 됩니다!

**다음 단계**: 백엔드 팀에 `docs/backend-mixpanel-integration-guide.md` 공유 🚀
