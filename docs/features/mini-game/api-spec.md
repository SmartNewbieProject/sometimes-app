# Mini Game - REST API Specification

> axiosClient interceptor가 `response.data.data`를 자동 추출합니다.
> 아래 "Response"는 interceptor 통과 후 프론트엔드가 받는 데이터입니다.

---

## 1. 게임 세션 API

### 1.1 게임 생성

새 게임 세션을 생성하고 채팅방에 초대 메시지를 발행합니다.

```
POST /v1/games
```

**Request Body**:
```typescript
interface CreateGameRequest {
  /** 게임이 진행될 채팅방 ID */
  chatRoomId: string;

  /** 게임 유형 */
  gameType: GameType;

  /**
   * 질문 난이도 (optional)
   * 미지정 시 서버가 관계 진행도 기반으로 자동 결정
   */
  difficulty?: Difficulty;
}
```

**Response** `201 Created`:
```typescript
interface CreateGameResponse {
  /** 생성된 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 게임 상태 */
  status: GameStatus;

  /** 이 게임에 출제된 질문/미션 목록 */
  rounds: GameRound[];

  /** 만료 시각 (ISO 8601) */
  expiresAt: string;

  /** 생성 시각 */
  createdAt: string;
}
```

**Error Responses**:
| Status | Code | 설명 |
|--------|------|------|
| 400 | `INVALID_GAME_TYPE` | 유효하지 않은 gameType |
| 400 | `DAILY_LIMIT_EXCEEDED` | 하루 게임 시작 횟수 초과 (3회) |
| 400 | `DUPLICATE_GAME_TYPE` | 같은 상대와 같은 게임 유형 1일 1회 제한 |
| 400 | `ACTIVE_GAME_EXISTS` | 이미 진행 중인 게임이 있음 |
| 403 | `CHAT_ROOM_LEFT` | 채팅방을 나간 상태 |
| 404 | `CHAT_ROOM_NOT_FOUND` | 채팅방 없음 |

---

### 1.2 게임 세션 조회

게임 세션의 현재 상태를 조회합니다.

```
GET /v1/games/:gameId
```

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `gameId` | string | 게임 세션 ID |

**Response** `200 OK`:
```typescript
interface GameSessionResponse {
  /** 게임 세션 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 게임 상태 */
  status: GameStatus;

  /** 채팅방 ID */
  chatRoomId: string;

  /** 게임 생성자 (초대한 사람) */
  createdBy: string;

  /** 질문/미션 목록 */
  rounds: GameRound[];

  /** 내 답변 현황 */
  myAnswers: GameAnswer[];

  /**
   * 상대방 답변 완료 여부 (라운드별)
   * 답변 내용은 result에서만 공개
   */
  partnerAnsweredRoundIds: string[];

  /**
   * 결과 (양쪽 모두 완료 시에만 존재)
   */
  result: GameResult | null;

  /** 만료 시각 */
  expiresAt: string;

  /** 생성 시각 */
  createdAt: string;
}
```

---

### 1.3 게임 목록 조회 (채팅방별)

특정 채팅방의 게임 히스토리를 조회합니다.

```
GET /v1/games?chatRoomId={chatRoomId}&status={status}&cursor={cursor}&limit={limit}
```

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `chatRoomId` | string | O | - | 채팅방 ID |
| `status` | GameStatus | X | - | 상태 필터 |
| `cursor` | string | X | - | 페이지네이션 커서 |
| `limit` | number | X | 10 | 조회 개수 (max 50) |

**Response** `200 OK`:
```typescript
interface GameListResponse {
  /** 게임 세션 목록 (요약) */
  games: GameSessionSummary[];

  /** 다음 페이지 커서 (null이면 마지막) */
  nextCursor: string | null;

  /** 추가 데이터 존재 여부 */
  hasMore: boolean;
}

interface GameSessionSummary {
  gameId: string;
  gameType: GameType;
  status: GameStatus;
  matchRate: number | null;
  createdAt: string;
  completedAt: string | null;
}
```

