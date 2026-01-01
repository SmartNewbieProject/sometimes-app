# 백엔드 Mixpanel 통합 가이드

**프로젝트**: Sometimes App
**작성일**: 2025-12-29
**대상**: 백엔드 개발팀

---

## 📋 프로젝트 정보

| 항목 | 값 |
|-----|---|
| **Project Token** | `3f1b97d815027821e7e1e93c73bad5a4` |
| **API Secret** | `5252bedfc90bf837e5b9af70a38b9ab7` |
| **Data Residency** | 한국 (기본 US 서버 사용) |
| **SDK** | Mixpanel Node.js SDK |

---

## 🎯 구현 목표

서버에서 tracking이 필요한 **30개 이벤트** 중 **Phase 1 핵심 7개**를 우선 구현합니다.

### Phase 1: 핵심 이벤트 (1-2주)
1. ✅ `Payment_Completed` - 결제 검증 완료
2. ✅ `Subscription_Renewed` - 구독 자동 갱신
3. ✅ `Like_Received` - 좋아요 수신
4. ✅ `Like_Match_Created` - 상호 좋아요 매칭
5. ✅ `Matching_Success` - 매칭 성공
6. ✅ `Chat_24h_Active` - 24시간 활성 대화
7. ✅ `Day_1/7/30_Retention` - 리텐션 코호트

---

## 🛠 Step 1: 설치 및 설정

### 1.1 Mixpanel SDK 설치

```bash
npm install mixpanel
# 또는
yarn add mixpanel
```

### 1.2 환경변수 설정

**`.env` 파일**
```env
# Mixpanel Configuration
MIXPANEL_PROJECT_TOKEN=3f1b97d815027821e7e1e93c73bad5a4
MIXPANEL_API_SECRET=5252bedfc90bf837e5b9af70a38b9ab7

# 환경 구분 (development, staging, production)
NODE_ENV=development

# 디버그 모드 (개발 환경에서만 true)
MIXPANEL_DEBUG=true
```

### 1.3 Mixpanel 클라이언트 초기화

**`src/libs/mixpanel.ts` (신규 생성)**
```typescript
import Mixpanel from 'mixpanel';

// Mixpanel 초기화
const mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN!, {
  // 디버그 모드 (개발 환경에서만 활성화)
  debug: process.env.MIXPANEL_DEBUG === 'true',

  // verbose 로깅 (개발 환경에서만)
  verbose: process.env.NODE_ENV === 'development',

  // 한국 사용자 - US 서버 사용 (기본값)
  // EU 사용자가 있다면: host: 'api-eu.mixpanel.com'
  // 인도 사용자가 있다면: host: 'api-in.mixpanel.com'
});

/**
 * Mixpanel 이벤트 Tracking 헬퍼 함수
 */
export const trackEvent = (
  eventName: string,
  distinctId: string,
  properties: Record<string, any> = {}
) => {
  mixpanel.track(eventName, {
    distinct_id: distinctId,
    ...properties,
    env: process.env.NODE_ENV,
    timestamp: Date.now(),
  });
};

/**
 * 사용자 프로필 설정
 */
export const setUserProfile = (
  distinctId: string,
  properties: Record<string, any>
) => {
  mixpanel.people.set(distinctId, {
    ...properties,
    $ip: '0', // 서버 IP 사용 안 함 (지역 정보 왜곡 방지)
  });
};

/**
 * 사용자 프로필 속성 증가 (예: 로그인 횟수)
 */
export const incrementUserProfile = (
  distinctId: string,
  property: string,
  incrementBy: number = 1
) => {
  mixpanel.people.increment(distinctId, property, incrementBy);
};

/**
 * 그룹 프로필 설정 (예: 회사, 대학)
 */
export const setGroupProfile = (
  groupKey: string,
  groupId: string,
  properties: Record<string, any>
) => {
  mixpanel.groups.set(groupKey, groupId, properties);
};

export default mixpanel;
```

---

## 💻 Step 2: 핵심 이벤트 구현

### 2.1 결제 완료 (Payment_Completed)

**파일**: `src/controllers/payment.controller.ts`

