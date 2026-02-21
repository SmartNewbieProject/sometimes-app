import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { globalReject } from '../apis';

export function useGlobalReject() {
	const { showErrorModal } = useModal();
	const { t } = useTranslation();

	const mutation = useMutation({
		mutationFn: (connectionId: string) => globalReject(connectionId),
		onSuccess: async (_data, connectionId) => {
			mixpanelAdapter.track('Global_Reject', {
				target_profile_id: connectionId,
				timestamp: new Date().toISOString(),
			});
			await queryClient.invalidateQueries({ queryKey: ['liked', 'to-me'] });
		},
		onError: () => {
			showErrorModal(t('features.global-matching.reject_error'), 'error');
		},
	});

	return {
		onGlobalReject: mutation.mutateAsync,
		isRejectPending: mutation.isPending,
	};
}
