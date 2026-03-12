import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../apis';

export const useUnreadCount = () => {
	return useQuery({
		queryKey: ['notifications', 'unread-count'],
		queryFn: getUnreadCount,
		staleTime: 1000 * 30,
		gcTime: 1000 * 60 * 5,
		refetchOnMount: false,
		refetchOnWindowFocus: true,
	});
};
