# UI Redesign Session Log

> Figma: `LluFfIG2PPiTY5PKWv25hU` / node `6560:21436`
> Session date: 2026-02-22
> Branch: `dev`
> Reference: `docs/ui-migration/requirements.md`

---

## 1. Session Overview

Sometimes App의 새 디자인 시스템 마이그레이션을 3-Phase 전략으로 진행.
이 세션에서 **Phase 1 완료**, **Phase 2 구현 후 stash 처리**, **마이페이지 BentoGrid + 인기 게시글 캐러셀** 추가 작업 수행.

### Phase 정의

| Phase | 범위 | 상태 |
|-------|------|------|
| **Phase 1** | 색상 시스템 + 공통 컴포넌트 리디자인 | **완료 (워킹트리에 반영)** |
| **Phase 2** | 홈 화면 리디자인 (신규 섹션, 매칭 카드, 배너 통합) | **구현 완료 → stash 보관** |
| **Phase 3** | 나머지 화면 (채팅, 커뮤니티, 마이페이지 상세 등) | 미착수 |

---

## 2. Phase 1: 색상 + 공통 컴포넌트 (현재 워킹트리)

Phase 1 변경은 커밋되지 않은 상태로 `dev` 브랜치 워킹트리에 존재.

### 2.1 변경 파일 목록 (33개)

#### 색상 시스템
| 파일 | 변경 내용 |
|------|----------|
| `src/shared/constants/semantic-colors.ts` | semantic color 토큰 전면 확장 (brand, surface, text, border 체계) |
| `src/shared/constants/colors.ts` | semantic-colors와 동기화, legacy 호환 유지 |

#### 공통 UI 컴포넌트
| 파일 | 변경 내용 |
|------|----------|
| `src/shared/ui/button/index.tsx` | pill 스타일 기본값 전환 (borderRadius 999), variant/size 체계 정리 |
| `src/shared/ui/badge/index.tsx` | `white-transparent` variant 추가, 스타일 체계 정리 |
| `src/shared/ui/text/text.tsx` | 텍스트 컬러 체계 semantic-colors 연동 |
| `src/shared/ui/header/index.tsx` | Header export 정리 |
| `src/shared/ui/header/ui/container.tsx` | backgroundColor `transparent` 전환 (각 페이지 배경과 동화) |
| `src/shared/ui/header/ui/logo.tsx` | 이미지 로고 → "SOMETIME" 텍스트 로고, 좌측 정렬 (`alignItems: 'flex-start'`) |
| `src/shared/ui/header/ui/center-content.tsx` | 포맷팅 정리 |
| `src/shared/ui/header-with-notification/index.tsx` | 투명 배경 적용, 스타일 정리 |
| `src/shared/ui/navigation/index.tsx` | semantic color 적용, 포맷팅 정리 |

#### Feature별 UI 적용
| 파일 | 변경 내용 |
|------|----------|
| `src/features/home/ui/header/index.tsx` | 홈 헤더 좌측 정렬 적용 |
| `src/features/chat/ui/chat-header.tsx` | 채팅 헤더 스타일 적용 |
| `src/features/moment/ui/moment-header.tsx` | 모먼트 헤더 스타일 적용 |
| `src/features/global-matching/ui/global-first-match.tsx` | 매칭 UI 스타일 적용 |
| `src/features/global-matching/ui/global-nav.tsx` | 버튼 pill 스타일 적용 |
| `src/features/global-matching/ui/onboarding-bottom-sheet.tsx` | 온보딩 바텀시트 리디자인 |
| `src/features/global-matching/ui/onboarding-nudge-banner.tsx` | 넛지 배너 스타일 리디자인 |
| `src/features/global-matching/hooks/use-global-rematch.ts` | 리매칭 훅 정리 |
| `src/features/global-matching/queries/use-global-matching-status.ts` | 쿼리 정리 |

#### i18n
| 파일 | 변경 |
|------|------|
| `src/shared/libs/locales/{ko,en,ja}/features/global-matching.json` | 온보딩 관련 키 추가/수정 |

#### 신규 파일
| 파일 | 내용 |
|------|------|
| `src/features/global-matching/hooks/use-complete-onboarding.ts` | 온보딩 완료 훅 |

### 2.2 핵심 디자인 변경 요약

```
Header:  중앙 이미지 로고 → 좌측 "SOMETIME" 텍스트 로고, 배경 transparent
Button:  borderRadius 12~16 → 999 (pill), variant/size 유지
Badge:   white-transparent variant 추가 (rgba(255,255,255,0.2))
Nav:     하드코딩 색상 → semantic-colors 참조
Colors:  brand.primary=#7A4AE2 유지, surface/text/border 토큰 확장
```

---

## 3. Phase 2: 홈 화면 리디자인 (stash 보관)