```typescript
import { Request, Response } from 'express';
import { trackEvent } from '@/libs/mixpanel';
import { verifyPGCallback, updatePaymentStatus, checkIsFirstPurchase } from '@/services/payment.service';

/**
 * POST /api/v1/payment/verify
 * PG사 콜백 검증 및 결제 완료 처리
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { transactionId, paymentId, amount, method, userId } = req.body;

    // 1. PG사 검증
    const verified = await verifyPGCallback({
      transactionId,
      paymentId,
      amount,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
      });
    }

    // 2. DB 업데이트
    await updatePaymentStatus(transactionId, 'completed');

    // 3. 첫 구매 여부 확인
    const isFirstPurchase = await checkIsFirstPurchase(userId);

    // 4. Mixpanel Tracking 🎯
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
        currency: 'KRW',
      }
    );

    // 5. 사용자 프로필 업데이트 (총 구매 금액)
    if (isFirstPurchase) {
      setUserProfile(userId, {
        $name: req.user.name, // 사용자 이름
        $email: req.user.email,
        first_purchase_date: new Date().toISOString(),
        total_revenue: amount,
      });
    } else {
      // 구매 금액 누적
      incrementUserProfile(userId, 'total_revenue', amount);
      incrementUserProfile(userId, 'purchase_count', 1);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
```

**서비스 함수 예시** (`src/services/payment.service.ts`)
```typescript
/**
 * 첫 구매 여부 확인
 */
export async function checkIsFirstPurchase(userId: string): Promise<boolean> {
  const count = await Payment.count({
    where: {
      userId,
      status: 'completed',
    },
  });

  return count === 0;
}
```

---

### 2.2 좋아요 수신 & 매칭 성사 (Like_Received, Like_Match_Created)

**파일**: `src/controllers/like.controller.ts`

```typescript
import { Request, Response } from 'express';
import { trackEvent } from '@/libs/mixpanel';
import { createLike, checkMutualLike, createMatch } from '@/services/like.service';

/**
 * POST /api/v1/likes
 * 좋아요 생성 (상대방에게 전송)
 */
export async function sendLike(req: Request, res: Response) {
  try {
    const senderId = req.user.id;
    const { targetUserId, likeType } = req.body; // 'free' | 'super'

    // 1. 좋아요 생성
    const like = await createLike({
      senderId,
      targetUserId,
      likeType,
    });

    // 2. 상호 좋아요 확인
    const isMutualLike = await checkMutualLike(senderId, targetUserId);

    let matchId: string | null = null;

    // 3. 매칭 성사 시
    if (isMutualLike) {
      const match = await createMatch(senderId, targetUserId);
      matchId = match.id;

      // 🎯 매칭 성사 tracking (양쪽 모두)
      trackEvent('Like_Match_Created', senderId, {
        target_profile_id: targetUserId,
        match_id: matchId,
        is_mutual: true,
        like_type: likeType,
      });

      trackEvent('Like_Match_Created', targetUserId, {
        target_profile_id: senderId,
        match_id: matchId,
        is_mutual: true,
        like_type: likeType,
      });

      // 매칭 성공 이벤트도 함께 tracking
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

    // 4. 🎯 좋아요 수신 tracking (상대방)
    trackEvent('Like_Received', targetUserId, {
      source_profile_id: senderId,
      like_type: likeType,
      is_mutual: isMutualLike,
      match_created: isMutualLike,
    });

    res.json({
      success: true,
      isMatch: isMutualLike,
      matchId,
    });
  } catch (error) {
    console.error('Send like error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
```

---

### 2.3 매칭 성공 (Matching_Success)

**파일**: `src/controllers/matching.controller.ts`

