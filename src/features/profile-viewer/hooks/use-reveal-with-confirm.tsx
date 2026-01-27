import { useCurrentGem } from '@/src/features/payment/hooks/use-current-gem';
import { useModal } from '@/src/shared/hooks/use-modal';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Text } from '@/src/shared/ui';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealCost, useRevealViewer } from '../queries';
import { RevealConfirmContent } from '../ui/reveal-confirm-content';

export const useRevealWithConfirm = () => {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { data: gemData } = useCurrentGem();
	const { data: costData } = useRevealCost();
	const revealMutation = useRevealViewer();
	const router = useRouter();

	const handleRevealWithConfirm = useCallback(
		(summaryId: string, canUnlockFree: boolean) => {
			console.log('[useRevealWithConfirm] called', { summaryId, canUnlockFree });
			const cost = costData?.cost ?? 5;

			showModal({
				title: t(PROFILE_VIEWER_KEYS.revealConfirmTitle),
				children: <RevealConfirmContent cost={cost} isFree={canUnlockFree} />,
				hideCloseButton: true,
				primaryButton: {
					text: t(PROFILE_VIEWER_KEYS.revealConfirmButton),
					onClick: async () => {
						// 무료가 아닌 경우에만 잔액 체크
						if (!canUnlockFree && (gemData?.totalGem ?? 0) < cost) {
							// 부족 모달 표시
							showModal({
								title: t(PROFILE_VIEWER_KEYS.insufficientGemTitle),
								children: (
									<Text textColor="black" style={{ textAlign: 'center' }}>
										{t(PROFILE_VIEWER_KEYS.insufficientGemDescription, { cost })}
									</Text>
								),
								primaryButton: {
									text: t(PROFILE_VIEWER_KEYS.chargeGemButton),
									onClick: () => router.push('/purchase/gem-store'),
								},
								secondaryButton: {
									text: t(PROFILE_VIEWER_KEYS.cancelButton),
									onClick: () => {},
								},
							});
							return;
						}

						// API 호출
						await revealMutation.mutateAsync({ summaryId });
					},
				},
				secondaryButton: {
					text: t(PROFILE_VIEWER_KEYS.revealCancelButton),
					onClick: () => {},
				},
			});
		},
		[showModal, t, costData?.cost, gemData?.totalGem, revealMutation, router],
	);

	return {
		handleRevealWithConfirm,
		isLoading: revealMutation.isPending,
	};
};
