import { useQuery } from '@tanstack/react-query';
import { getViewersList } from '../api';
import type { GetViewersParams } from '../type';
import { PROFILE_VIEWER_KEYS } from './keys';

export const useViewerList = (params?: GetViewersParams) => {
	return useQuery({
		queryKey: PROFILE_VIEWER_KEYS.list(params),
		queryFn: () => getViewersList(params),
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
