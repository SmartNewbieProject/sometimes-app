# Article API Specification

> 썸타임 이야기 (가칭) - 브랜드 스토리텔링 콘텐츠 시스템

## Overview

데이팅 앱 신뢰도 향상을 위한 미디엄 스타일 아티클 시스템입니다.
어드민에서 마크다운으로 작성하고, 앱에서 매거진형 UI로 제공합니다.

### 주요 특징

- **콘텐츠 유형**: 스토리 중심 (커플 성공 사례, 유저 인터뷰, 데이팅 팁)
- **마크다운 지원**: 텍스트, 이미지, 영상, GIF, 오디오
- **인터랙션**: 읽기 전용 + SNS 공유
- **접근 권한**: 로그인 전/후 동일 콘텐츠

---

## Data Models

### Article

```typescript
interface Article {
  // 식별자
  id: string;                    // UUID
  slug: string;                  // URL용 슬러그 (예: "our-safety-story")

  // 메타 정보
  status: ArticleStatus;         // 발행 상태
  category: ArticleCategory;     // 카테고리
  publishedAt: string | null;    // 발행일 (ISO 8601)
  createdAt: string;             // 생성일
  updatedAt: string;             // 수정일

  // 콘텐츠
  title: string;                 // 제목 (최대 100자)
  subtitle: string | null;       // 부제목 (최대 200자)
  content: string;               // 마크다운 본문
  excerpt: string;               // 요약 (리스트용, 최대 150자)

  // 미디어
  thumbnail: MediaAsset;         // 썸네일 이미지 (필수)
  coverImage: MediaAsset | null; // 커버 이미지 (상세 헤더용)

  // 작성자
  author: ArticleAuthor;         // 작성자 정보

  // 통계 (읽기 전용)
  viewCount: number;             // 조회수
  shareCount: number;            // 공유수

  // SEO/공유
  seo: ArticleSEO;               // SEO 메타데이터
}
```

### ArticleStatus

```typescript
enum ArticleStatus {
  DRAFT = 'draft',           // 임시저장
  SCHEDULED = 'scheduled',   // 예약 발행
  PUBLISHED = 'published',   // 발행됨
  ARCHIVED = 'archived',     // 보관됨 (숨김)
}
```

### ArticleCategory

```typescript
enum ArticleCategory {
  STORY = 'story',           // 커플 스토리 / 성공 사례
  INTERVIEW = 'interview',   // 유저 인터뷰
  TIPS = 'tips',             // 데이팅 팁
  TEAM = 'team',             // 팀 소개 / 비하인드
  UPDATE = 'update',         // 서비스 업데이트
  SAFETY = 'safety',         // 안전 정책 / 가이드
}
```

### ArticleAuthor

```typescript
interface ArticleAuthor {
  id: string;                // 어드민 유저 ID
  name: string;              // 표시 이름 (예: "썸타임 팀")
  avatar: string | null;     // 프로필 이미지 URL
  role: string | null;       // 역할 (예: "콘텐츠 에디터")
}
```

### MediaAsset

```typescript
interface MediaAsset {
  type: MediaType;
  url: string;               // S3 URL
  alt: string | null;        // 대체 텍스트
  width: number | null;      // 원본 너비
  height: number | null;     // 원본 높이
  duration: number | null;   // 영상/오디오 길이 (초)
  mimeType: string;          // MIME 타입
}

enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
  AUDIO = 'audio',
}
```

### ArticleSEO

```typescript
interface ArticleSEO {
  metaTitle: string | null;       // OG 제목 (없으면 title 사용)
  metaDescription: string | null; // OG 설명 (없으면 excerpt 사용)
  ogImage: string | null;         // OG 이미지 (없으면 thumbnail 사용)
  keywords: string[];             // 검색 키워드
}
```

### ArticleListItem (리스트 조회용 경량 모델)

```typescript
interface ArticleListItem {
  id: string;
  slug: string;
  status: ArticleStatus;
  category: ArticleCategory;
  publishedAt: string | null;
  title: string;
  subtitle: string | null;
  excerpt: string;
  thumbnail: MediaAsset;
  author: ArticleAuthor;
  viewCount: number;
}
```

