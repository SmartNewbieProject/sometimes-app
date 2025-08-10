import { Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { Payment as PortOnePayment, type PortOneController } from '@portone/react-native-sdk';
import { type ForwardedRef, forwardRef, useEffect } from 'react';
import paymentApis from '../api';
import { Button, Header } from '@/src/shared/ui';
import { router } from 'expo-router';
import { ImageResources } from '@/src/shared/libs/image';
import { usePortoneStore } from '../hooks/use-portone-store';


export interface PortOnePaymentCompleteResult {
	txId?: string;
	[key: string]: any;
}

export interface PortOnePaymentErrorResult {
	message: string;
	[key: string]: any;
}

export interface PortOnePaymentProps {
	payMode: 'rematching' | 'gem',
	request: any;
	onComplete?: (result: PortOnePaymentCompleteResult) => void;
	onError?: (error: unknown) => void;
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
		const { request, onComplete, onError, onCancel, productName, payMode } = props;
		const { eventType } = usePortoneStore();

		const handleComplete = async (complete: PortOnePaymentCompleteResult) => {
			try {
				if (complete.txId) {
					if (payMode === 'gem') {
						await paymentApis.payGem({ txId : complete.txId, merchantUid: complete.paymentId, eventType })
					}
					if (payMode === 'rematching') {
						await paymentApis.pay({
							txId: complete.txId,
							merchantUid: complete.paymentId,
						});
					}
				}
				onComplete?.(complete);
			} catch (error) {
				onError?.(error);
			}
		};

		const handleError = (error: PortOnePaymentErrorResult) => {
			console.log('실패', error.message);
			onError?.(error);
		};

		return (
			<SafeAreaView style={{ flex: 1 }}>
				<PortOnePayment
					ref={ref}
					request={request}
					onError={handleError}
					onComplete={handleComplete}
				/>
			</SafeAreaView>
		);
	},
);

PortOnePaymentView.displayName = 'PortOnePaymentView';
