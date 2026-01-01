import { useMixpanel, useTracking } from "@/src/shared/hooks";
import { useModal } from "@shared/hooks/use-modal";
import { Text } from "@shared/ui";
import { router } from "expo-router";
import { useCallback } from "react";
import { Platform, View, StyleSheet } from "react-native";
import paymentApis from "../api";
import type { PaymentResponse } from "../types";
import { usePortoneScript } from "./PortoneProvider";
import { usePortoneStore } from "./use-portone-store";
import {queryClient} from "@shared/config/query";
import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useTranslation } from "react-i18next";
import { devLogWithTag, devWarn } from "@/src/shared/utils";
import { checkIsFirstAction } from "@/src/shared/libs/mixpanel-tracking";

interface UsePortone {
  handlePaymentComplete: (
    result: PaymentResponse,
    options?: HandlePaymentCompleteOptions
  ) => Promise<void>;
}

interface HandlePaymentCompleteOptions {
  productCount?: number;
  showSuccessModal?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  gem?: {
    count: number;
  };
}

export function usePortone(): UsePortone {
  const { loaded, error } = usePortoneScript();
  const { showModal, showErrorModal, hideModal } = useModal();
  const { gemCount, eventType, clearEventType } = usePortoneStore();
  const { paymentEvents } = useMixpanel();
  const tracker = useTracking();

  const { t } = useTranslation();
  const { participate: participateFirstSale7 } = useEventControl({ type: EventType.FIRST_SALE_7 });
  const { participate: participateFirstSale16 } = useEventControl({ type: EventType.FIRST_SALE_16 });
  const { participate: participateFirstSale27 } = useEventControl({ type: EventType.FIRST_SALE_27 });

  const handleEventParticipation = useCallback(async (eventType: EventType) => {
    try {
      let participate;
      switch (eventType) {
        case EventType.FIRST_SALE_7:
          participate = participateFirstSale7;
          break;
        case EventType.FIRST_SALE_16:
          participate = participateFirstSale16;
          break;
        case EventType.FIRST_SALE_27:
          participate = participateFirstSale27;
          break;
        default:
          devWarn('알 수 없는 eventType:', eventType);
          return;
      }
      await participate();
      devLogWithTag('Payment Event', t("hooks.참여_완료"), eventType);
    } catch (error) {
      console.error('이벤트 참여 실패:', error);
    }
  }, [participateFirstSale7, participateFirstSale16, participateFirstSale27]);


  const handlePaymentComplete = useCallback(
    async (
      result: PaymentResponse,
      options: HandlePaymentCompleteOptions = {}
    ) => {
      const {
        productCount,
        showSuccessModal = true,
        onSuccess,
        onError,
      } = options;

      try {
        if (result?.message) {
          showErrorModal(result.message, "error");
          onError?.(result);
          return;
        }
        await queryClient.invalidateQueries({
          queryKey: ["gem", "current"],
          exact: true,
        })

        if (Platform.OS === "web") {
          await paymentApis.pay({
            txId: result.txId,
            merchantUid: result.paymentId,
          });
        }

        // 첫 구매 여부 체크 및 추적
        const isFirstPurchase = await checkIsFirstAction('purchase');
        if (isFirstPurchase) {
          tracker.trackFirstPurchase({
            transaction_id: result.paymentId,
            payment_method: result.method as any,
            total_amount: result.totalAmount || 0,
            gem_count: gemCount || 0,
            payment_provider: 'portone',
            is_first_purchase: true,
          });
        } else {
          tracker.trackRepeatPurchase({
            transaction_id: result.paymentId,
            payment_method: result.method as any,
            total_amount: result.totalAmount || 0,
            gem_count: gemCount || 0,
            payment_provider: 'portone',
            is_first_purchase: false,
          });
        }

        if (eventType) {
          await handleEventParticipation(eventType);
          await queryClient.invalidateQueries({
            queryKey: ["event"],
          });
          clearEventType();
        }

        if (showSuccessModal) {
          if (gemCount) {
            showModal({
              showLogo: true,
              customTitle: (
                <View style={styles.modalTitleContainer}>
                  <Text size="20" weight="bold" textColor="black">
                    {t("features.payment.ui.payment_modal.purchase_complete_title")}
                  </Text>
                </View>
              ),
              children: (
                <View style={styles.modalContent}>
                  <Text textColor="black" weight="semibold">
                    {t("features.payment.ui.payment_modal.gem_purchase_complete", { gemCount })}
                  </Text>
                  <Text textColor="pale-purple" weight="semibold">
                    {t("features.payment.ui.payment_modal.payment_complete_redirect")}
                  </Text>
                </View>
              ),
              primaryButton: {
                text: t("features.payment.ui.payment_modal.confirm_redirect_button"),
                onClick: () => router.push("/home"),
              },
              secondaryButton: {
                text: t("features.payment.ui.payment_modal.browse_more_button"),
                onClick: hideModal,
              },
            });
          }

          if (!gemCount) {
            showModal({
              showLogo: true,
              title: t("features.payment.ui.payment_modal.purchase_complete_title"),
              children: (
                <View style={styles.modalContentNoCenter}>
                  {productCount && (
                    <Text textColor="black" weight="semibold">
                      {t("features.payment.ui.payment_modal.gem_purchase_complete", { productCount })}
                    </Text>
                  )}
                  <Text textColor="black" weight="semibold">
                    {t("features.payment.ui.payment_modal.payment_complete_redirect")}
                  </Text>
                </View>
              ),
              primaryButton: {
                text: t("features.payment.ui.payment_modal.go_home_button"),
                onClick: () => router.push("/home"),
              },
            });
          }
        }

        onSuccess?.();
      } catch (error) {
        console.error("결제 처리 오류:", error);
        showErrorModal(
          error instanceof Error
            ? error.message
            : t("hooks.결제_처리_중_오류가_발생했습니다"),
          "error"
        );
        onError?.(error);
      }
    },
    [showModal, showErrorModal, gemCount]
  );

  return {
    handlePaymentComplete,
  };
}

const styles = StyleSheet.create({
  modalTitleContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 5,
  },
  modalContent: {
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  },
  modalContentNoCenter: {
    flexDirection: "column",
    gap: 4,
  },
});
