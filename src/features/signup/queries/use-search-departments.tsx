import { useQuery } from '@tanstack/react-query';
import { searchDepartments } from '../apis';

export function useSearchDepartmentsQuery(keyword: string) {
	return useQuery({
		queryKey: ['departments', 'search', keyword],
		queryFn: () => searchDepartments(keyword),
		enabled: keyword.trim().length > 0,
		staleTime: 1000 * 60 * 2,
	});
}
