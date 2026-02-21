# Sometimes App - Next Features

기획 완료된 신규 기능 목업 및 설계 산출물 정리.

---

## 1. 2인 협동 미니게임 (Duo Mini Game)

### 산출물

| 파일 | 경로 | 설명 |
|------|------|------|
| UX 아이디어 문서 | `docs/features/mini-game/ux-ideas.md` | 5개 진입 액션 x 5개 아이디어 = 25개 컨셉, Beta 분포 기반 확률 평가 |
| HTML 프리뷰 (v2) | `docs/features/mini-game/ux-preview.html` | 5개 섹션 모바일 폰 목업, 앱 색상 시스템 완전 반영 |

### 확정된 UX 방향

| # | 진입 액션 | 확정안 | 핵심 |
|---|----------|--------|------|
| 1 | Icebreaker | Tooltip + Content Panel | 입력바 위 Tooltip -> 3탭 Panel (게임/대화주제/미션) |
| 2 | 채팅 내 게임 | Icon Button | 기존 💡팁 -> 🎮로 대체, 동일 Panel 연동 |
| 3 | 자동 넛지 | Push + Deep Link | 12h 무응답 시 Push -> 딥링크 -> Panel 자동 오픈 |
| 4 | 게임 플레이 | **보류** | 추후 결정 |
| 5 | 결과 공유 | Milestone Journey UI | 타임라인 여정 + 궁합 리포트 확장 가능 |

### HTML 프리뷰 섹션 상세 (`docs/features/mini-game/ux-preview.html`)

**Section 1: Tooltip + Content Panel** (목업 4개)
- State 1: Tooltip 노출 - 채팅방 진입 시 입력바 위 pulse 애니메이션 Tooltip
- State 2: Panel 게임 탭 - 밸런스 게임 / 취향 퀴즈 / 랜덤 질문 카드 리스트
- State 3: Panel 대화주제 탭 - AI 추천 칩 + 예시 메시지 ("복사해서 보내기")
- State 4: Panel 미션 탭 - 일일미션 (하늘 사진, BGM 공유) + 잠금해제 콘텐츠 (셀카 교환)

**Section 2: Icon Button** (목업 3개)
- 평상시 아이콘 상주 (glow 없음)
- 첫 사용 전: Gradient + Glow + Dot Badge + Tooltip
- 탭 후: Section 1과 동일한 Content Panel 오픈

**Section 3: Push Nudge** (목업 3개)
- 잠금화면 Push 알림 ("🎮 OO님과 밸런스 게임 해볼래요?")
- Push 탭 -> 딥링크(`chat/{id}?panel=game`) -> 채팅방 + Panel 자동 오픈
- Push 문구 변형 3종 (A/B 테스트용)

**Section 4: Gameplay** - 보류

**Section 5: Milestone Journey** (목업 3개)
- Journey 메인 뷰: 타임라인 이정표 (매칭 성사 -> 게임 완료 -> 깊은 대화 -> 만남 제안 -> 궁합 리포트)
- 게임 직후 결과 카드: 일치율 + 스트릭 + "대화하기/다른게임/여정보기" CTA
- 확장 궁합 분석 리포트: 카테고리별 일치율 (음식/엔터/라이프스타일/연애관) + AI 인사이트

### Content Panel 구조 (Section 1~2 공유)

- **🎮 게임 탭**: 밸런스 게임 / 취향 퀴즈 / 랜덤 질문 카드 리스트 (시간 배지 포함)
- **💬 대화주제 탭**: AI 프로필 기반 추천 칩 + 예시 메시지 (기존 ChatTipsModal 흡수)
- **📸 미션 탭**: 일일미션 + 잠금해제 콘텐츠 (게임 3회 완료 시 해금)

### 앱 컴포넌트 매핑

| 프리뷰 요소 | 앱 컴포넌트 | 비고 |
|---|---|---|
| 🎮 아이콘 | `ChatInput` Bulb 자리 대체 | gradient + pulse glow |
| Content Panel | `ChatTipsModal` + `BottomSheetPicker` 확장 | 3탭 구조 |
| Tooltip | `FloatingTooltip` | 상하 부유 + 삼각형 화살표 |
| 게임 카드 | ChatTipsModal 팁 카드 패턴 | 아이콘 + 텍스트 + 화살표 |
| 대화주제 칩 | `ChipSelector` / Button size='chip' | 기존 위젯 |
| NEW 배지 | `Badge` variant='main' | 기존 컴포넌트 |
| 결과 카드 | `GlowingCard` | borderRadius 16, 보라 boxShadow |
| Journey 타임라인 | 신규 컴포넌트 | ProgressBar 참고 |
| Push 딥링크 | push-notification + Expo Router | `chat/{id}?panel=game` |

### 설계 포인트

- Tooltip 노출 조건: 첫 매칭 / 입력창 포커스 / 12h 대화 정체
- Push 전략: 1일 1회, 최대 3일 연속, 오후 7~10시 피크 타임
- Milestone 유형 8가지: 매칭 성사 / 게임 완료 / 대화 이벤트 / 미션 완료 / 스트릭 / 만남 제안 / 궁합 리포트 / 기념일
- 확장 로드맵: Phase 1 (게임+스트릭) -> Phase 2 (궁합 분석) -> Phase 3 (배지+기념일) -> Phase 4 (만남 기록)

### 남은 작업

