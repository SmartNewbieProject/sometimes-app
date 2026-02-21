import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useCashableModal } from '@shared/hooks';
import { useMutation } from '@tanstack/react-query';
import { HttpStatusCode } from 'axios';
import { useTranslation } from 'react-i18next';
import { globalLike } from '../apis';
import { globalMatchingKeys } from '../queries/keys';

const useGlobalLikeMutation = () =>
	useMutation({
		mutationFn: ({ connectionId, letter }: { connectionId: string; letter?: string }) =>
			globalLike(connectionId, letter),
		onSuccess: async (_data, variables) => {
			mixpanelAdapter.track('Global_Like_Sent', {
				target_profile_id: variables.connectionId,
				has_letter: !!variables.letter,
				timestamp: new Date().toISOString(),
			});
			await queryClient.invalidateQueries({ queryKey: globalMatchingKeys.all });
			await queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
			await queryClient.invalidateQueries({ queryKey: ['liked', 'of-me'] });
		},
	});

export function useGlobalLike() {
	const { showErrorModal, showModal } = useModal();
	const { show: showCashable } = useCashableModal();
	const { t } = useTranslation();
	const { mutateAsync: like, isPending: isLikePending } = useGlobalLikeMutation();

	const onGlobalLike = async (connectionId: string, letter?: string) => {
		await tryCatch(
			async () => {
				await like({ connectionId, letter });

				showModal({
					showLogo: true,
					showParticle: true,
					title: t('features.global-matching.like_success'),
					primaryButton: {
						text: t('features.global-matching.confirm'),
						onClick: () => {},
					},
				});
			},
			(err) => {
				if (err.status === HttpStatusCode.Forbidden) {
					showCashable({
						textContent: t('features.like.hooks.use-like.charge_message'),
					});
					return;
				}
				if (err.status === HttpStatusCode.Conflict) {
					showErrorModal(t('features.like.hooks.use-like.duplicate_like'), 'announcement');
					return;
				}
				if (err.status === HttpStatusCode.NotFound) {
					showErrorModal(t('features.global-matching.match_expired'), 'announcement');
					return;
				}
				showErrorModal(err.error ?? err.message ?? 'Unknown error', 'error');
			},
		);
	};

	return { onGlobalLike, isLikePending };
}
