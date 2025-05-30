import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from "react-native";
import { Text } from "@shared/ui";
import { usePortone } from "@/src/features/payment/hooks";

const { apis } = Payment;

export default function PaymentComplete() {
  const { txId, paymentId, custom_data: customData } = useGlobalSearchParams();
  const { handlePaymentComplete } = usePortone();

  useEffect(() => {
    const processPaymentComplete = async () => {
      try {
        const paymentInfo = customData ? JSON.parse(customData as string) : null;
        console.log({ paymentInfo });
        
        await handlePaymentComplete(
          { 
            txId: txId as string,
            paymentId: paymentId as string,
            transactionType: 'PAYMENT',
          },
          {
            productCount: paymentInfo?.productCount,
            onError: (error) => {
              console.error("Payment error:", error);
              router.push('/home');
            }
          }
        );
      } catch (error) {
        console.error("Payment error:", error);
        router.push('/home');
      }
    };

    processPaymentComplete();
  }, [customData, txId, paymentId, handlePaymentComplete]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text textColor="pale-purple" weight="semibold" className="mt-4">
        결제를 처리중입니다...
      </Text>
    </View>
  );
}
