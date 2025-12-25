# Mixpanel 매칭 트래킹 개선 사항

> **작성일**: 2024-12-24
> **버전**: 1.0
> **목적**: 매칭 대시보드 품질 향상을 위한 추가 이벤트 구현

---

## 📋 구현 개요

매칭 대시보드의 데이터 정확도를 높이기 위해 다음 개선사항을 구현했습니다:

1. ✅ **Matching_Started 이벤트 호출 추가** (재매칭)
2. ✅ **Match_Accepted 시각 저장** (채팅 전환 시간 계산용)
3. ✅ **Chat_Started에 time_since_match_accepted 추가**

---

## 🔧 구현 상세

### 1. Matching_Started 이벤트 추가

#### **위치**: `src/features/idle-match-timer/hooks/use-rematch.tsx`

#### **변경 내용**

**Before**:
```typescript
const performRematch = async () => {
  await tryCatch(
    async () => {
      onLoading();
      await rematch();
      finishLoading();
      finishRematching();
    },
```

**After**:
```typescript
const performRematch = async () => {
  await tryCatch(
    async () => {
      // KPI 이벤트: 매칭 시작 (재매칭)
      matchingEvents.trackMatchingStarted('rematch', []);

      onLoading();
      await rematch();
      finishLoading();
      finishRematching();
    },
```

#### **이벤트 속성**

```typescript
{
  matching_type: 'rematch',
  filters_applied: [],
  timestamp: '2024-12-24T10:30:00Z'
}
```

#### **효과**

- 재매칭 시작 시점을 정확히 트래킹
- 무료 매칭 vs 재매칭 전환율 비교 가능
- 매칭 시작 → 성공까지의 소요 시간 측정 가능

---

### 2. Match_Accepted 시각 저장

#### **위치**: `src/shared/hooks/use-mixpanel.ts`

#### **변경 내용**

**Before**:
```typescript
trackMatchAccepted: useCallback((sourceProfileId: string, timeToResponse: number) => {
  trackEvent('Match_Accepted', {
    profile_id: sourceProfileId,
    time_to_response: timeToResponse,
    response_type: 'accepted'
  });

  updateUserProperties({
    $add: {
      mutual_likes_count: 1,
      successful_matches: 1,
    },
  });
}, [trackEvent, updateUserProperties]),
```

**After**:
```typescript
trackMatchAccepted: useCallback(async (sourceProfileId: string, timeToResponse: number) => {
  trackEvent('Match_Accepted', {
    profile_id: sourceProfileId,
    time_to_response: timeToResponse,
    response_type: 'accepted'
  });

  updateUserProperties({
    $add: {
      mutual_likes_count: 1,
      successful_matches: 1,
    },
  });

  // Match_Accepted 시각을 저장 (Chat_Started와의 시간 차이 계산용)
  try {
    await storage.setItem(`match_accepted_time_${sourceProfileId}`, Date.now().toString());
  } catch (error) {
    console.error('[Mixpanel] Failed to save match accepted time:', error);
  }
}, [trackEvent, updateUserProperties]),
```

#### **Storage Key Format**

```
match_accepted_time_{partnerId} = {timestamp_ms}

예시:
match_accepted_time_user_12345 = "1703408400000"
```

#### **효과**

- Match_Accepted 시각을 AsyncStorage에 저장
- 채팅 시작 시 시간 차이 계산 가능
- 사용자별로 독립적인 시각 저장 (partnerId 기반)

---

### 3. Chat_Started에 시간 정보 추가

#### **위치 1**: `src/features/chat/queries/use-create-chat-room.tsx`

#### **변경 내용**

**Before**:
```typescript
onSuccess: ({ chatRoomId, partnerId }: { chatRoomId: string; partnerId?: string }) => {
  if (partnerId) {
    chatEvents.trackChatStarted(partnerId, 'mutual_like');
  }
  router.push(`/chat/${chatRoomId}`);
},
```

