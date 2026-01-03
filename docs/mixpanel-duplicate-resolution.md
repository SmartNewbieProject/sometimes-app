# Mixpanel 중복 이벤트 해결 가이드

**작성일**: 2025-12-29
**목적**: 클라이언트/서버 중복 tracking 완전 제거

---

## 🚨 발견된 문제

서버 전용으로 분류한 이벤트 중 **4개가 이미 클라이언트에 구현**되어 있습니다.

| 이벤트 | 클라이언트 위치 | 중복 심각도 |
|--------|----------------|-----------|
| `Payment_Completed` | ✅ use-portone.tsx:103, 111 (2번!)<br>✅ apple-gem-store.tsx:68<br>✅ port-one-payment.tsx:71 | 🔴 **심각** |
| `Matching_Success` | ✅ use-like.tsx:41 | 🔴 **심각** (잘못된 사용) |
| `Like_Received` | ✅ use-liked-me-query.tsx:37 | 🟡 중간 |
| `Chat_24h_Active` | ✅ use-auto-track-chat-activity.ts:40 | 🟢 양호 (구분자 있음) |

---

## 💡 해결 전략

### 전략 1: 클라이언트 제거 (서버만 사용)
**대상**: `Payment_Completed`, `Matching_Success`

**이유**:
- 보안: 서버 검증 필수
- 정확성: 서버만 확정 가능
- 중복 위험 높음

### 전략 2: 양쪽 유지 (tracking_source로 구분)
**대상**: `Like_Received`

**이유**:
- 실시간성: 서버가 더 정확
- 백업: 클라이언트가 누락 보완
- Mixpanel에서 중복 제거 가능

### 전략 3: 현재 상태 유지
**대상**: `Chat_24h_Active`

**이유**:
- 이미 `tracking_source: 'app'` 구분자 사용 중
- 서버는 `tracking_source: 'batch'` 사용 예정
- 충돌 없음

---

## 🔧 중복 제거 코드

### 1️⃣ Payment_Completed 제거 (클라이언트)

#### 파일 1: use-portone.tsx

**제거할 코드** (Line 102-116):
```typescript
// ❌ 제거: 중복 tracking
// KPI 이벤트: 결제 완료
paymentEvents.trackPaymentCompleted(
  result.paymentId,
  result.pgProvider || 'unknown',
  result.amount || 0,
  result.products || []
);

// 기존 이벤트 호환성
paymentEvents.trackPaymentCompleted(
  result.paymentId ?? '',
  result.method ?? '',
  result.totalAmount ?? 0,
  []
);
```

**수정 후**:
```typescript
// ✅ 제거: Payment_Completed는 서버에서만 tracking
// (Line 102-116 전체 삭제)

// ✅ 유지: First_Purchase / Repeat_Purchase (Line 118-138)
const isFirstPurchase = await checkIsFirstAction('purchase');
if (isFirstPurchase) {
  tracker.trackFirstPurchase({ ... });
} else {
  tracker.trackRepeatPurchase({ ... });
}
```

#### 파일 2: apple-gem-store.tsx

**제거할 코드** (Line 68-74):
```typescript
// ❌ 제거
paymentEvents.trackPaymentCompleted(
  purchase?.transactionId || transactionReceipt || 'unknown',
  'apple_iap',
  amount,
  [{ type: 'gem', quantity: serverResponse?.grantedQuantity || 0, price: amount }]
);
```

**수정 후**:
```typescript
// ✅ 제거: Payment_Completed는 서버에서만
// 서버가 Apple IAP receipt 검증 후 tracking
```

#### 파일 3: port-one-payment.tsx

**제거할 코드** (Line 71-77):
```typescript
// ❌ 제거
conversionEvents.trackPaymentCompleted(
  complete.txId,
  complete.paymentMethod || 'unknown',
  amount,
  items
);
```

---

### 2️⃣ Matching_Success 수정 (클라이언트)

#### 파일: use-like.tsx

**현재 코드** (Line 40-44):
```typescript
// ❌ 잘못된 사용: 좋아요 전송 ≠ 매칭 성공
onSuccess: async (data, connectionId) => {
  await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });
  await queryClient.refetchQueries({ queryKey: ["latest-matching"] });

  // 좋아요 성공 이벤트 트래킹
  trackEvent(MIXPANEL_EVENTS.MATCHING_SUCCESS, {
    profile_id: connectionId,
    matching_type: 'like',
  });
},
```

**수정 후**:
```typescript
// ✅ 수정: Matching_Success 제거
onSuccess: async (data, connectionId) => {
  await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });
  await queryClient.refetchQueries({ queryKey: ["latest-matching"] });

  // 좋아요 전송 성공은 이미 onMutate에서 tracking됨
  // (LIKE_SENT 이벤트)

  // Matching_Success는 서버에서 상호 좋아요 확인 후 tracking
},
```

---

### 3️⃣ Like_Received - tracking_source 추가 (양쪽 유지)

#### 클라이언트 수정: use-liked-me-query.tsx

