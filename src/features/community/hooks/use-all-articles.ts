import { useCallback, useState } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import apis_articles from '../apis/articles';
import apis_comments from '../apis/comments';
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
  comments: (articleId: number) => ['article-comments', articleId],
} as const;

export default function useAllArticles({ page = 1, size = 3 }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(page);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: articlesData,
    isLoading: isArticlesLoading,
    error: articlesError,
    refetch,
  } = useQuery<ArticlesResponse, Error>({
    queryKey: QUERY_KEYS.articles(currentPage, size),
    queryFn: async () => {
      const articles = await apis_articles.getAllArticles({ page: currentPage, size });
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

  const commentsQueries = useQueries({
    queries: (articlesData?.items ?? []).map((article: Article) => ({
      queryKey: QUERY_KEYS.comments(article.id),
      queryFn: () => apis_comments.getComments({ articleId: article.id }),
      staleTime: 1000 * 60,
    })),
  });

  const isCommentsLoading = commentsQueries.some((query) => query.isLoading);
  const commentsError = commentsQueries.find((query) => query.error)?.error;

  const articlesWithComments =
    articlesData?.items.map((article: Article, index: number) => ({
      ...article,
      comments: commentsQueries[index]?.data || [],
    })) || [];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetch(),
      ...commentsQueries.map((query) => query.refetch())
    ]);
    setIsRefreshing(false);
  }, [refetch, commentsQueries]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const prefetchNextPage = useCallback(() => {
    const nextPage = currentPage + 1;
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.articles(nextPage, size),
      queryFn: async () => {
        const articles = await apis_articles.getAllArticles({ page: nextPage, size });
        return {
          items: articles,
          meta: { currentPage: nextPage, itemsPerPage: size, totalItems: articles.length }
        };
      },
    });
  }, [currentPage, size, queryClient]);

  return {
    articles: articlesWithComments,
    isLoading: isArticlesLoading || isCommentsLoading,
    isRefreshing,
    error: articlesError || commentsError,
    currentPage,
    refresh: handleRefresh,
    loadMore: handleLoadMore,
    prefetchNextPage,
  };
}
