# PeekSheet + CategoryBadge 아이콘 VLM 프롬프트

> PeekSheet UI 통일성 개선 프로젝트 — 보라색 계열 3D 클레이 아이콘 7종
> 생성일: 2026-03-02
> 저장 경로: `assets/icons/match/`

---

## [아이콘 1] Match No Pool

**Category**: `3d-object`
**Suggested filename**: `match-no-pool.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D magnifying glass icon, 40x40 pixel icon scale. The circular lens frame is soft lavender (#B8A0E8) with a semi-translucent pale lavender (#E8D5F5) glass interior showing a subtle inner glow. The handle is a thick rounded rod in mid-purple (#B8A0E8). A small 3D lavender question mark or search-dot sits at the center of the lens, suggesting an empty result. Subtle white highlight streak on the upper-left of the lens. Soft drop shadow beneath the object. No sharp edges, no text. Cute, minimal, icon-like, simplified forms.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, red, green, emoji style, flat 2D

### Parameters

- Resolution: 80 x 80px (2x for 40x40 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render
- Color dominance: #B8A0E8 (mid-purple), #E8D5F5 (pale lavender)
- Composition: centered single object, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| Magnifying glass | 검색/탐색 행위 |
| Empty / question mark inside lens | 매칭풀에 적합한 상대가 없음 (NO_MATCH_POOL) |
| Lavender color scheme | 브랜드 보라 통일, 부정적이지 않은 따뜻한 톤 |

---

## [아이콘 2] Match Filtered

**Category**: `3d-object`
**Suggested filename**: `match-filtered.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D settings / filter funnel icon, 40x40 pixel icon scale. The shape is a wide-top tapered funnel with three horizontal rounded bars inside, representing filter sliders. Primary body color is soft lavender (#B8A0E8). The three slider bars are white with a pale lavender tint, each at different heights to suggest adjustable filters. A small rounded circular knob sits on each bar, colored mid-purple (#9B7FD6). Smooth matte surface, subtle white highlight on the top-left of the funnel body. No sharp edges, no gears, no text. Cute, minimal, simplified 3D icon.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, gear shape, mechanical, flat 2D, emoji style

### Parameters

- Resolution: 80 x 80px (2x for 40x40 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render
- Color dominance: #B8A0E8 (mid-purple), #9B7FD6 (natural purple)
- Composition: centered single object, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| Filter funnel / slider bars | 필터 조건에 의한 매칭 제외 (FILTERED_OUT) |
| Multiple adjustment knobs | 사용자가 설정한 이상형 필터 조건 |
| Lavender palette | 경고가 아닌 정보 전달 톤 유지 |

---

## [아이콘 3] Match Already

**Category**: `3d-object`
**Suggested filename**: `match-already.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D icon showing two overlapping rounded profile silhouettes (busts, no faces) with a small 3D lavender heart floating between them at the top. The left silhouette is white with a soft lavender (#E8D5F5) tint, the right silhouette is mid-purple (#B8A0E8). They overlap slightly in the center to suggest connection. The floating heart is soft pink (#FFB5C5) or pale lavender, small and puffy. Smooth matte surface, soft shadow beneath the group. Icon scale 40x40 pixels. No text, no sharp edges, cute and minimal.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, red, emoji style, detailed faces, flat 2D

### Parameters

- Resolution: 80 x 80px (2x for 40x40 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render
- Color dominance: #B8A0E8 (mid-purple), #E8D5F5 (pale lavender), #FFB5C5 (soft pink accent)
- Composition: two overlapping silhouettes centered, floating heart above, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| Two overlapping silhouettes | 이미 매칭이 성사된 상태 (ALREADY_MATCHED) |
| Heart floating between them | 커플/연결의 상징 |
| Overlap composition | 중복 매칭 불가 상태를 직관적으로 표현 |

---

## [아이콘 4] Stopwatch Branded

**Category**: `3d-object`
**Suggested filename**: `stopwatch-branded.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D stopwatch / timer icon, 32x32 pixel icon scale. The main circular body is soft lavender (#B8A0E8) with a subtle pale lavender (#E8D5F5) face. A thin white clock hand points to roughly the 10 o'clock position. The crown button on top is a small rounded mid-purple (#9B7FD6) cylinder. A small loop at the very top for hanging is rounded and mid-purple. The entire body has a gentle glossy highlight on the upper-left. No numbers on the face, no text, no sharp edges. Cute, minimal, icon-like, simplified forms. Designed to replace a large SVG stopwatch at small render sizes.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, complex dial, numbers, flat 2D

### Parameters

- Resolution: 64 x 64px (2x for 32x32 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render
- Color dominance: #B8A0E8 (mid-purple), #E8D5F5 (face), #9B7FD6 (accents)
- Composition: centered single object, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| Stopwatch body | 대기 중 / 다음 매칭까지 남은 시간 (WaitingContent) |
| Clock hand | 시간 흐름, 카운트다운 |
| Branded lavender color | 기존 3.2MB PNG를 브랜드 통일 소형 에셋으로 교체 |

---

## [아이콘 5] Rejection Sad

**Category**: `miho-character`
**Suggested filename**: `rejection-sad.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

A cute white nine-tailed fox character in 3D clay render style. Sitting with droopy ears and downcast curved-line eyes, looking dejected and sad. The fox has pure white smooth body, soft lavender-tinted tails (3 tails fanning out behind), pink inner ears, simple downward-curved-line sad eyes (no pupils, just drooping arcs), small dark nose (#2D2D2D), and closed mouth with a slight downward curve. A single small teardrop — soft lavender or pale blue (#C8D8F0) — falls from the left eye. The overall posture is hunched slightly forward with arms hanging loosely at the sides, conveying gentle sadness. Smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background. Pastel purple and white color scheme. Icon scale approximately 60x60 pixels, character fills most of the frame.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, aggressive, scary, crying heavily, flat 2D

### Parameters

- Resolution: 120 x 120px (2x for 60x60 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render — Miho character
- Color dominance: #FFFFFF (body), #C4B5E6~#B8A9D9 (tails), #FFB5C5 (ears), #C8D8F0 (teardrop)
- Composition: centered character, slight downward head tilt, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| 미호의 슬픈 표정 / 축 처진 자세 | 프로필 사진 거절 (photo-rejection) 상태 |
| 한 방울의 눈물 | 거절에 대한 감정 표현, 과하지 않은 슬픔 |
| 라벤더 꼬리 | 브랜드 미호 아이덴티티 유지 |
| 부드러운 톤 | 사용자를 위로하는 따뜻한 감성 전달 |

---

## [아이콘 6] Rematch Icon

**Category**: `3d-object`
**Suggested filename**: `rematch-icon.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D circular arrow / reload icon, matching a 39x38 pixel icon scale. Two thick rounded arrows form a nearly complete circle (refresh / cycle shape), leaving a small gap at the bottom where the tails point outward. The arrows are mid-purple (#9B7FD6) with a smooth matte finish and subtle white highlight on the upper curve. The arrowheads are slightly flared and rounded, not sharp. In the very center of the circle there is a small soft-pink (#FFB5C5) puffy heart, adding a romantic touch to the rematch concept. The overall form is compact and centered. No text, no sharp edges.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, flat 2D, loading spinner style, mechanical

### Parameters

- Resolution: 78 x 76px (2x for 39x38 display)
- Aspect ratio: 39:38 (approximately 1:1)
- Style: 3D Clay Render
- Color dominance: #9B7FD6 (natural purple arrows), #FFB5C5 (center heart accent)
- Composition: circular arrow form centered, small heart in center, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| 순환 화살표 (circular arrow) | 리매칭 재시도 동작 |
| 중앙 하트 | 매칭의 목적 — 새로운 인연 찾기 |
| Natural purple (#9B7FD6) | rematch 카테고리 색상 (#9B7FD6) 정합성 유지 |

---

## [아이콘 7] Expand Filter

**Category**: `3d-object`
**Suggested filename**: `expand-filter.webp`
**Suggested directory**: `assets/icons/match/`

### Prompt (EN)

3D clay render style, smooth matte surface, rounded puffy forms, soft top-left lighting, gentle diffused shadow, transparent background, pastel purple monochromatic palette. A puffy 3D expand / full-screen frame icon, 24x24 pixel icon scale. Four rounded L-shaped corner brackets arranged to form the four corners of a square, pointing outward — suggesting expansion or zoom-out. Each bracket is thick and chunky in mid-purple (#9B7FD6) with a smooth matte finish and a subtle white highlight. The brackets are evenly spaced with a small open center. The overall composition is tight and symmetric. No text, no sharp edges, no full border line connecting the corners. Minimal, icon-like, simplified forms. Cute and compact at small sizes.

### Negative Prompt

realistic, photographic, sharp edges, harsh shadows, dark mood, grungy, noisy texture, low quality, blurry, text artifacts, watermark, signature, orange, blue, complete rectangle border, flat 2D, line art

### Parameters

- Resolution: 48 x 48px (2x for 24x24 display)
- Aspect ratio: 1:1
- Style: 3D Clay Render
- Color dominance: #9B7FD6 (natural purple), white highlights
- Composition: four corner brackets symmetric, open center, transparent background

### Visual-Content Mapping

| Visual Element | Content Meaning |
|----------------|-----------------|
| 네 모서리 브래킷 (expand brackets) | 조건 확장 (Expand Filter) — 이상형 범위를 넓힘 |
| 열린 중심부 | 더 많은 가능성을 향해 열려 있음 |
| Natural purple (#9B7FD6) | NotFoundCard 아이콘 컬러 통일, FrameIcon 대체 |

---

## 적용 가이드

### 파일 배치

```
assets/icons/match/
├── match-no-pool.webp       # 40x40 display -> 80x80 export
├── match-filtered.webp      # 40x40 display -> 80x80 export
├── match-already.webp       # 40x40 display -> 80x80 export
├── stopwatch-branded.webp   # 32x32 display -> 64x64 export
├── rejection-sad.webp       # 60x60 display -> 120x120 export
├── rematch-icon.webp        # 39x38 display -> 78x76 export
└── expand-filter.webp       # 24x24 display -> 48x48 export
```

### 코드 교체 위치

| 파일 | 현재 | 교체 후 |
|------|------|---------|
| `peek-sheet.tsx` FAILURE_ICONS | 이모지 Record (`🔍⚙️💑`) | `Image` 컴포넌트 + `match-no-pool/filtered/already.webp` |
| `peek-sheet.tsx` WaitingContent/NotFoundContent | `<StopwatchIcon width={20} height={20} />` | `<Image source={stopwatchBranded} style={{width:20,height:20}} />` |
| `not-found.tsx` NotFoundCard 1 | `<ReloadingIcon />` | `<Image source={rematchIcon} style={{width:39,height:38}} />` |
| `not-found.tsx` NotFoundCard 2 | `<FrameIcon width={24} height={24} />` | `<Image source={expandFilter} style={{width:24,height:24}} />` |
| `not-found.tsx` TOAST_ICONS | 이모지 Record (`🔍⚙️💑`) | `Image` 컴포넌트 + `match-no-pool/filtered/already.webp` |
| `pending-approval-notice.tsx` | `<Text style={styles.sadEmoji}>😢</Text>` | `<Image source={rejectionSad} style={{width:60,height:60}} />` |
| `profile-photo-rejected.tsx` | `<Text style={styles.sadEmoji}>😢</Text>` | `<Image source={rejectionSad} style={{width:60,height:60}} />` |

### 생성 권장 도구

- Midjourney v6 / DALL-E 3 / Adobe Firefly
- 배경 제거: remove.bg 또는 Photoshop Remove Background
- 출력 포맷: WebP (투명 배경 지원), 품질 90+
- 2x 해상도로 export 후 앱에서 표시 사이즈로 렌더링
