# Mini Game - WebSocket 이벤트 명세

> 기존 채팅 소켓(`ChatSocketEventName`)을 확장합니다.
> 소켓 서버: `wss://api.some-in-univ.com/chat`

---

## 1. 이벤트 목록

### 서버 → 클라이언트 (수신)

| 이벤트명 | 트리거 | 설명 |
|---------|--------|------|
| `gameInvited` | 상대가 게임 생성 | 게임 초대 알림 |
| `gameAnswerSubmitted` | 상대가 답변 제출 | 상대 답변 완료 알림 |
| `gameCompleted` | 양쪽 답변 완료 | 게임 결과 도착 |
| `gameExpired` | 만료 시간 도달 | 게임 만료 알림 |
| `missionStarted` | 일일 미션 자동 생성 | 오늘의 미션 알림 |
| `missionPartnerCompleted` | 상대 미션 완료 | 상대 미션 완료 알림 |
| `streakUpdated` | 스트릭 변경 | 스트릭 업데이트 |
| `meetSuggestReceived` | 상대가 만남 제안 | 만남 제안 수신 |
| `meetSuggestResponded` | 상대가 만남 응답 | 만남 제안 응답 수신 |
| `gameNudge` | 서버 스케줄러 | 대화 정체 시 게임 넛지 |

### 클라이언트 → 서버 (발신)

| 이벤트명 | 용도 | 설명 |
|---------|------|------|
| `startGame` | 게임 시작 | REST API 대신 소켓으로 실시간 시작 (선택) |
| `submitGameAnswer` | 답변 제출 | 밸런스 게임 실시간 모드용 |
| `joinGameSession` | 게임 세션 진입 | 게임 화면 열 때 |
| `leaveGameSession` | 게임 세션 이탈 | 게임 화면 닫을 때 |

---

## 2. 이벤트 페이로드 상세

### 2.1 gameInvited

상대방이 게임을 생성했을 때 수신.

```typescript
interface GameInvitedPayload {
  /** 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 초대자 정보 */
  inviter: {
    userId: string;
    name: string;
  };

  /** 라운드 수 */
  roundCount: number;

  /** 만료 시각 */
  expiresAt: string;

  /** 타임스탬프 */
  timestamp: string;
}
```

**프론트엔드 처리**:
- 채팅방 메시지 목록에 `game_invite` 시스템 메시지 삽입
- 해당 채팅방에 있으면 게임 카드 즉시 표시
- 다른 화면이면 push notification + 채팅 목록 업데이트

---

### 2.2 gameAnswerSubmitted

상대방이 답변을 제출했을 때 수신.

```typescript
interface GameAnswerSubmittedPayload {
  /** 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 답변한 사람 */
  answerer: {
    userId: string;
    name: string;
  };

  /** 답변 완료한 라운드 ID */
  roundId: string;

  /** 상대방이 전체 답변을 완료했는지 */
  allRoundsCompleted: boolean;

  /** 타임스탬프 */
  timestamp: string;
}
```

**프론트엔드 처리**:
- `allRoundsCompleted === true`이면 "OO님이 모든 답변을 완료했어요!" 표시
- 밸런스 게임 실시간 모드에서는 즉시 결과 비교 표시
- 게임 세션 쿼리 invalidate

---

### 2.3 gameCompleted

양쪽 모두 답변을 완료하여 결과가 산출되었을 때.

```typescript
interface GameCompletedPayload {
  /** 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 게임 결과 */
  result: GameResult;

  /** 보상 정보 */
  reward: GameReward;

  /** 스트릭 정보 */
  streak: GameStreakInfo;

  /** 타임스탬프 */
  timestamp: string;
}
```

**프론트엔드 처리**:
- 채팅방에 `game_result` 시스템 메시지 삽입
- 게임 화면 열려있으면 결과 화면으로 전환
- 스트릭 UI 업데이트
- 구슬 잔액 갱신 (쿼리 invalidate)

---

### 2.4 gameExpired

게임이 만료되었을 때.

```typescript
interface GameExpiredPayload {
  /** 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 타임스탬프 */
  timestamp: string;
}
```

**프론트엔드 처리**:
- 게임 카드를 "만료됨" 상태로 업데이트
- 진행 중이던 게임 화면이면 만료 알림 표시 후 닫기

---

### 2.5 missionStarted

오늘의 일일 미션이 생성되었을 때 (서버 스케줄러에 의해 매일 오전 자동 생성).

```typescript
interface MissionStartedPayload {
  /** 미션 게임 세션 ID */
  gameId: string;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 미션 상세 */
  mission: {
    id: string;
    text: string;
    category: MissionCategory;
    submissionType: MissionSubmissionType;
    icon: string;
  };

  /** 만료 시각 (당일 23:59) */
  expiresAt: string;

  /** 타임스탬프 */
  timestamp: string;
}
```

---

### 2.6 missionPartnerCompleted

상대방이 미션을 완료했을 때.

```typescript
interface MissionPartnerCompletedPayload {
  /** 미션 게임 세션 ID */
  gameId: string;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 상대 제출 내용 */
  partnerSubmission: {
    type: MissionSubmissionType;
    /** text면 내용, image면 URL, link면 URL */
    content: string;
    title?: string;
  };

  /** 양쪽 모두 완료 여부 */
  bothCompleted: boolean;

  /** 보상 (양쪽 완료 시) */
  reward: GameReward | null;

  /** 스트릭 (양쪽 완료 시) */
  streak: GameStreakInfo | null;

  /** 타임스탬프 */
  timestamp: string;
}
```

