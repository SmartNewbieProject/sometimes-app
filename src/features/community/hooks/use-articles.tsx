import { useCallback } from 'react';
import { useInfiniteData, useInfiniteScroll } from '../../../shared/hooks';
import { getArticles } from '../apis/articles';
import { Article } from '../types';
import { PaginationParams } from '../../../shared/infinite-scroll/types';

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
  infiniteScroll = true
}: Props) => {
  const fetchArticles =
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

      return getArticles({
        code: categoryCode,
        ...pagination,
      });
    };

  const {
    items,
    allItems,
    meta,
    pagination,
    queryResult: { isLoading, isError, error, refetch },
    ...props
  } = useQueryPagination<Article>({
    queryKey: ['articles', categoryCode],
    queryFn: fetchArticles,
    queryOptions: {
      enabled: !!categoryCode,
    },
    initialPage,
    initialSize,
    infiniteScroll,
  });

  return {
    articles: infiniteScroll ? allItems : items,
    meta,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    ...props,
  };

};
