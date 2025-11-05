import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getNotifications, NotificationListResponse } from '../apis';

export const useNotificationList = (params?: {
  isRead?: boolean;
  type?: 'general' | 'reward';
}) => {
  return useInfiniteQuery({
    queryKey: ['notifications', params],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({
        ...params,
        page: pageParam,
        limit: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const useNotificationListSimple = (params?: {
  page?: number;
  isRead?: boolean;
  type?: 'general' | 'reward';
}) => {
  return useQuery({
    queryKey: ['notifications', 'simple', params],
    queryFn: () => getNotifications({
      ...params,
      limit: 20,
    }),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 60,
  });
};