- [ ] Gameplay UI 결정 (Section 4 보류 중)
- [ ] PRD 작성 (기능 스펙 + API 설계)
- [ ] Journey 타임라인 컴포넌트 신규 설계

---

## 2. 글로벌 매칭 (Global Matching) - 한일 크로스보더

### 산출물

| 파일 | 경로 | 설명 |
|------|------|------|
| HTML 프로토타입 (초기) | `docs/html/global-matching-prototype.html` | 6개 화면 인터랙티브 플로우 (홈->모드선택->온보딩->대기->파트너->채팅) |
| HTML UX 프리뷰 (상세) | `docs/features/global-matching/ux-preview.html` | 7개 섹션, 복수 전략(A/B/C) 비교 목업, 앱 디자인 시스템 반영 |

### UX 프리뷰 섹션 상세 (`docs/features/global-matching/ux-preview.html`)

**Section 1: 진입점** (전략 3개, 목업 4개)
- **A. 홈 전용 카드 (권장)**: GlowingCard 스타일 진입 카드, 온보딩 전/후 상태 분리
- B. 세그먼트 탭 전환: 홈 상단 [국내 매칭] / [글로벌] 세그먼트 컨트롤
- C. 플로팅 버블: FloatingTooltip 스타일 FAB + 말풍선

**Section 2: 온보딩** (목업 3개)
- 3단계 슬라이드: 소개 (핵심 가치 + 16구슬 비용) -> 언어 실력 (4단계 Radio) -> 관심 이유 (Chip 복수 선택)
- 완료 시 `POST /global-matching/onboarding` 호출

**Section 3: 후보 탐색** (전략 2개, 목업 3개)
- **A. 카드 스와이프 (권장)**: KR/JP 양쪽 시점 목업, 국기 배지 + 궁합 점수 + 번역 bio + Gem 비용
- B. 리스트 뷰: 무한 스크롤 + 궁합 점수 배지

**Section 4: 좋아요 & 편지** (목업 4개)
- 좋아요 확인 모달 (KR: 16구슬 차감 / JP: 무료)
- 편지 토글 (100자 이내)
- 구슬 부족 안내 -> GemStoreWidget 연동
- 전송 성공 + 48시간 타이머

**Section 5: 받은 좋아요** (목업 3개)
- 홈 내 글로벌 좋아요 섹션 (편지 번역+원본 / 48h 타이머 / 수락,거절)
- 매칭 성립 축하 모달 (confetti + 채팅방 CTA)
- 만료 시 안내 + 재탐색 유도

**Section 6: 채팅 번역** (전략 3개, 목업 4개)
- **A. 이중 버블 (권장)**: 원문 + 구분선 + 번역 한 버블에 표시, KR/JP 양쪽 시점
- B. 탭 토글 버블: 기본 번역만 + 탭하면 원문 전환
- C. 번역만 표시: 깔끔 UI + 길게 누르면 원문 팝업

**Section 7: 상태 & 설정** (목업 2개)
- 프로필 내 글로벌 매칭 섹션 (활성 상태 + 통계)
- 설정 바텀시트 (자동 번역 ON/OFF, 언어 실력 변경, 관심 이유 수정, 매칭 ON/OFF)

### 프로토타입 화면 구성 (`docs/html/global-matching-prototype.html`)

| 화면 | 내용 |
|------|------|
| 홈 | 글로벌 매칭 진입 카드 (다크 그라디언트, 🇰🇷↔🇯🇵 국기) |
| 모드 선택 | 국내 매칭 (비활성) / 글로벌 매칭 (NEW 배지) |
| 온보딩 | 일본어 실력 4단계 Radio + 관심 이유 6개 Chip |
| 대기 | 지구본 pulse 애니메이션 + 서울/도쿄 시간 표시 |
| 파트너 뷰 | 풀스크린 사진 + 언어 배지 + 번역 bio + 호감 보내기 |
| 채팅 | 번역 ON/OFF 토글 + 이중 버블 + 빠른 답장 칩 |

### 비즈니스 설계

- KR 유저: 좋아요 16구슬 (유료)
- JP 유저: 좋아요 무료 (초기 유저풀 확보)
- 48시간 만료 타이머 (긴급 6h 이내 빨간색 경고)
- 번역: content + content_translated 이중 저장

### 남은 작업

- [ ] UX 전략 최종 확정 (각 섹션 A/B/C 중 선택)
- [ ] PRD 작성 (API 스펙 + 번역 파이프라인)
- [ ] 백엔드 API 설계 (글로벌 매칭 + 번역 + 구슬 차감)
- [ ] 프론트엔드 구현 (FSD 구조)

---

## 3. 비즈니스 리서치 인프라

### 구축 완료

| 항목 | 경로 | 설명 |
|------|------|------|
| 지식베이스 | `docs/research/` | 85개 문서, 9개 카테고리, qmd 벡터 임베딩 |
| 에이전트 | `.claude/agents/business-research-agent.md` | 비즈니스 리서치 서브에이전트 |
| 보고서 | `docs/research/reports/` | 3건 |

### 신규기능 우선순위 (ICE Score)

| 순위 | 기능 | ICE | 핵심 |
|------|------|-----|------|
| 1 | 2인 협동 미니게임 | 672 | 대화->만남 전환 |
| 2 | 캠퍼스 안전 코호트 | 640 | 여성 유저 +15%p |
| 3 | 궁합 프리뷰 | 560 | 좋아요 전환율 +35% |
