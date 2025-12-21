# 인앱 리뷰 (In-App Review) Feature

앱 내에서 사용자에게 앱스토어/플레이스토어 리뷰를 요청하는 기능입니다.

## 📁 구조

```
in-app-review/
├── constants/
│   └── review-config.ts       # 리뷰 관련 설정 상수
├── hooks/
│   ├── use-in-app-review.ts   # 기본 리뷰 요청 훅
│   ├── use-mutual-match-review-trigger.ts
│   ├── use-chat-activity-review-trigger.ts
│   ├── use-signup-days-review-trigger.ts
│   ├── use-regular-matching-review-trigger.ts
│   └── use-withdrawal-review-trigger.ts
├── libs/
│   ├── review-storage.ts      # AsyncStorage 래퍼
│   └── review-eligibility-checker.ts
├── types.ts
└── index.ts
```

## 🎯 트리거 조건

| 우선순위 | 트리거 | 조건 | 훅 |
|---------|--------|------|-----|
| 🥇 1순위 | 상호 좋아요 매칭 | 매칭 성공 시 | `useMutualMatchReviewTrigger` |
| 🥇 1순위 | 채팅 10회 대화 | 상호 10턴 이상 | `useChatActivityReviewTrigger` |
| 🥈 2순위 | 가입 후 3일 | 72시간 경과 | `useSignupDaysReviewTrigger` |
| 🥈 2순위 | 정기매칭 후 | 매칭 결과 확인 | `useRegularMatchingReviewTrigger` |
| 🥉 3순위 | 회원탈퇴 | "파트너 찾음" | `useWithdrawalReviewTrigger` |

## 🚀 사용법

### 1. 상호 좋아요 매칭 성공 시

```typescript
import { useMutualMatchReviewTrigger } from '@/src/features/in-app-review';

function MatchSuccessScreen() {
  const { data: iLiked } = useQuery({ queryKey: ['i-liked'], queryFn: getILiked });
  const { data: likedMe } = useQuery({ queryKey: ['liked-me'], queryFn: getLikedMe });

  const isMutualMatch = iLiked?.some(person =>
    person.isMutualLike && likedMe?.some(liked => liked.id === person.id)
  );

  useMutualMatchReviewTrigger({
    isMutualMatch: isMutualMatch ?? false,
    enabled: true
  });

  return <MatchSuccessUI />;
}
```

### 2. 채팅 10회 이상 대화 시

```typescript
import { useChatActivityReviewTrigger } from '@/src/features/in-app-review';

function ChatRoomScreen({ chatRoomId }: { chatRoomId: string }) {
  const { data: activityStatus } = useQuery({
    queryKey: ['chat-activity', chatRoomId],
    queryFn: () => getChatRoomActivityStatus(chatRoomId),
  });

  useChatActivityReviewTrigger({
    myMessageCount: activityStatus?.myMessageCount ?? 0,
    partnerMessageCount: activityStatus?.partnerMessageCount ?? 0,
    enabled: true,
  });

  return <ChatUI />;
}
```

### 3. 가입 후 3일 경과 시

```typescript
import { useSignupDaysReviewTrigger } from '@/src/features/in-app-review';

function HomeScreen() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  useSignupDaysReviewTrigger({
    userCreatedAt: user?.createdAt,
    enabled: true,
  });

  return <HomeUI />;
}
```

### 4. 정기매칭 후 (목/일 21시)

```typescript
import { useRegularMatchingReviewTrigger } from '@/src/features/in-app-review';

function MatchingResultScreen() {
  const [hasViewedMatch, setHasViewedMatch] = useState(false);
  const { data: matchDetails } = useQuery({
    queryKey: ['matching'],
    queryFn: getLatestMatchingV2,
  });

  useEffect(() => {
    if (matchDetails?.partner) {
      setHasViewedMatch(true);
    }
  }, [matchDetails]);

  useRegularMatchingReviewTrigger({
    hasViewedMatch,
    matchType: matchDetails?.type,
    enabled: true,
  });

  return <MatchingResultUI />;
}
```

### 5. 회원탈퇴 - "파트너를 찾았어요"