```typescript
import { Request, Response } from 'express';
import { trackEvent } from '@/libs/mixpanel';
import { runMatchingAlgorithm } from '@/services/matching.service';

/**
 * POST /api/v1/matching/create
 * 매칭 알고리즘 실행
 */
export async function createMatching(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const { context } = req.body; // 'auto' | 'manual'

    // 1. 매칭 알고리즘 실행
    const matchResult = await runMatchingAlgorithm(userId, context);

    if (!matchResult) {
      return res.status(404).json({
        success: false,
        error: 'No matching found',
      });
    }

    // 2. 🎯 매칭 성공 tracking (양쪽 모두)
    trackEvent('Matching_Success', userId, {
      match_id: matchResult.matchId,
      partner_id: matchResult.partnerId,
      matching_type: context,
      match_score: matchResult.score, // 매칭 점수
      time_to_match: matchResult.processingTime, // 처리 시간 (ms)
    });

    trackEvent('Matching_Success', matchResult.partnerId, {
      match_id: matchResult.matchId,
      partner_id: userId,
      matching_type: context,
      match_score: matchResult.score,
    });

    res.json({
      success: true,
      match: matchResult,
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
```

---

### 2.4 구독 자동 갱신 (Subscription_Renewed)

**파일**: `src/webhooks/subscription.webhook.ts`

```typescript
import { Request, Response } from 'express';
import { trackEvent } from '@/libs/mixpanel';
import { updateSubscriptionStatus } from '@/services/subscription.service';

/**
 * POST /api/v1/webhooks/subscription/renew
 * PG사 구독 갱신 Webhook
 */
export async function handleSubscriptionRenew(req: Request, res: Response) {
  try {
    const { userId, subscriptionId, billingDate, amount, tier } = req.body;

    // 1. 서명 검증 (PG사 제공)
    const isValid = verifyWebhookSignature(req);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. DB 업데이트
    await updateSubscriptionStatus(subscriptionId, {
      status: 'active',
      nextBillingDate: calculateNextBillingDate(billingDate),
      lastRenewalDate: new Date(),
    });

    // 3. 🎯 구독 갱신 tracking
    trackEvent('Subscription_Renewed', userId, {
      subscription_id: subscriptionId,
      subscription_tier: tier, // 'basic' | 'premium' | 'vip'
      renewal_amount: amount,
      billing_date: billingDate,
      renewal_count: await getSubscriptionRenewalCount(subscriptionId),
    });

    // 4. 사용자 프로필 업데이트
    incrementUserProfile(userId, 'subscription_renewal_count', 1);
    incrementUserProfile(userId, 'total_revenue', amount);

    res.json({ success: true });
  } catch (error) {
    console.error('Subscription renewal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## ⏰ Step 3: 배치 작업 (Cron Job)

### 3.1 리텐션 코호트 추적

**파일**: `src/jobs/retention.job.ts`

```typescript
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';
import { User } from '@/models/user.model';
import { Match } from '@/models/match.model';
import { Message } from '@/models/message.model';

/**
 * 매일 오전 3시 실행
 * 리텐션 코호트 tracking
 */
export function setupRetentionTracking() {
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron] Running daily retention tracking...');

    try {
      // 1. 리텐션 체크 대상 사용자 조회
      const today = new Date();
      const usersToCheck = await User.findAll({
        where: {
          // 가입일이 1일, 3일, 7일, 30일 전인 사용자
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

      // 2. 각 사용자별 리텐션 tracking
      for (const user of usersToCheck) {
        const daysSinceSignup = calculateDaysSinceSignup(user.signupDate);

        // 리텐션 지표 수집
        const hasMatch = await hasUserMatch(user.id);
        const hasSentMessage = await hasUserSentMessage(user.id);
        const matchesCount = await getUserMatchesCount(user.id);
        const messagesCount = await getUserMessagesCount(user.id);
        const hasPurchased = await hasUserPurchased(user.id);

        const retentionData = {
          days_since_signup: daysSinceSignup,
          first_match_achieved: hasMatch,
          first_message_sent: hasSentMessage,
          matches_count: matchesCount,
          messages_sent: messagesCount,
          has_purchased: hasPurchased,
        };

        // Day별 tracking
        if (daysSinceSignup === 1) {
          trackEvent('Day_1_Retention', user.id, retentionData);
        } else if (daysSinceSignup === 3) {
          trackEvent('Day_3_Retention', user.id, retentionData);
        } else if (daysSinceSignup === 7) {
          trackEvent('Day_7_Retention', user.id, retentionData);
        } else if (daysSinceSignup === 30) {
          trackEvent('Day_30_Retention', user.id, retentionData);
        }
      }

      console.log(`[Cron] Retention tracking completed for ${usersToCheck.length} users`);
    } catch (error) {
      console.error('[Cron] Retention tracking error:', error);
    }
  });
}

