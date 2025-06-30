import type { PortOneController } from '@portone/react-native-sdk';
import { type ForwardedRef, createRef, forwardRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../../auth';
import paymentApis from '../api';
import { usePortoneStore } from '../hooks/use-portone-store';
import type { PaymentRequest, Product } from '../types';
import { PortOnePaymentView } from './port-one-payment';
import { WebPaymentView } from './web-payment';

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
		const {
			paymentId,
			orderName,
			totalAmount,
			productCount,
			productType,
			productName,
			onComplete,
			onError,
			onCancel,
		} = props;
		const { my } = useAuth();
		const { setCustomData } = usePortoneStore();

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
			totalAmount,
			currency: 'CURRENCY_KRW',
			payMethod: 'CARD',
			customer: {
				fullName: my?.name,
				customerId: my?.id,
				phoneNumber: my?.phoneNumber,
				email: my?.email,
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
				ref={ref}
				request={basePaymentParams}
				productName={productName}
				onComplete={onComplete}
				onError={onError}
				onCancel={onCancel}
			/>
		);
	},
);

PaymentView.displayName = 'PaymentView';
