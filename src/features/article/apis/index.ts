import axiosClient from '@/src/shared/libs/axios';
import type {
	Article,
	ArticleCategory,
	ArticleListResponse,
	SharePlatform,
	ShareResponse,
	ViewResponse,
} from '../types';
import { MOCK_ARTICLE_LIST, filterArticlesByCategory, findArticleByIdOrSlug } from '../mocks';

// 개발 환경에서 mock 사용 여부
const USE_MOCK = false;

interface GetArticlesParams {
	category?: ArticleCategory;
	page?: number;
	limit?: number;
}

// 아티클 목록 조회
export const getArticles = async (params: GetArticlesParams = {}): Promise<ArticleListResponse> => {
	const { category, page = 1, limit = 10 } = params;

	if (USE_MOCK) {
		// Mock 데이터 사용
		const filtered = filterArticlesByCategory(category);
		const start = (page - 1) * limit;
		const end = start + limit;
		const paginatedData = filtered.slice(start, end);

		return {
			items: paginatedData,
			meta: {
				currentPage: page,
				itemsPerPage: limit,
				totalItems: filtered.length,
				hasNextPage: end < filtered.length,
				hasPreviousPage: page > 1,
			},
		};
	}

	// 실제 API 호출
	return axiosClient.get('/sometime-articles', {
		params: { category, page, limit },
	});
};

// 아티클 상세 조회
export const getArticleByIdOrSlug = async (idOrSlug: string): Promise<Article> => {
	if (USE_MOCK) {
		const article = findArticleByIdOrSlug(idOrSlug);
		if (!article) {
			throw new Error('ARTICLE_NOT_FOUND');
		}
		return article;
	}

	return axiosClient.get(`/sometime-articles/${idOrSlug}`);
};

// 조회수 증가
export const incrementViewCount = async (id: string): Promise<ViewResponse> => {
	if (USE_MOCK) {
		// Mock: 현재 조회수 + 1 반환
		const article = findArticleByIdOrSlug(id);
		return { success: true, count: (article?.viewCount ?? 0) + 1 };
	}

	return axiosClient.post(`/sometime-articles/${id}/view`);
};

// 공유 카운트 증가
export const incrementShareCount = async (
	id: string,
	platform: SharePlatform,
): Promise<ShareResponse> => {
	if (USE_MOCK) {
		// Mock: 현재 공유수 + 1 반환
		const article = findArticleByIdOrSlug(id);
		return { success: true, count: (article?.shareCount ?? 0) + 1 };
	}

	return axiosClient.post(`/sometime-articles/${id}/share`, { platform });
};
