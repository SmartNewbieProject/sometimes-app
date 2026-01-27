import { useQuery } from '@tanstack/react-query';
import { getViewerCounts } from '../api';
import { PROFILE_VIEWER_KEYS } from './keys';

export const useViewerCounts = () => {
	return useQuery({
		queryKey: PROFILE_VIEWER_KEYS.counts(),
		queryFn: getViewerCounts,
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
};
