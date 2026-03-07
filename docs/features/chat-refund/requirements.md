# 채팅 즉시 환불 기능 요구사항

## Original Requirement

> Google Form 기반 환불을 앱 내 즉시 환불로 변경. canRefund=true일 때 버튼 클릭 → 서버 API 호출 → 즉시 구슬 11개 환불.

## Clarified Specification

### Goal

채팅방 48시간 무응답 환불을 Google Form 외부 링크 → 앱 내 즉시 환불 API 호출로 전환

### Scope

| 포함 | 제외 |
|------|------|
| 수동 환불 API 엔드포인트 신설 | 환불 기준(canRefund) 로직 변경 |
| 확인 모달 → API 호출 → 채팅방 자동 퇴장 | 자동 환불(여성 퇴장) 기준 변경 |
| `chat_room_refunds` 테이블 신설 | 환불 금액 변경 (11개 고정 유지) |
| 중복 환불 방지 (채팅방당 1회) | |

### Decisions

| Question | Decision |
|----------|----------|
| 환불 확인 UI | 확인 모달 표시 후 진행 |
| 환불 후 채팅방 | 자동 나가기 (leave 처리) |
| canRefund 기준 통일 | 현행 유지 (수동: 48h+msg<5 / 자동: 여성퇴장+msg≤8) |
| 중복 환불 방지 | 채팅방당 환불 1회 제한 (수동/자동 통합) |
| 환불 기록 | gem_transactions + chat_room_refunds 둘 다 기록 |

### UI Flow

```
남성 유저가 "구슬 돌려받기" 탭
  → 확인 모달: "구슬 11개를 돌려받으시겠어요?"
    → [확인] → POST /api/chat/rooms/:id/refund
      → 성공 → 토스트 "구슬 11개가 환불되었어요"
             → 채팅방 자동 퇴장 (leave 처리)
      → 실패 → 에러 토스트
    → [취소] → 모달 닫기
```

### API Schema

**Endpoint**: `POST /api/chat/rooms/:chatRoomId/refund`

**Headers**: `Authorization: Bearer {token}`

**Response 200**:
```json
{
  "refundedGems": 11,
  "totalGems": 150
}
```

**Error 400**: 환불 조건 미충족 (canRefund=false)
**Error 409**: 이미 환불된 채팅방

### DB: chat_room_refunds 테이블

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| chat_room_id | varchar | FK → chat_rooms.id |
| user_id | varchar | 환불 수령자 (남성) |
| refund_type | enum | MANUAL / AUTO |
| gem_amount | integer | 환불 구슬 수 (11) |
| reason | varchar | 환불 사유 |
| created_at | timestamp | 환불 시점 |

### Constraints

- 채팅방당 환불 1회 제한: `chat_room_refunds`에 해당 chat_room_id 레코드 존재 시 거부
- 자동 환불(여성 퇴장) 시에도 동일 테이블에 기록 → 수동 환불 중복 방지
- 기존 `gem_transactions` (CHAT_REFUND) 기록도 병행 유지

### 현행 기준 참고

| 구분 | 조건 | 환불 금액 |
|------|------|----------|
| 수동 환불 (canRefund UI) | 48h 경과 + 메시지 < 5 | 11개 |
| 자동 환불 (여성 퇴장) | 여성 퇴장 + 메시지 ≤ 8 | 11개 |