Phase 2는 완전히 구현되었으나, Phase 1과 분리하기 위해 stash 처리됨.

### 3.1 Stash 보관 내역

**`stash@{0}`: `phase2-home-redesign-new-files`**

신규 파일 4개:
| 파일 | 내용 |
|------|------|
| `src/features/like/ui/interest-avatars.tsx` | "나에게 관심을 보낸 사람" 아바타 가로 스크롤 섹션 |
| `src/features/home/ui/match-fab.tsx` | 검정 FAB 버튼 (56x56, 매칭 카드 우하단) |
| `src/features/home/ui/community-carousel.tsx` | 커뮤니티 인기글 가로 스크롤 카드 |
| `src/features/matching-history/ui/missed-connection-banner.tsx` | "놓친 인연" 배너 (마스코트 + 텍스트) |

### 3.2 원복된 수정 파일 (git checkout HEAD)

이 파일들은 Phase 2 변경이 `git checkout HEAD`로 원복됨. stash에는 포함되지 않으므로 **재구현 필요**:

| 파일 | Phase 2 변경 내용 (원복됨) |
|------|--------------------------|
| `app/home/index.tsx` | 배경색 backgroundAlt, 레이아웃 재배치 (InterestAvatars, MatchFab, MissedConnectionBanner, CommunityCarousel 교체) |
| `src/features/home/ui/banner-slide.tsx` | "이벤트" 섹션 타이틀 추가, 카드 프레임 래핑 |
| `src/features/home/ui/banner/server-banner.tsx` | borderRadius 20→12 |
| `src/features/home/ui/index.tsx` | Phase 2 컴포넌트 export 추가 (CommunityCarousel, MatchFab 등) |
| `src/features/idle-match-timer/ui/container.tsx` | borderRadius 20→12 |
| `src/features/idle-match-timer/ui/partner.tsx` | 하단 그라데이션 밝게 (0.7→0.3) |
| `src/features/global-matching/ui/global-partner-card.tsx` | 하단 그라데이션 밝게 (0.7→0.3) |
| `src/features/global-matching/ui/global-matching-timer.tsx` | borderRadius 20→12 |
| `src/features/global-matching/ui/mode-toggle.tsx` | 세그먼트 컨트롤 미세 스타일 조정 |
| `src/shared/libs/locales/{ko,en,ja}/features/home.json` | banner_slide.section_title, community_carousel 키 (Phase 2 전용) |
| `src/shared/libs/locales/{ko,en,ja}/features/like.json` | interest_avatars.section_title 키 |
| `src/shared/libs/locales/{ko,en,ja}/features/matching-history.json` | missed_banner.title/subtitle 키 |

### 3.3 원복된 색상 토큰

`semantic-colors.ts`와 `colors.ts`에서 `surface.backgroundAlt: '#F2F4F6'` 제거됨.
Phase 2 복원 시 다시 추가 필요.

---

## 4. 추가 작업: 마이페이지 BentoGrid + 인기 게시글 캐러셀

Phase 1/2와 별개로 진행된 기능 작업. 현재 워킹트리에 반영됨.

### 4.1 마이페이지 BentoGrid

**스크린샷 참조**: 기존 세로 메뉴 리스트 → 벤토 그리드 레이아웃으로 전환

| 파일 | 변경 |
|------|------|
| `app/my/index.tsx` | 기존 Profile/Menu 컴포넌트들 → `BentoGrid` 단일 컴포넌트로 교체, import 대폭 정리 |
| `src/features/mypage/ui/index.tsx` | `BentoGrid` export 추가 |
| `src/shared/libs/locales/{ko,en,ja}/features/mypage.json` | `bento.*` 키 추가 (edit, gem_label, ideal_type, photo_mgmt, preview, articles, comments, likes, block, support, account) |

**변경 핵심**:
- 기존: `Profile`, `SupportMenu`, `MatchingMenu`, `PrivacyMenu`, `NotificationMenu`, `MyActivityMenu` 순차 렌더링
- 신규: `BentoGrid` 하나로 통합 (그리드 기반 카드형 메뉴)
- `useFocusEffect`에 `mbti` 쿼리 invalidation 추가
- 기존 컴포넌트는 삭제하지 않음 (점진적 마이그레이션)

### 4.2 홈 인기 게시글 캐러셀 (HotPostsCarousel)

`requirements/home-popular-posts-carousel.md` 스펙 기반.

| 파일 | 변경 |
|------|------|
| `app/home/index.tsx` | `TipAnnouncement` 영역 → `HotPostsCarousel` 교체 |
| `src/features/home/ui/index.tsx` | `HotPostsCarousel` export 추가 |
| `src/shared/libs/locales/{ko,en,ja}/features/home.json` | `hot_posts_carousel.title/view_all` 키 추가 |

