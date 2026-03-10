import { useEffect } from "react";
import Payment from "@features/payment";
import { router, useGlobalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from "react-native";
import { Text } from "@shared/ui";
import { usePortone } from "@/src/features/payment/hooks";
import { useTranslation } from "react-i18next";

const { apis } = Payment;

const resolveReturnPath = (rawPath?: string) => {
  if (!rawPath) {
    return "/home";
  }

  try {
    const decodedPath = decodeURIComponent(rawPath);
    return decodedPath.startsWith("/") ? decodedPath : "/home";
  } catch {
    return rawPath.startsWith("/") ? rawPath : "/home";
  }
};

const parseCustomData = (customData?: string | string[]) => {
  if (!customData) {
    return null;
  }

  const rawValue = Array.isArray(customData) ? customData[0] : customData;

  try {
    return JSON.parse(rawValue) as {
      productCount?: number;
      gemCount?: number;
      returnPath?: string;
      returnTo?: string;
    };
  } catch (error) {
    console.error("Failed to parse payment custom data:", error);
    return null;
  }
};

export default function PaymentComplete() {
  const { t } = useTranslation();
  const { txId, paymentId, custom_data: customData } = useGlobalSearchParams();
  const { handlePaymentComplete } = usePortone();

  useEffect(() => {
    const processPaymentComplete = async () => {
      const paymentInfo = parseCustomData(customData);
      const returnPath = resolveReturnPath(
        paymentInfo?.returnTo ?? paymentInfo?.returnPath,
      );

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
