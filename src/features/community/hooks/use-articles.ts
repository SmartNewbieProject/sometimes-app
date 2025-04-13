import { useState, useCallback } from 'react';
import { useArticlesQuery } from '../queries/articles';

export function useArticles() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const { articles, meta, isLoading } = useArticlesQuery(currentPage, pageSize);

  const loadMore = useCallback(() => {
    if (meta && currentPage < Math.ceil(meta.totalItems / pageSize)) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, meta]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    articles,
    isLoading,
    hasMore: meta ? currentPage < Math.ceil(meta.totalItems / pageSize) : false,
    loadMore,
    refresh,
    currentPage,
  };
} 