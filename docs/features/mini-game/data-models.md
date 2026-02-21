# Mini Game - 데이터 모델 & 공통 DTO

---

## 1. Enum / Literal Union 정의

### 1.1 GameType — 게임 유형

```typescript
type GameType = 'icebreaker' | 'balance' | 'guess_match' | 'daily_mission';
```

| 값 | 설명 | 질문 수 | 특이사항 |
|----|------|--------|---------|
| `icebreaker` | 매칭 직후 아이스브레이커 | 3 | 채팅방당 1회, 스킵 가능 |
| `balance` | 밸런스 게임 (A vs B) | 5 | 타이머 옵션, 1일 1회/상대 |
| `guess_match` | 양방향 퀴즈 (답변+추측) | 3 | guessedOptionId 필수 |
| `daily_mission` | 일일 미션 (활동 공유) | 1 | 당일 23:59 만료 |

### 1.2 GameStatus — 게임 상태

```typescript
type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'expired' | 'skipped';
```

**상태 머신**:
```
                ┌─────────┐
                │ waiting  │  ← 게임 생성 직후 (상대 대기)
                └────┬─────┘
                     │ 한쪽이 첫 답변 제출
                     ▼
              ┌──────────────┐
              │ in_progress  │  ← 답변 진행 중
              └──────┬───────┘
              ┌──────┼──────┐
              │      │      │
              ▼      ▼      ▼
        ┌──────┐ ┌───────┐ ┌────────┐
        │ comp │ │expired│ │skipped │
        │leted │ │       │ │        │
        └──────┘ └───────┘ └────────┘
          양쪽    시간초과   유저 스킵
          완료
```

| 전환 | 조건 |
|------|------|
| `waiting` → `in_progress` | 어느 한쪽이 첫 답변 제출 |
| `waiting` → `skipped` | 생성자가 스킵 |
| `in_progress` → `completed` | 양쪽 모든 라운드 답변 완료 |
| `waiting/in_progress` → `expired` | `expiresAt` 도달 (icebreaker: 24h, balance/guess: 6h, mission: 당일) |

### 1.3 Difficulty — 난이도

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
```

| 난이도 | 적용 기준 | 질문 예시 |
|--------|----------|----------|
| `easy` | 대화 1~3일 | 짜장면 vs 짬뽕, 바다 vs 산 |
| `medium` | 대화 4~7일 | 계획 여행 vs 즉흥, 집 데이트 vs 밖 데이트 |
| `hard` | 대화 7일+ | 연인 비번 공유 여부, 이상적 연락 빈도 |

**서버 자동 결정 로직**: 채팅방 생성일로부터 경과 일수 + 주고받은 메시지 수 기반

### 1.4 MissionCategory — 미션 카테고리

```typescript
type MissionCategory = 'photo' | 'music' | 'question' | 'recommendation' | 'activity';
```

### 1.5 MissionSubmissionType — 미션 제출 유형

```typescript
type MissionSubmissionType = 'text' | 'image' | 'link';
```

### 1.6 MeetActivityType — 만남 활동 유형

```typescript
type MeetActivityType = 'cafe' | 'restaurant' | 'walk' | 'custom';
```

### 1.7 QuestionCategory — 질문 카테고리

```typescript
type QuestionCategory =
  | 'lifestyle'    // 라이프스타일
  | 'travel'       // 여행
  | 'food'         // 음식
  | 'hobby'        // 취미
  | 'relationship' // 관계/연애
  | 'values'       // 가치관
  | 'personality'  // 성격
  | 'future';      // 미래/꿈
```

---

## 2. 핵심 엔티티

### 2.1 GameSession — 게임 세션

1회 게임 플레이를 나타내는 최상위 엔티티.

```typescript
interface GameSession {
  /** UUID */
  id: string;

  /** 채팅방 ID (FK → chat_rooms.id) */
  chatRoomId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 게임 상태 */
  status: GameStatus;

  /** 게임 생성자 (초대한 유저 ID) */
  createdBy: string;

  /** 상대 유저 ID */
  partnerId: string;

