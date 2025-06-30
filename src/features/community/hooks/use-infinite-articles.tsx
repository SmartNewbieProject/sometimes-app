import { useCallback } from 'react';
import { useInfiniteData, useInfiniteScroll } from '../../../shared/hooks';
import type { Pagination as PaginationParams } from '../../../types/server';
import { getArticles } from '../apis/articles';
import type { Article } from '../types';

type Props = {
	categoryCode?: string;
	initialPage?: number;
	pageSize?: number;
	autoLoad?: boolean;
};

export const useInfiniteArticles = ({
	categoryCode,
	initialPage = 1,
	pageSize = 10,
	autoLoad = true,
}: Props = {}) => {
	const fetchArticles = useCallback(
		async (params: PaginationParams) => {
			if (!categoryCode) {
				return {
					items: [],
					meta: {
						currentPage: params.page,
						itemsPerPage: params.size,
						totalItems: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				};
			}

			const response = await getArticles({
				code: categoryCode,
				page: params.page,
				size: params.size,
			});

			return response;
		},
		[categoryCode],
	);

	const {
		data: articles,
		isLoading,
		isLoadingMore,
		error,
		hasNextPage,
		loadMore,
		setData,
		refresh,
		meta,
		currentPage,
	} = useInfiniteData<Article>({
		fetchFn: fetchArticles,
		initialPage,
		pageSize,
		autoLoad: autoLoad && !!categoryCode,
		dependencies: [categoryCode],
		getItemKey: (item) => item.id,
	});

	const { scrollProps } = useInfiniteScroll(loadMore, {
		threshold: 0.5,
		enabled: hasNextPage && !isLoadingMore,
	});

	return {
		articles,
		isLoading,
		setData,
		isLoadingMore,
		error,
		hasNextPage,
		loadMore,
		refresh,
		meta,
		currentPage,
		scrollProps,
	};
};
