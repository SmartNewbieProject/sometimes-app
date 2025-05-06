import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getArticles } from '../apis/articles';
import { Article } from '../types';
import { QUERY_KEYS } from './keys';
import { useCallback, useRef } from 'react';

type UseInfiniteArticlesProps = {
  categoryCode?: string;
  pageSize?: number;
  enabled?: boolean;
};

let scrollPosition = 0;

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
    queryKey: [...QUERY_KEYS.articles.lists(), { categoryCode }],
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const articles = data?.pages.flatMap((page) => page.items) || [];

  const saveScrollPosition = useCallback((position: number) => {
    scrollPosition = position;
  }, []);

  const getScrollPosition = useCallback(() => {
    return scrollPosition;
  }, []);


  const updateArticleLike = useCallback((articleId: string) => {
    queryClient.setQueryData(
      [...QUERY_KEYS.articles.lists(), { categoryCode }],
      (oldData: any) => {
        if (!oldData) return oldData;

        // 무한 쿼리 데이터 구조에 맞게 업데이트
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((article: Article) => {
              if (article.id === articleId) {
                return {
                  ...article,
                  likeCount: article.likeCount + (article.isLiked ? -1 : 1),
                  isLiked: !article.isLiked,
                };
              }
              return article;
            }),
          })),
        };
      }
    );

    return articles.map((article) => {
      if (article.id === articleId) {
        return {
          ...article,
          likeCount: article.likeCount + (article.isLiked ? -1 : 1),
          isLiked: !article.isLiked,
        };
      }
      return article;
    });
  }, [articles, queryClient, categoryCode]);

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
  };
};
