# 프론트엔드 구현 완료 요약

## 구현 일자
2025-12-14

## 작업 개요
미승인 유저에 대한 매칭 타이머 UI 및 안내 시스템 구현

---

## 1. 변경된 파일 목록

### 타입 정의
- ✅ `src/types/user.ts`
  - `UserProfile` 인터페이스에 `isApproved?: boolean` 필드 추가

- ✅ `src/features/idle-match-timer/types.ts`
  - `MatchViewType`에 `'pending-approval'` 타입 추가
  - `ApprovalStatus` 타입 추가: `'pending' | 'approved' | 'rejected'`
  - `MatchDetails` 인터페이스에 approval 관련 필드 추가:
    - `approvalStatus?: ApprovalStatus`
    - `approvalMessage?: string`
    - `estimatedApprovalTime?: string`
  - `PendingApprovalMatch` 타입 및 type guard 함수 추가

### API 레이어
- ✅ `src/features/idle-match-timer/apis/index.tsx`
  - `getLatestMatchingV2()` 함수 추가 (기존 v1 유지)
  - 엔드포인트: `GET /api/v2/matching`

- ✅ `src/features/idle-match-timer/queries/use-latest-matching.tsx`
  - Query key 변경: `"latest-matching"` → `"latest-matching-v2"`
  - Query function 변경: `getLatestMatching` → `getLatestMatchingV2`

### UI 컴포넌트
- ✅ `src/features/idle-match-timer/ui/pending-approval.tsx` (신규)
  - 미승인 유저용 메인 화면 컴포넌트
  - 타이머 + 안내 카드 통합 UI

- ✅ `src/features/idle-match-timer/ui/pending-approval-notice.tsx` (신규)
  - 미승인 상태 안내 카드 컴포넌트
  - 승인 메시지, 예상 소요 시간, 정보 박스 포함

- ✅ `src/features/idle-match-timer/index.tsx`
  - `pending-approval` 케이스 처리 로직 추가
  - `PendingApproval` 컴포넌트 import 및 렌더링

### 다국어 지원
- ✅ `src/shared/libs/locales/ko/features/idle-match-timer.json`
- ✅ `src/shared/libs/locales/en/features/idle-match-timer.json`
- ✅ `src/shared/libs/locales/ja/features/idle-match-timer.json`
  - `pending-approval` 섹션 추가 (6개 키)

---

## 2. 주요 구현 사항

### 2.1 타입 시스템 강화
```typescript
// 신규 타입
type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching' | 'pending-approval';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// 확장된 MatchDetails
type MatchDetails = {
  // ... 기존 필드
  approvalStatus?: ApprovalStatus;
  approvalMessage?: string;
  estimatedApprovalTime?: string;
};

// Type Guard
const isPendingApprovalMatch = (match: MatchDetails): match is PendingApprovalMatch =>
  match.type === 'pending-approval' && match.untilNext !== null;
```

### 2.2 API v2 구조
```typescript
// 엔드포인트
GET /api/v2/matching

// 응답 예시 (미승인 유저)
{
  "id": null,
  "type": "pending-approval",
  "endOfView": null,
  "partner": null,
  "untilNext": "2025-12-15T10:00:00Z",
  "connectionId": null,
  "approvalStatus": "pending",
  "approvalMessage": "프로필 심사가 진행 중입니다...",
  "estimatedApprovalTime": "24-48시간"
}
```

### 2.3 UI 구성
**PendingApproval 컴포넌트 구조:**
```
┌─────────────────────────────┐
│   다음 매칭까지              │
│   [  D - 3  ] (타이머)       │
│   승인 후 매칭이 진행됩니다   │
│                              │
│  ┌─────────────────────┐    │
│  │  ⏳                  │    │
│  │  프로필 심사 진행 중   │    │
│  │  심사 안내 메시지      │    │
│  │  예상 소요 시간: 24h  │    │
│  │  💡 안내 정보         │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

## 3. 다국어 번역 키

### 추가된 번역 키 (features.idle-match-timer.ui.pending-approval)
| 키 | 한국어 | 영어 | 일본어 |
|---|--------|------|--------|
| `title` | 프로필 심사 진행 중 | Profile Under Review | プロフィール審査中 |
| `description` | 프로필 심사가 진행 중입니다... | Your profile is currently under review... | プロフィールを審査中です... |
| `estimated-time` | 예상 소요 시간 | Estimated time | 予想所要時間 |
| `info` | 승인이 완료되면 알림을... | We'll notify you when... | 承認が完了したら通知を... |
| `next-matching` | 다음 매칭까지 | Until next matching | 次のマッチングまで |
| `timer-description` | 승인 후 매칭이 진행됩니다 | Matching will start after approval | 承認後、マッチングが開始されます |

---

## 4. 버전 호환성

### v1 vs v2 비교
| 항목 | v1 (`/matching`) | v2 (`/api/v2/matching`) |
|------|------------------|-------------------------|
| 엔드포인트 | `/matching` | `/api/v2/matching` |
| 미승인 유저 응답 | `type: 'waiting'` | `type: 'pending-approval'` |
| Approval 정보 | ❌ 없음 | ✅ 포함 |
| 호환성 | 기존 클라이언트 | 신규 클라이언트 |
| 상태 | 유지 | **현재 사용 중** |

### 클라이언트 전환 전략
- v1 엔드포인트는 백엔드에서 계속 유지
- 프론트엔드는 즉시 v2 사용 (query key: `latest-matching-v2`)
- 점진적 마이그레이션 완료

---

## 5. 동작 플로우

### 미승인 유저 시나리오
```
[회원가입 완료]
       ↓
