import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../apis';

export const useDepartmentQuery = (univ?: string) =>
	useQuery({
		queryKey: ['departments', univ],
		queryFn: () => getDepartments(univ as string),
		enabled: !!univ,
	});