**현재 코드** (Line 36-41):
```typescript
newLikes.forEach((like) => {
  mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_RECEIVED, {
    source_profile_id: like.connectionId,
    timestamp: new Date().toISOString(),
  });
});
```

**수정 후**:
```typescript
// ✅ 수정: tracking_source 추가
newLikes.forEach((like) => {
  mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_RECEIVED, {
    source_profile_id: like.connectionId,
    timestamp: new Date().toISOString(),
    tracking_source: 'client_polling', // 구분자 추가
  });
});
```

#### 서버 추가: like.controller.ts

```typescript
// ✅ 추가: 실시간 tracking
export async function sendLike(req, res) {
  await createLike(senderId, targetUserId);

  // 실시간 tracking (서버)
  trackEvent('Like_Received', targetUserId, {
    source_profile_id: senderId,
    like_type: likeType,
    tracking_source: 'server_realtime', // 구분자
  });
}
```

---

### 4️⃣ Chat_24h_Active - 현재 상태 유지

**현재 상태**: ✅ 이미 구분자 있음
- 클라이언트: `tracking_source: 'app'`
- 서버: `tracking_source: 'batch'` (계획)

**액션**: 수정 불필요. 서버는 미실행 사용자만 tracking

---

## 📊 최종 정리

### ✅ 클라이언트에서 제거할 코드 (3곳)

| 파일 | Line | 제거할 이벤트 | 이유 |
|------|------|-------------|------|
| `use-portone.tsx` | 102-116 | `Payment_Completed` (2번) | 서버 검증 후 tracking |
| `apple-gem-store.tsx` | 68-74 | `Payment_Completed` | 서버 검증 후 tracking |
| `port-one-payment.tsx` | 71-77 | `Payment_Completed` | 서버 검증 후 tracking |
| `use-like.tsx` | 41-44 | `Matching_Success` | 잘못된 사용. 서버에서만 |

### 🟡 클라이언트에서 수정할 코드 (1곳)

| 파일 | Line | 수정 내용 |
|------|------|----------|
| `use-liked-me-query.tsx` | 37-41 | `tracking_source: 'client_polling'` 추가 |

### ✅ 서버에서만 구현할 이벤트 (최종)

**중복 없는 서버 전용 이벤트** (26개):

1. **결제** (5개)
   - ✅ `Payment_Completed` (클라이언트 제거 후)
   - ✅ `Subscription_Renewed`
   - ✅ `Rematch_Purchased`
   - ✅ `Subscription_Started`
   - ✅ `Subscription_Cancelled`

2. **좋아요/매칭** (3개)
   - ✅ `Like_Received` (양쪽 유지, 구분자로 관리)
   - ✅ `Like_Match_Created`
   - ✅ `Matching_Success` (클라이언트 제거 후)

3. **채팅** (4개)
   - ✅ `Chat_24h_Active` (양쪽 유지, 구분자로 관리)
   - ✅ `First_Message_Received`
   - ✅ `Chat_Response`
   - ✅ `Match_Conversation_Rate`

4. **리텐션** (4개)
   - ✅ `Day_1/3/7/30_Retention`

5. **기타** (10개)
   - ✅ 회원가입, 커뮤니티, 추천 등

---

## 🚀 실행 계획

### Step 1: 클라이언트 중복 제거 (30분)
```bash
# 제거할 파일 3개
1. src/features/payment/hooks/use-portone.tsx (Line 102-116)
2. src/features/payment/ui/apple-gem-store/apple-gem-store.tsx (Line 68-74)
3. src/features/payment/ui/port-one-payment.tsx (Line 71-77)

# 수정할 파일 1개
4. src/features/like/hooks/use-like.tsx (Line 41-44)

# tracking_source 추가할 파일 1개
5. src/features/like/queries/use-liked-me-query.tsx (Line 37-41)
```

### Step 2: 서버 구현 (1-2주)
```bash
# 최우선 7개 이벤트
1. Payment_Completed (결제 검증 API)
2. Subscription_Renewed (Webhook)
3. Like_Received (좋아요 API - 실시간)
4. Like_Match_Created (좋아요 API)
5. Matching_Success (매칭 API)
6. Chat_24h_Active (Cron - 앱 미실행 사용자)
7. Day_1/7/30_Retention (Cron)
```

---

## 📋 체크리스트

### 클라이언트 팀
- [ ] `use-portone.tsx` Line 102-116 제거
- [ ] `apple-gem-store.tsx` Line 68-74 제거
- [ ] `port-one-payment.tsx` Line 71-77 제거
- [ ] `use-like.tsx` Line 41-44 제거 (Matching_Success)
- [ ] `use-liked-me-query.tsx` Line 37-41 수정 (tracking_source 추가)

### 백엔드 팀
- [ ] Mixpanel SDK 초기화
- [ ] 결제 검증 API에 Payment_Completed tracking
- [ ] 좋아요 API에 Like_Received, Like_Match_Created tracking
- [ ] 매칭 API에 Matching_Success tracking
- [ ] Cron Job 설정 (리텐션, 채팅 활성도)

---

**결론**: 클라이언트 중복 제거 → 서버만 구현 = **완전한 중복 방지** ✅
