import { useQuery } from '@tanstack/react-query';
import apis from '../apis';

export function useUnivQuery() {
	return useQuery({
		queryKey: ['univs'],
		queryFn: apis.getUnivs,
	});
}
