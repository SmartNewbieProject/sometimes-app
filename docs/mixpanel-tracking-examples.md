# Mixpanel High Priority 지표 사용 예시

## 설치 및 설정

### 1. 훅 import
```typescript
import { useTracking } from '@/src/shared/hooks';
```

### 2. 컴포넌트 내 사용
```typescript
const tracker = useTracking();
```

---

## 결제 도메인 (Payment)

### ✅ 이미 구현됨: 첫 구매 추적
**위치**: `src/features/payment/hooks/use-portone.tsx:118-138`

```typescript
// 첫 구매 여부 체크 및 추적
const isFirstPurchase = await checkIsFirstAction('purchase');
if (isFirstPurchase) {
  tracker.trackFirstPurchase({
    transaction_id: result.paymentId,
    payment_method: result.method as any,
    total_amount: result.totalAmount || 0,
    gem_count: gemCount || 0,
    payment_provider: 'portone',
    is_first_purchase: true,
  });
} else {
  tracker.trackRepeatPurchase({
    transaction_id: result.paymentId,
    payment_method: result.method as any,
    total_amount: result.totalAmount || 0,
    gem_count: gemCount || 0,
    payment_provider: 'portone',
    is_first_purchase: false,
  });
}
```

### 📝 구현 예정: 결제 이탈 추적

