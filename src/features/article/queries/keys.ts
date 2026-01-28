export const ARTICLE_QUERY_KEYS = {
	all: ['articles'] as const,
	lists: () => [...ARTICLE_QUERY_KEYS.all, 'list'] as const,
	list: (category?: string) => [...ARTICLE_QUERY_KEYS.lists(), { category }] as const,
	details: () => [...ARTICLE_QUERY_KEYS.all, 'detail'] as const,
	detail: (idOrSlug: string) => [...ARTICLE_QUERY_KEYS.details(), idOrSlug] as const,
};
