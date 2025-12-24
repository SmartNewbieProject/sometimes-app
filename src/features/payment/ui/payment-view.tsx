import { Platform } from "react-native";
import { createRef, forwardRef, useEffect, type ForwardedRef } from "react";
import type { PortOneController } from "@portone/react-native-sdk";
import { PortOnePaymentView } from "./port-one-payment";
import { WebPaymentView } from "./web-payment";
import type { Product, PaymentRequest } from "../types";
import { useAuth } from "../../auth";
import { usePortoneStore } from "../hooks/use-portone-store";
import paymentApis from "../api";
import { env } from "@/src/shared/libs/env";

export interface PaymentViewProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  productType: Product;
  gemCount?: number;
  productCount: number;
  customData?: Record<string, any>;
  onComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
  payMode: 'rematching' | 'gem';
}

export const PaymentView = forwardRef(
  (props: PaymentViewProps, ref: ForwardedRef<PortOneController>) => {
    const { paymentId, orderName, totalAmount, productCount, productType, productName, customData: propsCustomData, onComplete, onError, onCancel, payMode } = props;
    const { my } = useAuth();
    const { setCustomData, gemCount } = usePortoneStore();

    const customData = {
      orderName: productName || orderName,
      amount: totalAmount,
      productType,
      productCount,
      gemCount,
      ...propsCustomData,
    };

    const basePaymentParams: PaymentRequest = {
      storeId: env.STORE_ID,
      channelKey: env.CHANNEL_KEY,
      paymentId,
      orderName: productName || orderName,
      totalAmount: totalAmount,
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
