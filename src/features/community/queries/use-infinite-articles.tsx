import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getArticles } from '../apis/articles';
import type { Article } from '../types';
import { QUERY_KEYS } from './keys';
import { useCallback } from 'react';

type UseInfiniteArticlesProps = {
	categoryCode?: string;
	pageSize?: number;
	enabled?: boolean;
};

let scrollPosition = 0;

export const createArticlesQueryKey = (categoryCode?: string) => {
	return [...QUERY_KEYS.articles.lists(), { categoryCode }];
};

export const useInfiniteArticlesQuery = ({
	categoryCode,
	pageSize = 10,
	enabled = true,
}: UseInfiniteArticlesProps) => {
	const queryClient = useQueryClient();

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
		queryKey: createArticlesQueryKey(categoryCode),
		queryFn: async ({ pageParam = 1 }) => {
			if (!categoryCode) {
				return {
					items: [],
					meta: {
						currentPage: pageParam,
						itemsPerPage: pageSize,
						totalItems: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				};
			}

			return getArticles({
				code: categoryCode,
				page: pageParam,
				size: pageSize,
			});
		},

		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage.meta.hasNextPage) return undefined;
			return lastPage.meta.currentPage + 1;
		},
		enabled: enabled && !!categoryCode,
		staleTime: 0,
	});

	const articles = data?.pages.flatMap((page) => page.items) || [];

	const saveScrollPosition = useCallback((position: number) => {
		scrollPosition = position;
	}, []);

	const getScrollPosition = useCallback(() => {
		return scrollPosition;
	}, []);

	const updateArticleLike = useCallback(
		(articleId: string) => {
			const article = articles.find((a) => a.id === articleId);
			if (!article) return articles;

			const newIsLiked = !article.isLiked;
			const newLikeCount = article.likeCount + (article.isLiked ? -1 : 1);

			queryClient.setQueryData(
				[...QUERY_KEYS.articles.lists(), { categoryCode }],
				(oldData: any) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						pages: oldData.pages.map((page: any) => ({
							...page,
							items: page.items.map((article: Article) => {
								if (article.id === articleId) {
									return {
										...article,
										likeCount: newLikeCount,
										isLiked: newIsLiked,
									};
								}
								return article;
							}),
						})),
					};
				},
			);

			queryClient.setQueryData(QUERY_KEYS.articles.detail(articleId), (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					likeCount: newLikeCount,
					isLiked: newIsLiked,
				};
			});

			return articles.map((article) => {
				if (article.id === articleId) {
					return {
						...article,
						likeCount: newLikeCount,
						isLiked: newIsLiked,
					};
				}
				return article;
			});
		},
		[articles, queryClient, categoryCode],
	);

	return {
		articles,
		isLoading,
		isLoadingMore: isFetchingNextPage,
		hasNextPage: !!hasNextPage,
		loadMore: fetchNextPage,
		refresh: refetch,
		isError,
		error,
		saveScrollPosition,
		getScrollPosition,
		updateArticleLike,
		refetch,
	};
};
