import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { blockUser } from "../apis/block";
import { QUERY_KEYS } from "../queries/keys";
import { useToast } from "@/src/shared/hooks/use-toast";
import { MIXPANEL_EVENTS, USER_ACTION_SOURCES } from "@/src/shared/constants/mixpanel-events";
import type { Article } from "../types";
import { useTranslation } from "react-i18next";

export const useBlockUser = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { emitToast } = useToast();

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
      emitToast(t("features.community.ui.block.error_toast"));
    },
    onSuccess: (_, blockedUserId) => {

      mixpanelAdapter.track(MIXPANEL_EVENTS.USER_BLOCKED, {
        blocked_user_id: blockedUserId,
        reason: "user_initiated",
        action_source: USER_ACTION_SOURCES.COMMUNITY,
        timestamp: new Date().toISOString(),
      });

      emitToast(t("features.community.ui.block.success_toast"));
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles.lists() });
    },
  });
};
