import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from "react-native";
import { Text } from "@shared/ui";
import { usePortone } from "@/src/features/payment/hooks";
import { useTranslation } from "react-i18next";

const { apis } = Payment;

export default function PaymentComplete() {
  const { t } = useTranslation();
  const { txId, paymentId, custom_data: customData } = useGlobalSearchParams();
  const { handlePaymentComplete } = usePortone();

  useEffect(() => {
    const processPaymentComplete = async () => {
      const paymentInfo = customData ? JSON.parse(customData as string) : null;
      const returnPath: string = paymentInfo?.returnPath ?? '/home';

      try {
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
            onSuccess: () => router.replace(returnPath as any),
            onError: (error) => {
              console.error("Payment error:", error);
              router.replace(returnPath as any);
            },
          }
        );
      } catch (error) {
        console.error("Payment error:", error);
        router.replace(returnPath as any);
      }
    };

    processPaymentComplete();
  }, [customData, txId, paymentId, handlePaymentComplete]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text textColor="pale-purple" weight="semibold" className="mt-4">
        {t("apps.purchase.complete.processing_payment")}
      </Text>
    </View>
  );
}
