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
    onError: (err: { error: string; status: number }) => {
      console.log("err", err.error);
      if (err.error === t('features.matching-history.ui.messages.error_insufficient_gems') || err.status === 400) {
        show({
          textContent: t('features.matching-history.ui.messages.modal_recharge_prompt'),
        });
        return;
      }
      showErrorModal(err.error, "error");
      return;
    },
  });
};
