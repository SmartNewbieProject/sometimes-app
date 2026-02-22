import { useQuery } from '@tanstack/react-query';
import { getGlobalMatchingStatus } from '../apis';
import type { GlobalMatchingStatus } from '../types';
import { globalMatchingKeys } from './keys';

export const useGlobalMatchingStatus = (refetchInterval?: number) => {
	return useQuery<GlobalMatchingStatus>({
		queryKey: globalMatchingKeys.status(),
		queryFn: getGlobalMatchingStatus,
		staleTime: 1000 * 60 * 5,
		refetchInterval: refetchInterval
			? (query) => (query.state.data?.profileTranslated ? false : refetchInterval)
			: false,
	});
};
