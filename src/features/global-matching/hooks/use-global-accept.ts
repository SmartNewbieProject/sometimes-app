import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { globalAccept } from '../apis';

export function useGlobalAccept() {
	const { showErrorModal } = useModal();
	const { t } = useTranslation();

	const mutation = useMutation({
		mutationFn: (connectionId: string) => globalAccept(connectionId),
		onSuccess: async (_data, connectionId) => {
			mixpanelAdapter.track('Global_Accept', {
				target_profile_id: connectionId,
				timestamp: new Date().toISOString(),
			});
			await queryClient.invalidateQueries({ queryKey: ['liked', 'to-me'] });
			await queryClient.invalidateQueries({ queryKey: ['liked', 'of-me'] });
		},
		onError: () => {
			showErrorModal(t('features.global-matching.accept_error'), 'error');
		},
	});

	return {
		onGlobalAccept: mutation.mutateAsync,
		isAcceptPending: mutation.isPending,
	};
}
