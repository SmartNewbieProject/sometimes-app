import { useQuery } from '@tanstack/react-query';
import apis_articles from '../apis/articles';
import apis_comments from '../apis/comments';
import { Article } from '../types';

const QUERY_KEYS = {
  article: (id: number) => ['article', id],
  comments: (articleId: number) => ['article-comments', articleId],
} as const;

export default function useArticleDetail(articleId: number) {
  const { data: article, isLoading: isArticleLoading, error: articleError } = useQuery<Article>({
    queryKey: QUERY_KEYS.article(articleId),
    queryFn: () => apis_articles.getArticle(articleId),
  });

  const { data: comments, isLoading: isCommentsLoading, error: commentsError } = useQuery({
    queryKey: QUERY_KEYS.comments(articleId),
    queryFn: () => apis_comments.getComments({ articleId }),
  });

  return {
    article,
    comments,
    isLoading: isArticleLoading || isCommentsLoading,
    error: articleError || commentsError,
  };
}
