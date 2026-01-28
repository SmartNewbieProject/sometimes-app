// 아티클 발행 상태
export enum ArticleStatus {
	DRAFT = 'draft',
	SCHEDULED = 'scheduled',
	PUBLISHED = 'published',
	ARCHIVED = 'archived',
}

// 아티클 카테고리
export enum ArticleCategory {
	STORY = 'story',
	INTERVIEW = 'interview',
	TIPS = 'tips',
	TEAM = 'team',
	UPDATE = 'update',
	SAFETY = 'safety',
}

// 미디어 타입
export enum MediaType {
	IMAGE = 'image',
	VIDEO = 'video',
	GIF = 'gif',
	AUDIO = 'audio',
}

// 미디어 자산
export interface MediaAsset {
	type: MediaType;
	url: string;
	alt: string | null;
	width: number | null;
	height: number | null;
	duration: number | null;
	mimeType: string;
}

// 아티클 작성자
export interface ArticleAuthor {
	id: string;
	name: string;
	avatar: string | null;
	role: string | null;
}

// SEO 메타데이터
export interface ArticleSEO {
	metaTitle: string | null;
	metaDescription: string | null;
	ogImage: string | null;
	keywords: string[];
}

// 아티클 (상세)
export interface Article {
	id: string;
	slug: string;
	status: ArticleStatus;
	category: ArticleCategory;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
	title: string;
	subtitle: string | null;
	content: string;
	excerpt: string;
	thumbnail: MediaAsset;
	coverImage: MediaAsset | null;
	author: ArticleAuthor;
	viewCount: number;
	shareCount: number;
	seo: ArticleSEO;
}

// 아티클 리스트 아이템 (경량)
export interface ArticleListItem {
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

// 아티클 목록 메타 (페이지네이션)
export interface ArticleListMeta {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

// 아티클 목록 응답
export interface ArticleListResponse {
	items: ArticleListItem[];
	meta: ArticleListMeta;
}

// 공유 플랫폼
export type SharePlatform = 'kakao' | 'instagram' | 'link' | 'other';

// 공유 요청
export interface ShareRequest {
	platform: SharePlatform;
}

// 조회수 응답
export interface ViewResponse {
	success: boolean;
	count: number;
}

// 공유 응답
export interface ShareResponse {
	success: boolean;
	count: number;
}

// 카테고리 표시 정보
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
	[ArticleCategory.STORY]: '스토리',
	[ArticleCategory.INTERVIEW]: '인터뷰',
	[ArticleCategory.TIPS]: '데이팅 팁',
	[ArticleCategory.TEAM]: '팀 소개',
	[ArticleCategory.UPDATE]: '업데이트',
	[ArticleCategory.SAFETY]: '안전',
};
