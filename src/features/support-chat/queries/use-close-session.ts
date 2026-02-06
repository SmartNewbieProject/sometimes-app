import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeSession } from '../apis';
import type { CloseSessionRequest } from '../types';

interface UseCloseSessionParams {
	sessionId: string;
	data?: CloseSessionRequest;
}

export const useCloseSession = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ sessionId, data }: UseCloseSessionParams) => closeSession(sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-chat', 'sessions'] });
		},
	});
};
