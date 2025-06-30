import { useQuery } from '@tanstack/react-query';
import { getArticle } from '../apis/articles';
import { Article } from '../types';
import { QUERY_KEYS } from './keys';

export const useArticleDetailsQuery = (id?: string) => {
  const { data: article, ...queryProps } = useQuery<Article>({
    queryKey: QUERY_KEYS.articles.detail(id!),
    queryFn: () => getArticle(id!),
    enabled: !!id,
  });

  return { article, ...queryProps };
};
