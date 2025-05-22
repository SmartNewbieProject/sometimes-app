import { Alert, Platform, View } from "react-native";
import { useEffect, useState } from "react";
import webPayment, { initializeIMP, resetIMP } from "../web";
import paymentApis from "../api";
import { useAuth } from "../../auth";
import Loading from "../../loading";
import type { PaymentResponse } from "@/src/types/payment";
import type { Product } from "../types";
import { usePortoneStore } from "../hooks/use-portone-store";

export interface WebPaymentProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productType: Product;
  productName?: string;
  productCount: number;
  onComplete?: (result: PaymentResponse) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}


/**
 * 웹 환경에서 I'mport.js를 사용한 결제 컴포넌트
 */
export const WebPaymentView = (props: WebPaymentProps) => {
  const { paymentId, orderName, productCount, totalAmount, productName, productType, onComplete, onError, onCancel } = props;
  const [isProcessing, setIsProcessing] = useState(true);
  const { my } = useAuth();
  const { setCustomData } = usePortoneStore();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      onError?.({ message: '웹 환경에서만 사용 가능합니다.' });
      setIsProcessing(false);
      return;
    }

    const processPayment = async () => {
      if (!my) {
        console.debug("로그인 사용자가 조회되지 않습니다.");
        setIsProcessing(false);
        return;
      }

      try {
        await paymentApis.saveHistory({
          orderId: paymentId,
          amount: totalAmount,
          orderName: productName || orderName,
        });

        const customData = {
          orderName: productName || orderName,
          amount: totalAmount,
          productType,
          productCount,
        };

        setCustomData(customData);
        
        const paymentParams: IMP.RequestPayParams = {
          pg: process.env.EXPO_PUBLIC_PG_PROVIDER,
          channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY as string,
          pay_method: 'card',
          merchant_uid: paymentId,
          name: productName || orderName,
          amount: totalAmount,
          buyer_name: my.name,
          buyer_tel: my.phoneNumber,
          buyer_email: my.email,
          m_redirect_url: `${window.location.origin}/purchase/complete`,
          custom_data: JSON.stringify(customData),
        };

        // console.table(paymentParams);
        const response = await webPayment.requestPay(paymentParams) as PaymentResponse;
        // console.log('결제 응답:', response);
        onComplete?.(response);
      } catch (error) {
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [my]);

  if (isProcessing) {
    return (
      <Loading.Page
        title="결제를 처리 중입니다. 잠시만 기다려주세요..."
      />
    );
  }

  return null;
};
