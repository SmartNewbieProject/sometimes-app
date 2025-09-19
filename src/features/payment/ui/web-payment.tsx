import { Platform } from "react-native";
import { useEffect, useState } from "react";
import Loading from "../../loading";
import { usePortoneStore } from "../hooks/use-portone-store";
import type { CustomData, PaymentRequest } from "../types";
import * as PortOne from "@portone/browser-sdk/v2";
import { useTranslation } from "react-i18next";


export interface WebPaymentProps {
  paymentParams: PaymentRequest;
  gemCount?: number;
  onComplete?: (result: PaymentResponse) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}

/**
 * 웹 환경에서 I'mport.js를 사용한 결제 컴포넌트
 */
export const WebPaymentView = (props: WebPaymentProps) => {
  const { paymentParams, onComplete, onError, onCancel, gemCount } = props;
  const [isProcessing, setIsProcessing] = useState(true);
  const { setCustomData } = usePortoneStore();
  const { t } = useTranslation();

  if (!paymentParams.storeId || !paymentParams.channelKey) {
    return (
      <Loading.Page title={t("ui.web_payment.missing_env_vars")} />
    );
  }

  useEffect(() => {
    if (Platform.OS !== 'web') {
      onError?.({ message: t("ui.web_payment.web_only_error") });
      setIsProcessing(false);
      return;
    }

    const processPayment = async () => {
      if (!paymentParams.customer?.fullName) {
        setIsProcessing(false);
        return;
      }

      try {
        if (isCustomData(paymentParams.customData)) {
          setCustomData({ ...paymentParams.customData, gemCount });
        }

        const response = await PortOne.requestPayment({
          ...paymentParams,
          redirectUrl: `${location.origin}/purchase/complete`,
        }) as unknown as PaymentResponse;

        if (!response) {
          onError?.({ message: t("ui.web_payment.no_payment_result") });
          return;
        } 
        if (PortOne.isPortOneError(response)) {
          onError?.(response);
          return;
        } 

      onComplete?.(response);
      } catch (error) {
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, []);

  if (isProcessing) {
    return (
      <Loading.Page
        title={t("ui.web_payment.processing_payment_wait")}
      />
    );
  }

  return null;
};

function isCustomData(data: unknown): data is CustomData {
  if (!data || typeof data !== 'object') return false;
  const d = data as CustomData;
  return (
    typeof d.orderName === 'string' &&
    typeof d.amount === 'number' &&
    typeof d.productType !== 'undefined' &&
    typeof d.productCount === 'number'
  );
}
