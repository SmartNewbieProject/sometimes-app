export const QUERY_KEYS = {
  articles: {
    all: ['articles'],
    lists: () => [...QUERY_KEYS.articles.all, 'list'],
    list: (page: number, size: number) => [...QUERY_KEYS.articles.lists(), { page, size }],
    detail: (id: number) => [...QUERY_KEYS.articles.all, 'detail', id],
  },
  comments: {
    all: ['comments'],
    lists: (articleId: number) => [...QUERY_KEYS.comments.all, 'list', articleId],
    detail: (articleId: number, commentId: number) => [...QUERY_KEYS.comments.all, 'detail', articleId, commentId],
  },
} as const; 