# Mini Game - 프론트엔드 타입 정의

> FSD 경로: `src/features/duo-game/`
> 기존 패턴 참조: `src/features/moment/`, `src/features/chat/`

---

## 1. Query Keys

```typescript
// src/features/duo-game/queries/keys.ts

export const GAME_QUERY_KEYS = {
  // 게임 세션
  SESSION: (gameId: string) => ['game', 'session', gameId] as const,
  LIST: (chatRoomId: string) => ['game', 'list', chatRoomId] as const,

  // 아이스브레이커
  ICEBREAKER_AVAILABILITY: (chatRoomId: string) =>
    ['game', 'icebreaker', 'availability', chatRoomId] as const,

  // 결과
  RESULT: (gameId: string) => ['game', 'result', gameId] as const,

  // 질문
  QUESTIONS: (gameType: GameType, difficulty?: Difficulty) =>
    ['game', 'questions', gameType, difficulty] as const,

  // 일일 미션
  DAILY_MISSION: (chatRoomId: string) =>
    ['game', 'mission', 'daily', chatRoomId] as const,

  // 스트릭
  STREAK: (chatRoomId: string) => ['game', 'streak', chatRoomId] as const,

  // 만남 제안
  MEET_SUGGEST_AVAILABILITY: (chatRoomId: string) =>
    ['game', 'meet-suggest', 'availability', chatRoomId] as const,

  // 넛지 설정
  NUDGE_SETTINGS: (chatRoomId: string) =>
    ['game', 'nudge-settings', chatRoomId] as const,
} as const;

export const GAME_STALE_TIME = {
  SESSION: 30 * 1000,           // 30초 (실시간성 중요)
  LIST: 5 * 60 * 1000,          // 5분
  AVAILABILITY: 2 * 60 * 1000,  // 2분
  RESULT: 30 * 60 * 1000,       // 30분 (불변 데이터)
  QUESTIONS: 60 * 60 * 1000,    // 1시간
  STREAK: 5 * 60 * 1000,        // 5분
  NUDGE: 10 * 60 * 1000,        // 10분
} as const;
```

---

## 2. API 함수

```typescript
// src/features/duo-game/apis/index.ts

import { axiosClient } from '@/src/shared/libs/axios';
import type {
  CreateGameRequest,
  CreateGameResponse,
  GameSessionResponse,
  GameListResponse,
  IcebreakerAvailability,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  GameResultResponse,
  QuestionPoolResponse,
  DailyMissionResponse,
  CompleteMissionRequest,
  CompleteMissionResponse,
  GameStreakResponse,
  MeetSuggestAvailability,
  CreateMeetSuggestRequest,
  CreateMeetSuggestResponse,
  RespondMeetSuggestRequest,
  RespondMeetSuggestResponse,
  SkipGameResponse,
  GameNudgeSettings,
} from './types';

// ── 게임 세션 ──

export const createGame = (data: CreateGameRequest): Promise<CreateGameResponse> =>
  axiosClient.post('/v1/games', data);

export const getGameSession = (gameId: string): Promise<GameSessionResponse> =>
  axiosClient.get(`/v1/games/${gameId}`);

export const getGameList = (params: {
  chatRoomId: string;
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<GameListResponse> =>
  axiosClient.get('/v1/games', { params });

export const getIcebreakerAvailability = (
  chatRoomId: string,
): Promise<IcebreakerAvailability> =>
  axiosClient.get('/v1/games/icebreaker/availability', {
    params: { chatRoomId },
  });

export const skipGame = (gameId: string): Promise<SkipGameResponse> =>
  axiosClient.post(`/v1/games/${gameId}/skip`);

// ── 답변 ──

export const submitAnswer = (
  gameId: string,
  data: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> =>
  axiosClient.post(`/v1/games/${gameId}/answers`, data);

// ── 결과 ──

export const getGameResult = (gameId: string): Promise<GameResultResponse> =>
  axiosClient.get(`/v1/games/${gameId}/result`);

// ── 질문 풀 ──

export const getQuestionPool = (params: {
  gameType: string;
  difficulty?: string;
  category?: string;
}): Promise<QuestionPoolResponse> =>
  axiosClient.get('/v1/games/questions', { params });

// ── 일일 미션 ──

export const getDailyMission = (chatRoomId: string): Promise<DailyMissionResponse> =>
  axiosClient.get('/v1/games/missions/daily', { params: { chatRoomId } });

export const completeMission = (
  gameId: string,
  data: CompleteMissionRequest,
): Promise<CompleteMissionResponse> =>
  axiosClient.post(`/v1/games/missions/${gameId}/complete`, data);

// ── 스트릭 ──

export const getGameStreak = (chatRoomId: string): Promise<GameStreakResponse> =>
  axiosClient.get('/v1/games/streak', { params: { chatRoomId } });

// ── 만남 제안 ──

export const getMeetSuggestAvailability = (
  chatRoomId: string,
): Promise<MeetSuggestAvailability> =>
  axiosClient.get('/v1/games/meet-suggest/availability', {
    params: { chatRoomId },
  });

export const createMeetSuggest = (
  data: CreateMeetSuggestRequest,
): Promise<CreateMeetSuggestResponse> =>
  axiosClient.post('/v1/games/meet-suggest', data);

export const respondMeetSuggest = (
  meetSuggestId: string,
  data: RespondMeetSuggestRequest,
): Promise<RespondMeetSuggestResponse> =>
  axiosClient.patch(`/v1/games/meet-suggest/${meetSuggestId}`, data);

// ── 넛지 설정 ──

export const getNudgeSettings = (chatRoomId: string): Promise<GameNudgeSettings> =>
  axiosClient.get('/v1/games/nudge-settings', { params: { chatRoomId } });

export const updateNudgeSettings = (
  data: GameNudgeSettings,
): Promise<GameNudgeSettings> =>
  axiosClient.put('/v1/games/nudge-settings', data);
```