---

## API Endpoints

> **Base Path**: `/api/v1/articles/sometimes`
>
> 기존 `/articles` 엔드포인트와의 충돌을 방지하기 위해 `/articles/sometimes` 네임스페이스를 사용합니다.

### 아티클 목록 조회

```http
GET /api/v1/articles/sometimes
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| category | ArticleCategory | No | - | 카테고리 필터 |
| status | ArticleStatus | No | published | 발행 상태 (어드민 전용) |
| page | number | No | 1 | 페이지 번호 |
| limit | number | No | 10 | 페이지당 개수 (max: 50) |

#### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "our-first-couple-story",
      "status": "published",
      "category": "story",
      "publishedAt": "2025-01-15T09:00:00Z",
      "title": "썸타임에서 만난 우리, 1년 후 결혼합니다",
      "subtitle": "민수님과 지영님의 이야기",
      "excerpt": "대학 시절 썸타임에서 처음 만난 두 사람이 1년간의 연애 끝에 결혼을 앞두고 있습니다.",
      "thumbnail": {
        "type": "image",
        "url": "https://cdn.sometime.app/articles/thumb-001.jpg",
        "alt": "커플 사진",
        "width": 800,
        "height": 600,
        "duration": null,
        "mimeType": "image/jpeg"
      },
      "author": {
        "id": "admin-001",
        "name": "썸타임 팀",
        "avatar": "https://cdn.sometime.app/team/logo.png",
        "role": "콘텐츠 에디터"
      },
      "viewCount": 1523
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "hasNext": true
  }
}
```

---

### 아티클 상세 조회

```http
GET /api/v1/articles/sometimes/:idOrSlug
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| idOrSlug | string | 아티클 ID (UUID) 또는 슬러그 |

#### Response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "our-first-couple-story",
    "status": "published",
    "category": "story",
    "publishedAt": "2025-01-15T09:00:00Z",
    "createdAt": "2025-01-10T14:30:00Z",
    "updatedAt": "2025-01-15T08:45:00Z",
    "title": "썸타임에서 만난 우리, 1년 후 결혼합니다",
    "subtitle": "민수님과 지영님의 이야기",
    "content": "# 첫 만남\n\n대학교 3학년이던 2023년 봄...",
    "excerpt": "대학 시절 썸타임에서 처음 만난 두 사람이 1년간의 연애 끝에 결혼을 앞두고 있습니다.",
    "thumbnail": {
      "type": "image",
      "url": "https://cdn.sometime.app/articles/thumb-001.jpg",
      "alt": "커플 사진",
      "width": 800,
      "height": 600,
      "duration": null,
      "mimeType": "image/jpeg"
    },
    "coverImage": {
      "type": "image",
      "url": "https://cdn.sometime.app/articles/cover-001.jpg",
      "alt": "커플 사진 (와이드)",
      "width": 1920,
      "height": 1080,
      "duration": null,
      "mimeType": "image/jpeg"
    },
    "author": {
      "id": "admin-001",
      "name": "썸타임 팀",
      "avatar": "https://cdn.sometime.app/team/logo.png",
      "role": "콘텐츠 에디터"
    },
    "viewCount": 1523,
    "shareCount": 89,
    "seo": {
      "metaTitle": null,
      "metaDescription": null,
      "ogImage": null,
      "keywords": ["커플", "성공사례", "대학생연애", "썸타임"]
    }
  }
}
```

---

### 조회수 증가

```http
POST /api/v1/articles/sometimes/:id/view
```

#### Response

```json
{
  "viewCount": 1524
}
```

---

### 공유 카운트 증가

```http
POST /api/v1/articles/sometimes/:id/share
```

#### Request Body

