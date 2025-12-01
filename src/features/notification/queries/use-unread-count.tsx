import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../apis';

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    staleTime: 0,
    gcTime: 1000 * 60 * 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};