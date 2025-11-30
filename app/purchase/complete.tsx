import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@shared/ui";
import { usePortone } from "@/src/features/payment/hooks";

const { apis } = Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
});

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
            gem: paymentInfo?.gemCount ? {
              count: paymentInfo.gemCount,
            } : undefined,
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
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text textColor="pale-purple" weight="semibold" style={styles.loadingText}>
        결제를 처리중입니다...
      </Text>
    </View>
  );
}
