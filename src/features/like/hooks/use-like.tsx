import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient, tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useCashableModal } from "@shared/hooks";
import { useMutation } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useMatchLoading } from "../../idle-match-timer/hooks";
import { useTranslation } from "react-i18next";

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
      await queryClient.refetchQueries({ queryKey: ["liked", "to-me"] });
    },
  });

export default function useLike() {
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: like } = useLikeMutation();
  const { show: showCashable } = useCashableModal();
  const { t } = useTranslation();
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
                position: "relative",
              }}
            >
              <Image
                style={styles.particle1}
                source={require("@assets/images/particle1.png")}
              />
              <Image
                style={styles.particle2}
                source={require("@assets/images/particle2.png")}
              />
              <Image
                style={styles.particle3}
                source={require("@assets/images/particle3.png")}
              />
              <Text textColor="black" weight="bold" size="20">
                {t("features.like.hooks.use-like.like_sent")}
              </Text>
            </View>
          ),
          children: (
            <View className="flex flex-col w-full items-center mt-[5px]">
              <Text className="text-[#AEAEAE] text-[12px]">
                {t("features.like.hooks.use-like.if_interested")}
              </Text>
              <Text className="text-[#AEAEAE] text-[12px]">
                {t("features.like.hooks.use-like.can_contact")}
              </Text>
            </View>
          ),
          primaryButton: {
            text: t("features.like.hooks.use-like.confirm"),
            onClick: () => {},
          },
        });
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showCashable({
            textContent:
              t("features.like.hooks.use-like.charge_message"),
          });
          return;
        }
        if (err.status === HttpStatusCode.Conflict) {
          if (err.error.includes('소통이 제한')) {
            showErrorModal(err.error, "announcement");
            return;
          }
          showErrorModal(t("features.like.hooks.use-like.duplicate_liked"), "announcement");
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
          showErrorModal(t("features.like.hooks.use-like.no_gems"), "announcement");
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

const styles = StyleSheet.create({
  particle1: {
    position: "absolute",
    left: -6,
    bottom: -36,
    width: 66,
    height: 34,
  },
  particle2: {
    position: "absolute",
    left: 10,
    top: -48,
    width: 52,
    height: 49,
  },
  particle3: {
    position: "absolute",
    right: -20,
    top: -40,
    width: 105,
    height: 80,
  },
});
