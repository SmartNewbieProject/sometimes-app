import { useState, useCallback } from 'react';
import { Article } from '../types';
import { mockArticles } from '../mocks/articles';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLike = useCallback((articleId: number) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === articleId
          ? { ...article, likes: article.likes + 1 }
          : article
      )
    );
  }, []);

  const handleComment = useCallback((articleId: number) => {
    // 댓글 기능은 나중에 구현
    console.log('Comment on article:', articleId);
  }, []);

  const handleViews = useCallback((articleId: number) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === articleId
          ? { ...article, views: article.views + 1 }
          : article
      )
    );
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // TODO: API 호출로 대체
    setTimeout(() => {
      setArticles(prev => [...prev, ...mockArticles]);
      setHasMore(false);
      setIsLoading(false);
    }, 1000);
  }, [isLoading, hasMore]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    // TODO: API 호출로 대체
    await new Promise(resolve => setTimeout(resolve, 1000));
    setArticles(mockArticles);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return {
    articles,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    handleLike,
    handleComment,
    handleViews,
  };
} 