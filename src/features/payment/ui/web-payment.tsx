import { Alert, Platform, View } from "react-native";
import { useEffect, useState } from "react";
import webPayment from "../web";
import paymentApis from "../api";
import { useAuth } from "../../auth";
import { resolveScheme } from "expo-linking";

export interface WebPaymentProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  onComplete?: (result: IMP.RequestPayResponse) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

/**
 * 웹 환경에서 I'mport.js를 사용한 결제 컴포넌트
 */
export const WebPaymentView = (props: WebPaymentProps) => {
  const { paymentId, orderName, totalAmount, productName, onComplete, onError, onCancel } = props;
  const [isProcessing, setIsProcessing] = useState(true);
  const { profileDetails } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      onError?.({ message: '웹 환경에서만 사용 가능합니다.' });
      return;
    }

    const processPayment = async () => {
      try {
        await paymentApis.saveHistory({
          orderId: paymentId,
          amount: totalAmount,
          orderName: productName || orderName,
        });
  
        const paymentParams: IMP.RequestPayParams = {
          channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY || '',
          pay_method: 'card', // 결제 수단
          merchant_uid: paymentId, // 주문번호
          name: orderName, // 주문명
          amount: totalAmount, // 결제금액
          buyer_name: profileDetails?.name!,
          buyer_tel: '010-5705-1328',
          m_redirect_url: window.location.origin + '/purchase/complete',
          custom_data: {
            orderName,
            paymentId,
          },
        };
        const response = await webPayment.requestPay(paymentParams);
        onComplete?.(response);
      } catch (error: any) {
        Alert.alert("실패", error.message || '결제 처리 중 오류가 발생했습니다.');
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, []);

  if (isProcessing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <p>결제를 처리 중입니다. 잠시만 기다려주세요...</p>
        </View>
      </View>
    );
  }

  return null;
};