```json
{
  "platform": "kakao"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| platform | string | Yes | `kakao` \| `instagram` \| `link` \| `other` |

#### Response

```json
{
  "shareCount": 90
}
```

---

## Markdown 지원 요소

본문 `content` 필드에서 지원할 마크다운 요소입니다.

### 기본 요소

| 요소 | 문법 | 비고 |
|------|------|------|
| 제목 | `# ## ###` | h1~h3 지원 |
| 굵게 | `**text**` | |
| 기울임 | `*text*` | |
| 링크 | `[text](url)` | 외부 링크 |
| 이미지 | `![alt](url)` | S3 URL |
| 인용문 | `> text` | |
| 구분선 | `---` | |
| 리스트 | `- item` | |
| 번호 리스트 | `1. item` | |

### 커스텀 요소 (확장 문법)

| 요소 | 문법 | 설명 |
|------|------|------|
| 영상 | `@[video](url)` | 비디오 플레이어 렌더링 |
| 오디오 | `@[audio](url)` | 오디오 플레이어 렌더링 |
| 콜아웃 (팁) | `:::tip\n내용\n:::` | 팁 박스 |
| 콜아웃 (주의) | `:::warning\n내용\n:::` | 경고 박스 |
| 콜아웃 (정보) | `:::info\n내용\n:::` | 정보 박스 |

### 마크다운 예시

```markdown
# 첫 만남

대학교 3학년이던 2023년 봄, **민수**님은 친구의 추천으로 썸타임을 설치했습니다.

> "처음엔 반신반의했어요. 근데 지영이 프로필을 보는 순간..."

## 운명 같은 매칭

![첫 데이트 사진](https://cdn.sometime.app/articles/img-001.jpg)

@[video](https://cdn.sometime.app/articles/video-001.mp4)

:::tip
첫 데이트는 가벼운 카페에서 시작하는 것을 추천해요!
:::

---

## 1년 후, 결혼을 앞두고

1. 서로를 알아가는 시간
2. 부모님 상견례
3. 프로포즈

@[audio](https://cdn.sometime.app/articles/audio-message.mp3)
```

---

## 진입점 설계

### 로그인 전 유저

- **경로**: `/auth/login` 화면 하단 탭 바
- **탭 구성**: `로그인` | `썸타임 이야기`
- **아티클 목록**: `/article` (인증 불필요)
- **아티클 상세**: `/article/[slug]` (인증 불필요)

### 로그인 후 유저

- **경로**: 커뮤니티 화면 내 카테고리
- **카테고리명**: `공식` 또는 `썸타임 이야기`
- **아티클 목록**: 커뮤니티 탭 내 표시
- **아티클 상세**: `/article/[slug]` (공유 URL과 동일)

---

## UI 스펙

### 리스트 화면 (매거진형)

```
┌─────────────────────────────────────┐
│ [큰 썸네일 이미지]                    │
│                                     │
│ STORY · 1월 15일                     │
│ 썸타임에서 만난 우리, 1년 후 결혼합니다  │
│ 민수님과 지영님의 이야기               │
│                                     │
│ 👁 1,523                            │
└─────────────────────────────────────┘
```

### 상세 화면

```
┌─────────────────────────────────────┐
│ [← 뒤로]              [공유 버튼]    │
├─────────────────────────────────────┤
│ [커버 이미지 (있으면)]                │
├─────────────────────────────────────┤
│ STORY                               │
│ 썸타임에서 만난 우리, 1년 후 결혼합니다  │
│ 민수님과 지영님의 이야기               │
│                                     │
│ 썸타임 팀 · 2025.01.15              │
├─────────────────────────────────────┤
│ [마크다운 렌더링된 본문]              │
│ ...                                 │
│ ...                                 │
├─────────────────────────────────────┤
│ [카카오 공유] [링크 복사]             │
└─────────────────────────────────────┘
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ARTICLE_NOT_FOUND | 404 | 아티클을 찾을 수 없음 |
| INVALID_CATEGORY | 400 | 유효하지 않은 카테고리 |
| INVALID_PLATFORM | 400 | 유효하지 않은 공유 플랫폼 |

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-01-27 | 초기 스펙 정의 |