---

### 1.4 아이스브레이커 가용 여부 조회

매칭 직후 아이스브레이커 게임을 표시할지 결정합니다.

```
GET /v1/games/icebreaker/availability?chatRoomId={chatRoomId}
```

**Response** `200 OK`:
```typescript
interface IcebreakerAvailability {
  /** 아이스브레이커 표시 가능 여부 */
  available: boolean;

  /**
   * 불가능 사유
   * - 'already_played': 이미 플레이함
   * - 'expired': 24시간 경과
   * - 'skipped': 유저가 스킵함
   */
  reason?: 'already_played' | 'expired' | 'skipped' | null;

  /** 이미 플레이한 경우, 해당 게임 ID */
  existingGameId?: string;
}
```

---

## 2. 답변 API

### 2.1 답변 제출

개별 라운드에 대한 답변을 제출합니다.

```
POST /v1/games/:gameId/answers
```

**Request Body**:
```typescript
interface SubmitAnswerRequest {
  /** 라운드 ID */
  roundId: string;

  /** 선택한 옵션 ID */
  selectedOptionId: string;

  /**
   * 상대방 답변 추측 (guess_match 전용)
   * guess_match 게임에서만 필수
   */
  guessedOptionId?: string;

  /** 답변까지 소요 시간 (초) */
  responseTimeSeconds: number;
}
```

**Response** `200 OK` — 진행 중:
```typescript
interface SubmitAnswerProgressResponse {
  /** 완료 여부 */
  isComplete: false;

  /** 현재 답변한 라운드 수 */
  answeredCount: number;

  /** 전체 라운드 수 */
  totalRounds: number;

  /** 상대방 답변 완료 여부 */
  partnerCompleted: boolean;
}
```

**Response** `200 OK` — 양쪽 모두 완료:
```typescript
interface SubmitAnswerCompleteResponse {
  /** 완료 여부 */
  isComplete: true;

  /** 답변 수 */
  answeredCount: number;
  totalRounds: number;

  /** 게임 결과 */
  result: GameResult;

  /** 보상 정보 */
  reward: GameReward;
}
```

**Union Type**:
```typescript
type SubmitAnswerResponse = SubmitAnswerProgressResponse | SubmitAnswerCompleteResponse;
```

**Error Responses**:
| Status | Code | 설명 |
|--------|------|------|
| 400 | `ALREADY_ANSWERED` | 해당 라운드에 이미 답변함 |
| 400 | `INVALID_OPTION` | 유효하지 않은 옵션 ID |
| 400 | `GUESS_REQUIRED` | guess_match 게임인데 guessedOptionId 누락 |
| 404 | `GAME_NOT_FOUND` | 게임 세션 없음 |
| 410 | `GAME_EXPIRED` | 게임 만료됨 |

---

### 2.2 아이스브레이커 스킵

아이스브레이커 게임을 건너뜁니다.

```
POST /v1/games/:gameId/skip
```

**Response** `200 OK`:
```typescript
interface SkipGameResponse {
  /** 성공 여부 */
  success: boolean;
}
```

---

## 3. 결과 API

### 3.1 게임 결과 조회

양쪽 답변이 모두 완료된 게임의 결과를 조회합니다.

```
GET /v1/games/:gameId/result
```

