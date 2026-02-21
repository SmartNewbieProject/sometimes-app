# Mini Game (2인 협동 미니게임) - 데이터 문서

> PRD: [docs/duo-game-prd.md](/docs/duo-game-prd.md)

## 문서 구조

| 문서 | 설명 |
|------|------|
| [api-spec.md](./api-spec.md) | REST API 엔드포인트 & 요청/응답 DTO |
| [data-models.md](./data-models.md) | 서버 DB 모델, Enum, 상태 머신 |
| [socket-events.md](./socket-events.md) | WebSocket 실시간 이벤트 페이로드 |
| [frontend-types.md](./frontend-types.md) | 프론트엔드 타입 정의, Query Keys, Store |

## 핵심 도메인 용어

| 용어 | 설명 |
|------|------|
| **GameSession** | 1회 게임 플레이 단위. 두 유저가 참여하는 하나의 게임 인스턴스 |
| **GameType** | 게임 유형 (`icebreaker`, `balance`, `guess_match`, `daily_mission`) |
| **GameRound** | 게임 내 개별 질문/미션 1개 단위 |
| **GameAnswer** | 유저 1명의 1개 라운드에 대한 답변 |
| **GameResult** | 양쪽 답변 완료 후 산출된 매칭 결과 |
| **GameStreak** | 채팅방 단위의 연속 게임 완료 카운트 |
| **MeetSuggest** | 게임 3회 완료 후 제안되는 만남 카드 |

## 게임 유형별 특성

| GameType | 질문 수 | 타이머 | 추측 | 미션 | 난이도 |
|----------|--------|--------|------|------|--------|
| `icebreaker` | 3 | 없음 | 없음 | 없음 | easy 고정 |
| `balance` | 5 | 선택 | 없음 | 없음 | 점진적 |
| `guess_match` | 3 | 없음 | 있음 | 없음 | 점진적 |
| `daily_mission` | 1 | 23:59 | 없음 | 있음 | - |

## API Base URL

```
Production: https://api.some-in-univ.com/api/v1/games
Staging:    https://api-staging.some-in-univ.com/api/v1/games
```
