import { Platform } from "react-native";
import { createRef, forwardRef, ForwardedRef } from "react";
import { PortOneController } from "@portone/react-native-sdk";
import { PortOnePaymentView, PortOnePaymentProps } from "./port-one-payment";
import { WebPaymentView } from "./web-payment";

export interface PaymentViewProps {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  productName?: string;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

/**
 * 플랫폼에 따라 결제 로직을 분기 처리하는 통합 결제 컴포넌트
 * 
 * @example
 * ```tsx
 * const controller = createRef<PortOneController>();
 * 
 * <PaymentView
 *   ref={controller}
 *   paymentId="payment-id"
 *   orderName="상품명 x 1"
 *   totalAmount={10000}
 *   productName="상품명"
 *   onComplete={(result) => console.log(result)}
 *   onError={(error) => console.error(error)}
 *   onCancel={() => console.log("취소됨")}
 * />
 * ```
 */
export const PaymentView = forwardRef(
  (props: PaymentViewProps, ref: ForwardedRef<PortOneController>) => {
    const { paymentId, orderName, totalAmount, productName, onComplete, onError, onCancel } = props;

    // 웹 환경인 경우
    if (Platform.OS === 'web') {
      return (
        <WebPaymentView
          paymentId={paymentId}
          orderName={orderName}
          totalAmount={totalAmount}
          productName={productName}
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
