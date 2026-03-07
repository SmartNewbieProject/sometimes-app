# UI Migration Requirements

> Figma: `LluFfIG2PPiTY5PKWv25hU` / node `6560:21436`
> Created: 2026-02-22

---

## 1. Overview

Sometimes App 전체를 새 디자인 시스템으로 마이그레이션한다.
Phase 단계별로 진행하며, 기존 비즈니스 로직/API/훅은 최대한 재사용한다.

### Phase 계획

| Phase | 범위 | 내용 |
|-------|------|------|
| **Phase 1** | 색상 + 공통 컴포넌트 | semantic-colors 확장, Button pill 전환, Badge/Card 스타일 |
| **Phase 2** | 홈 화면 | 신규 섹션, 매칭 카드 리디자인, 배너 통합 |
| **Phase 3** | 나머지 화면 | 채팅, 커뮤니티, 마이페이지, 매칭 상세 등 |

---

## 2. Design System Changes

### 2.1 Color System (semantic-colors 확장)

| 토큰 | 현재 | 신규 | 용도 |
|------|------|------|------|
| `brand.primary` | `#7A4AE2` | 유지 | D-day 배지, 페이지네이션 dot, 악센트 |
| `brand.cta` (NEW) | - | `#3871FF` | CTA 버튼, 주요 액션 |
| `surface.background` | `#FFFFFF` | `#F2F4F6` | 앱 전체 배경 |
| `surface.card` (NEW) | - | `#FFFFFF` | 카드 배경 |
| `border.card` (NEW) | - | `#E5E8EB` | 카드 보더 |
| `text.black.primary` (NEW) | - | `#191F28` | Figma 주 텍스트 색상 |
| `text.black.secondary` (NEW) | - | `#4E5968` | 보조 텍스트 |
| `text.black.tertiary` (NEW) | - | `#8B95A1` | 힌트/메타 텍스트 |

### 2.2 Typography

- Font: Pretendard (기존과 동일)
- 새 디자인 텍스트 계층:

| 스타일 | Size | Weight | LineHeight | LetterSpacing |
|--------|------|--------|------------|---------------|
| Headline/4 | 24 | Bold(700) | 28 | -2.2% |
| Headline/5 | 20 | Bold(700) | 24 | -2.2% |
| Headline/6 | 18 | Bold(700) | 22 | -2.2% |
| Headline/7 | 16 | Bold(700) | 18 | -2.2% |
| Title/4 | 20 | SemiBold(600) | 26 | -2% |
| Title/5 | 18 | SemiBold(600) | 24 | -2% |
| Title/6 | 16 | SemiBold(600) | 22 | -2% |
| Body/1 | 18 | Medium(500) | 28 | -2% |
| Body/3 | 15 | Medium(500) | 22 | -2% |
| Body/4 | 14 | Medium(500) | 20 | -2% |
| Body/5 | 12 | Medium(500) | 18 | -2% |
| Caption/4 | 14 | Regular(400) | 22 | -2% |
| Caption/5 | 13 | Regular(400) | 20 | -2% |
| Caption/6 | 12 | Regular(400) | 18 | -2% |
| Caption/7 | 11 | Regular(400) | 16 | -2% |

### 2.3 Spacing/Radius Tokens

| 토큰 | 값 | 용도 |
|------|---|------|
| `gap.g0` | 0 | 없음 |
| `gap.g1` | 2 | 최소 |
| `gap.g2` | 4 | 태그 내부 |
| `gap.g3` | 6 | 아이콘+텍스트 |
| `gap.g4` | 8 | 카드 내부 요소 |
| `gap.g5` | 12 | 섹션 내부 |
| `gap.g6` | 16 | 중간 간격 |
| `gap.g7` | 20 | 큰 간격 |
| `padding.p3` | 6 | 뱃지 내부 |
| `padding.p4` | 8 | 작은 패딩 |
| `padding.p5` | 12 | 카드 내부 |
| `padding.p6` | 16 | 일반 패딩 |
| `padding.p7` | 20 | 섹션 패딩 |
| `padding.p8` | 24 | 큰 패딩 |
| `padding.p10` | 32 | 섹션 간 |
| `radius.small` | 4 | 뱃지, 작은 요소 |
| `radius.xlarge` | 10 | 이미지 |
| `radius.xxlarge` | 12 | 카드 |
| `radius.full` | 999 | pill 버튼, 아바타 |
| `size.size-4` | 20 | 뱃지 높이 |
| `size.size-9` | 48 | 헤더 높이 |
| `size.size-10` | 56 | FAB 버튼 |

---

## 3. Component Changes

### 3.1 Button

