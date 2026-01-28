import { useInfiniteQuery } from '@tanstack/react-query';
import { getArticles } from '../apis';
import type { ArticleCategory } from '../types';
import { ARTICLE_QUERY_KEYS } from './keys';

interface UseArticlesProps {
	category?: ArticleCategory;
	pageSize?: number;
	enabled?: boolean;
}

export const useArticles = ({ category, pageSize = 10, enabled = true }: UseArticlesProps = {}) => {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		refetch,
	} = useInfiniteQuery({
		queryKey: ARTICLE_QUERY_KEYS.list(category),
		queryFn: async ({ pageParam = 1 }) => {
			return getArticles({
				category,
				page: pageParam,
				limit: pageSize,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage.meta.hasNextPage) return undefined;
			return lastPage.meta.currentPage + 1;
		},
		enabled,
		staleTime: 30_000,
		gcTime: 10 * 60 * 1000,
	});

	const articles = data?.pages.flatMap((page) => page.items) ?? [];

	return {
		articles,
		isLoading,
		isLoadingMore: isFetchingNextPage,
		hasNextPage: !!hasNextPage,
		loadMore: fetchNextPage,
		refresh: refetch,
		isError,
		error,
	};
};
