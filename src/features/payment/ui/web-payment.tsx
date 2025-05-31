import { Platform } from "react-native";
import { useEffect, useState } from "react";
import Loading from "../../loading";
import { usePortoneStore } from "../hooks/use-portone-store";
import type { CustomData, PaymentRequest } from "../types";


export interface WebPaymentProps {
  paymentParams: PaymentRequest;
  onComplete?: (result: PaymentResponse) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}

/**
 * 웹 환경에서 I'mport.js를 사용한 결제 컴포넌트
 */
export const WebPaymentView = (props: WebPaymentProps) => {
  const { paymentParams, onComplete, onError, onCancel } = props;
  const [isProcessing, setIsProcessing] = useState(true);
  const { setCustomData } = usePortoneStore();

  if (!paymentParams.storeId || !paymentParams.channelKey) {
    return (
      <Loading.Page title="결제 환경변수가 누락되었습니다." />
    );
  }

  useEffect(() => {
    if (Platform.OS !== 'web') {
      onError?.({ message: '웹 환경에서만 사용 가능합니다.' });
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
          setCustomData(paymentParams.customData);
        }

        const PortOne = await import("@portone/browser-sdk/v2");
        const response = await PortOne.requestPayment(paymentParams) as unknown as PaymentResponse;

        if (!response) {
          onError?.({ message: '결제 결과를 받아오지 못했습니다.' });
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
        title="결제를 처리 중입니다. 잠시만 기다려주세요..."
      />
    );
  }

  return null;
};

// CustomData 타입 가드
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
