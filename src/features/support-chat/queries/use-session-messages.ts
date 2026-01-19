import { useQuery } from '@tanstack/react-query';
import { getSessionMessages } from '../apis';

export const useSessionMessages = (sessionId: string | undefined) => {
	return useQuery({
		queryKey: ['support-chat', 'sessions', sessionId, 'messages'],
		queryFn: () => {
			if (!sessionId) {
				throw new Error('sessionId is required');
			}
			return getSessionMessages(sessionId);
		},
		enabled: !!sessionId,
	});
};
