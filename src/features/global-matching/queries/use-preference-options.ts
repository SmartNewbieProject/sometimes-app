import { useQuery } from '@tanstack/react-query';
import { getGlobalPreferenceOptions } from '../apis';
import type { GlobalPreferenceCategory } from '../types';
import { globalMatchingKeys } from './keys';

export const useGlobalPreferenceOptions = () => {
	return useQuery<GlobalPreferenceCategory[]>({
		queryKey: globalMatchingKeys.preferenceOptions(),
		queryFn: getGlobalPreferenceOptions,
		staleTime: 1000 * 60 * 30,
	});
};
