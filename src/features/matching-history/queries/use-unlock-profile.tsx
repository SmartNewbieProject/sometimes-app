import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { getPreviewHistory, postUnlockProfile } from "../apis";
import type { PreviewMatchingHistory } from "../type";
import {useCashableModal} from "@shared/hooks";
import { useTranslation } from "react-i18next";

export const useUnlockProfile = (matchId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showErrorModal, showModal } = useModal();
  const { show } = useCashableModal();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => postUnlockProfile(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matching-history-list"] });
      queryClient.invalidateQueries({ queryKey: ["gem", "current"] });

      router.push(`/partner/view/${matchId}`);
    },
    onError: (err: { message?: string; errorCode?: string; status?: number }) => {
      console.log("err", err);

      const isInsufficientGems = err.message?.includes("재화가 부족") ||
                                 err.message?.includes("구슬이 부족") ||
                                 err.message?.includes("insufficient");

      if (isInsufficientGems) {
        show({
          textContent: t('features.matching-history.ui.matching_history_card.messages.modal_recharge_prompt'),
        });
        return;
      }

      showErrorModal(err.message || "오류가 발생했어요", "error");
      return;
    },
  });
};
