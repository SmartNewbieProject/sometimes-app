import { useQuery } from '@tanstack/react-query';
import { getHomeSummary } from '../api';
import { PROFILE_VIEWER_KEYS } from './keys';

export const useHomeSummary = () => {
	return useQuery({
		queryKey: PROFILE_VIEWER_KEYS.homeSummary(),
		queryFn: getHomeSummary,
		staleTime: 3 * 60 * 1000, // 3분 (BE 캐시 5분보다 짧게)
		gcTime: 10 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
		refetchIntervalInBackground: false,
	});
};
