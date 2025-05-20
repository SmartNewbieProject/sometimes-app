import { useQuery, useQueryClient } from '@tanstack/react-query';
import ApiArticles from '../apis/articles';
import ApiComments from '../apis/comments';
import type { Article } from '../types';
import { QUERY_KEYS } from '../queries/keys';

export default function useArticleDetail(articleId: string) {
  const queryClient = useQueryClient();

  const { data: article, isLoading: isArticleLoading, error: articleError } = useQuery<Article>({
    queryKey: QUERY_KEYS.articles.detail(articleId),
    queryFn: () => ApiArticles.getArticle(articleId),
    staleTime: 0,
  });

  const { data: comments, isLoading: isCommentsLoading, error: commentsError } = useQuery({
    queryKey: QUERY_KEYS.comments.lists(articleId),
    queryFn: () => ApiComments.getComments({ articleId }),
    staleTime: 0,
  });

  return {
    article,
    comments,
    isLoading: isArticleLoading || isCommentsLoading,
    error: articleError || commentsError,
  };
}
