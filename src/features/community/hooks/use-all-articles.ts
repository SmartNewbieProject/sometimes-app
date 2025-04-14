import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ApiArticles from '../apis/articles';
import { Article } from '../types';

interface ArticlesResponse {
  items: Article[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

const QUERY_KEYS = {
  articles: (page: number, size: number) => ['all-articles', page, size],
} as const;

export default function useAllArticles({ page = 1, size = 3 }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(page);

  const {
    data: articlesData,
    isLoading: isArticlesLoading,
    error: articlesError,
  } = useQuery<ArticlesResponse, Error>({
    queryKey: QUERY_KEYS.articles(currentPage, size),
    queryFn: async () => {
      const articles = await ApiArticles.getAllArticles({ page: currentPage, size });
      return {
        items: articles,
        meta: {
          currentPage,
          itemsPerPage: size,
          totalItems: articles.length
        }
      };
    },
  });

  const articles = articlesData?.items || [];

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const prefetchNextPage = useCallback(() => {
    const nextPage = currentPage + 1;
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.articles(nextPage, size),
      queryFn: async () => {
        const articles = await ApiArticles.getAllArticles({ page: nextPage, size });
        return {
          items: articles,
          meta: { currentPage: nextPage, itemsPerPage: size, totalItems: articles.length }
        };
      },
    });
  }, [currentPage, size, queryClient]);

  return {
    articles,
    isLoading: isArticlesLoading,
    error: articlesError,
    currentPage,
    loadMore: handleLoadMore,
    prefetchNextPage,
  };
}
