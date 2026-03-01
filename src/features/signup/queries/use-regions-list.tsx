import { useQuery } from '@tanstack/react-query';
import { getRegionsList } from '../apis';

export function useRegionsListQuery() {
	return useQuery({
		queryKey: ['universities', 'regions', 'list'],
		queryFn: getRegionsList,
		staleTime: 1000 * 60 * 30,
	});
}
