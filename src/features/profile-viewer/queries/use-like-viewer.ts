import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { likeViewer } from '../api';
import { likeErrorHandlers } from '../services';
import type { LikeViewerRequest } from '../type';
import { PROFILE_VIEWER_KEYS } from './keys';

interface ApiErrorResponse {
	status?: number;
	error: string;
	statusCode?: number;
	message?: string;
}

export const useLikeViewer = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { showModal, showErrorModal } = useModal();

	return useMutation({
		mutationFn: ({
			summaryId,
			request,
		}: {
			summaryId: string;
			request?: LikeViewerRequest;
		}) => likeViewer(summaryId, request),
		onSuccess: () => {
			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: PROFILE_VIEWER_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: ['liked', 'to-me'] });
			queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
			queryClient.invalidateQueries({ queryKey: ['my'] });
		},
		onError: (error: unknown) => {
			const apiError = error as ApiErrorResponse;
			const status = apiError?.status ?? apiError?.statusCode ?? 500;
			const handler = likeErrorHandlers[status] || likeErrorHandlers.default;
			handler.handle(apiError, { router, showModal, showErrorModal });
		},
	});
};
