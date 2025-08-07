import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient, tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useCashableModal } from "@shared/hooks";
import { useMutation } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useMatchLoading } from "../../idle-match-timer/hooks";

const useLikeMutation = () =>
  useMutation({
    mutationFn: (connectionId: string) =>
      axiosClient.post(`/v1/matching/interactions/like/${connectionId}`),
    onSuccess: async () => {
      // 쿼리 무효화를 확실히 처리하기 위해 await 사용
      await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });

      // 추가로 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({ queryKey: ["latest-matching"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.refetchQueries({ queryKey: ["liked", "of-me"] });
    },
  });

export default function useLike() {
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: like } = useLikeMutation();
  const { show: showCashable } = useCashableModal();

  const performLike = async (connectionId: string) => {
    await tryCatch(
      async () => {
        await like(connectionId);
        showModal({
          showLogo: true,
          showParticle: true,
          customTitle: (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text textColor="black" weight="bold" size="20">
                썸을 보냈어요!
              </Text>
            </View>
          ),
          children: (
            <View className="flex flex-col w-full items-center">
              <Text className="text-[#AEAEAE] text-[12px]">
                상대방도 관심을 보이면,
              </Text>
              <Text className="text-[#AEAEAE] text-[12px]">
                바로 대화가 열려요
              </Text>
            </View>
          ),
          primaryButton: {
            text: "확인했어요",
            onClick: () => {},
          },
        });
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showCashable({
            textContent:
              "지금 충전하고, 마음에 드는 상대와 대화를 시작해보세요!",
          });
          return;
        }
        if (err.status === HttpStatusCode.Conflict) {
          showCashable({
            textContent: "중복된 좋아요 요청이에요!",
          });
          return;
        }
      }
    );
  };

  const onLike = async (connectionId: string) => {
    await tryCatch(
      async () => {
        performLike(connectionId);
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showErrorModal("구슬이 없습니다.", "announcement");
          return;
        }
        showErrorModal(err.error, "error");
      }
    );
  };
  return {
    onLike,
  };
}

const styles = StyleSheet.create({});
