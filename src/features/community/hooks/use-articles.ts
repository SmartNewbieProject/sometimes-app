import { useState, useCallback } from 'react';
import { Article } from '../types';
import { mockArticles, mockPopularArticles, mockComments } from '../mocks/articles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllArticles } from '@/src/features/community/apis/articles';

const QUERY_KEYS = {
  articles: {
    lists: (type: 'realtime' | 'popular') => ['articles', type],
  },
};

export function useArticles(type: 'realtime' | 'popular' = 'realtime') {
  const queryClient = useQueryClient();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 실시간 게시글 API 호출
  const { data: realtimeArticles, isLoading: isRealtimeLoading } = useQuery({
    queryKey: QUERY_KEYS.articles.lists('realtime'),
    queryFn: async () => {
      const response = await getAllArticles({ page: 1, size: 3 });
      return response;
    },
    enabled: type === 'realtime',
  });

  // 인기 게시글은 목업 데이터 사용
  const popularArticles = type === 'popular' ? mockPopularArticles : [];

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
    articles: type === 'realtime' ? realtimeArticles || [] : popularArticles,
    isLoading: type === 'realtime' ? isRealtimeLoading : false,
    hasMore,
    loadMore,
    refresh,
    handleLike,
    handleComment,
    handleViews,
  };
} 