**Response** `200 OK`:
```typescript
interface GameResultResponse {
  /** 게임 ID */
  gameId: string;

  /** 게임 유형 */
  gameType: GameType;

  /** 전체 일치율 (0~100) */
  matchRate: number;

  /** 라운드별 상세 결과 */
  roundResults: RoundResult[];

  /** 결과 요약 메시지 (서버 생성) */
  summaryMessage: string;

  /** 보상 정보 */
  reward: GameReward;

  /** 현재 스트릭 */
  streak: GameStreakInfo;

  /** 완료 시각 */
  completedAt: string;
}

interface RoundResult {
  /** 라운드 ID */
  roundId: string;

  /** 질문 텍스트 */
  questionText: string;

  /** 질문 카테고리 */
  category: string;

  /** 내 답변 */
  myAnswer: AnswerDetail;

  /** 상대 답변 */
  partnerAnswer: AnswerDetail;

  /** 일치 여부 */
  isMatch: boolean;

  /**
   * 추측 결과 (guess_match 전용)
   */
  guessResult?: GuessResult;
}

interface AnswerDetail {
  /** 선택한 옵션 ID */
  optionId: string;

  /** 선택한 옵션 텍스트 */
  optionText: string;
}

interface GuessResult {
  /** 내가 상대를 맞췄는지 */
  myGuessCorrect: boolean;

  /** 내가 추측한 옵션 */
  myGuessOptionText: string;

  /** 상대가 나를 맞췄는지 */
  partnerGuessCorrect: boolean;

  /** 상대가 추측한 옵션 */
  partnerGuessOptionText: string;
}
```

**Error Responses**:
| Status | Code | 설명 |
|--------|------|------|
| 404 | `GAME_NOT_FOUND` | 게임 세션 없음 |
| 409 | `GAME_NOT_COMPLETED` | 양쪽 답변 미완료 |

---

## 4. 질문 풀 API

### 4.1 질문 풀 조회

게임 유형별 사용 가능한 질문을 조회합니다. (관리/디버그용)

```
GET /v1/games/questions?gameType={gameType}&difficulty={difficulty}&category={category}
```

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `gameType` | GameType | O | 게임 유형 |
| `difficulty` | Difficulty | X | 난이도 필터 |
| `category` | string | X | 카테고리 필터 |

**Response** `200 OK`:
```typescript
interface QuestionPoolResponse {
  /** 질문 목록 */
  questions: GameQuestion[];

  /** 전체 질문 수 */
  totalCount: number;
}
```

---

## 5. 일일 미션 API

### 5.1 오늘의 미션 조회

채팅방에 대한 오늘의 미션을 조회합니다.

```
GET /v1/games/missions/daily?chatRoomId={chatRoomId}
```

**Response** `200 OK`:
```typescript
interface DailyMissionResponse {
  /** 미션 게임 세션 ID (이미 생성된 경우) */
  gameId: string | null;

  /** 오늘의 미션 */
  mission: MissionDetail;

  /** 내 완료 여부 */
  myCompleted: boolean;

  /** 상대 완료 여부 */
  partnerCompleted: boolean;

  /** 만료 시각 (당일 23:59) */
  expiresAt: string;
}

interface MissionDetail {
  /** 미션 ID */
  id: string;

  /** 미션 텍스트 */
  text: string;

  /** 미션 카테고리 */
  category: MissionCategory;

  /** 미션 완료 시 제출해야 할 유형 */
  submissionType: MissionSubmissionType;

  /** 미션 아이콘 (이모지 or 아이콘 키) */
  icon: string;
}
```

### 5.2 미션 완료 제출

미션 수행 결과를 제출합니다.

```
POST /v1/games/missions/:gameId/complete
```

**Request Body**:
```typescript
interface CompleteMissionRequest {
  /** 제출 유형에 따른 내용 */
  submission: MissionSubmission;
}

type MissionSubmission =
  | { type: 'text'; content: string }
  | { type: 'image'; mediaUrl: string }
  | { type: 'link'; url: string; title?: string };
```

**Response** `200 OK`:
```typescript
interface CompleteMissionResponse {
  /** 성공 여부 */
  success: boolean;

  /** 양쪽 모두 완료 여부 */
  bothCompleted: boolean;

  /** 보상 (양쪽 완료 시) */
  reward: GameReward | null;

  /** 스트릭 (양쪽 완료 시) */
  streak: GameStreakInfo | null;
}
```

---

## 6. 스트릭 API

### 6.1 스트릭 조회

채팅방의 게임 스트릭을 조회합니다.

```
GET /v1/games/streak?chatRoomId={chatRoomId}
```

