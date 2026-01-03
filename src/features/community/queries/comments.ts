import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apis_comments from '../apis/comments';
import { QUERY_KEYS } from './keys';

export function useCommentsQuery(articleId: string) {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.comments.lists(articleId),
    queryFn: async () => {
      const comments = await apis_comments.getComments({ articleId });
      console.log('Comments fetched:', comments.map(c => ({
        id: c.id,
        isLiked: c.isLiked,
        likeCount: c.likeCount,
        likeCountType: typeof c.likeCount
      })));
      return comments;
    },
  });
}

export function useCreateCommentMutation(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { content: string; anonymous: boolean; parentId?: string }) =>
      apis_comments.postComments(articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
}

export function useUpdateCommentMutation(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
      apis_comments.patchComments(articleId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
}

export function useDeleteCommentMutation(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      apis_comments.deleteComments(articleId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
}

export function useCommentLikeMutation(articleId: string) {
  return useMutation({
    mutationFn: (commentId: string) =>
      apis_comments.patchCommentLike(articleId, commentId),
  });
}