[내 성향 입력]
       ↓
[파트너 성향 입력]
       ↓
[/api/v2/matching 호출]
       ↓
[type: 'pending-approval' 응답]
       ↓
[PendingApproval UI 렌더링]
  - 타이머 표시 (다음 매칭 시간까지)
  - 안내 카드 표시
  - "승인 진행 중" 메시지
       ↓
[관리자 승인 처리]
       ↓
[다음 폴링 시 type: 'waiting' 또는 'open' 응답]
       ↓
[정상 매칭 플로우]
```

### 승인된 유저 시나리오 (기존과 동일)
```
[/api/v2/matching 호출]
       ↓
[type: 'open' | 'waiting' | 'not-found' | 'rematching']
       ↓
[기존 UI 렌더링]
```

---

## 6. 스타일링 원칙 준수

### ✅ StyleSheet 사용
```typescript
const styles = StyleSheet.create({
  container: { /* ... */ },
  card: { /* ... */ },
  // Tailwind/NativeWind 사용 안 함
});
```

### ✅ Semantic Colors 활용
```typescript
import { semanticColors } from "@/src/shared/constants/colors";

backgroundColor: semanticColors.background.primary,
borderColor: semanticColors.brand.primary,
```

---

## 7. 테스트 체크리스트

### ✅ 완료된 검증
- [x] TypeScript 타입 체크 (idle-match-timer 관련 에러 없음)
- [x] 타입 안전성 (type guard 함수 추가)
- [x] i18n 키 일관성 (한/영/일 3개 언어)
- [x] StyleSheet 준수
- [x] Semantic colors 사용

### ⚠️ 백엔드 대기 중
- [ ] `/api/v2/matching` 엔드포인트 구현
- [ ] `UserProfile.isApproved` 필드 추가
- [ ] 미승인 유저 매칭 큐 제외 로직

### 📝 향후 테스트 필요
- [ ] 실제 API 응답 연동 후 UI 동작 확인
- [ ] 타이머 카운트다운 정확성
- [ ] 승인 완료 후 자동 전환 테스트
- [ ] 다국어 표시 확인

---

## 8. 백엔드 팀 전달 사항

### 필수 구현 항목
1. **UserProfile 스키마 변경**
   - `isApproved: boolean` 필드 추가 (default: false)

2. **/api/v2/matching 엔드포인트**
   - 미승인 유저: `type: 'pending-approval'` 응답
   - `approvalStatus`, `approvalMessage`, `estimatedApprovalTime` 포함

3. **매칭 로직 변경**
   - `isApproved: false` 유저는 매칭 큐에서 제외
   - `untilNext`는 다음 매칭 예정 시간 반환 (타이머용)

### 참고 문서
- 📄 `docs/backend-matching-api-v2-spec.md` (상세 API 명세)

---

## 9. 코드 위치 참고

### 주요 파일 경로
```
src/
├── types/
│   └── user.ts (UserProfile.isApproved)
├── features/
│   └── idle-match-timer/
│       ├── types.ts (PendingApprovalMatch)
│       ├── apis/index.tsx (getLatestMatchingV2)
│       ├── queries/use-latest-matching.tsx
│       ├── index.tsx (라우팅 로직)
│       └── ui/
│           ├── pending-approval.tsx (NEW)
│           └── pending-approval-notice.tsx (NEW)
└── shared/
    └── libs/
        └── locales/
            ├── ko/features/idle-match-timer.json
            ├── en/features/idle-match-timer.json
            └── ja/features/idle-match-timer.json
```

---

## 10. Git Commit 권장사항

### Commit Message (Angular Convention)
```bash
feat(idle-match-timer): 미승인 유저 매칭 타이머 UI 추가

- UserProfile에 isApproved 필드 추가
- pending-approval 타입 및 관련 UI 컴포넌트 구현
- API v2 엔드포인트 연동 (getLatestMatchingV2)
- 한/영/일 다국어 지원 추가
- 타이머 + 안내 카드 통합 레이아웃

Refs: #[티켓번호]
```

---

## 11. 추가 고려사항

### 향후 확장 가능성
1. **반려(rejected) 처리**
   - `approvalStatus: 'rejected'` 응답 시 별도 UI
   - 재신청 플로우 추가

2. **승인 알림**
   - 푸시 알림 연동
   - 인앱 알림 배너

3. **심사 진행 상태**
   - 심사 단계별 진행률 표시 (선택)
   - 예상 소요 시간 실시간 업데이트

---

## 문서 버전
- **작성일**: 2025-12-14
- **작성자**: Frontend Team
- **상태**: ✅ 구현 완료 (백엔드 대기 중)
