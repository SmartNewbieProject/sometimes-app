import { useQuery } from '@tanstack/react-query';
import { getMyDetails } from '../apis';

export const useMyDetailsQuery = (enabled: boolean) => {
	const { data, ...props } = useQuery({
		queryKey: ['my-details'],
		queryFn: getMyDetails,
		enabled,
	});
	return { my: data, ...props };
};
