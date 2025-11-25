import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser } from "../apis/block";
import { QUERY_KEYS } from "../queries/keys";
import { useToast } from "@/src/shared/hooks/use-toast";
import type { Article } from "../types";

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: blockUser,
    onMutate: async (blockedUserId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.articles.lists() });

      // Snapshot the previous value
      const previousArticles = queryClient.getQueryData(QUERY_KEYS.articles.lists());

      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.articles.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.filter((article: Article) => article.author.id !== blockedUserId),
            })),
          };
        }
      );

      return { previousArticles };
    },
    onError: (err, newTodo, context) => {
      // Rollback to the previous value
      if (context?.previousArticles) {
        queryClient.setQueryData(QUERY_KEYS.articles.lists(), context.previousArticles);
      }
      showToast("사용자 차단에 실패했습니다.", "error");
    },
    onSuccess: () => {
      showToast("사용자를 차단했습니다.");
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.lists() });
    },
  });
};
