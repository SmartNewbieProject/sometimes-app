import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { getPreviewHistory, postUnlockProfile } from "../apis";
import type { PreviewMatchingHistory } from "../type";

export const useUnlockProfile = (matchId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showErrorModal, showModal } = useModal();

  const showTicketPurchaseModal = () => {
    showModal({
      title: "연인 매칭권이 없어요",
      children: (
        <View className="flex flex-col">
          <Text>연인매칭권이 부족해 해제할 수 없어요</Text>
          <Text>매칭권을 구매하시겠어요?</Text>
        </View>
      ),
      primaryButton: {
        text: "살펴보러가기",
        onClick: () => {
          router.navigate("/purchase/tickets/rematch");
        },
      },
      secondaryButton: {
        text: "다음에 볼게요",
        onClick: () => {},
      },
    });
  };
  return useMutation({
    mutationFn: () => postUnlockProfile(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matching-history-list"] });
      queryClient.invalidateQueries({ queryKey: ["rematching-tickets"] });

      router.push(`/partner/view/${matchId}`);
    },
    onError: (err: { error: string; status: number }) => {
      console.log("err", err.error);
      if (err.error === "남은 재매칭권이 없습니다." || err.status === 400) {
        showTicketPurchaseModal();
        return;
      }
      showErrorModal(err.error, "error");
      return;
    },
  });
};
