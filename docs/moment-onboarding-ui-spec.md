# 모먼트 온보딩 UI 스펙

> **시안**: C "설렘 여행" 스타일
> **버전**: v1.0
> **최종 수정**: 2026-02-08
> **상태**: 기획 검토 중

---

## 1. 개요

### 1.1 기능 목적

모먼트 온보딩은 신규 유저가 처음 모먼트 기능에 진입할 때 거치는 성격 분석 플로우이다.
Big5 성격 모델 기반 질문에 답변하면 AI가 관계 성향을 분석하고, 맞춤 매칭의 기초 데이터를 생성한다.

### 1.2 디자인 컨셉

**"좋은 인연을 만나기 위한 첫 걸음"**

데이팅 앱의 본질인 설렘과 기대감을 온보딩 전체에 녹인다.
무겁고 딱딱한 "테스트"가 아니라, 좋은 사람을 만나기 위해 나를 돌아보는 따뜻한 경험으로 설계한다.

### 1.3 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **설렘 우선** | 모든 인터랙션에 기대감과 두근거림을 담는다 |
| **부담 없는 진입** | "1분이면 끝나요"를 시각적으로도 느끼게 한다 |
| **따뜻한 톤** | 존댓말이되 친근하고 감성적인 어조를 유지한다 |
| **보상감 있는 결과** | 분석 결과가 "선물을 여는 느낌"이 되도록 연출한다 |

### 1.4 플로우 요약

```
[Intro] → [Questions ×4~5] → [Loading] → [Result]
   ↓           ↓                            ↓
 시작 유도    질문 응답                    결과 확인 → 모먼트 진입
```

---

## 2. 디자인 시스템

### 2.1 색상 팔레트

#### 기본 색상 (기존 시스템 활용)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `brand.primary` | `#7A4AE2` | 주요 버튼, 강조 텍스트, 선택 상태 |
| `brand.primaryLight` | `#E2D5FF` | 선택지 선택 배경, 태그 배경 |
| `brand.accent` | `#A892D7` | 보조 강조, 아이콘 색상 |
| `brand.deep` | `#49386E` | 진한 텍스트 강조 |
| `surface.background` | `#FFFFFF` | 기본 배경 |
| `surface.secondary` | `#F7F3FF` | 카드 배경, 섹션 배경 |
| `text.primary` | `#000000` | 본문 텍스트 |
| `text.muted` | `#7C7C7C` | 보조 텍스트, 플레이스홀더 |
| `text.disabled` | `#AEAEAE` | 비활성 텍스트 |

#### 온보딩 전용 확장 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `onboarding.gradientStart` | `#FFFFFF` | Intro/Result 배경 그라디언트 시작 |
| `onboarding.gradientMid` | `#F5F1FF` | 배경 그라디언트 중간 |
| `onboarding.gradientEnd` | `#E8DEFF` | Intro 배경 그라디언트 끝 |
| `onboarding.resultGradientEnd` | `#B095E0` | Result 배경 그라디언트 끝 |
| `onboarding.shimmer` | `#D4BBFF` | 버튼 shimmer 효과 |
| `onboarding.heartPink` | `#FF6B9D` | 하트 아이콘, 설렘 포인트 색상 |
| `onboarding.sparkle` | `#FFD700` | 축하 파티클, 별 효과 |
| `onboarding.progressTrack` | `#F3EDFF` | 프로그레스 바 트랙 |
| `onboarding.progressFill` | `#7A4AE2` | 프로그레스 바 채우기 |
| `onboarding.cardGlow` | `rgba(122, 74, 226, 0.08)` | 질문 카드 외곽 글로우 |

#### 배경 그라디언트 정의

```
Intro 화면:
  LinearGradient(#FFFFFF → #F5F1FF → #E8DEFF)
  방향: 상단 → 하단

Questions 화면:
  Solid(#FFFFFF)

Result 화면:
  LinearGradient(#FFFFFF → #F5F1FF → #DECEFF → #B095E0)
  방향: 상단 → 하단
```

### 2.2 타이포그래피