```typescript
import { useWithdrawalReviewTrigger } from '@/src/features/in-app-review';

function WithdrawalScreen() {
  const { triggerIfFoundPartner } = useWithdrawalReviewTrigger();

  const handleWithdraw = async (reason: WithdrawalReason) => {
    // 리뷰 요청 먼저
    await triggerIfFoundPartner(reason);

    // 그 다음 탈퇴 API 호출
    await withdraw(reason);
  };

  return <WithdrawalUI onSubmit={handleWithdraw} />;
}
```

## 🔧 설정

`constants/review-config.ts`에서 설정 변경 가능:

```typescript
export const REVIEW_CONFIG = {
  MAX_REQUEST_COUNT: 3,              // iOS 연간 최대 요청 횟수
  MIN_REQUEST_INTERVAL_DAYS: 30,    // 최소 요청 간격 (일)
  MIN_DAYS_SINCE_SIGNUP: 3,         // 가입 후 최소 경과 일수
  CHAT_MESSAGE_THRESHOLD: 10,       // 채팅 메시지 임계값
  DEFAULT_DELAY_MS: 1500,           // 기본 딜레이 (ms)
};
```

## 🎨 2단계 리뷰 요청 패턴

본 기능은 **2단계 리뷰 요청 패턴**을 사용합니다:

1. **커스텀 Pre-prompt 모달 표시**
   - 제목: "썸타임에 대한 당신만의 반응을 남겨주세요!"
   - 설명: "우리가 개인을 위한 맞춤 서비스를 지원할 수 있도록 도와주세요."
   - 버튼: [리뷰 남기기] [나중에]

2. **긍정적 응답 시에만 시스템 리뷰 호출**
   - "리뷰 남기기" 클릭 → `StoreReview.requestReview()` 호출
   - "나중에" 클릭 → 아무 동작 없음

### 왜 2단계 패턴을 사용하나요?

| 장점 | 설명 |
|------|------|
| **효율적인 제한 횟수 활용** | iOS 연간 3회 제한을 긍정적 사용자에게만 사용 |
| **부정적 리뷰 방지** | 불만족 사용자는 "나중에"로 조용히 스킵 가능 |
| **사용자 제어권 향상** | 강제성 없이 사용자가 선택할 수 있음 |

## 📊 분석 이벤트

자동으로 Mixpanel/Amplitude에 전송되는 이벤트:

### `InAppReview_Eligible`
리뷰 요청 조건 충족 여부

**속성:**
- `trigger_type`: 트리거 유형
- `can_request`: 요청 가능 여부
- `reason`: 불가 사유 (선택)

### `InAppReview_PrePromptShown`
Pre-prompt 모달이 사용자에게 표시됨

**속성:**
- `trigger_type`: 트리거 유형

### `InAppReview_PrePromptResponse`
사용자가 Pre-prompt에 응답함

**속성:**
- `trigger_type`: 트리거 유형
- `response`: 'accepted' (리뷰 남기기) | 'declined' (나중에)

### `InAppReview_Requested`
시스템 리뷰 다이얼로그 호출 (사용자가 "리뷰 남기기" 선택)

**속성:**
- `trigger_type`: 트리거 유형

## ⚠️ 주의사항

### iOS 제약사항
- **연간 3회 제한**: `StoreReview.requestReview()` 호출이 1년에 최대 3회만 가능
- **시스템 UI**: 디자인 변경 불가
- **사용자 설정**: 사용자가 설정에서 비활성화 가능

### Android 제약사항
- **할당량**: 단기간 내 중복 노출 제한
- **시스템 UI**: 디자인 변경 불가

### 테스트
- **실제 기기 필수**: 시뮬레이터/에뮬레이터에서는 작동하지 않음
- **프로덕션 빌드**: TestFlight/내부 테스트 트랙에서만 확인 가능

## 🐛 디버깅

로컬 저장소 초기화:

```typescript
import { storage } from '@/src/shared/libs/store';
import { STORAGE_KEY } from '@/src/features/in-app-review/constants/review-config';

// 리뷰 요청 기록 초기화
await storage.removeItem(STORAGE_KEY.REVIEW_TRACKING);
```

로그 확인:

```typescript
// 콘솔에 자동으로 출력됨
[InAppReview] Not eligible: max_request_count_reached
[InAppReview] Store review not available
```

## 📚 참고 자료

- [expo-store-review 공식 문서](https://docs.expo.dev/versions/latest/sdk/store-review/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ratings-and-reviews)
- [Google Play In-App Review API](https://developer.android.com/guide/playcore/in-app-review)