/**
 * 유틸리티 함수들
 */
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

async function hasUserMatch(userId: string): Promise<boolean> {
  const count = await Match.count({ where: { userId } });
  return count > 0;
}

async function hasUserSentMessage(userId: string): Promise<boolean> {
  const count = await Message.count({ where: { senderId: userId } });
  return count > 0;
}

async function getUserMatchesCount(userId: string): Promise<number> {
  return await Match.count({ where: { userId } });
}

async function getUserMessagesCount(userId: string): Promise<number> {
  return await Message.count({ where: { senderId: userId } });
}

async function hasUserPurchased(userId: string): Promise<boolean> {
  const count = await Payment.count({
    where: { userId, status: 'completed' },
  });
  return count > 0;
}
```

**앱 시작 시 Cron Job 등록** (`src/index.ts`)
```typescript
import { setupRetentionTracking } from '@/jobs/retention.job';
import { setupChatActivityTracking } from '@/jobs/chat-activity.job';

// Express 서버 시작 후
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Cron Jobs 등록
  setupRetentionTracking();
  setupChatActivityTracking();
});
```

---

### 3.2 24시간 활성 대화 추적

**파일**: `src/jobs/chat-activity.job.ts`

```typescript
import cron from 'node-cron';
import { trackEvent } from '@/libs/mixpanel';
import { ChatRoom } from '@/models/chat-room.model';
import { Message } from '@/models/message.model';

/**
 * 매일 오전 4시 실행
 * 24시간 내 대화 활성도 tracking
 */
