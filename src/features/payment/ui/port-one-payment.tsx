import { Alert, SafeAreaView } from 'react-native';
import { Payment as PortOnePayment, type PortOneController } from '@portone/react-native-sdk';
import { type ForwardedRef, forwardRef } from 'react';
import paymentApis from '../api';

export interface PortOnePaymentRequest {
	storeId: string;
	channelKey: string;
	paymentId: string;
	orderName: string;
	totalAmount: number;
	currency: string;
	payMethod: string;
}

export interface PortOnePaymentCompleteResult {
	txId?: string;
	[key: string]: any;
}

export interface PortOnePaymentErrorResult {
	message: string;
	[key: string]: any;
}

export interface PortOnePaymentProps {
	request: PortOnePaymentRequest;
	onComplete?: (result: PortOnePaymentCompleteResult) => void;
	onError?: (error: PortOnePaymentErrorResult) => void;
	onCancel?: () => void;
	productName?: string; // 결제 후 저장할 상품명 (orderName과 다를 수 있음)
}

/**
 * PortOne 결제 컴포넌트
 *
 * @example
 * ```tsx
 * const controller = createRef<PortOneController>();
 *
 * <PortOnePaymentView
 *   ref={controller}
 *   request={{
 *     storeId: "store-id",
 *     channelKey: "channel-key",
 *     paymentId: "payment-id",
 *     orderName: "상품명 x 1",
 *     totalAmount: 10000,
 *     currency: "CURRENCY_KRW",
 *     payMethod: "CARD",
 *   }}
 *   productName="상품명"
 *   onComplete={(result) => console.log(result)}
 *   onError={(error) => console.error(error)}
 *   onCancel={() => console.log("취소됨")}
 * />
 * ```
 */
export const PortOnePaymentView = forwardRef(
	(props: PortOnePaymentProps, ref: ForwardedRef<PortOneController>) => {
		const { request, onComplete, onError, onCancel, productName } = props;

		const handleComplete = async (complete: PortOnePaymentCompleteResult) => {
			Alert.alert('완료', '결제가 완료되었습니다.');

			try {
				// 결제 내역 저장
				await paymentApis.saveHistory({
					orderId: request.paymentId,
					amount: request.totalAmount,
					orderName: productName || request.orderName,
				});

				// 결제 확인 처리
				if (complete.txId) {
					await paymentApis.pay({
						impUid: process.env.EXPO_PUBLIC_IMP as string,
						merchantUid: process.env.EXPO_PUBLIC_MERCHANT_ID as string,
					});
				}

				// 완료 콜백 호출
				onComplete?.(complete);
			} catch (error) {
				Alert.alert('오류', '결제 후 처리 중 오류가 발생했습니다.');
			}
		};

		const handleError = (error: PortOnePaymentErrorResult) => {
			Alert.alert('실패', error.message);
			onError?.(error);
		};

		return (
			<SafeAreaView style={{ flex: 1 }}>
				<PortOnePayment
					ref={ref}
					request={request as any}
					onError={handleError}
					onComplete={handleComplete}
				/>
			</SafeAreaView>
		);
	},
);

PortOnePaymentView.displayName = 'PortOnePaymentView';
