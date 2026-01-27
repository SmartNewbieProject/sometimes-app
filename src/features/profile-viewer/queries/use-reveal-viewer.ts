import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { revealViewer } from '../api';
import { revealErrorHandlers } from '../services';
import { PROFILE_VIEWER_KEYS } from './keys';

interface ApiErrorResponse {
	status?: number;
	error: string;
	statusCode?: number;
	message?: string;
}

export const useRevealViewer = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { showModal, showErrorModal } = useModal();

	return useMutation({
		mutationFn: ({ summaryId }: { summaryId: string }) => revealViewer(summaryId),
		onSuccess: (data) => {
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: PROFILE_VIEWER_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: PROFILE_VIEWER_KEYS.counts() });
			queryClient.invalidateQueries({ queryKey: PROFILE_VIEWER_KEYS.homeSummary() });
			queryClient.invalidateQueries({ queryKey: PROFILE_VIEWER_KEYS.cost() });

			// Invalidate gem balance
			queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
			queryClient.invalidateQueries({ queryKey: ['my'] });

			// If match created, invalidate matching queries
			if (data.matchId) {
				queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
			}
		},
		onError: (error: unknown) => {
			const apiError = error as ApiErrorResponse;
			const status = apiError?.status ?? apiError?.statusCode ?? 500;
			const handler = revealErrorHandlers[status] || revealErrorHandlers.default;
			handler.handle(apiError, { router, showModal, showErrorModal });
		},
	});
};