  /** 적용된 난이도 */
  difficulty: Difficulty;

  /** 이 게임의 라운드 목록 */
  rounds: GameRound[];

  /** 결과 (completed 상태에서만 존재) */
  result: GameResult | null;

  /** 만료 시각 */
  expiresAt: string;

  /** 완료 시각 */
  completedAt: string | null;

  /** 생성 시각 */
  createdAt: string;

  /** 수정 시각 */
  updatedAt: string;
}
```

### 2.2 GameRound — 게임 라운드

게임 내 개별 질문/미션 1개.

```typescript
interface GameRound {
  /** UUID */
  id: string;

  /** 소속 게임 세션 ID */
  gameId: string;

  /** 라운드 순서 (0-based) */
  order: number;

  /** 질문 정보 */
  question: GameQuestion;

  /** 이 라운드에 대한 답변들 */
  answers: GameAnswer[];
}
```

### 2.3 GameQuestion — 질문

질문 풀에서 추출된 개별 질문.

```typescript
interface GameQuestion {
  /** UUID */
  id: string;

  /** 질문 텍스트 */
  text: string;

  /** 질문 카테고리 */
  category: QuestionCategory;

  /** 난이도 */
  difficulty: Difficulty;

  /** 선택지 목록 */
  options: GameOption[];

  /**
   * 게임 유형별 질문 형태
   * - icebreaker: 4지선다
   * - balance: 2지선다 (A vs B)
   * - guess_match: 4지선다
   * - daily_mission: options 없음 (미션 텍스트만)
   */
  gameType: GameType;
}

interface GameOption {
  /** UUID */
  id: string;

  /** 옵션 텍스트 */
  text: string;

  /** 옵션 아이콘/이모지 (선택) */
  icon?: string;

  /** 표시 순서 */
  order: number;
}
```

### 2.4 GameAnswer — 답변

유저 1명의 1개 라운드에 대한 답변.

```typescript
interface GameAnswer {
  /** UUID */
  id: string;

  /** 소속 게임 세션 ID */
  gameId: string;

  /** 소속 라운드 ID */
  roundId: string;

  /** 답변한 유저 ID */
  userId: string;

  /** 선택한 옵션 ID */
  selectedOptionId: string;

  /**
   * 상대방 답변 추측 (guess_match 전용)
   * 어떤 옵션을 골랐을지 추측한 옵션 ID
   */
  guessedOptionId: string | null;

  /** 답변 소요 시간 (초) */
  responseTimeSeconds: number;

  /** 답변 시각 */
  answeredAt: string;
}
```

### 2.5 GameResult — 게임 결과

양쪽 답변 완료 시 서버가 산출하는 결과.

```typescript
interface GameResult {
  /** 전체 일치율 (0~100) */
  matchRate: number;

  /** 일치한 라운드 ID 목록 */
  matchedRoundIds: string[];

  /** 불일치 라운드 ID 목록 */
  mismatchedRoundIds: string[];

  /**
   * 추측 정확도 (guess_match 전용)
   * 내가 상대를 맞춘 비율
   */
  myGuessAccuracy: number | null;

  /**
   * 상대가 나를 맞춘 비율
   */
  partnerGuessAccuracy: number | null;

  /** 결과 요약 메시지 (서버 생성) */
  summaryMessage: string;
}
```

**summaryMessage 생성 규칙**:

| matchRate | 메시지 예시 |
|-----------|-----------|
| 80~100% | "거의 한 몸이네요! 취향이 정말 비슷해요" |
| 60~79% | "비슷한 부분이 꽤 많네요!" |
| 40~59% | "반반! 비슷한 점과 다른 점을 모두 발견했어요" |
| 20~39% | "다른 점이 많지만, 그래서 더 재미있을 수도!" |
| 0~19% | "정반대 취향! 서로 새로운 세계를 보여줄 수 있겠어요" |

> 부정적 프레이밍 금지. 항상 긍정적/호기심 유발 톤 유지.

---

## 3. 보상 & 스트릭

### 3.1 GameReward — 보상

```typescript
interface GameReward {
  /** 지급된 구슬 수 */
  marbles: number;

