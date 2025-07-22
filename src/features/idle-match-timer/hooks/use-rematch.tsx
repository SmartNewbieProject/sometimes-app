import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient, tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useMatchLoading } from "../hooks";

const useRematchingMutation = () =>
  useMutation({
    mutationFn: () => axiosClient.post("/matching/rematch"),
    onSuccess: async () => {
      // 쿼리 무효화를 확실히 처리하기 위해 await 사용
      await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });
      // 추가로 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({ queryKey: ["latest-matching"] });
    },
  });
function useRematch() {
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();
  const { onLoading, finishLoading } = useMatchLoading();

  const showRematchSuccessModal = () => {
    showModal({
      title: "연인 찾기 완료",
      children: "연인을 찾았어요! 바로 확인해보세요.",
      primaryButton: {
        text: "바로 확인하기",
        onClick: finishLoading,
      },
    });
  };

  const showTicketPurchaseModal = () => {
    showModal({
      title: "연인 매칭권이 없어요",
      children: (
        <View className="flex flex-col">
          <Text>연인매칭권이 부족해 즉시 매칭을 수행할 수 없어요</Text>
          <Text>매칭권을 구매하시겠어요?</Text>
        </View>
      ),
      primaryButton: {
        text: "살펴보러가기",
        onClick: () => {
          finishLoading();
          router.navigate("/purchase/tickets/rematch");
        },
      },
      secondaryButton: {
        text: "다음에 볼게요",
        onClick: finishLoading,
      },
    });
  };

  const performRematch = async () => {
    await tryCatch(
      async () => {
        onLoading();
        await rematch();
        showRematchSuccessModal();
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showTicketPurchaseModal();
          return;
        }
        finishLoading();
        showModal({
          title: "아직 추천드릴 상대가 없어요",
          children: (
            <View className="flex flex-col">
              <Text>지금은 조건에 맞는 상대가 잠시 없어요.</Text>
              <Text>
                곧 더 많은 분들이 참여할 예정이니, 잠시 후 다시 시도해 주세요!
              </Text>
            </View>
          ),
        });
      }
    );
  };

  const showRematchConfirmModal = () => {
    showModal({
      children: (
        <View className="w-full justify-center items-center">
          <Text textColor="black" size="md">
            재매칭권을 사용하시겠습니까?
          </Text>
        </View>
      ),
      primaryButton: {
        text: "사용하기",
        onClick: performRematch,
      },
      secondaryButton: {
        text: "나중에",
        onClick: finishLoading,
      },
    });
  };

  const onRematch = async () => {
    await tryCatch(
      async () => {
        showRematchConfirmModal();
      },
      (err) => {
        finishLoading();
        if (err.status === HttpStatusCode.Forbidden) {
          showErrorModal("재매칭권이 없습니다.", "announcement");
          return;
        }
        showErrorModal(err.error, "error");
      }
    );
  };
  return {
    onRematch,
  };
}

const styles = StyleSheet.create({});

export default useRematch;