export function setupChatActivityTracking() {
  cron.schedule('0 4 * * *', async () => {
    console.log('[Cron] Running chat activity tracking...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 어제 생성된 매칭 (채팅방) 조회
      const chatRooms = await ChatRoom.findAll({
        where: {
          createdAt: {
            $gte: yesterday,
            $lt: today,
          },
        },
      });

      // 각 채팅방별 활성도 체크
      for (const room of chatRooms) {
        const { userId1, userId2, matchId } = room;

        // 24시간 내 메시지 조회
        const messages = await Message.findAll({
          where: {
            chatRoomId: room.id,
            createdAt: {
              $gte: yesterday,
              $lt: today,
            },
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

        // 🎯 24시간 활성 대화 tracking (양쪽 모두)
        const baseData = {
          chat_room_id: room.id,
          match_id: matchId,
          is_active: isActive,
          is_mutual_conversation: isMutual,
          activity_status: activityStatus,
          total_message_count: messages.length,
          tracking_source: 'batch',
        };

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

      console.log(`[Cron] Chat activity tracking completed for ${chatRooms.length} rooms`);
    } catch (error) {
      console.error('[Cron] Chat activity tracking error:', error);
    }
  });
}
```

---

## 🔒 Step 4: 보안 및 베스트 프랙티스

### 4.1 환경변수 보안

```typescript
// .env 파일은 절대 Git에 커밋하지 않기
// .gitignore에 추가
.env
.env.local
.env.*.local
```

### 4.2 에러 처리

```typescript
import mixpanel from '@/libs/mixpanel';

// Mixpanel tracking 실패해도 서버 로직은 정상 진행
export const trackEventSafe = (
  eventName: string,
  distinctId: string,
  properties: Record<string, any> = {}
) => {
  try {
    mixpanel.track(eventName, {
      distinct_id: distinctId,
      ...properties,
      env: process.env.NODE_ENV,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`[Mixpanel] Failed to track event "${eventName}":`, error);
    // 에러가 발생해도 서버 로직은 계속 진행
  }
};
```

### 4.3 비동기 처리 (Serverless 환경)

```typescript
import { promisify } from 'util';

// AWS Lambda 등 Serverless 환경에서는 callback 사용 필수
export const trackEventAsync = async (
  eventName: string,
  distinctId: string,
  properties: Record<string, any> = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    mixpanel.track(
      eventName,
      {
        distinct_id: distinctId,
        ...properties,
      },
      (error) => {
        if (error) {
          console.error('[Mixpanel] Tracking error:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};
```

### 4.4 개인정보 보호

```typescript
// IP 주소 무시 (서버 IP 사용 방지)
mixpanel.people.set(userId, {
  name: user.name,
  email: user.email,
  $ip: '0', // ✅ 지역 정보 왜곡 방지
});

// 민감 정보 제외
trackEvent('Payment_Completed', userId, {
  transaction_id: txId,
  total_amount: amount,
  // ❌ 카드 번호, CVV 등 절대 전송하지 않기
});
```

---

## 📊 Step 5: 테스트 및 검증

### 5.1 개발 환경 테스트

```bash
# .env 파일 확인
MIXPANEL_PROJECT_TOKEN=3f1b97d815027821e7e1e93c73bad5a4
MIXPANEL_DEBUG=true
NODE_ENV=development

# 서버 실행
npm run dev

# 테스트 요청
curl -X POST http://localhost:3000/api/v1/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "transactionId": "txn_test_123",
    "amount": 9900,
    "method": "card"
  }'
```

### 5.2 Mixpanel 대시보드 확인

1. **Mixpanel 로그인**: https://mixpanel.com
2. **Live View 접속**: 실시간 이벤트 확인
3. **필터링**: `Payment_Completed` 검색
4. **속성 확인**: `distinct_id`, `total_amount` 등 확인

### 5.3 디버그 로그 확인

```typescript
// 디버그 모드에서 콘솔 출력 확인
[Mixpanel] Sending track request for event "Payment_Completed"
[Mixpanel] Event data: {
  distinct_id: 'test-user-123',
  transaction_id: 'txn_test_123',
  total_amount: 9900,
  ...
}
[Mixpanel] Request successful
```

---

## 🚀 Step 6: 프로덕션 배포

### 6.1 프로덕션 환경변수

```env
# Production .env
MIXPANEL_PROJECT_TOKEN=3f1b97d815027821e7e1e93c73bad5a4
MIXPANEL_API_SECRET=5252bedfc90bf837e5b9af70a38b9ab7
MIXPANEL_DEBUG=false
NODE_ENV=production
```

### 6.2 배포 체크리스트

- [ ] 환경변수 설정 완료
- [ ] Mixpanel SDK 설치 및 초기화
- [ ] Phase 1 핵심 이벤트 7개 구현
- [ ] Cron Job 등록 (리텐션, 채팅 활성도)
- [ ] 에러 처리 적용
- [ ] 개인정보 보호 확인
- [ ] 테스트 환경 검증
- [ ] Mixpanel Live View 확인

---

## 📋 구현 우선순위

### ✅ Week 1: 핵심 API Tracking
1. `Payment_Completed` - 결제 검증 API
2. `Like_Received` - 좋아요 API
3. `Like_Match_Created` - 좋아요 API (매칭 성사 시)
4. `Matching_Success` - 매칭 API

### ✅ Week 2: Webhook & Cron Jobs
5. `Subscription_Renewed` - 구독 갱신 Webhook
6. `Day_1/7/30_Retention` - 리텐션 Cron Job
7. `Chat_24h_Active` - 채팅 활성도 Cron Job

### 🟡 Week 3-4: 나머지 서버 이벤트 (23개)
- 회원가입 완료, 대학 인증
- 커뮤니티 DAU, 피드 조회
- 추천 리워드, 사용자 지표 갱신 등

---

## 📞 문의 및 지원

### 프론트엔드 팀 협업
- API 응답에 `isMatch` 필드 추가 완료 확인
- 클라이언트 tracking과 중복 방지 협의

### Mixpanel 공식 문서
- Node.js SDK: https://developer.mixpanel.com/docs/nodejs
- API Reference: https://mixpanel.github.io/mixpanel-node/

### 내부 문서
- 전체 이벤트 목록: `docs/mixpanel-events-full-list.md`
- 구현 완료 보고서: `docs/mixpanel-implementation-summary.md`

---

**작성일**: 2025-12-29
**담당자**: 백엔드 개발팀
**다음 리뷰**: Week 2 완료 후 (구현 검증)
