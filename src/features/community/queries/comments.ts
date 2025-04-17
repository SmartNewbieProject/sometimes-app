import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apis_comments from '../apis/comments';
import { QUERY_KEYS } from './keys';

export function useCommentsQuery(articleId: number) {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.comments.lists(articleId),
    queryFn: () => apis_comments.getComments({ articleId }),
  });
}

export function useCreateCommentMutation(articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { content: string; anonymous: boolean }) => 
      apis_comments.postComments(articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
}

export function useUpdateCommentMutation(articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) => 
      apis_comments.patchComments(articleId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
}

export function useDeleteCommentMutation(articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => 
      apis_comments.deleteComments(articleId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments.lists(articleId) });
    },
  });
} 