import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getMyInviteStats } from '../api';
import type { InviteStatsQuery } from '../types';

const STALE_TIME = 5 * 60 * 1000; // 5분

interface UseInviteStatsOptions extends InviteStatsQuery {
	enabled?: boolean;
}

export function useInviteStats(options?: UseInviteStatsOptions) {
	const { accessToken } = useAuth();
	const { enabled = true, ...queryOptions } = options || {};

	const query = useQuery({
		queryKey: ['invite-stats', queryOptions],
		queryFn: () => getMyInviteStats(queryOptions),
		enabled: !!accessToken && enabled,
		staleTime: STALE_TIME,
		retry: (failureCount) => !!accessToken && failureCount < 3,
	});

	return {
		stats: query.data,
		summary: query.data?.summary,
		dailyStats: query.data?.dailyStats,
		convertedUsers: query.data?.convertedUsers,
		inviteCode: query.data?.inviteCode,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
