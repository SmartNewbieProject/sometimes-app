import { useCallback } from 'react';
import { useInfiniteData, useInfiniteScroll } from '../../../shared/hooks';
import { getAllArticles } from '../apis/articles';
import { Article } from '../types';
import { Pagination, PaginatedResponse } from '../../../types/server';
import { useQuery } from '@tanstack/react-query';

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
  infiniteScroll = false
}: Props = {}) => {
  // 데이터 가져오는 함수
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
    [categoryCode]
  );

  // 무한 스크롤 모드
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
    };
  }

  const pagination = { page: initialPage, size: initialSize };

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', categoryCode, pagination.page, pagination.size],
    queryFn: () => fetchArticles(pagination),
    enabled: !!categoryCode,
  });

  return {
    articles: data?.items || [],
    meta: data?.meta || {
      currentPage: initialPage,
      itemsPerPage: initialSize,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
};
