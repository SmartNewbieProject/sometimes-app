import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePagination } from '../../../shared/hooks';
import { getArticles } from '../apis/articles';
import { Article } from '../types';
import { PaginatedResponse } from '../../../types/server';

type Props = {
  categoryCode?: string;
  initialPage?: number;
  initialSize?: number;
};

export const useArticles = ({
  categoryCode,
  initialPage = 1,
  initialSize = 10
}: Props) => {
  const {
    items: articles,
    pagination,
    updateResults,
    ...paginationProps
  } = usePagination<Article>({
    initialPage,
    initialSize
  });

  const { isLoading, isError, error, refetch, data } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', categoryCode, pagination.page, pagination.size],
    queryFn: () => getArticles({
      code: categoryCode!,
      ...pagination,
    }),
    enabled: !!categoryCode,
  });

  useEffect(() => {
    if (data) {
      updateResults(data);
    }
  }, [data, updateResults]);

  return {
    articles,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    ...paginationProps,
  };
};
