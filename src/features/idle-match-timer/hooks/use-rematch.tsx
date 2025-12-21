import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient, tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useCashableModal } from "@shared/hooks";
import { useMutation } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useMatchLoading } from "../hooks";
import { useTranslation } from "react-i18next";
import type { RematchResponseV3 } from "../types-v3";
import {
	useExternalMatching,
	useRegionalExpansionModal,
	useMatchingStore,
} from "@/src/features/matching";
import { logError } from "@/src/shared/utils";

const useRematchingMutation = () =>
  useMutation<RematchResponseV3>({
    mutationFn: () => axiosClient.post("/v3/matching/rematch"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["latest-matching-v2"] });
      await queryClient.refetchQueries({ queryKey: ["latest-matching-v2"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.invalidateQueries({ queryKey: ["matching-first"] });
    },
  });

const useDevRematchingMutation = () =>
  useMutation({
    mutationFn: () => axiosClient.post("/matching/dev/auto-match"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["latest-matching-v2"] });
      await queryClient.refetchQueries({ queryKey: ["latest-matching-v2"] });
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      await queryClient.invalidateQueries({ queryKey: ["matching-first"] });
    },
  });

function useRematch() {
  const { showErrorModal, showModal, closeModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();
  const { onLoading, finishLoading, finishRematching } = useMatchLoading();
  const { show: showCashable } = useCashableModal();
  const { t } = useTranslation();
  const { showExpansionModal } = useRegionalExpansionModal();
  const { startExternalMatch, error: externalMatchError } = useExternalMatching();
  const { userRegion, matchAttempts, setCurrentMatch, setCurrentBadge } = useMatchingStore();

  // 외부 매칭 에러 처리
  useEffect(() => {
    if (!externalMatchError) return;

    logError('[외부 매칭] Error:', externalMatchError);

    finishLoading();
    finishRematching();

    showErrorModal(
      externalMatchError.message || "확장 매칭 중 오류가 발생했습니다",
      "error"
    );
  }, [externalMatchError, finishLoading, finishRematching, showErrorModal]);

  const handleShowExpansionModal = (expansionSuggestion: any) => {
    const { currentRegion, expansionPath, nextAction } = expansionSuggestion;

    showExpansionModal({
      userRegion: currentRegion.name,
      expansionPath: `${expansionPath.icon} ${expansionPath.summary}`,
      onConfirm: async () => {
        try {
          onLoading();
          // JWT 토큰으로 인증되므로 userId 생략
          // 서버가 Authorization 헤더의 토큰에서 userId 추출
          await startExternalMatch({
            context: {
              previousMatchAttempts: matchAttempts,
              lastMatchedRegion: currentRegion.name,
            },
            onComplete: () => {
              finishLoading();
              finishRematching();
            },
          });
        } catch (error) {
          logError('[외부 매칭] Error:', error);
          finishLoading();
          finishRematching();
          showErrorModal(
            error?.message || "확장 매칭 중 오류가 발생했습니다",
            "error"
          );
        }
      },
      onCancel: () => {},
    });
  };

  const performRematch = async () => {
    await tryCatch(
      async () => {
        onLoading();
        await rematch();
        finishLoading();
        finishRematching();
      },
      (err) => {
        finishLoading();
        finishRematching();

        // Forbidden - 재매칭 티켓 부족
        if (err.status === HttpStatusCode.Forbidden) {
          showCashable({
            textContent:
              t("features.idle-match-timer.hooks.use-rematch.charge"),
          });
          return;
        }

        // USER_NOT_FOUND - 지역 확장 제안
        // axios interceptor가 error.response.data를 이미 펼쳐서 반환함
        if (
          err.success === false &&
          err.errorCode === 'USER_NOT_FOUND' &&
          err.details?.expansionSuggestion
        ) {
          const expansionSuggestion = err.details.expansionSuggestion;
          if (expansionSuggestion.available) {
            handleShowExpansionModal(expansionSuggestion);
          } else {
            showErrorModal("현재 매칭 가능한 상대가 없습니다", "announcement");
          }
          return;
        }

        // 기타 에러
        showErrorModal(err.message || "매칭 중 오류가 발생했습니다", "error");
      }
    );
  };

  const onRematch = async () => {
    // performRematch 내부에서 모든 에러 처리를 하므로 별도 에러 핸들러 불필요
    await performRematch();
  };
  return {
    onRematch,
  };
}

const styles = StyleSheet.create({
  modalContent: {
    flexDirection: "column",
  },
});

export default useRematch;
