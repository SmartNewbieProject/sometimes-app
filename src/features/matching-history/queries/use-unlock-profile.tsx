import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { getPreviewHistory, postUnlockProfile } from "../apis";
import type { PreviewMatchingHistory } from "../type";
import {useCashableModal} from "@shared/hooks";

export const useUnlockProfile = (matchId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showErrorModal, showModal } = useModal();
  const { show } = useCashableModal();

  return useMutation({
    mutationFn: () => postUnlockProfile(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matching-history-list"] });
      queryClient.invalidateQueries({ queryKey: ["gem", "current"] });

      router.push(`/partner/view/${matchId}`);
    },
    onError: (err: { error: string; status: number }) => {
      console.log("err", err.error);
      if (err.error === '남은 재화가 부족합니다' || err.status === 400) {
        show({
          textContent: '지금 충전하고, 마음에 드는 상대와 대화를 시작해보세요!',
        });
        return;
      }
      showErrorModal(err.error, "error");
      return;
    },
  });
};