| 용도 | 크기 | 두께 | 행간 | 예시 |
|------|------|------|------|------|
| 메인 타이틀 | 24px | Bold (700) | 34px | "좋은 만남은 나를 아는 것부터" |
| 서브 타이틀 | 16px | Medium (500) | 24px | "잠깐이면 돼요, 약속" |
| 질문 텍스트 | 18px | SemiBold (600) | 28px | 질문 카드 내 텍스트 |
| 선택지 텍스트 | 15px | Medium (500) | 22px | 선택지 옵션 |
| 선택지 (선택됨) | 15px | Bold (700) | 22px | 선택된 옵션 |
| 본문 | 14px | Regular (400) | 22px | 설명, 인사이트 텍스트 |
| 캡션 | 12px | Regular (400) | 18px | 글자수 카운터, 보조 정보 |
| 버튼 | 16px | Bold (700) | - | CTA 버튼 텍스트 |
| 키워드 태그 | 14px | Medium (500) | - | #키워드 |

### 2.3 간격 체계

| 토큰 | 값 | 용도 |
|------|-----|------|
| `spacing.xs` | 4px | 아이콘과 텍스트 사이 |
| `spacing.sm` | 8px | 키워드 태그 간격 |
| `spacing.md` | 12px | 선택지 간 간격, 카드 내부 요소 |
| `spacing.lg` | 16px | 섹션 내부 패딩 |
| `spacing.xl` | 24px | 화면 좌우 패딩, 섹션 간 간격 |
| `spacing.2xl` | 32px | 큰 섹션 간 간격 |
| `spacing.3xl` | 48px | 화면 상하 여백 |

### 2.4 모서리 & 그림자

```
카드: borderRadius: 16px
선택지: borderRadius: 12px
버튼: borderRadius: 12px
태그: borderRadius: 20px (pill 형태)
입력란: borderRadius: 12px

그림자 (카드):
  iOS: shadowColor #000, offset {0, 2}, opacity 0.06, radius 8
  Android: elevation 2
```

---

## 3. 화면별 상세 스펙

---

### 3.1 Intro 화면

**경로**: `/moment/onboarding`

#### 레이아웃 구조

```
┌─────────────────────────────┐
│         (Safe Area)         │
│                             │
│                             │
│      ┌───────────────┐      │
│      │   캐릭터 이미지  │      │
│      │   + 파티클 효과  │      │
│      └───────────────┘      │
│                             │
│    "좋은 만남은               │
│     나를 아는 것부터"          │
│                             │
│    "잠깐이면 돼요, 약속"       │
│                             │
│   ┌───────────────────┐     │
│   │ ✓ 짧은 질문 4개     │     │
│   │ ✓ 나와 잘 맞는 사람을│     │
│   │   찾아줘요          │     │
│   │ ✓ 당신만의 매력     │     │
│   │   포인트 발견        │     │
│   └───────────────────┘     │
│                             │
│   ┌───────────────────┐     │
│   │   나를 알아보기  ✨   │     │
│   └───────────────────┘     │
│         (Safe Area)         │
└─────────────────────────────┘
```

#### 요소별 스펙

**캐릭터 이미지 영역**

| 속성 | 값 |
|------|-----|
| 이미지 소스 | `miho-mailbox.png` (기존) |
| 크기 | 화면 너비의 50% |
| 위치 | 수평 중앙, 상단에서 Safe Area + 40px |
| 파티클 | 하트(♥)와 별(✦)이 이미지 주변에 부유 |
| 파티클 개수 | 6~8개 |
| 파티클 애니메이션 | 위아래로 느리게 부유 (3~5초 주기) |
| 파티클 색상 | `onboarding.heartPink`, `onboarding.sparkle`, `brand.primaryLight` |
| 파티클 투명도 | 0.3 ~ 0.7 (랜덤) |

**메인 타이틀**

