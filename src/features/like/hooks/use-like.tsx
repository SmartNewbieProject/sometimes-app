import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient, tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useCashableModal, useTracking } from "@shared/hooks";
import { useMutation } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useMatchLoading } from "../../idle-match-timer/hooks";
import { determineFailureReason, predictFailureLikelihood } from "../../matching/utils/failure-analyzer";
import { MIXPANEL_EVENTS, LIKE_TYPES } from "@/src/shared/constants/mixpanel-events";
import { useTranslation } from "react-i18next";
import { useAppInstallPrompt } from "@/src/features/app-install-prompt";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";
import { checkIsFirstAction } from "@/src/shared/libs/mixpanel-tracking";

const useLikeMutation = (trackEvent: ReturnType<typeof useMixpanel>['trackEvent']) =>
  useMutation({
    mutationFn: (connectionId: string) =>
      axiosClient.post(`/v1/matching/interactions/like/${connectionId}`),
    onMutate: async (connectionId: string) => {
      trackEvent(MIXPANEL_EVENTS.LIKE_SENT, {
        target_profile_id: connectionId,
        like_type: LIKE_TYPES.FREE,
      });
    },
    onSuccess: async (data, connectionId) => {
      // 쿼리 무효화를 확실히 처리하기 위해 await 사용
      await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });

      // 추가로 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({ queryKey: ["latest-matching"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.refetchQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.refetchQueries({ queryKey: ["liked", "to-me"] });

      // 좋아요 전송 성공 (LIKE_SENT는 onMutate에서 이미 tracking됨)
      // Matching_Success는 서버에서 상호 좋아요 확인 후 tracking
    },
    onError: async (error: any, connectionId) => {
      // 실패 원인 분석 및 트래킹
      const failureReason = determineFailureReason(error);

      // 좋아요 실패 이벤트 트래킹
      trackEvent(MIXPANEL_EVENTS.MATCHING_FAILED, {
        profile_id: connectionId,
        matching_type: 'like',
        error_reason: failureReason.type,
        failure_category: failureReason.category,
        is_recoverable: failureReason.recoverable,
      });
    }
  });

export default function useLike() {
  const { showErrorModal, showModal } = useModal();
  const { trackEvent } = useMixpanel();
  const { mutateAsync: like } = useLikeMutation(trackEvent);
  const { show: showCashable } = useCashableModal();
  const { t } = useTranslation();
  const { showPromptForMatching } = useAppInstallPrompt();
  const tracker = useTracking();

  const performLike = async (connectionId: string) => {
    await tryCatch(
      async () => {
        const result = await like(connectionId);

        // 첫 좋아요 전송인지 확인
        const isFirstLikeSent = await checkIsFirstAction('like_sent');
        if (isFirstLikeSent) {
          tracker.trackFirstLikeSent({
            time_to_first_action: 0, // 추후 가입일 기반 계산 가능
          });
        }

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
            <View style={styles.modalContent}>
              <Text textColor="disabled" size="12">
                {t("features.like.hooks.use-like.if_interested")}
              </Text>
              <Text textColor="disabled" size="12">
                {t("features.like.hooks.use-like.can_contact")}
              </Text>
            </View>
          ),
          primaryButton: {
            text: t("features.like.hooks.use-like.confirm"),
            onClick: () => {
              showPromptForMatching();
            },
          },
        });
      },
      (err) => {
        // 실패 원인 분석기로 정확한 원인 파악
        const failureReason = determineFailureReason(err);

        if (err.status === HttpStatusCode.Forbidden) {
          showCashable({
            textContent:
              t("features.like.hooks.use-like.charge_message"),
          });
          return;
        }

        // 실패 원인에 따른 구체적인 사용자 가이드 제공
        if (failureReason.type === 'TICKET_INSUFFICIENT') {
          // 좋아요 한도 도달 tracking
          tracker.trackLikeLimitReached(0, {
            like_type: LIKE_TYPES.FREE as any,
            target_profile_id: connectionId,
          });

          showCashable({
            textContent: t("features.like.hooks.use-like.ticket_insufficient"),
          });
          return;
        }

        if (failureReason.type === 'COMMUNICATION_RESTRICTED') {
          showErrorModal(t("features.like.hooks.use-like.communication_restricted"), "announcement");
          return;
        }

        if (failureReason.type === 'DUPLICATE_LIKE') {
          showErrorModal(t("features.like.hooks.use-like.already_liked"), "announcement");
          return;
        }

        // 기타 409 에러 처리
        if (err.status === HttpStatusCode.Conflict) {
          // 서버 응답 메시지는 한국어로 오므로 한국어 문자열로 비교
          if (err.error?.includes('소통이 제한')) {
            showErrorModal(err.error, "announcement");
            return;
          }
          showErrorModal(t("features.like.hooks.use-like.duplicate_like"), "announcement");
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
  modalContent: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
});