---

## 3. Zustand Store

```typescript
// src/features/duo-game/store/game-store.ts

import { create } from 'zustand';

interface ActiveGame {
  gameId: string;
  gameType: GameType;
  chatRoomId: string;
  currentRoundIndex: number;
  totalRounds: number;
  myAnswers: Map<string, string>; // roundId → selectedOptionId
  myGuesses: Map<string, string>; // roundId → guessedOptionId (guess_match)
  startedAt: number;
}

interface GameStoreState {
  /** 현재 진행 중인 게임 */
  activeGame: ActiveGame | null;

  /** 게임 시작 */
  startGame: (game: Omit<ActiveGame, 'currentRoundIndex' | 'myAnswers' | 'myGuesses' | 'startedAt'>) => void;

  /** 다음 라운드로 이동 */
  nextRound: () => void;

  /** 답변 기록 */
  recordAnswer: (roundId: string, optionId: string) => void;

  /** 추측 기록 (guess_match) */
  recordGuess: (roundId: string, optionId: string) => void;

  /** 게임 종료 */
  clearGame: () => void;

  /** 현재 라운드의 답변 소요 시간 (초) */
  getElapsedSeconds: () => number;
}
```

---

## 4. TanStack Query Hooks

```typescript
// src/features/duo-game/queries/use-game-session.ts
export function useGameSession(gameId: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.SESSION(gameId),
    queryFn: () => getGameSession(gameId),
    staleTime: GAME_STALE_TIME.SESSION,
    enabled: !!gameId,
  });
}

// src/features/duo-game/queries/use-icebreaker-availability.ts
export function useIcebreakerAvailability(chatRoomId: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.ICEBREAKER_AVAILABILITY(chatRoomId),
    queryFn: () => getIcebreakerAvailability(chatRoomId),
    staleTime: GAME_STALE_TIME.AVAILABILITY,
    enabled: !!chatRoomId,
  });
}

// src/features/duo-game/queries/use-create-game.ts
export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGameRequest) => createGame(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.LIST(variables.chatRoomId),
      });
    },
  });
}

// src/features/duo-game/queries/use-submit-answer.ts
export function useSubmitAnswer(gameId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitAnswerRequest) => submitAnswer(gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.SESSION(gameId),
      });
    },
  });
}

// src/features/duo-game/queries/use-game-result.ts
export function useGameResult(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.RESULT(gameId),
    queryFn: () => getGameResult(gameId),
    staleTime: GAME_STALE_TIME.RESULT,
    enabled: enabled && !!gameId,
  });
}

// src/features/duo-game/queries/use-daily-mission.ts
export function useDailyMission(chatRoomId: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.DAILY_MISSION(chatRoomId),
    queryFn: () => getDailyMission(chatRoomId),
    staleTime: GAME_STALE_TIME.SESSION,
    enabled: !!chatRoomId,
  });
}

// src/features/duo-game/queries/use-game-streak.ts
export function useGameStreak(chatRoomId: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.STREAK(chatRoomId),
    queryFn: () => getGameStreak(chatRoomId),
    staleTime: GAME_STALE_TIME.STREAK,
    enabled: !!chatRoomId,
  });
}

// src/features/duo-game/queries/use-meet-suggest-availability.ts
export function useMeetSuggestAvailability(chatRoomId: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.MEET_SUGGEST_AVAILABILITY(chatRoomId),
    queryFn: () => getMeetSuggestAvailability(chatRoomId),
    staleTime: GAME_STALE_TIME.AVAILABILITY,
    enabled: !!chatRoomId,
  });
}

// src/features/duo-game/queries/use-complete-mission.ts
export function useCompleteMission(gameId: string, chatRoomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteMissionRequest) => completeMission(gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.DAILY_MISSION(chatRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.STREAK(chatRoomId),
      });
    },
  });
}
```