| 속성 | 값 |
|------|-----|
| 텍스트 | "좋은 만남은 나를 아는 것부터" |
| 크기 / 두께 | 24px / Bold |
| 색상 | `text.primary` (#000000) |
| 정렬 | 중앙 |
| 상단 간격 | 캐릭터 이미지 아래 32px |

**서브 타이틀**

| 속성 | 값 |
|------|-----|
| 텍스트 | "잠깐이면 돼요, 약속" |
| 크기 / 두께 | 16px / Medium |
| 색상 | `text.muted` (#7C7C7C) |
| 정렬 | 중앙 |
| 상단 간격 | 메인 타이틀 아래 8px |

**특징 리스트 박스**

| 속성 | 값 |
|------|-----|
| 배경 | `surface.secondary` (#F7F3FF) |
| 모서리 | 16px |
| 패딩 | 20px |
| 좌우 마진 | 24px |
| 상단 간격 | 서브 타이틀 아래 32px |
| 체크 아이콘 | 원형 배지 (24px) + 체크마크 |
| 아이콘 배경 | `brand.primary` (#7A4AE2) |
| 아이콘 색상 | `#FFFFFF` |
| 항목 간 간격 | 16px |
| 텍스트 크기 / 두께 | 14px / Medium |
| 텍스트 색상 | `text.secondary` (#333333) |

특징 항목:

| # | 텍스트 (KO) |
|---|-------------|
| 1 | "짧은 질문 {{count}}개" |
| 2 | "나와 잘 맞는 사람을 찾아줘요" |
| 3 | "당신만의 매력 포인트 발견" |

**CTA 버튼**

| 속성 | 값 |
|------|-----|
| 텍스트 | "나를 알아보기" |
| 크기 | Full-width, height 52px |
| 배경 | `brand.primary` (#7A4AE2) |
| 텍스트 색상 | `#FFFFFF` |
| 모서리 | 12px |
| 좌우 마진 | 24px |
| 하단 위치 | Safe Area bottom + 16px |
| Shimmer 효과 | 좌→우 빛 흐름, 3초 주기 반복 |
| Shimmer 색상 | `onboarding.shimmer` (#D4BBFF), 투명도 0.4 |

#### 진입 애니메이션

| 요소 | 애니메이션 | 시간 |
|------|-----------|------|
| 캐릭터 이미지 | fade-in + scale (0.8→1.0) | 0ms → 400ms |
| 파티클 | 순차 fade-in | 300ms → 800ms (stagger 80ms) |
| 메인 타이틀 | fade-in + translateY (20→0) | 200ms → 500ms |
| 서브 타이틀 | fade-in + translateY (20→0) | 350ms → 650ms |
| 특징 리스트 | fade-in + translateY (20→0) | 500ms → 800ms |
| CTA 버튼 | fade-in + translateY (20→0) | 650ms → 950ms |

---

### 3.2 Questions 화면

**경로**: `/moment/onboarding/questions`

#### 레이아웃 구조

```
┌─────────────────────────────┐
│         (Safe Area)         │
│  ← 뒤로    나 알아가기   ♥♡♡♡  │
│                             │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░  │  ← 프로그레스 바
│                             │
│      ┌─────────────────┐    │
│      │                 │    │
│      │   질문 텍스트      │    │
│      │                 │    │
│      └─────────────────┘    │
│                             │
│   ┌───────────────────┐     │
│   │ ○  선택지 1         │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │ ● 선택지 2 (선택됨) │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │ ○  선택지 3         │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │ ○  선택지 4         │     │
│   └───────────────────┘     │
│                             │
│   ┌───────────────────┐     │
│   │     다음으로         │     │
│   └───────────────────┘     │
│         (Safe Area)         │
└─────────────────────────────┘
```

#### 헤더

| 속성 | 값 |
|------|-----|
| 왼쪽 | 뒤로가기 화살표 아이콘 (24px) |
| 중앙 타이틀 | "나 알아가기" |
| 타이틀 크기 / 두께 | 16px / SemiBold |
| 오른쪽 | 하트 진행 표시 |
| 높이 | 56px |

**하트 진행 표시** (Questions 전용)

질문 수에 따라 하트 아이콘으로 진행도를 표시한다.

```
질문 4개 기준:
  Step 0: ♥ ♡ ♡ ♡
  Step 1: ♥ ♥ ♡ ♡
  Step 2: ♥ ♥ ♥ ♡
  Step 3: ♥ ♥ ♥ ♥
```

| 속성 | 값 |
|------|-----|
| 하트 크기 | 16px |
| 하트 간격 | 4px |
| 채워진 하트 색상 | `onboarding.heartPink` (#FF6B9D) |
| 빈 하트 색상 | `text.disabled` (#AEAEAE) |
| 채워질 때 애니메이션 | scale bounce (1.0→1.3→1.0), 300ms |

#### 프로그레스 바

| 속성 | 값 |
|------|-----|
| 높이 | 8px |
| 트랙 색상 | `onboarding.progressTrack` (#F3EDFF) |
| 채우기 색상 | `onboarding.progressFill` (#7A4AE2) |
| 모서리 | 4px (pill) |
| 좌우 마진 | 24px |
| 상단 간격 | 헤더 아래 12px |
| 애니메이션 | Spring (damping: 15, stiffness: 150), 300ms |

#### 질문 카드

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 테두리 | 1px `border.smooth` (#E4E2E2) |
| 모서리 | 16px |
| 패딩 | 24px |
| 좌우 마진 | 24px |
| 상단 간격 | 프로그레스 바 아래 24px |
| 글로우 효과 | `onboarding.cardGlow` box-shadow 8px blur |
| 텍스트 크기 / 두께 | 18px / SemiBold |
| 텍스트 색상 | `text.primary` (#000000) |
| 텍스트 정렬 | 중앙 |
| 텍스트 행간 | 28px |

#### 선택지 (Choice Type)

**미선택 상태**

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 테두리 | 1.5px `#E5E5E5` |
| 모서리 | 12px |
| 패딩 | 16px |
| 좌우 마진 | 24px |
| 항목 간 간격 | 12px |
| 라디오 원형 크기 | 22px |
| 라디오 테두리 색상 | `#CCCCCC` |
| 텍스트 크기 / 두께 | 15px / Medium |
| 텍스트 색상 | `text.primary` (#000000) |

**선택됨 상태**

| 속성 | 값 |
|------|-----|
| 배경 | `#F8F5FF` |
| 테두리 | 1.5px `brand.primary` (#7A4AE2) |
| 라디오 내부 원 | 12px, `brand.primary` |
| 텍스트 두께 | Bold |
| 텍스트 색상 | `brand.primary` (#7A4AE2) |
| 선택 시 ripple 색상 | `brand.primaryLight` (#E2D5FF), 투명도 0.3 |
| Native 터치 | scale (0.97), haptic feedback (light) |

#### 텍스트 입력 (Text Type)

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 테두리 | 1.5px `#E5E5E5` |
| 포커스 테두리 | 1.5px `brand.primary` (#7A4AE2) |
| 모서리 | 12px |
| 최소 높이 | 160px |
| 패딩 | 16px |
| 좌우 마진 | 24px |
| 플레이스홀더 | "솔직하게 적어주세요" |
| 플레이스홀더 색상 | `text.disabled` (#AEAEAE) |
| 텍스트 크기 | 15px |
| 글자수 카운터 위치 | 입력란 하단 우측 |
| 카운터 형식 | "0/500" |
| 카운터 색상 | `text.muted` (#7C7C7C) |
| 최대 글자수 | 500자 (서버 설정 우선) |

#### 네비게이션 버튼

| 상태 | 텍스트 |
|------|--------|
| 중간 질문 | "다음으로" |
| 마지막 질문 | "내 매력 확인하기" |

| 속성 | 값 |
|------|-----|
| 크기 | Full-width, height 52px |
| 활성 배경 | `brand.primary` (#7A4AE2) |
| 비활성 배경 | `surface.disabled` (#E5E7EB) |
| 텍스트 색상 (활성) | `#FFFFFF` |
| 텍스트 색상 (비활성) | `text.disabled` (#AEAEAE) |
| 모서리 | 12px |
| 좌우 마진 | 24px |
| 하단 위치 | Safe Area bottom + 16px |

#### 질문 전환 애니메이션

| 방향 | 효과 | 시간 |
|------|------|------|
| 다음 (→) | 현재 카드 왼쪽으로 slide-out + fade-out, 새 카드 오른쪽에서 slide-in + fade-in | 250ms |
| 이전 (←) | 현재 카드 오른쪽으로 slide-out + fade-out, 새 카드 왼쪽에서 slide-in + fade-in | 250ms |
| 슬라이드 거리 | 30px |
| 이징 | cubic-bezier(0.25, 0.1, 0.25, 1) |
| 2단계 전환 | Phase 1: fade-out (0→125ms), Phase 2: fade-in (125→250ms) |

#### 배경 색상 변화 (질문별)

각 질문마다 배경 그라디언트가 미묘하게 변한다.

| 질문 | 배경 색상 |
|------|-----------|
| Q1 | `#FFFFFF` (순백) |
| Q2 | `#FEFCFF` (미세한 라벤더) |
| Q3 | `#FDFAFF` (연한 라벤더) |
| Q4 | `#FCF8FF` (라벤더) |
| Q5+ | `#FBF6FF` (진한 라벤더) |

전환: 200ms linear fade

---

### 3.3 Loading 상태 (Questions → Result 전환)

질문 제출 후 결과를 받아오는 동안 표시되는 상태.

#### 레이아웃

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│        ✨ 파티클 효과 ✨      │
│                             │
│    "당신의 매력을              │
│     분석하고 있어요..."        │
│                             │
│      ● ● ●  (로딩 dots)     │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 배경 | 그라디언트 (#FFFFFF → #F5F1FF → #E8DEFF) |
| 텍스트 | "당신의 매력을 분석하고 있어요..." |
| 텍스트 크기 / 두께 | 18px / SemiBold |
| 텍스트 색상 | `brand.deep` (#49386E) |
| 로딩 dots | 3개, 8px 원형, `brand.primary` |
| dots 애니메이션 | 순차 bounce (0→-8px→0), stagger 150ms |
| 파티클 | 별/하트 6개 느리게 부유 |

---

### 3.4 Result 화면

**경로**: `/moment/onboarding/result`

#### 레이아웃 구조

```
┌─────────────────────────────┐
│         (Safe Area)         │
│                             │
│    ✨  축하 파티클 효과  ✨    │
│                             │
│      [캐릭터 이미지 80px]     │
│                             │
│    "당신의 매력, 찾았어요"     │
│                             │
│   ┌───────────────────┐     │
│   │                   │     │
│   │  "창의적 공감자"     │     │
│   │                   │     │
│   │  요약 텍스트...      │     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   ┌───────────────────┐     │
│   │                   │     │
│   │   레이더 차트        │     │
│   │   (5축 분석)        │     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   #키워드1 #키워드2 #키워드3  │
│                             │
│   ┌───────────────────┐     │
│   │ ▼ 인사이트 1        │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │ ▼ 인사이트 2        │     │
│   └───────────────────┘     │
│                             │
│   ┌───────────────────┐     │
│   │   인연 만나러 가기    │     │
│   └───────────────────┘     │
│         (Safe Area)         │
└─────────────────────────────┘
```

#### 축하 효과

| 속성 | 값 |
|------|-----|
| 타입 | Confetti + Sparkle |
| 파티클 종류 | 별(✦), 하트(♥), 원형(●), 다이아(◆) |
| 파티클 색상 | `#7A4AE2`, `#FF6B9D`, `#FFD700`, `#E2D5FF`, `#A892D7` |
| 파티클 수 | 30~40개 |
| 지속 시간 | 2초간 폭발 후 fade-out |
| 발사 위치 | 화면 상단 중앙 |
| 낙하 | 중력 시뮬레이션, 좌우 흔들림 |

#### 완료 타이틀 영역

| 속성 | 값 |
|------|-----|
| 캐릭터 이미지 크기 | 80 × 80px |
| 타이틀 텍스트 | "당신의 매력, 찾았어요" |
| 타이틀 크기 / 두께 | 20px / Bold |
| 타이틀 색상 | `brand.primary` (#7A4AE2) |
| 정렬 | 중앙 |
| 캐릭터 ↔ 타이틀 간격 | 16px |

#### 페르소나 카드 (메인 결과)

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 모서리 | 20px |
| 패딩 | 24px |
| 그림자 | iOS: offset {0,4}, opacity 0.08, radius 12 / Android: elevation 3 |
| 좌우 마진 | 24px |
| 상단 간격 | 타이틀 아래 24px |
| 페르소나 이름 | 따옴표로 감싸서 표시 (예: "창의적 공감자") |
| 이름 크기 / 두께 | 24px / Bold |
| 이름 색상 | `brand.deep` (#49386E) |
| 요약 텍스트 크기 | 14px / Regular |
| 요약 텍스트 색상 | `text.secondary` (#333333) |
| 요약 행간 | 22px |
| 이름 ↔ 요약 간격 | 12px |
| 텍스트 정렬 | 중앙 |

#### 레이더 차트 카드

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 모서리 | 20px |
| 패딩 | 20px |
| 좌우 마진 | 24px |
| 상단 간격 | 페르소나 카드 아래 16px |
| 차트 크기 | (화면 너비 - 48px - 40px) 정사각형 |

**5축 레이더 차트 상세**

| 속성 | 값 |
|------|-----|
| 축 라벨 | 외향성, 개방성, 성실성, 친화성, 정서적 안정 |
| 라벨 크기 / 색상 | 12px / `text.muted` (#7C7C7C) |
| 그리드 레벨 | 20, 40, 60, 80, 100 (5단계) |
| 그리드 선 색상 | `#E5E5E5`, 두께 0.5px |
| 데이터 영역 채우기 | `rgba(122, 74, 226, 0.15)` |
| 데이터 영역 외곽선 | `brand.primary` (#7A4AE2), 두께 2px |
| 데이터 포인트 | 원형 6px, `brand.primary` |
| 스케일 | 0~100 |

#### 키워드 태그

| 속성 | 값 |
|------|-----|
| 배치 | FlexWrap, 중앙 정렬 |
| 좌우 마진 | 24px |
| 상단 간격 | 레이더 차트 아래 16px |
| 태그 배경 | `surface.secondary` (#F7F3FF) |
| 태그 텍스트 색상 | `brand.primary` (#7A4AE2) |
| 태그 크기 | 14px / Medium |
| 태그 패딩 | 8px 16px |
| 태그 모서리 | 20px (pill) |
| 태그 간 간격 | 8px |
| 접두사 | "#" |

#### 인사이트 카드 (접기/펼치기)

| 속성 | 값 |
|------|-----|
| 배경 | `#FFFFFF` |
| 테두리 | 1px `border.smooth` (#E4E2E2) |
| 모서리 | 12px |
| 패딩 | 16px |
| 좌우 마진 | 24px |
| 카드 간 간격 | 12px |
| 상단 간격 | 키워드 아래 24px |
| 접힌 상태 높이 | auto (타이틀만) |
| 토글 아이콘 | 화살표 ▼/▲ |
| 토글 애니메이션 | LayoutAnimation, 200ms |
| 본문 텍스트 크기 | 14px / Regular |
| 본문 행간 | 22px |
| 본문 색상 | `text.secondary` (#333333) |

#### CTA 버튼

| 속성 | 값 |
|------|-----|
| 텍스트 | "인연 만나러 가기" |
| 크기 | Full-width, height 52px |
| 배경 | `brand.primary` (#7A4AE2) |
| 텍스트 색상 | `#FFFFFF` |
| 모서리 | 12px |
| 좌우 마진 | 24px |
| 위치 | 하단 고정 (absolute), Safe Area bottom + 16px |
| 동작 | `/moment`로 이동 + 온보딩 상태 리셋 |

#### 결과 화면 진입 애니메이션

| 요소 | 애니메이션 | 시간 |
|------|-----------|------|
| 축하 파티클 | 폭발 + 낙하 | 0ms → 2000ms |
| 캐릭터 이미지 | scale (0→1.0) + bounce | 200ms → 600ms |
| 완료 타이틀 | fade-in + translateY | 400ms → 700ms |
| 페르소나 카드 | fade-in + translateY (30→0) | 600ms → 1000ms |
| 레이더 차트 | 데이터 영역 0%→100% 확장 | 1000ms → 1600ms |
| 키워드 태그 | 순차 fade-in + scale | 1200ms → 1800ms (stagger 100ms) |
| 인사이트 카드 | 순차 fade-in | 1500ms → 2000ms |
| CTA 버튼 | fade-in + translateY | 1800ms → 2100ms |

---

## 4. 텍스트 컨텐츠 (다국어)

### 4.1 Intro 화면

| Key | 한국어 (KO) | 영어 (EN) | 일본어 (JA) |
|-----|------------|-----------|-------------|
| `intro.title` | 좋은 만남은 나를 아는 것부터 | Good connections start with knowing yourself | 良い出会いは自分を知ることから |
| `intro.subtitle` | 잠깐이면 돼요, 약속 | Just a moment, we promise | ほんの少しだけ、約束 |
| `intro.feature1` | 짧은 질문 {{count}}개 | {{count}} quick questions | {{count}}つの短い質問 |
| `intro.feature2` | 나와 잘 맞는 사람을 찾아줘요 | Find people who match you well | あなたに合う人を見つけます |
| `intro.feature3` | 당신만의 매력 포인트 발견 | Discover your unique charm | あなただけの魅力ポイント発見 |
| `intro.startButton` | 나를 알아보기 | Get to know me | 自分を知る |

### 4.2 Questions 화면

| Key | 한국어 (KO) | 영어 (EN) | 일본어 (JA) |
|-----|------------|-----------|-------------|
| `questions.headerTitle` | 나 알아가기 | Getting to know me | 自分を知る |
| `questions.nextButton` | 다음으로 | Next | 次へ |
| `questions.submitButton` | 내 매력 확인하기 | See my charm | 私の魅力を確認 |
| `questions.placeholder` | 솔직하게 적어주세요 | Write honestly | 素直に書いてください |

### 4.3 Loading 상태

| Key | 한국어 (KO) | 영어 (EN) | 일본어 (JA) |
|-----|------------|-----------|-------------|
| `loading.message` | 당신의 매력을 분석하고 있어요... | Analyzing your charm... | あなたの魅力を分析中... |

### 4.4 Result 화면

| Key | 한국어 (KO) | 영어 (EN) | 일본어 (JA) |
|-----|------------|-----------|-------------|
| `result.completeTitle` | 당신의 매력, 찾았어요 | Found your charm | あなたの魅力、見つけました |
| `result.startMomentButton` | 인연 만나러 가기 | Go meet your match | ご縁に会いに行く |

### 4.5 레이더 차트 축 라벨

| Dimension | 한국어 (KO) | 영어 (EN) | 일본어 (JA) |
|-----------|------------|-----------|-------------|
| extraversion | 외향성 | Extraversion | 外向性 |
| openness | 개방성 | Openness | 開放性 |
| conscientiousness | 성실성 | Conscientiousness | 誠実性 |
| agreeableness | 친화성 | Agreeableness | 協調性 |
| neuroticism | 정서적 안정 | Emotional Stability | 情緒安定性 |

---

## 5. 인터랙션 상세

### 5.1 뒤로가기 동작

| 상황 | 동작 |
|------|------|
| Intro 화면 | 이전 화면으로 돌아감 (모먼트 홈) |
| Questions Step 0 | 모먼트 홈으로 이동 (온보딩 종료) |
| Questions Step 1+ | 이전 질문으로 이동 (답변 유지) |
| Result 화면 | 뒤로가기 비활성 (gestureEnabled: false) |

### 5.2 선택지 인터랙션

```
터치 시작 → scale(0.97) + 배경색 전환 시작
터치 완료 → 선택 상태 업데이트 + haptic feedback (light)
           → scale(1.0) spring 복원
           → 이전 선택 해제 (라디오 방식)
```

### 5.3 버튼 활성/비활성 조건

| 질문 타입 | 활성 조건 |
|-----------|----------|
| choice | 선택지 1개 이상 선택됨 |
| text | 입력 텍스트 trim 후 1자 이상 |

비활성 상태에서 터치 시: 아무 반응 없음 (opacity 0.5 유지)

### 5.4 답변 저장 및 복원

- 답변은 Zustand store의 `Map<questionId, answer>`에 실시간 저장
- 뒤로 돌아가면 이전 답변이 복원되어 표시됨
- 온보딩 완전 종료(홈 이동) 시 store reset

---

## 6. 반응형 & 플랫폼 처리

### 6.1 Safe Area

| 위치 | 처리 |
|------|------|
| 상단 | `insets.top` 적용 (헤더 paddingTop) |
| 하단 | `insets.bottom + 16px` 적용 (CTA 버튼 위치) |

### 6.2 플랫폼별 차이

| 요소 | Native (iOS/Android) | Web |
|------|---------------------|-----|
| 선택지 터치 | Reanimated spring + haptic | CSS transition |
| 프로그레스 바 | Reanimated spring | CSS transition |
| 질문 전환 | Reanimated worklet | State-based phase transition |
| 스켈레톤 | Native shimmer | CSS gradient animation |
| 축하 효과 | Reanimated particles | CSS keyframes |

### 6.3 작은 화면 대응

| 화면 높이 | 조정 |
|-----------|------|
| < 700px | 캐릭터 이미지 40% 축소, 간격 75% 축소 |
| < 600px | 캐릭터 이미지 숨김, 상단 간격 최소화 |

---

## 7. 에러 & 엣지 케이스

| 상황 | 처리 |
|------|------|
| 질문 로딩 실패 | Skeleton 유지 + 재시도 버튼 표시 |
| 답변 제출 실패 | Toast 에러 메시지 + 버튼 재활성화 |
| 네트워크 끊김 | 오프라인 안내 Toast |
| 질문 0개 응답 | Intro로 리다이렉트 |
| 빈 리포트 응답 | 기본 메시지 표시 ("분석 결과를 준비 중이에요") |

---

## 8. 접근성

| 항목 | 처리 |
|------|------|
| 선택지 | accessibilityRole="radio", accessibilityState={{selected}} |
| 버튼 | accessibilityRole="button", accessibilityState={{disabled}} |
| 프로그레스 | accessibilityRole="progressbar", accessibilityValue |
| 질문 텍스트 | accessibilityRole="text" |
| 이미지 | accessibilityLabel 제공 |
| 화면 전환 | announceForAccessibility로 새 질문 알림 |

---

## 부록: 파일 매핑

| 스펙 섹션 | 구현 파일 |
|-----------|----------|
| Intro 화면 | `src/features/moment/ui/onboarding/onboarding-intro.tsx` |
| Questions 화면 | `src/features/moment/ui/onboarding/onboarding-questions.tsx` |
| Result 화면 | `src/features/moment/ui/onboarding/onboarding-result.tsx` |
| i18n 키 | `src/features/moment/ui/onboarding/keys.ts` |
| 선택지 컴포넌트 | `src/features/moment/ui/onboarding/components/choice-options.{tsx,native.tsx,web.tsx}` |
| 프로그레스 바 | `src/features/moment/ui/onboarding/components/animated-progress-bar.{tsx,native.tsx,web.tsx}` |
| 질문 전환 | `src/features/moment/ui/onboarding/components/animated-transition.{tsx,native.tsx,web.tsx}` |
| 질문 카드 | `src/features/moment/ui/onboarding/components/question-card.tsx` |
| 텍스트 입력 | `src/features/moment/ui/onboarding/components/text-input.tsx` |
| 특징 리스트 | `src/features/moment/ui/onboarding/components/intro-features.tsx` |
| 스켈레톤 | `src/features/moment/ui/onboarding/components/skeleton.{tsx,native.tsx,web.tsx}` |
| 상태 관리 | `src/features/moment/hooks/use-moment-onboarding.ts` |
| API 호출 | `src/features/moment/apis/onboarding.ts` |
| Query 훅 | `src/features/moment/queries/onboarding.ts` |
| 타입 정의 | `src/features/moment/types.ts` |
| 라우팅 레이아웃 | `app/moment/onboarding/_layout.tsx` |
| 라우팅 (Intro) | `app/moment/onboarding/index.tsx` |
| 라우팅 (Questions) | `app/moment/onboarding/questions.tsx` |
| 라우팅 (Result) | `app/moment/onboarding/result.tsx` |