**Response** `200 OK`:
```typescript
interface GameStreakResponse {
  /** 채팅방 ID */
  chatRoomId: string;

  /** 현재 연속 일수 */
  currentStreak: number;

  /** 최장 연속 기록 */
  longestStreak: number;

  /** 총 게임 완료 횟수 */
  totalGamesCompleted: number;

  /** 게임 유형별 완료 횟수 */
  completedByType: Record<GameType, number>;

  /** 오늘 게임 완료 여부 */
  completedToday: boolean;

  /** 마지막 게임 완료 일시 */
  lastCompletedAt: string | null;

  /** 다음 스트릭 보너스까지 남은 일수 */
  nextBonusIn: number | null;

  /** 다음 스트릭 보너스 구슬 수 */
  nextBonusReward: number | null;
}
```

---

## 7. 만남 제안 API

### 7.1 만남 제안 가용 여부 조회

만남 제안 넛지를 표시할지 결정합니다.

```
GET /v1/games/meet-suggest/availability?chatRoomId={chatRoomId}
```

**Response** `200 OK`:
```typescript
interface MeetSuggestAvailability {
  /** 만남 제안 표시 가능 여부 */
  available: boolean;

  /** 완료된 게임 수 (3회 이상이면 available) */
  gamesCompleted: number;

  /** 필요 게임 수 */
  requiredGames: number;

  /** 이미 제안한 경우 */
  alreadySuggested: boolean;
}
```

### 7.2 만남 제안 전송

```
POST /v1/games/meet-suggest
```

**Request Body**:
```typescript
interface CreateMeetSuggestRequest {
  /** 채팅방 ID */
  chatRoomId: string;

  /** 만남 활동 유형 */
  activityType: MeetActivityType;

  /** 직접 입력한 활동 (activityType === 'custom' 일 때) */
  customActivity?: string;

  /** 제안 메시지 (선택) */
  message?: string;
}
```

**Response** `201 Created`:
```typescript
interface CreateMeetSuggestResponse {
  /** 만남 제안 ID */
  meetSuggestId: string;

  /** 채팅방에 전송된 메시지 ID */
  chatMessageId: string;
}
```

### 7.3 만남 제안 응답

```
PATCH /v1/games/meet-suggest/:meetSuggestId
```

**Request Body**:
```typescript
interface RespondMeetSuggestRequest {
  /** 수락 여부 */
  accepted: boolean;
}
```

**Response** `200 OK`:
```typescript
interface RespondMeetSuggestResponse {
  success: boolean;

  /** 보상 (수락 시) */
  reward: GameReward | null;
}
```

---

## 8. 넛지 설정 API

### 8.1 넛지 설정 조회/수정

```
GET /v1/games/nudge-settings?chatRoomId={chatRoomId}
PUT /v1/games/nudge-settings
```

**Request/Response Body**:
```typescript
interface GameNudgeSettings {
  /** 채팅방 ID */
  chatRoomId: string;

  /** 넛지 활성화 여부 (기본 true) */
  enabled: boolean;

  /** 넛지 발동 대기 시간 (시간 단위, 기본 12) */
  delayHours: number;
}
```

---

## 공통 DTO

아래 타입은 여러 API에서 공통으로 사용됩니다.
상세 정의는 [data-models.md](./data-models.md)를 참고하세요.

```typescript
type GameType = 'icebreaker' | 'balance' | 'guess_match' | 'daily_mission';
type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'expired' | 'skipped';
type Difficulty = 'easy' | 'medium' | 'hard';
type MissionCategory = 'photo' | 'music' | 'question' | 'recommendation' | 'activity';
type MissionSubmissionType = 'text' | 'image' | 'link';
type MeetActivityType = 'cafe' | 'restaurant' | 'walk' | 'custom';

interface GameRound { ... }       // → data-models.md 참고
interface GameAnswer { ... }      // → data-models.md 참고
interface GameResult { ... }      // → data-models.md 참고
interface GameReward { ... }      // → data-models.md 참고
interface GameStreakInfo { ... }   // → data-models.md 참고
interface GameQuestion { ... }    // → data-models.md 참고
```
