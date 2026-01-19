import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession } from '../apis';
import type { CreateSessionRequest } from '../types';

export const useCreateSession = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data?: CreateSessionRequest) => createSession(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-chat', 'sessions'] });
		},
	});
};
