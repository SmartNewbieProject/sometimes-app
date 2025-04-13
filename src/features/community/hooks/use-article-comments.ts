import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../queries/keys';
import { mockComments } from '../mocks/articles';

export function useArticleComments(articleId: number) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { mutate: writeComment, isPending } = useMutation({
    mutationFn: async () => {
      // 실제 API가 구현되면 여기에 API 호출 코드를 넣습니다
      const newComment = {
        id: Date.now(),
        articleId,
        content,
        createdAt: new Date().toISOString(),
        author: {
          id: 1,
          nickname: '사용자',
        },
      };
      return Promise.resolve(newComment);
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.comments.lists(articleId) 
      });
    },
  });

  const comments = mockComments.filter(comment => comment.articleId === articleId);

  return {
    comments,
    content,
    setContent,
    writeComment,
    isPending,
  };
}