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
import { useMatchLoading } from "../hooks";
import { useTranslation } from "react-i18next";


const useRematchingMutation = () =>
  useMutation({
    mutationFn: () => axiosClient.post("/v2/matching/rematch"),
    onSuccess: async () => {
      // 쿼리 무효화를 확실히 처리하기 위해 await 사용
      await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });

      // 추가로 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({ queryKey: ["latest-matching"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.invalidateQueries({ queryKey: ["matching-first"] });
    },
  });

function useRematch() {
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();
  const { onLoading, finishLoading, finishRematching } = useMatchLoading();
  const { show: showCashable } = useCashableModal();
  const { t } = useTranslation();

  const performRematch = async () => {
    await tryCatch(
      async () => {
        onLoading();

        await rematch();
        finishLoading();
      },
      (err) => {
        finishLoading();
        finishRematching();
        if (err.status === HttpStatusCode.Forbidden) {
          showCashable({
            textContent:
              t("features.idle-match-timer.hooks.use-rematch.charge"),
          });
          return;
        }

        showModal({
          title: t("features.idle-match-timer.hooks.use-rematch.no_recommend"),
          children: (
            <View className="flex flex-col">
              <Text>{t("features.idle-match-timer.hooks.use-rematch.no_match")}</Text>
              <Text>
                {t("features.idle-match-timer.hooks.use-rematch.retry_later")}
              </Text>
            </View>
          ),
          primaryButton: {
            text: t("global.confirm"),
            onClick: () => {},
          },
        });
      }
    );
  };

  const onRematch = async () => {
    await tryCatch(
      async () => {
        performRematch();
      },
      (err) => {
        finishLoading();
        finishRematching();
        if (err.status === HttpStatusCode.Forbidden) {
          showErrorModal(t("features.idle-match-timer.hooks.use-rematch.no_rematch_ticket"), "announcement");
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
