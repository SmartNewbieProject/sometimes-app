import { useMatchLoading } from '@/src/features/idle-match-timer/hooks/use-match-loading';
import { useFeatureCost } from '@/src/features/payment/hooks';
import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { useCashableModal } from '@shared/hooks';
import { useMutation } from '@tanstack/react-query';
import { HttpStatusCode } from 'axios';
import { useTranslation } from 'react-i18next';
import { globalRematch } from '../apis';
import { globalMatchingKeys } from '../queries/keys';

export function useGlobalRematch() {
	const { showErrorModal } = useModal();
	const { show: showCashable } = useCashableModal();
	const { t } = useTranslation();
	const { onLoading, finishLoading, finishRematching } = useMatchLoading();
	const { featureCosts } = useFeatureCost();

	const mutation = useMutation({
		mutationFn: () => globalRematch(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: globalMatchingKeys.all });
			await queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
		},
	});

	const onGlobalRematch = async () => {
		await tryCatch(
			async () => {
				onLoading();
				await mutation.mutateAsync();
				finishLoading();
				finishRematching();
			},
			(err) => {
				finishLoading();
				finishRematching();

				if (err.status === HttpStatusCode.Forbidden) {
					showCashable({
						textContent: t('features.global-matching.rematch_charge'),
					});
					return;
				}

				if (err.success === false && err.errorCode === 'USER_NOT_FOUND') {
					showErrorModal(t('features.global-matching.rematch_no_match'), 'announcement');
					return;
				}

				showErrorModal(err.message || t('features.global-matching.rematch_error'), 'error');
			},
		);
	};

	return {
		onGlobalRematch,
		isRematchPending: mutation.isPending,
		rematchCost: featureCosts?.REMATCHING,
	};
}
