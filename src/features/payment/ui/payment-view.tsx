import { Platform } from "react-native";
import { createRef, forwardRef, useEffect, type ForwardedRef } from "react";
import type { PortOneController } from "@portone/react-native-sdk";
import { PortOnePaymentView, type PortOnePaymentProps } from "./port-one-payment";
import { WebPaymentView } from "./web-payment";
import type { Product } from "../types";
import { useAuth } from "../../auth";
import { usePortoneStore } from "../hooks/use-portone-store";
import type { PaymentResponse } from "@/src/types/payment";
import paymentApis from "../api";

export interface PaymentViewProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  productType: Product; 
  productCount: number;
  onComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}

export const PaymentView = forwardRef(
  (props: PaymentViewProps, ref: ForwardedRef<PortOneController>) => {
    const { paymentId, orderName, totalAmount, productCount, productType, productName, onComplete, onError, onCancel } = props;
    const { my } = useAuth();
    const { setCustomData } = usePortoneStore();


    const customData = {
      orderName: productName || orderName,
      amount: totalAmount,
      productType,
      productCount,
    };

    const paymentParams: IMP.RequestPayParams = {
      pg: process.env.EXPO_PUBLIC_PG_PROVIDER,
      channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY as string,
      pay_method: 'card',
      merchant_uid: paymentId,
      name: productName || orderName,
      amount: totalAmount,
      buyer_name: my?.name,
      buyer_tel: my?.phoneNumber,
      buyer_email: my?.email,
      m_redirect_url: `${window.location.origin}/purchase/complete`,
      custom_data: JSON.stringify(customData),
    };

    useEffect(() => {
      setCustomData(customData);
      paymentApis.saveHistory({
        orderId: paymentId,
        amount: totalAmount,
        orderName: productName || orderName,
      });
    }, []);

    // 웹 환경인 경우
    if (Platform.OS === 'web') {
      return (
        <WebPaymentView
          paymentId={paymentId}
          orderName={orderName}
          productType={productType}
          totalAmount={totalAmount}
          productName={productName}
          productCount={productCount}
          onComplete={onComplete}
          onError={onError}
          onCancel={onCancel}
        />
      );
    }

    // 네이티브 환경인 경우
    return (
      <PortOnePaymentView
        ref={ref}
        request={{ 
          ...paymentParams,
          storeId: process.env.EXPO_PUBLIC_STORE_ID,
          paymentId,
          orderName: productName || orderName,
          totalAmount,
          currency: "CURRENCY_KRW",
          payMethod: "CARD",
          customer: {
            fullName: my?.name,
            phoneNumber: my?.phoneNumber,
            email: my?.email,
          },
          appScheme: process.env.EXPO_PUBLIC_APP_SCHEME,
          mRedirectUrl: process.env.EXPO_PUBLIC_PAYMENT_REDIRECT_URL,
        }}
        productName={productName}
        onComplete={onComplete}
        onError={onError}
        onCancel={onCancel}
      />
    );
  }
);

PaymentView.displayName = "PaymentView";
