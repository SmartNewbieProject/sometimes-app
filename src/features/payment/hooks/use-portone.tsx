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
import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";

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
          console.warn('알 수 없는 eventType:', eventType);
          return;
      }
      await participate();
      console.log('이벤트 참여 완료:', eventType);
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

        track("GemStore_Payment_Success", {
          result,
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });

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
                <View className="w-full flex flex-row justify-center pb-[5px]">
                  <Text size="20" weight="bold" textColor="black">
                    ❤️ 구매 완료
                  </Text>
                </View>
              ),
              children: (
                <View className="flex flex-col gap-y-1 items-center">
                  <Text textColor="black" weight="semibold">
                    구슬 {gemCount} 개 구매를 완료했어요
                  </Text>
                  <Text textColor="pale-purple" weight="semibold">
                    결제가 완료되었으니 홈으로 이동할게요
                  </Text>
                </View>
              ),
              primaryButton: {
                text: "네 이동할게요",
                onClick: () => router.push("/home"),
              },
              secondaryButton: {
                text: "좀 더 구경할게요",
                onClick: hideModal,
              },
            });
          }

          if (!gemCount) {
            showModal({
              showLogo: true,
              title: "❤️ 구매 완료",
              children: (
                <View className="flex flex-col gap-y-1">
                  {productCount && (
                    <Text textColor="black" weight="semibold">
                      연인 재매칭권 {productCount} 개 구매를 완료했어요
                    </Text>
                  )}
                  <Text textColor="black" weight="semibold">
                    결제가 완료되었으니 홈으로 이동할게요
                  </Text>
                </View>
              ),
              primaryButton: {
                text: "홈으로 이동",
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
