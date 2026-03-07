# PeekSheet UI 통일성 개선 요구사항

## Original Requirement
"PeekSheet UI 통일성을 개선하자. 아이콘은 앱 아이콘과 유사한 스타일을 가지는 스타일에이전트를 활용한 아이콘 생성을 진행하고, 보색인 주황색은 사용하지말고 보라색계열로 통일하자."

## Clarified Specification

### Goal
PeekSheet + CategoryBadge UI의 색상 체계를 보라색 계열로 통일하고, 모든 시각 요소(아이콘, 아바타 플레이스홀더 등)를 앱 브랜드 스타일로 재설계

### Scope
- PeekSheet 컴포넌트 (open/waiting/not-found 상태)
- CategoryBadge 컴포넌트
- CATEGORY_COLORS 상수 (`src/features/idle-match-timer/types-v31.ts`)
- 관련 아이콘 전체 (이모지 + SVG)

### 제외
- Container, Nav, NotFound 전체 페이지 등 idle-match-timer의 다른 UI

### 현재 문제점
| 카테고리 | 현재 색상 | 문제 |
|----------|-----------|------|
| scheduled | `#7A4AE2` (보라) | OK - 브랜드 primary |
| rematch | `#FF8C42` (주황) | 보색 - 제거 대상 |
| global | `#4A90D9` (파랑) | 보라 계열 아님 |

### Decisions

| 질문 | 결정 |
|------|------|
| 개선 범위 | PeekSheet + CategoryBadge |
| rematch/global 색상 | 둘 다 보라 계열로 통일 |
| 카테고리 구분 방식 | 명도 차이 (scheduled=primary, rematch=내추럴보라, global=딥보라) |
| 아이콘 교체 범위 | 전체 재설계 (이모지 + SVG 모두) |
| 아이콘 생성 방식 | VLM 프롬프트 생성 → 수동 이미지 생성 후 적용 |

### Color Plan
- **scheduled**: `#7A4AE2` (기존 brand.primary 유지)
- **rematch**: `#9B7FD6` (밝은 보라 - 내추럴) / gradient `['#B89AEF', '#9B7FD6']`
- **global**: `#5C3D8F` (진한 보라 - 딥) / gradient `['#7A52B8', '#5C3D8F']`

### Icon Redesign Plan
- 실패 상태 이모지(🔍 ⚙️ 💑) → 앱 스타일 커스텀 아이콘
- SVG 아이콘(Stopwatch, Frame, ImproveProfile, Reloading) → 통일된 스타일
- asset-prompt-generator 에이전트로 VLM 프롬프트 생성 → 수동 적용

### Success Criteria
1. 모든 색상이 보라색 계열(#7A4AE2 기반)로 통일
2. 아이콘 VLM 프롬프트 생성 완료
3. 코드 변경사항 적용 (CATEGORY_COLORS, CategoryBadge, PeekSheet)