**변경 핵심**:
- 기존 TipAnnouncement (팁 카드) → 커뮤니티 인기 게시글 스냅 캐러셀
- 데이터: 기존 `/articles/hot/latest` API, `useHomeHots()` 훅 재사용
- 카드: categoryName 배지 + title (2줄 제한)
- 전체보기 → `/community` 이동

---

## 5. 현재 워킹트리 상태 요약

```
반영됨 (unstaged):
├── Phase 1: 색상/공통 컴포넌트 리디자인 (23개 파일)
├── 마이페이지 BentoGrid (3개 파일 + locale 6개)
└── 인기 게시글 캐러셀 (2개 파일 + locale 3개)

stash 보관:
└── stash@{0}: phase2-home-redesign-new-files (신규 파일 4개)

원복됨 (재구현 필요):
└── Phase 2 수정 파일 19개 + 색상 토큰 backgroundAlt
```

---

## 6. 롤백/복원 방법

### 6.1 Phase 1 전체 롤백

```bash
# 모든 워킹트리 변경 원복 (주의: 마이페이지/캐러셀 변경도 함께 사라짐)
git checkout HEAD -- .
```

### 6.2 Phase 2 복원

Phase 2 복원은 2단계 필요:

```bash
# Step 1: stash에서 신규 파일 4개 복원
git stash pop stash@{0}

# Step 2: 수정 파일 재구현 필요 (stash에 미포함)
# - app/home/index.tsx: 배경색, 레이아웃 재배치
# - banner-slide, server-banner: 이벤트 캐러셀화
# - idle-match-timer, global-matching: borderRadius/gradient 조정
# - mode-toggle: 세그먼트 스타일
# - locale 파일: like, home, matching-history 키 추가
# - semantic-colors.ts, colors.ts: surface.backgroundAlt 토큰 추가
#
# 재구현 참조:
# - Plan 원본: 이전 세션 트랜스크립트 (Phase 2 구현 계획 전문 포함)
# - 디자인: Figma LluFfIG2PPiTY5PKWv25hU / node 6560:21436
# - 스펙: docs/ui-migration/requirements.md Section 4
```

### 6.3 마이페이지 BentoGrid만 롤백

```bash
git checkout HEAD -- \
  app/my/index.tsx \
  src/features/mypage/ui/index.tsx \
  src/shared/libs/locales/ko/features/mypage.json \
  src/shared/libs/locales/en/features/mypage.json \
  src/shared/libs/locales/ja/features/mypage.json
```

### 6.4 인기 게시글 캐러셀만 롤백

```bash
git checkout HEAD -- \
  app/home/index.tsx \
  src/features/home/ui/index.tsx \
  src/shared/libs/locales/ko/features/home.json \
  src/shared/libs/locales/en/features/home.json \
  src/shared/libs/locales/ja/features/home.json
```

> **주의**: `app/home/index.tsx`와 `src/features/home/ui/index.tsx`는 캐러셀과 Phase 1 변경이 혼재.
> 캐러셀만 롤백하면 Phase 1 변경도 함께 원복됨. 수동 분리 필요.

---

## 7. 참조 문서

| 문서 | 위치 |
|------|------|
| 마이그레이션 요구사항 전체 | `docs/ui-migration/requirements.md` |
| 인기 게시글 캐러셀 스펙 | `requirements/home-popular-posts-carousel.md` |
| 마이페이지 리디자인 아이디어 | `docs/features/mypage/mypage-redesign-ideas.html` |
| 온보딩 시트 디자인 | `docs/features/global-matching/onboarding-sheet-designs.html` |
| 넛지 배치 아이디어 | `docs/features/global-matching/nudge-placement-ideas.html` |
| 온보딩 완료 아이디어 | `docs/features/global-matching/onboarding-complete-ideas.html` |

---

## 8. 다음 세션 가이드

### Phase 1 커밋 시
Phase 1 변경만 커밋할 경우, 마이페이지 BentoGrid와 인기 게시글 캐러셀을 분리할지 결정 필요.
- **Option A**: Phase 1 + BentoGrid + 캐러셀 함께 커밋 (현재 상태 그대로)
- **Option B**: Phase 1만 커밋 → BentoGrid/캐러셀은 별도 커밋 (파일 단위 staging)

### Phase 2 재개 시
1. Phase 1이 커밋된 상태에서 시작
2. `git stash pop stash@{0}`으로 신규 파일 4개 복원
3. 수정 파일들은 이 문서의 Section 3.2 테이블 참조하여 재구현
4. `surface.backgroundAlt: '#F2F4F6'` 토큰 재추가 필수
5. Phase 2 원본 계획은 이전 세션 트랜스크립트에 전문 포함됨
