import { useSuspenseQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { mockArticles, mockComments } from '../mocks/articles';
import { QUERY_KEYS } from './keys';

export function useArticlesQuery(page: number, size: number) {
  const { data: articles } = useSuspenseQuery({
    queryKey: QUERY_KEYS.articles.list(page, size),
    queryFn: () => Promise.resolve({
      items: mockArticles.slice((page - 1) * size, page * size),
      meta: {
        currentPage: page,
        itemsPerPage: size,
        totalItems: mockArticles.length
      }
    }),
  });

  const commentsQueries = useQueries({
    queries: (articles?.items || []).map(article => ({
      queryKey: QUERY_KEYS.comments.lists(article.id),
      queryFn: () => Promise.resolve(
        mockComments.filter(comment => comment.articleId === article.id)
      ),
    })),
  });

  const articlesWithComments = articles?.items.map((article, index) => ({
    ...article,
    comments: commentsQueries[index]?.data || [],
  }));

  return {
    articles: articlesWithComments,
    meta: articles?.meta,
    isLoading: commentsQueries.some(query => query.isLoading),
  };
}

// export function useArticleQuery(articleId: number) {
//   return useSuspenseQuery({
//     queryKey: QUERY_KEYS.articles.detail(articleId),
//     queryFn: () => apis_articles.getArticle(articleId),
//   });
// }

// export function useCreateArticleMutation() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: apis_articles.postArticles,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.lists() });
//     },
//   });
// }

// export function useUpdateArticleMutation(articleId: number) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (body: { content: string; anonymous: boolean }) => 
//       apis_articles.patchArticle(articleId, body),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.detail(articleId) });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.lists() });
//     },
//   });
// }

// export function useDeleteArticleMutation(articleId: number) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: () => apis_articles.deleteArticle(articleId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.lists() });
//     },
//   });
// } 