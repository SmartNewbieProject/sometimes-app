import Payment from '@features/payment';
import { useModal } from '@shared/hooks/use-modal';
import { Text } from '@shared/ui';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Platform, View } from 'react-native';
import type { PaymentResponse } from '../types';
import { usePortoneScript } from './PortoneProvider';
import { usePortoneStore } from './use-portone-store';

const { apis } = Payment;

interface UsePortone {
	handlePaymentComplete: (
		result: PaymentResponse,
		options?: HandlePaymentCompleteOptions,
	) => Promise<void>;
}

interface HandlePaymentCompleteOptions {
	productCount?: number;
	showSuccessModal?: boolean;
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}

export function usePortone(): UsePortone {
	const { loaded, error } = usePortoneScript();
	const { showModal, showErrorModal } = useModal();

	const handlePaymentComplete = useCallback(
		async (result: PaymentResponse, options: HandlePaymentCompleteOptions = {}) => {
			const { productCount, showSuccessModal = true, onSuccess, onError } = options;

			try {
				if (result?.message) {
					showErrorModal(result.message, 'error');
					onError?.(result);
					return;
				}

				if (Platform.OS === 'web') {
					await apis.pay({
						txId: result.txId,
						merchantUid: result.paymentId,
					});
				}

				if (showSuccessModal) {
					showModal({
						title: '구매 완료',
						children: (
							<View className="flex flex-col gap-y-1">
								{productCount && (
									<Text textColor="pale-purple" weight="semibold">
										연인 재매칭권 {productCount} 개 구매를 완료했어요
									</Text>
								)}
								<Text textColor="pale-purple" weight="semibold">
									결제가 완료되었으니 홈으로 이동할게요
								</Text>
							</View>
						),
						primaryButton: {
							text: '홈으로 이동',
							onClick: () => router.push('/home'),
						},
					});
				}

				onSuccess?.();
			} catch (error) {
				console.error('결제 처리 오류:', error);
				showErrorModal(
					error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.',
					'error',
				);
				onError?.(error);
			}
		},
		[showModal, showErrorModal],
	);

	return {
		handlePaymentComplete,
	};
}
