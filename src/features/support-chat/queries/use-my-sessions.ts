import { useQuery } from '@tanstack/react-query';
import { getMySessions } from '../apis';

export const useMySessions = () => {
	return useQuery({
		queryKey: ['support-chat', 'sessions', 'me'],
		queryFn: getMySessions,
	});
};
