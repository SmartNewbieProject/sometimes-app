import { useQuery } from '@tanstack/react-query';
import { getNextMatchingDate } from '../apis';

export const useNextMatchingDate = () =>
	useQuery({
		queryKey: ['next-matching-date'],
		queryFn: getNextMatchingDate,
	});
