import { Platform } from "react-native";
import { createRef, forwardRef, useEffect, type ForwardedRef } from "react";
import type { PortOneController } from "@portone/react-native-sdk";
import { PortOnePaymentView } from "./port-one-payment";
import { WebPaymentView } from "./web-payment";
import type { Product, PaymentRequest } from "../types";
import { useAuth } from "../../auth";
import { usePortoneStore } from "../hooks/use-portone-store";
import paymentApis from "../api";

export interface PaymentViewProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  productType: Product;
  gemCount?: number;
  productCount: number;
  onComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
  payMode: 'rematching' | 'gem';
}

export const PaymentView = forwardRef(
  (props: PaymentViewProps, ref: ForwardedRef<PortOneController>) => {
    const { paymentId, orderName, totalAmount, productCount, productType, productName, onComplete, onError, onCancel, payMode } = props;
    const { my } = useAuth();
    const { setCustomData, gemCount } = usePortoneStore();

    const customData = {
      orderName: productName || orderName,
      amount: totalAmount,
      productType,
      productCount,
    };

    const basePaymentParams: PaymentRequest = {
      storeId: process.env.EXPO_PUBLIC_STORE_ID as string,
      channelKey: process.env.EXPO_PUBLIC_CHANNEL_KEY,
      paymentId,
      orderName: productName || orderName,
      totalAmount: gemCount || totalAmount,
      currency: "CURRENCY_KRW",
      payMethod: "CARD",
      customer: {
        fullName: my?.name,
        customerId: my?.id,
        phoneNumber: my?.phoneNumber,
      },
      customData,
    };

    useEffect(() => {
      setCustomData(customData);
      paymentApis.saveHistory({
        orderId: paymentId,
        amount: totalAmount,
        orderName: productName || orderName,
      });
    }, []);

    if (Platform.OS === 'web') {
      return (
        <WebPaymentView
          paymentParams={basePaymentParams}
          onComplete={onComplete}
          onError={onError}
          onCancel={onCancel}
        />
      );
    }

    return (
      <PortOnePaymentView
        payMode={payMode}
        ref={ref}
        request={basePaymentParams}
        productName={productName}
        onComplete={onComplete}
        onError={onError}
        onCancel={onCancel}
      />
    );
  }
);

PaymentView.displayName = "PaymentView";
