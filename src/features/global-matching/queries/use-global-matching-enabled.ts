import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';
import { useQuery } from '@tanstack/react-query';
import { checkGlobalMatchingEnabled } from '../apis/feature-flags';

export const GLOBAL_MATCHING_ENABLED_KEY = ['global-matching', 'enabled'] as const;

export const useGlobalMatchingEnabled = () => {
	return useQuery<FeatureFlagResponse>({
		queryKey: GLOBAL_MATCHING_ENABLED_KEY,
		queryFn: checkGlobalMatchingEnabled,
		staleTime: 1000 * 60 * 5,
		select: (data) => ({
			...data,
			enabled: data.enabled,
		}),
	});
};
