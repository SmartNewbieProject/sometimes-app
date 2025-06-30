import type { PaginatedResponse, Pagination } from '@/src/types/server';
import { useCallback } from 'react';
import { useInfiniteData, useInfiniteScroll } from '../../../shared/hooks';
import { PaginationParams } from '../../../shared/infinite-scroll/types';
import { getAllArticles } from '../apis/articles';
import type { Article } from '../types';

type Props = {
	categoryCode?: string;
	initialPage?: number;
	initialSize?: number;
	infiniteScroll?: boolean;
};

export const useArticles = ({
	categoryCode,
	initialPage = 1,
	initialSize = 10,
	infiniteScroll = false,
}: Props) => {
	const fetchArticles = useCallback(
		async (pagination: Pagination): Promise<PaginatedResponse<Article>> => {
			if (!categoryCode) {
				return {
					items: [],
					meta: {
						currentPage: pagination.page,
						itemsPerPage: pagination.size,
						totalItems: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				};
			}

			return getAllArticles({
				code: categoryCode,
				...pagination,
			});
		},
		[categoryCode],
	);

	if (infiniteScroll) {
		const {
			data: articles,
			isLoading,
			isLoadingMore,
			error,
			hasNextPage,
			loadMore,
			refresh,
			meta,
			setData,
			currentPage,
		} = useInfiniteData<Article>({
			fetchFn: fetchArticles,
			initialPage,
			pageSize: initialSize,
			autoLoad: !!categoryCode,
			dependencies: [categoryCode],
			getItemKey: (item) => item.id,
		});

		const { scrollProps } = useInfiniteScroll(loadMore, {
			threshold: 0.5,
			enabled: hasNextPage && !isLoadingMore,
		});

		const updateArticle = (updatedArticle: Article) => {
			setData((prevArticles) =>
				prevArticles.map((article) =>
					article.id === updatedArticle.id ? updatedArticle : article,
				),
			);
		};

		return {
			articles,
			isLoading,
			isLoadingMore,
			error,
			hasNextPage,
			loadMore,
			refresh,
			meta,
			currentPage,
			scrollProps,
			updateArticle,
		};
	}
};