---

### 2.7 streakUpdated

스트릭이 변경되었을 때 (증가, 리셋, 보너스 달성).

```typescript
interface StreakUpdatedPayload {
  /** 채팅방 ID */
  chatRoomId: string;

  /** 변경된 스트릭 정보 */
  streak: GameStreakInfo;

  /** 보너스 보상 (달성 시) */
  bonusReward: GameReward | null;

  /** 타임스탬프 */
  timestamp: string;
}
```

---

### 2.8 meetSuggestReceived

상대방이 만남을 제안했을 때.

```typescript
interface MeetSuggestReceivedPayload {
  /** 만남 제안 ID */
  meetSuggestId: string;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 제안자 정보 */
  suggestedBy: {
    userId: string;
    name: string;
  };

  /** 만남 활동 유형 */
  activityType: MeetActivityType;

  /** 직접 입력 활동명 */
  customActivity?: string;

  /** 제안 메시지 */
  message?: string;

  /** 타임스탬프 */
  timestamp: string;
}
```

---

### 2.9 meetSuggestResponded

상대방이 만남 제안에 응답했을 때.

```typescript
interface MeetSuggestRespondedPayload {
  /** 만남 제안 ID */
  meetSuggestId: string;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 수락 여부 */
  accepted: boolean;

  /** 응답자 정보 */
  responder: {
    userId: string;
    name: string;
  };

  /** 보상 (수락 시) */
  reward: GameReward | null;

  /** 타임스탬프 */
  timestamp: string;
}
```

---

### 2.10 gameNudge

대화 정체 감지 시 서버가 보내는 넛지.

```typescript
interface GameNudgePayload {
  /** 채팅방 ID */
  chatRoomId: string;

  /** 마지막 메시지 이후 경과 시간 (시간) */
  hoursSinceLastMessage: number;

  /** 제안할 게임 유형 */
  suggestedGameTypes: GameType[];

  /** 타임스탬프 */
  timestamp: string;
}
```

**넛지 발동 조건** (서버 스케줄러):
- 마지막 양방향 메시지로부터 12시간 경과
- 해당 채팅방에서 오늘 넛지를 아직 안 보냈음
- 유저의 넛지 설정이 `enabled: true`
- 채팅방이 `hasLeft === false`

---

## 3. 클라이언트 발신 이벤트

### 3.1 joinGameSession

게임 화면에 진입할 때 발신. 실시간 상태 동기화를 위해 사용.

```typescript
interface JoinGameSessionPayload {
  gameId: string;
  chatRoomId: string;
}
```

### 3.2 leaveGameSession

게임 화면에서 이탈할 때 발신.

```typescript
interface LeaveGameSessionPayload {
  gameId: string;
  chatRoomId: string;
}
```

### 3.3 submitGameAnswer (실시간 모드)

밸런스 게임에서 실시간으로 상대 답변과 비교하기 위한 소켓 전송.
REST API(`POST /v1/games/:gameId/answers`)의 소켓 버전.

```typescript
interface SubmitGameAnswerPayload {
  gameId: string;
  roundId: string;
  selectedOptionId: string;
  responseTimeSeconds: number;
}
```

> 밸런스 게임의 실시간 모드에서만 사용.
> 다른 게임 유형은 REST API로 답변 제출.

---

## 4. 소켓 이벤트 타입 통합

기존 `ChatSocketEventName`에 추가:

```typescript
// 기존
type ChatSocketEventName =
  | 'connected' | 'error' | 'newMessage' | 'chatRoomCreated'
  | 'chatHistory' | 'chatRoomLeft' | 'userTyping' | 'userStoppedTyping'
  | 'messagesRead' | 'messageUpdated' | 'imageUploadStatus';

// 추가
type GameSocketEventName =
  | 'gameInvited'
  | 'gameAnswerSubmitted'
  | 'gameCompleted'
  | 'gameExpired'
  | 'missionStarted'
  | 'missionPartnerCompleted'
  | 'streakUpdated'
  | 'meetSuggestReceived'
  | 'meetSuggestResponded'
  | 'gameNudge';

// 통합
type SocketEventName = ChatSocketEventName | GameSocketEventName;
```

**페이로드 맵**:
```typescript
interface GameSocketEventPayloads {
  gameInvited: GameInvitedPayload;
  gameAnswerSubmitted: GameAnswerSubmittedPayload;
  gameCompleted: GameCompletedPayload;
  gameExpired: GameExpiredPayload;
  missionStarted: MissionStartedPayload;
  missionPartnerCompleted: MissionPartnerCompletedPayload;
  streakUpdated: StreakUpdatedPayload;
  meetSuggestReceived: MeetSuggestReceivedPayload;
  meetSuggestResponded: MeetSuggestRespondedPayload;
  gameNudge: GameNudgePayload;
}
```

---

## 5. 에러 이벤트

게임 관련 소켓 에러 시 기존 `error` 이벤트의 payload를 확장:

```typescript
interface GameSocketError {
  type: 'game_error';
  code: string;
  message: string;
  gameId?: string;
  chatRoomId?: string;
}
```

| code | 설명 |
|------|------|
| `GAME_SESSION_NOT_FOUND` | 존재하지 않는 게임 세션 |
| `GAME_ALREADY_EXPIRED` | 만료된 게임에 답변 시도 |
| `NOT_GAME_PARTICIPANT` | 게임 참여자가 아닌 유저 |
| `ANSWER_CONFLICT` | 동시 답변 충돌 (retry 필요) |
