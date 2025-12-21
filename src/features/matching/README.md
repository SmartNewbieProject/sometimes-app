# 지역 확장 매칭 기능

썸타임 앱의 지역 확장 매칭 기능 구현 가이드입니다.

## 📁 디렉터리 구조

```
src/features/matching/
├── apis/
│   └── index.ts              # 외부 매칭 API
├── hooks/
│   ├── use-external-matching.ts        # 외부 매칭 훅
│   └── use-regional-expansion-modal.tsx # 지역 확장 모달 훅
├── stores/
│   └── matching-store.ts     # Zustand 매칭 상태 관리
├── ui/
│   ├── match-badge.tsx       # 배지 컴포넌트
│   └── matching-loading.tsx  # 로딩 컴포넌트
├── utils/
│   └── expansion-path.ts     # 지역 확장 경로 유틸
├── types.ts                  # 타입 정의
└── index.ts                  # 배럴 export
```

## 🚀 사용 방법

### 1. 기본 사용 예시

```typescript
import { useExternalMatching, useRegionalExpansionModal } from '@/src/features/matching';
import { useMatchingStore } from '@/src/features/matching/stores/matching-store';
import { getExpansionPath } from '@/src/features/matching/utils/expansion-path';

const MatchingScreen = () => {
  const { startExternalMatch, isLoading, data } = useExternalMatching();
  const { showExpansionModal } = useRegionalExpansionModal();
  const { userRegion, matchAttempts } = useMatchingStore();

  // 재매칭 실패 시 모달 표시
  const handleMatchingFailed = () => {
    const expansionPath = getExpansionPath(userRegion);

    showExpansionModal({
      userRegion,
      expansionPath,
      onConfirm: () => {
        // 진행할게요
        startExternalMatch(
          {
            previousMatchAttempts: matchAttempts,
            lastMatchedRegion: userRegion,
          },
          userId
        );
      },
      onCancel: () => {
        // 다음에 할게요
        router.push('/home');
      },
    });
  };

  // 외부 매칭 결과 처리
  useEffect(() => {
    if (data?.success && data.data) {
      // 성공 - 프로필 화면으로 이동
      router.push({
        pathname: '/profile',
        params: {
          match: JSON.stringify(data.data.match),
          badge: JSON.stringify(data.data.expansion.badge),
        },
      });
    } else if (data?.error) {
      // 실패 처리
      handleMatchError(data.error);
    }
  }, [data]);

  return (
    <View>
      {isLoading && (
        <MatchingLoading
          message="조금 더 넓은 지역에서 찾고 있어요"
          description="✨ 인근 지역 스캔 중..."
        />
      )}
    </View>
  );
};
```

### 2. 프로필 화면에 배지 표시

```typescript
import { MatchBadge } from '@/src/features/matching';
import type { BadgeData } from '@/src/features/matching';

const ProfileScreen = ({ route }) => {
  const { match, badge } = route.params;
  const badgeData: BadgeData = JSON.parse(badge);

  return (
    <View>
      <Image source={{ uri: match.profileImage }} />

      {badge && <MatchBadge badge={badgeData} />}

      <Text>{match.nickname}, {match.age}</Text>
      {/* ... 프로필 정보 */}
    </View>
  );
};
```

### 3. 로딩 상태 관리

```typescript
const getLoadingMessage = (state: LoadingState): string => {
  switch (state) {
    case 'normal':
      return '매칭 중이에요';
    case 'rematch':
      return '다시 매칭 중이에요';
    case 'external':
      return '조금 더 넓은 지역에서 찾고 있어요';
    default:
      return '';
  }
};

// 사용
<MatchingLoading message={getLoadingMessage(loadingState)} />
```

## 🎨 UI 컴포넌트

### MatchBadge

외부 매칭 성공 시 프로필에 표시되는 배지 컴포넌트

**Props:**
- `badge: BadgeData` - 배지 정보 (icon, text, distance)

**스타일:**
- 위치: 프로필 이미지 우측 상단
- 배경: 검은색 반투명 (0.7)
- 텍스트: 하얀색, 12px, 600 weight

### MatchingLoading

매칭 진행 중 표시되는 로딩 화면

**Props:**
- `message: string` - 로딩 메시지
- `description?: string` - 부가 설명 (기본값: "잠시만 기다려주세요...")

## 🔌 API 응답 구조

### 성공 응답

```typescript
{
  "success": true,
  "data": {
    "matchId": "uuid",
    "match": {
      "userId": "uuid",
      "nickname": "이서연",
      "age": 24,
      "university": "고려대 세종캠퍼스",
      "region": {
        "city": "세종특별자치시",
        "district": "조치원읍"
      },
      "distance": 23.5,
      "profileImage": "https://...",
      "bio": "카페에서 책 읽는 걸 좋아해요",
      "interests": ["카페투어", "독서", "영화"],
      "commonInterests": ["카페투어", "독서"]
    },
    "expansion": {
      "level": 1,
      "fromRegion": "대전광역시",
      "toRegion": "세종특별자치시",
      "badge": {
        "icon": "🚗",
        "text": "세종에서 찾아온 인연",
        "distance": "약 20km"
      }
    }
  }
}
```

### 실패 응답

```typescript
{
  "success": false,
  "error": {
    "code": "NO_MATCH_FOUND_ANYWHERE",
    "message": "전국에서 매칭 가능한 상대가 없습니다",
    "suggestions": [
      "프로필을 더 매력적으로 꾸며보세요",
      "관심사를 조금 더 다양하게 설정해보세요"
    ]
  }
}
```

## 📊 에러 처리

```typescript
const handleMatchError = (error: ExternalMatchErrorResponse['error']) => {
  switch (error.code) {
    case 'NO_MATCH_FOUND_ANYWHERE':
      // 전국 확장까지 실패
      router.push({
        pathname: '/match-failure',
        params: { suggestions: JSON.stringify(error.suggestions) },
      });
      break;

    case 'UNAUTHORIZED':
      // 인증 실패 - 로그인 화면으로
      router.push('/login');
      break;

    case 'TOO_MANY_REQUESTS':
      // Rate Limiting
      showToast(`${error.message} (${error.retryAfter}초 후 재시도)`);
      break;

    default:
      showToast('일시적인 오류가 발생했습니다');
  }
};
```

## 🌏 지역 확장 경로

지역별로 다른 확장 경로가 제공됩니다:

- **대전**: 대전 → 세종 → 충청권
- **서울**: 서울 → 경기 남부 → 수도권 전체
- **부산**: 부산 → 울산/양산 → 영남권
- **제주**: 제주 → 전국
- **기타**: 현재 지역 → 인근 지역 → 광역권

## ⚡ 성능 최적화

- **API 타임아웃**: 15초
- **자동 재시도**: 1회 (3초 대기)
- **React Query 캐싱**: 비활성화 (매칭 결과는 캐싱 불필요)

## 🎯 핵심 포인트

1. **투명성**: 확장 전 명확한 안내
2. **선택권**: 사용자가 진행 여부 결정
3. **심플함**: 한 번의 선택으로 완료
4. **긍정적 표현**: "멀다" 대신 "찾아온 인연"

## 📝 TODO

- [ ] Analytics 이벤트 추적 추가
- [ ] 에러 로깅 (Sentry 연동)
- [ ] Unit Tests 작성
- [ ] E2E Tests 작성