**추가할 위치**: 결제 화면 (`src/features/payment/ui/gem-store/index.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { useFocusEffect } from '@react-navigation/native';
import { useRef } from 'react';

function GemStore() {
  const tracker = useTracking();
  const startTime = useRef<number>(Date.now());
  const selectedProduct = useRef<string | null>(null);

  // 화면 진입 시 시작 시간 기록
  useFocusEffect(() => {
    startTime.current = Date.now();

    return () => {
      // 화면 이탈 시 - 결제 완료되지 않았다면 이탈로 간주
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

      if (selectedProduct.current && !paymentCompleted) {
        tracker.trackPaymentAbandoned({
          abandoned_step: 'item_selection',
          abandoned_reason: 'changed_mind',
          time_to_purchase: timeSpent,
          gem_count: selectedProduct.current,
        });
      }
    };
  });

  // 상품 선택 시
  const handleProductSelect = (productId: string) => {
    selectedProduct.current = productId;
  };
}
```

### 📝 구현 예정: 젬 부족 감지

**추가할 위치**: 좋아요 기능 (`src/features/like/hooks/use-like.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { useCurrentGem } from '@/src/features/payment/hooks';

export default function useLike() {
  const tracker = useTracking();
  const { data: gem } = useCurrentGem();

  const performLike = async (connectionId: string) => {
    const requiredGems = 10; // 좋아요 비용

    // 젬 부족 감지
    if (gem && gem.current < requiredGems) {
      if (gem.current === 0) {
        tracker.trackGemBalanceDepleted('like');
      } else {
        tracker.trackGemBalanceLow(gem.current, requiredGems, 'like');
      }

      // 젬 구매 유도 모달 표시
      tracker.trackGemPurchasePromptShown({
        gem_balance_before: gem.current,
        gem_required: requiredGems,
        purchase_trigger: 'like',
      });

      // 모달 표시 로직...
      return;
    }

    // 정상 좋아요 처리
    await like(connectionId);
  };
}
```

---

## 매칭 도메인 (Matching)

### 📝 구현 예정: 매칭 대기 시간 추적

**추가할 위치**: 매칭 로딩 화면 (`src/features/matching/ui/matching-loading.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { useEffect, useRef } from 'react';

function MatchingLoading() {
  const tracker = useTracking();
  const startTime = useRef<number>(Date.now());
  const queueJoined = useRef<boolean>(false);

  useEffect(() => {
    // 대기열 진입
    if (!queueJoined.current) {
      tracker.trackMatchingQueueJoined({
        matching_type: 'auto',
      });
      queueJoined.current = true;
    }

    return () => {
      // 화면 이탈 시
      const waitTimeSeconds = Math.floor((Date.now() - startTime.current) / 1000);

      if (!matchingSuccess) {
        // 매칭 성공 전에 이탈 = 대기 포기
        tracker.trackMatchingQueueAbandoned(waitTimeSeconds, {
          matching_type: 'auto',
        });
      } else {
        // 매칭 성공
        tracker.trackMatchingQueueTime(waitTimeSeconds, false, {
          matching_type: 'auto',
        });
      }
    };
  }, [matchingSuccess]);
}
```

### 📝 구현 예정: 좋아요로 매칭 성사

**추가할 위치**: 좋아요 응답 처리 (`src/features/like/hooks/use-like.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { checkIsFirstAction } from '@/src/shared/libs/mixpanel-tracking';

export default function useLike() {
  const tracker = useTracking();

  const handleLikeResponse = async (response: LikeResponse) => {
    // 상호 좋아요로 매칭 성사
    if (response.isMatch) {
      tracker.trackLikeMatchCreated({
        target_profile_id: response.profileId,
        match_created: true,
        is_mutual: true,
        like_type: response.isSuperLike ? 'super' : 'free',
      });

      // 첫 매칭인지 확인
      const isFirstMatch = await checkIsFirstAction('match');
      if (isFirstMatch) {
        tracker.trackFirstMatchAchieved({
          time_to_first_action: Math.floor((Date.now() - signupTime) / 1000),
          profile_completion_rate: profileCompletionRate,
        });
      }
    }
  };
}
```

---

## 채팅 도메인 (Chat)

### 📝 구현 예정: 첫 응답 시간 추적

**추가할 위치**: 채팅 메시지 전송 (`src/features/chat/ui/input.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { checkIsFirstAction } from '@/src/shared/libs/mixpanel-tracking';

function ChatInput({ chatId, partnerId, matchTime }: Props) {
  const tracker = useTracking();

  const handleSendMessage = async (message: string) => {
    // 메시지 전송 로직...
    await sendMessage(message);

    // 첫 메시지 전송인지 확인
    const isFirstMessage = await checkIsFirstAction(`chat_${chatId}_first_message`);

    if (isFirstMessage) {
      // 첫 응답 시간 계산
      const responseTime = Math.floor((Date.now() - new Date(matchTime).getTime()) / 1000);

      tracker.trackChatFirstResponseTime(responseTime, {
        chat_id: chatId,
        chat_partner_id: partnerId,
        message_character_count: message.length,
        is_first_interaction: true,
      });

      // 전역 첫 메시지 확인
      const isGlobalFirstMessage = await checkIsFirstAction('message_sent');
      if (isGlobalFirstMessage) {
        tracker.trackFirstMessageSent({
          time_to_first_action: responseTime,
        });
      }
    }
  };
}
```

### 📝 구현 예정: 대화 길이 및 지속 시간 추적

**추가할 위치**: 채팅방 나가기 (`src/features/chat/ui/chat-list.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { useEffect, useRef } from 'react';

function ChatRoom({ chatId, partnerId }: Props) {
  const tracker = useTracking();
  const startTime = useRef<number>(Date.now());
  const messageCount = useRef<number>(0);

  // 메시지 전송 시 카운트 증가
  const handleSendMessage = async (message: string) => {
    messageCount.current++;
    // 메시지 전송 로직...
  };

  // 채팅방 이탈 시
  useEffect(() => {
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTime.current) / 1000);

      // 대화 길이 추적
      tracker.trackChatConversationLength(messageCount.current, {
        chat_id: chatId,
        chat_partner_id: partnerId,
      });

      // 대화 지속 시간 추적
      tracker.trackChatConversationDuration(durationSeconds, {
        chat_id: chatId,
        chat_partner_id: partnerId,
        message_count: messageCount.current,
      });
    };
  }, []);
}
```

---

## 리텐션 도메인

### 📝 구현 예정: 리텐션 코호트 추적

**추가할 위치**: 앱 실행 시 (`app/_layout.tsx`)

```typescript
import { useTracking } from '@/src/shared/hooks';
import { calculateDaysSince } from '@/src/shared/libs/mixpanel-tracking';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RootLayout() {
  const tracker = useTracking();

  useEffect(() => {
    checkRetention();
  }, []);

  const checkRetention = async () => {
    try {
      // 가입일 조회
      const signupDateStr = await AsyncStorage.getItem('signup_date');
      if (!signupDateStr) return;

      const daysSinceSignup = calculateDaysSince(signupDateStr);

      // 각 리텐션 포인트 체크
      const properties = {
        days_since_signup: daysSinceSignup,
        first_match_achieved: await checkIfMatchExists(),
        first_message_sent: await checkIfMessageSent(),
        profile_completion_rate: await getProfileCompletionRate(),
        matches_count: await getMatchesCount(),
        has_purchased: await checkIfPurchased(),
      };

      // Day 1 리텐션 (가입 후 24-48시간)
      if (daysSinceSignup === 1) {
        const tracked = await AsyncStorage.getItem('retention_day1_tracked');
        if (!tracked) {
          tracker.trackDay1Retention(properties);
          await AsyncStorage.setItem('retention_day1_tracked', 'true');
        }
      }

      // Day 7 리텐션 (가입 후 7-8일)
      if (daysSinceSignup === 7) {
        const tracked = await AsyncStorage.getItem('retention_day7_tracked');
        if (!tracked) {
          tracker.trackDay7Retention(properties);
          await AsyncStorage.setItem('retention_day7_tracked', 'true');
        }
      }

      // Day 30 리텐션 (가입 후 30-31일)
      if (daysSinceSignup === 30) {
        const tracked = await AsyncStorage.getItem('retention_day30_tracked');
        if (!tracked) {
          tracker.trackDay30Retention(properties);
          await AsyncStorage.setItem('retention_day30_tracked', 'true');
        }
      }
    } catch (error) {
      console.error('Failed to track retention:', error);
    }
  };
}
```

---

## 추가 구현 사항

### 1. 좋아요 한도 도달

**위치**: `src/features/like/hooks/use-like.tsx`

```typescript
// API 에러 응답에서 한도 도달 감지
if (error.response?.status === 429) {
  tracker.trackLikeLimitReached(0, {
    like_type: 'free',
  });

  // 프리미엄 업그레이드 유도
  showUpgradeModal();
}
```

### 2. 첫 좋아요 수신

**위치**: 알림 수신 시 (`src/features/notification/handlers/like-notification.tsx`)

```typescript
const handleLikeNotification = async (notification: Notification) => {
  const isFirstLikeReceived = await checkIsFirstAction('like_received');

  if (isFirstLikeReceived) {
    tracker.trackFirstLikeReceived({
      time_to_first_action: calculateDaysSince(signupDate) * 86400, // seconds
    });
  }
};
```

---

## 테스트 방법

### 1. 개발 환경에서 확인

```typescript
// Mixpanel 이벤트 로깅 활성화
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = Mixpanel.init('YOUR_DEV_TOKEN');
mixpanel.setLoggingEnabled(true); // 콘솔에 로그 출력
```

### 2. Mixpanel 대시보드에서 확인

1. Mixpanel → Live View
2. 이벤트 이름으로 필터링 (예: `Payment_First_Purchase`)
3. 속성 값 확인

### 3. 로컬 테스트

```typescript
// AsyncStorage 초기화로 "첫 액션" 재테스트
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('first_action_purchase');
await AsyncStorage.removeItem('first_action_match');
await AsyncStorage.removeItem('first_action_message_sent');
```

---

## 다음 단계

### ✅ 완료
- [x] Mixpanel 이벤트 상수 추가
- [x] 타입 정의 추가
- [x] Tracking 유틸리티 클래스 작성
- [x] `useTracking` 훅 생성
- [x] 첫 구매 추적 구현

### 🔄 진행 중
- [ ] 결제 이탈 추적 구현
- [ ] 젬 부족 감지 구현

### 📋 남은 작업
- [ ] 매칭 대기 시간 추적
- [ ] 좋아요 매칭 성사 추적
- [ ] 채팅 응답 시간 추적
- [ ] 리텐션 코호트 추적
- [ ] 각 도메인별 단위 테스트 작성

---

**작성일**: 2025-12-29
**버전**: v1.0
**담당자**: 개발팀
