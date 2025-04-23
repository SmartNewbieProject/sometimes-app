import { Alert, Platform, View } from "react-native";
import { useEffect, useState } from "react";
import webPayment, { initializeIMP, resetIMP } from "../web";
import paymentApis from "../api";
import { useAuth } from "../../auth";
import Loading from "../../loading";
import { PaymentResponse } from "@/src/types/payment";
import { Product } from "../types";

export interface WebPaymentProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productType: Product;
  productName?: string;
  productCount: number;
  onComplete?: (result: PaymentResponse) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

/**
 * 웹 환경에서 I'mport.js를 사용한 결제 컴포넌트
 */
export const WebPaymentView = (props: WebPaymentProps) => {
  const { paymentId, orderName, productCount, totalAmount, productName, productType, onComplete, onError, onCancel } = props;
  const [isProcessing, setIsProcessing] = useState(true);
  const { my } = useAuth();
  console.log({ my });

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
        // 결제 전 IMP 초기화 상태 리셋
        resetIMP();
        initializeIMP(process.env.EXPO_PUBLIC_IMP as string);

        // 결제 내역 저장
        await paymentApis.saveHistory({
          orderId: paymentId,
          amount: totalAmount,
          orderName: productName || orderName,
        });

        // 결제 파라미터 설정
        const paymentParams: IMP.RequestPayParams = {
          channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY || '',
          pay_method: 'card',
          merchant_uid: paymentId,
          name: productName || orderName,
          amount: totalAmount,
          buyer_name: my.name,
          buyer_tel: my.phoneNumber,
          m_redirect_url: window.location.origin + '/purchase/complete',
          custom_data: {
            orderName: productName || orderName,
            amount: totalAmount,
            productType,
            productCount,
          },
        };

        // 결제 요청
        const response = await webPayment.requestPay(paymentParams) as PaymentResponse;
        console.log('결제 응답:', response);
        onComplete?.(response);
      } catch (error: any) {
        console.error('결제 오류:', error);
        Alert.alert("결제 실패", error.message || '결제 처리 중 오류가 발생했습니다.');
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
