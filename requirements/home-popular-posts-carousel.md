# Home Popular Posts Carousel

## Original Requirement
"홈 화면의 TipAnnouncement 영역을 카드 캐러셀 형식의 커뮤니티 인기 게시글 스와이프 UI로 교체"

## Clarified Specification

### Goal
홈 화면의 TipAnnouncement 영역을 커뮤니티 인기 게시글 스냅 캐러셀로 교체

### Scope
- 기존 Hot API(`/articles/hot/latest`) 사용
- 데이터: `HotArticle {id, title, categoryId, categoryName}`
- 섹션 타이틀 + "전체보기" 버튼 헤더
- 스냅 캐러셀: 카드 단위로 맞춰 멈춤, 다음 카드 peek 효과
- 카드 탭 → `/community/{id}` 게시글 상세 이동
- 전체보기 → `/community` 커뮤니티 메인 이동

### Card Content (HotArticle 기반)
- 카테고리 배지 (categoryName)
- 제목 (title, 2줄 제한)
- 카드 스타일: 앱 컬러 시스템(semantic-colors) 적용

### Decisions

| Question | Decision |
|----------|----------|
| 데이터 소스 | 기존 Hot API 사용 (추가 백엔드 변경 없음) |
| 스와이프 방식 | 스냅 캐러셀 + peek 효과 |
| 탭 액션 | 게시글 상세 페이지 이동 (`/community/{id}`) |
| 전체보기 | 헤더에 추가 → 커뮤니티 메인 이동 (`/community`) |

### Technical Notes
- 기존 `useHomeHots()` hook 재사용
- `TipAnnouncement` 컴포넌트/영역 대체
- FlatList horizontal + snapToInterval 또는 ScrollView + pagingEnabled 활용