---

## 5. 소켓 이벤트 핸들러 연동

```typescript
// src/features/duo-game/hooks/use-game-socket-events.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GAME_QUERY_KEYS } from '../queries/keys';

/**
 * 게임 관련 소켓 이벤트를 수신하여 쿼리 캐시를 갱신합니다.
 * GlobalChatProvider 또는 채팅방 화면에서 사용.
 */
export function useGameSocketEvents(socket: SocketInstance | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // 게임 초대
    const onGameInvited = (payload: GameInvitedPayload) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.LIST(payload.chatRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.ICEBREAKER_AVAILABILITY(payload.chatRoomId),
      });
      // 채팅 목록도 갱신 (새 시스템 메시지 반영)
      queryClient.invalidateQueries({ queryKey: ['chat-list', payload.chatRoomId] });
    };

    // 게임 완료
    const onGameCompleted = (payload: GameCompletedPayload) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.SESSION(payload.gameId),
      });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.RESULT(payload.gameId),
      });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.STREAK(payload.chatRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.MEET_SUGGEST_AVAILABILITY(payload.chatRoomId),
      });
      queryClient.invalidateQueries({ queryKey: ['chat-list', payload.chatRoomId] });
    };

    // 상대 답변 제출
    const onAnswerSubmitted = (payload: GameAnswerSubmittedPayload) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.SESSION(payload.gameId),
      });
    };

    // 미션 관련
    const onMissionStarted = (payload: MissionStartedPayload) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.DAILY_MISSION(payload.chatRoomId),
      });
    };

    const onMissionPartnerCompleted = (payload: MissionPartnerCompletedPayload) => {
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.DAILY_MISSION(payload.chatRoomId),
      });
      if (payload.bothCompleted) {
        queryClient.invalidateQueries({
          queryKey: GAME_QUERY_KEYS.STREAK(payload.chatRoomId),
        });
      }
    };

    // 스트릭
    const onStreakUpdated = (payload: StreakUpdatedPayload) => {
      queryClient.setQueryData(
        GAME_QUERY_KEYS.STREAK(payload.chatRoomId),
        payload.streak,
      );
    };

    // 만남 제안
    const onMeetSuggest = (payload: MeetSuggestReceivedPayload) => {
      queryClient.invalidateQueries({ queryKey: ['chat-list', payload.chatRoomId] });
    };

    socket.on('gameInvited', onGameInvited);
    socket.on('gameCompleted', onGameCompleted);
    socket.on('gameAnswerSubmitted', onAnswerSubmitted);
    socket.on('missionStarted', onMissionStarted);
    socket.on('missionPartnerCompleted', onMissionPartnerCompleted);
    socket.on('streakUpdated', onStreakUpdated);
    socket.on('meetSuggestReceived', onMeetSuggest);

    return () => {
      socket.off('gameInvited', onGameInvited);
      socket.off('gameCompleted', onGameCompleted);
      socket.off('gameAnswerSubmitted', onAnswerSubmitted);
      socket.off('missionStarted', onMissionStarted);
      socket.off('missionPartnerCompleted', onMissionPartnerCompleted);
      socket.off('streakUpdated', onStreakUpdated);
      socket.off('meetSuggestReceived', onMeetSuggest);
    };
  }, [socket, queryClient]);
}
```

---

## 6. 채팅 메시지 렌더링 분기

