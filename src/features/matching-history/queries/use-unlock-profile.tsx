import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { getPreviewHistory, postUnlockProfile } from '../apis';
import type { PreviewMatchingHistory } from '../type';
import { useCashableModal } from '@shared/hooks';
import { useTranslation } from 'react-i18next';

export const useUnlockProfile = (matchId: string) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { showErrorModal, showModal } = useModal();
	const { show } = useCashableModal();
	const { t } = useTranslation();

	return useMutation({
		mutationFn: () => postUnlockProfile(matchId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['matching-history-list'] });
			queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });

			router.push({
				pathname: '/partner/view/[id]',
				params: { id: matchId, redirectTo: encodeURIComponent('/matching-history') },
			});
		},
		onError: (err: { message?: string; errorCode?: string; status?: number }) => {
			console.log('err', err);

			const isInsufficientGems =
				err.message?.includes(t('common.재화가_부족')) ||
				err.message?.includes(t('common.구슬이_부족')) ||
				err.message?.includes('insufficient');

			if (isInsufficientGems) {
				show({
					textContent: t(
						'features.matching-history.ui.matching_history_card.messages.modal_recharge_prompt',
					),
				});
				return;
			}

			showErrorModal(err.message || t('common.오류가_발생했어요'), 'error');
			return;
		},
	});
};