- **기본 borderRadius**: 12~16px -> `999px` (pill)
- variant 추가: `pill` (기본값으로 전환)
- CTA 색상: `brand.cta` (#3871FF) 사용
- Outline variant: border 색상도 `brand.cta`

### 3.2 Badge

- 스타일 추가: `white-transparent` (rgba(255,255,255,0.2) 배경, 흰 텍스트)
- 크기: height 20px, padding horizontal 6px
- borderRadius: 4px

### 3.3 Header

- 좌측: "SOMETIME" 텍스트 로고 (기존 이미지 로고 대체)
- 우측: 알림 아이콘 + GEM 버튼 **유지**
- 배경: 투명 (새 배경색과 동화)

### 3.4 Navigation (하단)

- 탭 구성: **기존 유지** (Home/Community/Chat/Moment/My)
- 스타일만 새 디자인에 맞춰 업데이트
- 배경: 흰색 유지

### 3.5 Card (공통)

- 배경: `#FFFFFF`
- border: `1px solid #E5E8EB`
- borderRadius: `12px`
- 그림자: 제거 또는 최소화

---

## 4. Home Screen Sections (Phase 2)

### 4.1 "나에게 관심을 보낸 사람" (NEW)

- 데이터: `useLiked()` 훅
- 가로 스크롤 아바타 리스트 (48x48, borderRadius full)
- 온라인 상태 dot (초록 #37DA1A, 12px)
- pill 컨테이너 (흰색, borderRadius 30px, padding 16px)
- 우측 "+N" 카운터
- 우측 그라데이션 페이드아웃

### 4.2 Main Match Card (REDESIGN)

- **기존 타이머 UX 유지**, 카드 스타일만 변경
- 큰 프로필 사진 카드 (335x338)
- 하단 그라데이션 오버레이 (rgba(0,0,0,0) -> rgba(0,0,0,0.3))
- 정보 오버레이: 대학, 나이, MBTI
- 태그 배지: rgba(255,255,255,0.2) 흰색 투명
- D-day 배지: 좌상단, 보라 배경 (#7A4AE2), 리본 스타일
- 글로벌 토글: **기존 세그먼트 토글 유지**, 스타일만 업데이트
- 액션 버튼 2개:
  - "더 찾아보기": 파란 아웃라인 (#3871FF)
  - "좋아요": 파란 채움 (#3871FF)
- 검정 FAB 버튼 (56px, pill, 우하단)

### 4.3 "놓친 인연" Banner (NEW)

- 흰색 배경, padding 20px
- 타이틀: "아쉽게 놓친 인연이 있을지도 몰라요"
- 서브타이틀: "지나간 매칭 리스트를 다시 볼 수 있어요!"
- 우측: 마스코트 이미지 (50x50, 상하 반전)
- 탭: `/matching-history` 이동

### 4.4 "오늘 추천" Grid (DEFERRED)

- **보류** - 추후 별도 결정

### 4.5 Event Carousel (MERGE)

- 기존 서버 배너(BannerSlide) → 이벤트 캐러셀로 통합
- 섹션 타이틀: "이벤트"
- 카드형 캐러셀: 이미지 + 텍스트 + CTA ("자세히 보기" 검정 pill)
- 페이지네이션 dot: 보라 활성(#7A4AE2), 회색 비활성

### 4.6 Community Carousel (REDESIGN)

- 섹션 타이틀: "매칭만 기다리기 지루하다면?" + chevron
- 가로 스크롤 커뮤니티 글 카드
- 카드: 유저(아바타+이름+성별/나이/대학) + 글 제목 + 미리보기 + 좋아요/댓글
- 페이지네이션 dot

---

## 5. Decisions

| 항목 | 결정 |
|------|------|
| 마이그레이션 범위 | 앱 전체 |
| 진행 전략 | Phase 단계별 (색상 -> 홈 -> 나머지) |
| 색상 전략 | semantic-colors 확장 (새 토큰 추가) |
| CTA 색상 | #3871FF (파란), D-day/dot은 #7A4AE2 유지 |
| 하단 네비게이션 | 기존 5탭 유지, 스타일만 변경 |
| 매칭 UX | 기존 타이머 UX 유지, 카드 스타일만 변경 |
| 글로벌 토글 | 기존 세그먼트 토글 유지, 스타일 업데이트 |
| 헤더 좌측 | SOMETIME 텍스트 로고 |
| 헤더 우측 | 알림 + GEM 유지 |
| 버튼 스타일 | pill (borderRadius 999) 전환 |
| "관심 보낸 사람" | useLiked() 훅 |
| "오늘 추천" | 보류 |
| "놓친 인연" 탭 | /matching-history |
| 서버 배너 | 이벤트 캐러셀 통합 |
| 에셋 확보 | Figma에서 직접 추출 |
| i18n | 기존 패턴 (한/일/영 3개 언어) |
| 기존 컴포넌트 제거 | 사용자 별도 지시 시에만 |

---

## 6. Constraints

- FSD 아키텍처 준수
- 기존 API/훅 재사용 (새 API 불필요)
- Safe Area 처리 필수
- Biome 포맷팅/검사 통과
- expo-image 사용 (이미지 렌더링)
- Pretendard 폰트 유지