```typescript
// 기존 src/features/chat/ui/message/chat-message.tsx 확장 가이드

// 게임 메시지 타입 판별 헬퍼
const GAME_MESSAGE_TYPES = [
  'game_invite',
  'game_answer_notify',
  'game_result',
  'game_nudge',
  'mission_start',
  'mission_complete',
  'meet_suggest',
  'meet_response',
] as const;

type GameMessageType = typeof GAME_MESSAGE_TYPES[number];

function isGameMessage(messageType: string): messageType is GameMessageType {
  return GAME_MESSAGE_TYPES.includes(messageType as GameMessageType);
}

// 렌더링 분기
function ChatMessage({ message }: { message: Chat }) {
  if (isGameMessage(message.messageType)) {
    const content = JSON.parse(message.content);

    switch (message.messageType) {
      case 'game_invite':
        return <GameInviteMessage content={content as GameInviteContent} />;
      case 'game_result':
        return <GameResultMessage content={content as GameResultContent} />;
      case 'game_nudge':
        return <GameNudgeMessage content={content as GameNudgeContent} />;
      case 'mission_start':
        return <MissionStartMessage content={content as MissionStartContent} />;
      case 'mission_complete':
        return <MissionCompleteMessage content={content as MissionCompleteContent} />;
      case 'meet_suggest':
        return <MeetSuggestMessage content={content as MeetSuggestContent} />;
      case 'meet_response':
        return <MeetResponseMessage content={content as MeetResponseContent} />;
      case 'game_answer_notify':
        return <GameAnswerNotifyMessage content={content as GameAnswerNotifyContent} />;
    }
  }

  // 기존 메시지 렌더링 (text, image, system)
  // ...
}
```

---

## 7. Mixpanel 이벤트 타입

```typescript
// src/features/duo-game/constants/analytics.ts

export const GAME_ANALYTICS_EVENTS = {
  // 노출
  GAME_VIEWED: 'Game_Viewed',
  GAME_NUDGE_SHOWN: 'Game_Nudge_Shown',
  MEET_SUGGEST_SHOWN: 'Meet_Suggest_Shown',

  // 액션
  GAME_STARTED: 'Game_Started',
  GAME_ANSWER_SUBMITTED: 'Game_Answer_Submitted',
  GAME_COMPLETED: 'Game_Completed',
  GAME_SKIPPED: 'Game_Skipped',
  GAME_RESULT_SHARED: 'Game_Result_Shared',
  GAME_NUDGE_CLICKED: 'Game_Nudge_Clicked',
  MEET_SUGGEST_SENT: 'Meet_Suggest_Sent',
  MEET_SUGGEST_ACCEPTED: 'Meet_Suggest_Accepted',
  MEET_SUGGEST_DECLINED: 'Meet_Suggest_Declined',
  MISSION_COMPLETED: 'Mission_Completed',
  STREAK_ACHIEVED: 'Streak_Achieved',
} as const;

// 이벤트 속성 타입
interface GameViewedProperties {
  gameType: GameType;
  source: 'icebreaker_card' | 'game_button' | 'nudge' | 'push';
  chatRoomId: string;
}

interface GameStartedProperties {
  gameType: GameType;
  chatRoomId: string;
  difficulty: Difficulty;
  daysSinceMatch: number;
  messageCountBefore: number;
}

interface GameCompletedProperties {
  gameType: GameType;
  chatRoomId: string;
  matchRate: number;
  streakCount: number;
  totalTimeSeconds: number;
  rewardMarbles: number;
}

interface GameSkippedProperties {
  gameType: GameType;
  source: 'icebreaker_card' | 'game_screen' | 'nudge';
  chatRoomId: string;
}
```

---

## 8. 파일 구조 요약

```
src/features/duo-game/
├── apis/
│   ├── index.ts              # API 함수
│   └── types.ts              # Request/Response DTO (api-spec.md 기반)
├── hooks/
│   ├── use-game-socket-events.ts  # 소켓 이벤트 핸들러
│   └── use-game-nudge.ts          # 넛지 로직
├── queries/
│   ├── keys.ts                    # Query Keys & Stale Time
│   ├── use-game-session.ts
│   ├── use-icebreaker-availability.ts
│   ├── use-create-game.ts
│   ├── use-submit-answer.ts
│   ├── use-game-result.ts
│   ├── use-daily-mission.ts
│   ├── use-complete-mission.ts
│   ├── use-game-streak.ts
│   └── use-meet-suggest-availability.ts
├── store/
│   └── game-store.ts              # 진행 중 게임 상태 (Zustand)
├── ui/
│   ├── icebreaker-card.tsx
│   ├── game-bottom-sheet.tsx
│   ├── balance-game/
│   ├── guess-match/
│   ├── daily-mission/
│   ├── messages/                  # 채팅 메시지 컴포넌트
│   └── meet-suggest-card.tsx
├── constants/
│   ├── analytics.ts               # Mixpanel 이벤트
│   └── game-config.ts             # 제한값, 보상 테이블
└── types.ts                       # 도메인 타입 (data-models.md 기반)
```
