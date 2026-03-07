# 홈 후기 슬라이드 카드 높이 불일치 버그 수정 (2026-03-07)

## 배경

QA에서 홈 화면 "연애 성공 후기" 캐러셀 슬라이드마다 카드 하단과 인디케이터(점) 사이 간격이 들쭉날쭉하다고 제보. 리뷰 내용 길이에 따라 카드가 달라 보이는 시각적 일관성 문제.

---

## 완료 작업

### 1. `overflow: "hidden"` 추가 (핵심 수정)

`src/features/home/ui/review-slide.tsx` — `reviewCard` 스타일

**원인**: `reviewCard`에 `height: 160`이 이미 있었으나 `overflow`가 기본값 `"visible"`이라, 리뷰 body 줄 수·title 유무에 따라 콘텐츠가 카드 경계(160px) 아래로 시각적으로 흘러넘침. 인디케이터는 레이아웃 기준 `bottom: -28`에 고정되어 있어, 넘치는 콘텐츠 양이 다른 슬라이드마다 카드 하단 ↔ 인디케이터 간격이 다르게 보임.

```typescript
reviewCard: {
  flexDirection: "column",
  gap: 8,
  width: "100%",
  height: 160,
  overflow: "hidden",   // 추가
  backgroundColor: colors.moreLightPurple,
  padding: 10,
  borderRadius: 12,
},
```

### 2. 중복 margin 제거

- `contentSection`의 `marginTop: 8` 제거 — 부모 `reviewCard`의 `gap: 8`과 중복(실효 gap 16px → 8px)
- `dateText`의 `marginBottom: 12` 제거 — 카드 `padding: 10`이 이미 하단 여백 제공

```typescript
contentSection: {
  marginHorizontal: 8,
  flexDirection: "column",
  gap: 4,
},
dateText: {
  color: "#6F6F6F",
  marginTop: 4,
},
```

---

## 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/features/home/ui/review-slide.tsx` | `overflow: "hidden"`, `contentSection.marginTop` 제거, `dateText.marginBottom` 제거 |

---

## 커밋 상태

**미커밋** — 다음 세션에서 커밋 필요.

---

## 다음 세션 참고사항

- `src/widgets/slide/index.tsx`의 인디케이터: `position: absolute`, `bottom: -16` 기본 → `indicatorContainerStyle`로 `bottom: -28` 오버라이드. 카드 레이아웃 높이 기준으로 위치하므로 카드 시각적 높이가 일정해야 인디케이터 간격도 일정함.
- 카드 내부 콘텐츠가 160px 초과 가능 (`padding + header + body 5줄 + date ≈ 188px`) — `overflow: "hidden"`으로 클리핑 처리됨.
- 이전 세션(MY 탭 계정 관리 IA 정리) 변경사항도 미커밋 상태: `bento-grid.tsx`, `setting-header.tsx`, locale 3개 파일.