**After**:
```typescript
onSuccess: async ({ chatRoomId, partnerId }: { chatRoomId: string; partnerId?: string }) => {
  if (partnerId) {
    try {
      // Match_Accepted 시각 조회
      const matchAcceptedTimeStr = await storage.getItem(`match_accepted_time_${partnerId}`);

      if (matchAcceptedTimeStr) {
        const matchAcceptedTime = parseInt(matchAcceptedTimeStr, 10);
        const now = Date.now();
        const timeSinceMatchAccepted = Math.floor((now - matchAcceptedTime) / 1000); // 초 단위

        // 확장된 이벤트 트래킹 (time_since_match_accepted 포함)
        chatEvents.trackChatStarted(partnerId, 'mutual_like', timeSinceMatchAccepted);

        console.log(`[Analytics] Chat started ${timeSinceMatchAccepted}s after Match_Accepted`);

        // 저장된 시각 삭제 (일회성)
        await storage.removeItem(`match_accepted_time_${partnerId}`);
      } else {
        // Match_Accepted 시각이 없는 경우 (이전 매칭 또는 데이터 누락)
        chatEvents.trackChatStarted(partnerId, 'mutual_like');
      }
    } catch (error) {
      console.error('[Analytics] Failed to calculate time since match accepted:', error);
      // 에러가 발생해도 기본 이벤트는 전송
      chatEvents.trackChatStarted(partnerId, 'mutual_like');
    }
  }
  router.push(`/chat/${chatRoomId}`);
},
```

#### **위치 2**: `src/shared/hooks/use-mixpanel.ts`

**trackChatStarted 시그니처 확장**:

```typescript
// Before
trackChatStarted: (chatPartnerId: string, matchType?: string) => void;

// After
trackChatStarted: (chatPartnerId: string, matchType?: string, timeSinceMatchAccepted?: number) => void;
```

**구현**:

```typescript
trackChatStarted: useCallback((chatPartnerId: string, matchType?: string, timeSinceMatchAccepted?: number) => {
  trackEvent('Chat_Started', {
    chat_partner_id: chatPartnerId,
    match_type: matchType as any,
    ...(timeSinceMatchAccepted !== undefined && {
      time_since_match_accepted: timeSinceMatchAccepted
    })
  });
}, [trackEvent]),
```

#### **이벤트 속성**

**시간 정보 있는 경우**:
```typescript
{
  chat_partner_id: 'user_12345',
  match_type: 'mutual_like',
  time_since_match_accepted: 3600, // 초 단위 (1시간)
  timestamp: '2024-12-24T11:30:00Z'
}
```

**시간 정보 없는 경우** (이전 매칭):
```typescript
{
  chat_partner_id: 'user_12345',
  match_type: 'mutual_like',
  timestamp: '2024-12-24T11:30:00Z'
}
```

#### **효과**

- Match_Accepted → Chat_Started 시간 차이를 초 단위로 정확히 측정
- 빠른 전환 vs 느린 전환 사용자 분석 가능
- 채팅 전환율 최적화를 위한 데이터 확보

---

## 📊 대시보드 활용 방법

### 1. Matching_Started 활용

#### **Mixpanel Insights**

**무료 vs 재매칭 시작 비율**:
```
Event: Matching_Started
Breakdown: matching_type
Chart Type: Pie Chart
Time Range: Last 30 Days
```

**시간대별 매칭 시작**:
```
Event: Matching_Started
Metric: Count
Breakdown: Hour of Day
Chart Type: Line Chart
```

---

### 2. Match_Accepted → Chat_Started 시간 분석

#### **Histogram 차트**

```
Event: Chat_Started
Filter: time_since_match_accepted is set
Metric: Property (time_since_match_accepted)
Bins: [0-1h, 1-3h, 3-6h, 6-12h, 12-24h, 24h+]
```

**예상 분포**:
```
0-1h:    45%  ████████████████████████
1-3h:    27%  ██████████████
3-6h:    15%  ████████
6-12h:   8%   ████
12-24h:  4%   ██
24h+:    1%   █
```

#### **평균 전환 시간**

```
Event: Chat_Started
Filter: time_since_match_accepted is set
Metric: Average (time_since_match_accepted)
Time Range: Last 30 Days
```

**목표**: 중앙값 < 3시간 (10,800초)

---

### 3. 빠른 전환 vs 느린 전환 비교

#### **Cohort 생성**

**빠른 전환 사용자**:
```
Cohort: Fast Chat Starters
Criteria:
  - Event: Chat_Started
  - Filter: time_since_match_accepted < 3600 (1시간)
  - Within: Last 30 days
```

**느린 전환 사용자**:
```
Cohort: Slow Chat Starters
Criteria:
  - Event: Chat_Started
  - Filter: time_since_match_accepted > 21600 (6시간)
  - Within: Last 30 days
```

