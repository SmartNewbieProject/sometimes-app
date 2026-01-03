import { useQuery } from '@tanstack/react-query';
import { likeLetterApi } from '../api';

export const useLetterPrompts = (connectionId: string) => {
	return useQuery({
		queryKey: ['letter-prompts', connectionId],
		queryFn: () => likeLetterApi.getLetterPermission(connectionId),
		enabled: !!connectionId,
		staleTime: 1000 * 60 * 5,
	});
};
