import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { Alert, View, ActivityIndicator } from "react-native";
import { Text } from "@shared/ui";

const { apis } = Payment;

export default function PaymentComplete() {
  const { imp_uid, merchant_uid, custom_data: customData } = useGlobalSearchParams();

  useEffect(() => {
    const processPaymentComplete = async () => {
      try {
        if (customData) {
          const paymentInfo = JSON.parse(customData as string);
          console.log("Payment info:", paymentInfo);
        }

        await apis.pay({
          impUid: imp_uid as string,
          merchantUid: merchant_uid as string,
        });

        // Redirect to home after successful payment processing
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      } catch (error) {
        console.error("Payment error:", error);
        Alert.alert("결제에 오류가 발생했습니다.");
        router.push('/home');
      }
    };

    processPaymentComplete();
  }, [customData, imp_uid, merchant_uid]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text textColor="pale-purple" weight="semibold" className="mt-4">
        결제를 처리중입니다...
      </Text>
    </View>
  );
}
