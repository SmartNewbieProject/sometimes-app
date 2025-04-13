import { useState } from 'react';
import { Article } from '../types';
import { mockArticles } from '../mocks/articles';

export function useArticles(type: 'realtime' | 'popular' = 'realtime') {
  const [articles, setArticles] = useState<Article[]>(() => 
    type === 'popular' 
      ? mockArticles.filter(article => article.likes > 10)
      : mockArticles
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    // 실제로는 여기서 더 많은 게시글을 불러올 수 있습니다
  };

  const refresh = async () => {
    setIsLoading(true);
    // 실제로는 여기서 게시글을 새로고침할 수 있습니다
    setArticles(
      type === 'popular' 
        ? mockArticles.filter(article => article.likes > 10)
        : mockArticles
    );
    setIsLoading(false);
  };

  return {
    articles,
    isLoading,
    hasMore,
    loadMore,
    refresh,
  };
} 