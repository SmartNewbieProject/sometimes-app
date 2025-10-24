import { track } from "@amplitude/analytics-react-native";
import { useModal } from "@shared/hooks/use-modal";
import { Text } from "@shared/ui";
import { router } from "expo-router";
import { useCallback } from "react";
import { Platform, View } from "react-native";
import paymentApis from "../api";
import type { PaymentResponse } from "../types";
import { usePortoneScript } from "./PortoneProvider";
import { usePortoneStore } from "./use-portone-store";
import {queryClient} from "@shared/config/query";
import { useTranslation } from "react-i18next";

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
  const { gemCount } = usePortoneStore();
  const { t } = useTranslation();

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

        track("GemStore_Payment_Success", {
          result,
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });

        if (showSuccessModal) {
          if (gemCount) {
            showModal({
              showLogo: true,
              customTitle: (
                <View className="w-full flex flex-row justify-center pb-[5px]">
                  <Text size="20" weight="bold" textColor="black">
                    {t("features.payment.ui.payment_modal.purchase_complete_title")}
                  </Text>
                </View>
              ),
              children: (
                <View className="flex flex-col gap-y-1 items-center">
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
                <View className="flex flex-col gap-y-1">
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
            : "결제 처리 중 오류가 발생했습니다.",
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
