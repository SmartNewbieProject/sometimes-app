import { useQuery } from '@tanstack/react-query';
import ApiArticles from '../apis/articles';
import ApiComments from '../apis/comments';
import { Article } from '../types';

const QUERY_KEYS = {
  article: (id: string) => ['article', id],
  comments: (articleId: string) => ['article-comments', articleId],
} as const;

export default function useArticleDetail(articleId: string) {
  const { data: article, isLoading: isArticleLoading, error: articleError } = useQuery<Article>({
    queryKey: QUERY_KEYS.article(articleId),
    queryFn: () => ApiArticles.getArticle(articleId),
  });

  const { data: comments, isLoading: isCommentsLoading, error: commentsError } = useQuery({
    queryKey: QUERY_KEYS.comments(articleId),
    queryFn: () => ApiComments.getComments({ articleId }),
  });

  return {
    article,
    comments,
    isLoading: isArticleLoading || isCommentsLoading,
    error: articleError || commentsError,
  };
}
