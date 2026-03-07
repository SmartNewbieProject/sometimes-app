# 무료 보상 어뷰징 차단 UX 설계

> 작성일: 2026-03-04

## Original Requirement

"현재 무료 보상 지급 (커뮤니티 댓글, 마이페이지 학교인증, 인스타인증 친구 초대등) 가능여부에 대한 API를 통해 모달로 안내하는곳은 받을수없으면 모달을 띄워주지않거나, 상점페이지에서 비활성화되어있는등 UX 설계를 통해 어뷰징계정의 중복 수령 차단기능을 작업하고싶어"

## Clarified Requirement

### Goal

`GET /api/v1/event/free-rewards/status` API 응답의 `eligible`/`reason` 필드를 활용하여, 5가지 무료 보상의 중복 수령을 프론트엔드 UX 레벨에서 차단

### Scope

- **프론트엔드(React Native)만** — API는 이미 완성되어 있으므로 백엔드 변경 없음

### 대상 보상 (5종)

| 보상 키 | 설명 | Gems |
|---------|------|------|
| `welcomeReward` | 가입 축하 보상 | 5 |
| `instagramRegistration` | 인스타그램 등록 | 2 |
| `universityVerification` | 대학교 인증 | 5 |
| `referralInvitee` | 추천 초대 보상 | 30 |
| `communityFirstPost` | 커뮤니티 첫 글 | 1 |

### 적용 화면

보상 관련 UI가 있는 **모든 곳**:
- 상점(Store) 페이지 — 보상 목록
- 마이페이지 — 학교 인증, 인스타그램 인증
- 커뮤니티 — 첫 글 작성 보상
- 초대 화면 — 추천 초대 보상
- 안내 모달/팝업 — 보상 안내 모달

### UX 설계

| 항목 | 설계 |
|------|------|
| `eligible=false` 처리 | **비활성화 + 사유 표시** (숨기지 않음) |
| 비활성화 시각 표현 | **그레이아웃(opacity 감소) + ✅ 체크마크 아이콘** |
| 사유 메시지 | **통일 메시지** — reason 코드 구분 없이 단일 텍스트 (예: '수령 완료') |
| `eligible=true` 처리 | 기존 활성 상태 유지 (탭/클릭 가능) |

### API 호출 전략

| 시점 | 동작 |
|------|------|
| 앱 시작(로그인) | `free-rewards/status` **1회 호출** → 전역 상태(Zustand 등)에 캐시 |
| 보상 수령 성공 후 | `free-rewards/status` **재호출** → 캐시 갱신 → 즉시 UI 반영 |
| 화면 전환 | 캐시된 데이터 사용 (추가 API 호출 없음) |

### API 응답 참고

```typescript
interface FreeRewardStatus {
  rewards: {
    welcomeReward: RewardEligibility;
    instagramRegistration: RewardEligibility;
    universityVerification: RewardEligibility;
    referralInvitee: RewardEligibility;
    communityFirstPost: RewardEligibility;
  };
}

interface RewardEligibility {
  eligible: boolean;        // 수령 가능 여부
  reason: string | null;    // 'ALREADY_RECEIVED' | 'ALREADY_PARTICIPATED' | null
  gemsAmount: number;       // 보상 구슬 수
}
```

### Success Criteria

- [ ] 앱 시작 시 보상 상태 API 1회 호출 → 전역 캐시
- [ ] 상점 페이지에서 eligible=false 보상이 그레이아웃 + 체크마크 + 통일 메시지로 표시
- [ ] 각 기능 화면(마이페이지, 커뮤니티, 초대)에서 eligible=false 시 비활성화 처리
- [ ] 모달/팝업에서 eligible=false 시 비활성화 처리
- [ ] 보상 수령 성공 후 API 재호출하여 캐시 갱신 → 즉시 UI 반영
- [ ] 어뷰징 계정(재가입 등)이 이미 수령한 보상을 다시 수령할 수 없도록 UI 차단

## Decisions Log

| 질문 | 결정 |
|------|------|
| eligible=false UX 전략 | 비활성화 + 사유 표시 |
| 작업 범위 | 프론트엔드만 |
| API 호출 시점 | 앱 시작 시 1회 + 캐시 |
| 적용 화면 | 상점 + 기능화면 + 모달/팝업 전부 |
| 비활성화 UI | 그레이아웃 + 체크마크 |
| reason별 메시지 | 통일 메시지 |
| 수령 후 UI 업데이트 | API 재호출 + 캐시 갱신 |