  /** 보상 유형 */
  rewardType: GameRewardType;

  /** 보상 후 현재 구슬 잔액 */
  currentBalance: number;

  /** 보너스 여부 (스트릭 보너스 등) */
  isBonus: boolean;

  /** 보너스 사유 */
  bonusReason: string | null;
}

type GameRewardType = 'game_complete' | 'mission_complete' | 'streak_bonus' | 'meet_accept';
```

**보상 테이블**:

| 활동 | rewardType | marbles | 조건 |
|------|-----------|---------|------|
| 아이스브레이커 완료 | `game_complete` | 5 | 양쪽 답변 완료 |
| 밸런스 게임 완료 | `game_complete` | 3 | 양쪽 답변 완료 |
| 양방향 퀴즈 완료 | `game_complete` | 3 | 양쪽 답변 완료 |
| 일일 미션 완료 | `mission_complete` | 5 | 양쪽 제출 완료 |
| 3일 연속 스트릭 | `streak_bonus` | 10 | 3일 연속 게임 완료 |
| 7일 연속 스트릭 | `streak_bonus` | 30 | 7일 연속 게임 완료 |
| 만남 제안 수락 | `meet_accept` | 15 | 상대가 수락 시 양쪽 지급 |

### 3.2 GameStreakInfo — 스트릭 정보

```typescript
interface GameStreakInfo {
  /** 현재 연속 일수 */
  currentStreak: number;

  /** 최장 연속 기록 */
  longestStreak: number;

  /** 오늘 게임 완료 여부 */
  completedToday: boolean;

  /** 다음 스트릭 보너스까지 남은 일수 (null이면 보너스 없음) */
  nextBonusIn: number | null;

  /** 다음 스트릭 보너스 구슬 수 */
  nextBonusReward: number | null;
}
```

**스트릭 카운트 규칙**:
- 하루 1회 이상 아무 게임 완료 시 스트릭 유지
- "완료" = 양쪽 모두 답변 마친 상태
- 자정(KST 00:00) 기준 리셋 판단
- 한 채팅방에서 여러 게임 해도 스트릭은 +1/일

---

## 4. 채팅 연동 모델

### 4.1 게임 관련 채팅 메시지 타입 확장

기존 `Chat.messageType: string`에 추가되는 값:

```typescript
type GameMessageType =
  | 'game_invite'       // 게임 초대 카드
  | 'game_answer_notify'// "[이름]님이 답변했어요!" 알림
  | 'game_result'       // 게임 결과 카드
  | 'game_nudge'        // 대화 정체 시 게임 제안 넛지
  | 'mission_start'     // 일일 미션 시작 카드
  | 'mission_complete'  // 미션 양쪽 완료 카드
  | 'meet_suggest'      // 만남 제안 카드
  | 'meet_response';    // 만남 제안 응답 (수락/거절)
```

### 4.2 게임 메시지 content 구조

`Chat.messageType`이 게임 관련일 때, `Chat.content`는 JSON string으로 메타데이터를 포함합니다.

```typescript
// messageType === 'game_invite'
interface GameInviteContent {
  gameId: string;
  gameType: GameType;
  inviterName: string;
  roundCount: number;
}

// messageType === 'game_answer_notify'
interface GameAnswerNotifyContent {
  gameId: string;
  gameType: GameType;
  answererName: string;
  /** 내가 아직 답변 안 했으면 true */
  waitingForMe: boolean;
}

// messageType === 'game_result'
interface GameResultContent {
  gameId: string;
  gameType: GameType;
  matchRate: number;
  summaryMessage: string;
}

// messageType === 'game_nudge'
interface GameNudgeContent {
  /** 마지막 메시지 이후 경과 시간 (시간) */
  hoursSinceLastMessage: number;
  /** 제안할 게임 유형 목록 */
  suggestedGameTypes: GameType[];
}

// messageType === 'mission_start'
interface MissionStartContent {
  gameId: string;
  missionText: string;
  missionIcon: string;
  expiresAt: string;
}

