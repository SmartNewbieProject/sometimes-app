export const QUERY_KEYS = {
  articles: {
    all: ['articles'],
    lists: () => [...QUERY_KEYS.articles.all, 'list'],
    list: (page: number, size: number) => [...QUERY_KEYS.articles.lists(), { page, size }],
    detail: (id: string) => [...QUERY_KEYS.articles.all, 'detail', id],
  },
  comments: {
    all: ['comments'],
    lists: (articleId: string) => [...QUERY_KEYS.comments.all, 'list', articleId],
    detail: (articleId: string, commentId: string) => [...QUERY_KEYS.comments.all, 'detail', articleId, commentId],
  },
} as const; 