#### **리텐션 비교**

```
Cohort A: Fast Chat Starters
Cohort B: Slow Chat Starters

Metric: 7-Day Retention (App_Opened)
```

**가설**: 빠른 전환 사용자가 더 높은 리텐션을 보일 것

---

## 🎯 기대 효과

### **데이터 품질 개선**

| 지표 | 개선 전 | 개선 후 |
|------|---------|---------|
| 매칭 시작 트래킹 | ❌ 누락 | ✅ 100% 트래킹 |
| 채팅 전환 시간 | ❌ 알 수 없음 | ✅ 초 단위 정확 측정 |
| 무료 vs 재매칭 비교 | ⚠️ 제한적 | ✅ 전체 퍼널 비교 가능 |

### **비즈니스 인사이트**

1. **재매칭 ROI 검증**
   - 재매칭 사용자의 전환율이 더 높은가?
   - 재매칭권 가격 책정 정당화

2. **채팅 전환 최적화**
   - 몇 시간 내 채팅을 시작해야 활성화율이 높은가?
   - 푸시 알림 타이밍 최적화

3. **사용자 세그먼트 분석**
   - 빠른 전환 사용자 vs 느린 전환 사용자 특성
   - 타겟 마케팅 전략 수립

---

## ⚠️ 주의사항

### 1. Storage 용량 관리

**문제**: Match_Accepted 시각이 누적되면 storage 용량 증가

**해결책**:
- ✅ 채팅 시작 후 자동 삭제 (`storage.removeItem`)
- ✅ Key에 partnerId 포함 (사용자별 독립)
- ⚠️ 주기적 정리 로직 추가 권장 (7일 이상 된 데이터)

### 2. 에러 처리

**문제**: Storage 오류 시 이벤트 누락 가능

**해결책**:
- ✅ try-catch로 에러 처리
- ✅ 에러 발생 시에도 기본 이벤트 전송
- ✅ 콘솔 로그로 디버깅 가능

### 3. 이전 매칭 데이터

**문제**: 이 업데이트 이전의 매칭은 시간 정보 없음

**해결책**:
- ✅ `timeSinceMatchAccepted`를 옵셔널로 설정
- ✅ Mixpanel 쿼리 시 `is set` 필터 사용
- ✅ 점진적으로 데이터 축적

---

## 🔍 검증 방법

### 1. 로컬 테스트

```typescript
// 재매칭 시작 시
console.log('[Analytics] Matching_Started: rematch');

// Match_Accepted 시
console.log('[Analytics] Match_Accepted time saved');

// Chat_Started 시
console.log('[Analytics] Chat started {X}s after Match_Accepted');
```

### 2. Mixpanel 실시간 확인

```
Mixpanel → Events → Live View

Filter:
- Event: Matching_Started
- Event: Match_Accepted
- Event: Chat_Started (with time_since_match_accepted)
```

### 3. 데이터 무결성 체크

**7일 후 확인**:

```
Event: Chat_Started
Filter: time_since_match_accepted is set
Metric: Count

Expected: > 70% of Chat_Started events
```

---

## 🚀 다음 단계

### 단기 (1-2주)

- [ ] 로컬 개발 환경에서 테스트
- [ ] Staging 환경 배포
- [ ] 실제 데이터 수집 시작 (최소 7일)

### 중기 (1개월)

- [ ] Mixpanel 대시보드에 새 차트 추가
  - Match_Accepted → Chat_Started 시간 분포
  - 시간대별 빠른 전환율
- [ ] 코호트 생성 (빠른/느린 전환 사용자)
- [ ] A/B 테스트 (푸시 알림 타이밍)

### 장기 (2-3개월)

- [ ] 머신러닝 모델 학습용 데이터 활용
- [ ] 최적 푸시 알림 타이밍 자동화
- [ ] 사용자별 개인화된 알림 전략

---

## 📚 관련 문서

- **대시보드 가이드**: `docs/MIXPANEL_MATCHING_DASHBOARD_GUIDE.md`
- **빠른 참고**: `docs/MIXPANEL_QUICK_REFERENCE.md`
- **이벤트 정의**: `src/shared/constants/mixpanel-events.ts`
- **KPI 문서**: `KPI.md`

---

**작성자**: Development Team
**최종 업데이트**: 2024-12-24
**버전**: 1.0
