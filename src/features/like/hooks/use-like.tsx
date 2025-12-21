import { queryClient } from "@/src/shared/config/query";
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
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
import { determineFailureReason, predictFailureLikelihood } from "../../matching/utils/failure-analyzer";
import { MIXPANEL_EVENTS, LIKE_TYPES } from "@/src/shared/constants/mixpanel-events";
import { useTranslation } from "react-i18next";

const useLikeMutation = () =>
  useMutation({
    mutationFn: (connectionId: string) =>
      axiosClient.post(`/v1/matching/interactions/like/${connectionId}`),
    onMutate: async (connectionId: string) => {

      mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_SENT, {
        target_profile_id: connectionId,
        like_type: LIKE_TYPES.FREE,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: async () => {
      // 쿼리 무효화를 확실히 처리하기 위해 await 사용
      await queryClient.invalidateQueries({ queryKey: ["latest-matching"] });

      // 추가로 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({ queryKey: ["latest-matching"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.refetchQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.refetchQueries({ queryKey: ["liked", "to-me"] });

      // 매칭 성공 이벤트 트래킹

      mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_SUCCESS, {
        action_type: 'like_success',
        result: 'success',
        timestamp: new Date().toISOString(),
        user_context: {
          gem_balance: queryClient.getQueryData(["gem", "current"]),
          matching_stage: 'like_sent'
        }
      });
    },
    onError: async (error: any) => {
      // 실패 원인 분석 및 트래킹
      const failureReason = determineFailureReason(error);


      // 매칭 실패 이벤트 트래킹
      mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_FAILURE, {
        action_type: 'like_failed',
        failure_type: failureReason.type,
        failure_category: failureReason.category,
        user_action_required: failureReason.userAction,
        recoverable: failureReason.recoverable,
        severity: failureReason.severity,
        server_message: failureReason.serverMessage,
        http_status: failureReason.httpStatus,
        retry_available_at: failureReason.retryAvailableAt,
        wait_time_seconds: failureReason.waitTimeSeconds,
        timestamp: new Date().toISOString()
      });

      // 실패 예측 데이터 수집 (다음 시도를 위해)
      const currentGemBalance = queryClient.getQueryData(["gem", "current"]) as number || 0;
      const failurePrediction = predictFailureLikelihood({
        currentGemBalance,
        ticketCount: 0, // TODO: 실제 티켓 수 가져오기
        recentLikeCount: 0, // TODO: 최근 좋아요 수 가져오기
        recentMatchCount: 0, // TODO: 최근 매칭 수 가져오기
        restrictionHistory: [], // TODO: 제한 이력 가져오기
        lastLikeTime: Date.now() - 3600000, // 1시간 전으로 가정
        timeOfDay: new Date().getHours(),
        isPeakTime: new Date().getHours() >= 20 && new Date().getHours() <= 23
      });

      // 실패 예측 이벤트 트래킹
      mixpanelAdapter.track('MATCHING_FAILURE_PREDICTION', {
        risk_score: failurePrediction.riskScore,
        primary_risk: failurePrediction.primaryRisk,
        is_high_risk: failurePrediction.isHighRisk,
        preventable: failurePrediction.preventable,
        predicted_server_message: failurePrediction.predictedServerMessage,
        recommendations: failurePrediction.recommendations
      });
    }
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
            onClick: () => {},
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
          showCashable({
            textContent: "재매칭권이 필요합니다. 지금 구매하고 계속 매칭을 즐겨보세요!",
          });
          return;
        }

        if (failureReason.type === 'COMMUNICATION_RESTRICTED') {
          showErrorModal("현재 상대방과 소통이 제한되어 있습니다. 잠시 후 다시 시도해주세요.", "announcement");
          return;
        }

        if (failureReason.type === 'DUPLICATE_LIKE') {
          showErrorModal("이미 좋아요를 보낸 상대방입니다.", "announcement");
          return;
        }

        // 기타 409 에러 처리
        if (err.status === HttpStatusCode.Conflict) {
          if (err.error?.includes('소통이 제한')) {
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
  modalContent: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
});
