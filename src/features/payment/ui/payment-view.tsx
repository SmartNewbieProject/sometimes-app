import { Platform } from "react-native";
import { createRef, forwardRef, type ForwardedRef } from "react";
import type { PortOneController } from "@portone/react-native-sdk";
import { PortOnePaymentView, type PortOnePaymentProps } from "./port-one-payment";
import { WebPaymentView } from "./web-payment";
import type { Product } from "../types";

export interface PaymentViewProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  productType: Product;
  productCount: number;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export const PaymentView = forwardRef(
  (props: PaymentViewProps, ref: ForwardedRef<PortOneController>) => {
    const { paymentId, orderName, totalAmount, productCount, productType, productName, onComplete, onError, onCancel } = props;

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
          storeId: process.env.EXPO_PUBLIC_STORE_ID || "",
          channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY || "",
          paymentId: paymentId,
          orderName: orderName,
          totalAmount: totalAmount,
          currency: "CURRENCY_KRW",
          payMethod: "CARD",
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
