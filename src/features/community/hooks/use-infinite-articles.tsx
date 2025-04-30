import { useCallback } from 'react';
import { useInfiniteData, useInfiniteScroll } from '../../../shared/hooks';
import { getArticles } from '../apis/articles';
import { Article } from '../types';
import { Pagination as PaginationParams } from '../../../types/server';

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
  // 데이터 가져오는 함수
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
    [categoryCode]
  );

  // 무한 데이터 훅 사용
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
    pageSize,
    autoLoad: autoLoad && !!categoryCode,
    dependencies: [categoryCode],
    getItemKey: (item) => item.id,
  });

  // 무한 스크롤 훅 사용
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
};
