import { useMatchLoading } from '@/src/features/idle-match-timer/hooks/use-match-loading';
import { useFeatureCost } from '@/src/features/payment/hooks';
import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { useCashableModal } from '@shared/hooks';
import { useMutation } from '@tanstack/react-query';
import { HttpStatusCode } from 'axios';
import { useTranslation } from 'react-i18next';
import { completeOnboarding, globalRematch } from '../apis';
import { globalMatchingKeys } from '../queries/keys';
import { useFirstGlobalMatch } from './use-first-global-match';

export function useGlobalRematch() {
	const { showErrorModal } = useModal();
	const { show: showCashable } = useCashableModal();
	const { t } = useTranslation();
	const { onLoading, finishLoading, finishRematching } = useMatchLoading();
	const { featureCosts } = useFeatureCost();
	const { isFirstGlobalMatch, completeFirstMatch } = useFirstGlobalMatch();

	const mutation = useMutation({
		mutationFn: async (preferenceOptionIds?: string[]) => {
			if (isFirstGlobalMatch) {
				await completeOnboarding(preferenceOptionIds?.length ? { preferenceOptionIds } : undefined);
			}
			await globalRematch();
		},
		onSuccess: async () => {
			completeFirstMatch();
			await queryClient.invalidateQueries({ queryKey: globalMatchingKeys.all });
			await queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
		},
	});

	const onGlobalRematch = async (preferenceOptionIds?: string[]) => {
		await tryCatch(
			async () => {
				onLoading();
				await mutation.mutateAsync(preferenceOptionIds);
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
