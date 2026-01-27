import { useQuery } from '@tanstack/react-query';
import { getRevealCost } from '../api';
import { PROFILE_VIEWER_KEYS } from './keys';

export const useRevealCost = () => {
	return useQuery({
		queryKey: PROFILE_VIEWER_KEYS.cost(),
		queryFn: getRevealCost,
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
};
