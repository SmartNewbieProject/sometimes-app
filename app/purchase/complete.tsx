import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { Alert } from "react-native";

const { apis } = Payment;

// app/payment/complete.tsx
export default function PaymentComplete() {
  const { imp_uid, merchant_uid, custom_data: customData } = useGlobalSearchParams();
  
  useEffect(() => {
    const processPaymentComplete = async () => {
      try {
        const paymentInfo = JSON.parse(customData as string);
        await apis.pay({
          impUid: imp_uid as string,
          merchantUid: merchant_uid as string,
        });
      } catch (error) {
        Alert.alert("결제에 오류가 발생했습니다.");
        router.push('/home');
      }
    };

    processPaymentComplete();
  }, [customData, imp_uid, merchant_uid]);

  return <div>결제를 처리중입니다...</div>;
}