// messageType === 'mission_complete'
interface MissionCompleteContent {
  gameId: string;
  missionText: string;
  reward: GameReward;
}

// messageType === 'meet_suggest'
interface MeetSuggestContent {
  meetSuggestId: string;
  activityType: MeetActivityType;
  customActivity?: string;
  message?: string;
  suggestedByName: string;
}

// messageType === 'meet_response'
interface MeetResponseContent {
  meetSuggestId: string;
  accepted: boolean;
  responderName: string;
}
```

**파싱 방법**:
```typescript
// 프론트엔드에서 content를 파싱
const chat: Chat = { messageType: 'game_result', content: '{"gameId":"...","matchRate":60}', ... };

if (chat.messageType === 'game_result') {
  const data: GameResultContent = JSON.parse(chat.content);
  // data.matchRate → 60
}
```

---

## 5. 만남 제안 모델

### 5.1 MeetSuggest — 만남 제안

```typescript
interface MeetSuggest {
  /** UUID */
  id: string;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 제안자 유저 ID */
  suggestedBy: string;

  /** 만남 활동 유형 */
  activityType: MeetActivityType;

  /** 직접 입력 활동명 */
  customActivity: string | null;

  /** 제안 메시지 */
  message: string | null;

  /** 응답 상태 */
  responseStatus: 'pending' | 'accepted' | 'declined';

  /** 응답 시각 */
  respondedAt: string | null;

  /** 생성 시각 */
  createdAt: string;
}
```

---

## 6. 알림 확장

기존 `NotificationSubType`에 추가:

```typescript
type GameNotificationSubType =
  | 'game_invite'        // "OO님이 밸런스 게임을 보냈어요!"
  | 'game_partner_done'  // "OO님이 답변을 완료했어요! 결과를 확인하세요"
  | 'game_nudge'         // "OO님과 게임 한판 어때요?"
  | 'mission_reminder'   // "오늘의 미션이 곧 만료돼요!"
  | 'streak_milestone'   // "🔥 3일 연속 게임 달성! 보너스 +10 구슬"
  | 'meet_suggest'       // "OO님이 만남을 제안했어요!"
  | 'meet_accepted';     // "OO님이 만남을 수락했어요!"
```

**푸시 알림 페이로드**:
```typescript
interface GamePushPayload {
  type: 'game';
  subType: GameNotificationSubType;
  title: string;
  body: string;
  data: {
    chatRoomId: string;
    gameId?: string;
    meetSuggestId?: string;
  };
}
```

---

## 7. 일일 제한 & 비즈니스 규칙

### 7.1 제한 테이블

| 제한 항목 | 값 | 단위 | 비고 |
|----------|---|------|------|
| 하루 게임 시작 | 3 | 회/일/유저 | 전체 채팅방 합산 |
| 같은 상대 같은 게임 유형 | 1 | 회/일 | balance 1회, guess 1회는 가능 |
| 아이스브레이커 | 1 | 회/채팅방(평생) | 스킵 포함 1회 기회 |
| 넛지 메시지 | 1 | 회/일/채팅방 | 12시간 대화 정체 시 |
| 만남 제안 넛지 | 1 | 회/채팅방(평생) | 3회 게임 완료 시 자동 |
| 게임 만료 (icebreaker) | 24 | 시간 | |
| 게임 만료 (balance, guess) | 6 | 시간 | |
| 게임 만료 (mission) | 당일 | 23:59 KST | |

### 7.2 난이도 자동 결정 로직

```
IF 채팅방 생성 후 경과일 <= 3일:
  difficulty = 'easy'
ELSE IF 경과일 <= 7일:
  difficulty = 'medium'
ELSE:
  difficulty = 'hard'

// 보정: 메시지 수가 적으면 난이도 하향
IF 총 메시지 수 < 10 AND difficulty !== 'easy':
  difficulty = difficulty - 1단계
```

### 7.3 질문 중복 방지

- 같은 채팅방에서 이미 출제된 질문은 제외
- 질문 풀 소진 시 이전 질문 재출제 허용 (30일 쿨다운)
