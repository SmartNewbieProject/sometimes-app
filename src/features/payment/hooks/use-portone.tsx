import { useCallback } from 'react';
import { usePortoneStore } from './use-portone-store';
import { usePortoneScript } from './PortoneProvider';
import { router } from 'expo-router';
import { Platform, View } from 'react-native';
import { Text } from '@shared/ui';
import paymentApis from '../api';
import { useModal } from '@shared/hooks/use-modal';
import type { PaymentResponse } from '../types';
import { track } from '@amplitude/analytics-react-native';

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
	gem?: {
		count: number;
	}
}

export function usePortone(): UsePortone {
	const { loaded, error } = usePortoneScript();
	const { showModal, showErrorModal, hideModal } = useModal();
	const { gemCount } = usePortoneStore();

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
					await paymentApis.pay({
						txId: result.txId,
						merchantUid: result.paymentId,
					});
				}

				track("GemStore_Payment_Success", {  result  });

				if (showSuccessModal) {
					if (gemCount) {
						showModal({
							showLogo: true,
							customTitle: (
									<View className="w-full flex flex-row justify-center pb-[5px]">
										<Text size="20" weight="bold" textColor="black">
											❤️ 구매 완료
										</Text>
									</View>
							),
							children: (
									<View className="flex flex-col gap-y-1 items-center">
											<Text textColor="black" weight="semibold">
												구슬 {gemCount} 개 구매를 완료했어요
											</Text>
										<Text textColor="pale-purple" weight="semibold">
											결제가 완료되었으니 홈으로 이동할게요
										</Text>
									</View>
							),
							primaryButton: {
								text: '네 이동할게요',
								onClick: () => router.push('/home'),
							},
							secondaryButton: {
								text: '좀 더 구경할게요',
								onClick: hideModal,
							}
						});
					}

					if (!gemCount) {
						showModal({
							showLogo: true,
							title: '❤️ 구매 완료',
							children: (
									<View className="flex flex-col gap-y-1">
										{productCount && (
												<Text textColor="black" weight="semibold">
													연인 재매칭권 {productCount} 개 구매를 완료했어요
												</Text>
										)}
										<Text textColor="black" weight="semibold">
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
		[showModal, showErrorModal, gemCount],
	);

	return {
		handlePaymentComplete,
	};
}
