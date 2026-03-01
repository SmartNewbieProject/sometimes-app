import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateUniversityParams, createUniversity } from '../apis';

export function useCreateUniversityMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateUniversityParams) => createUniversity(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['universities'] });
			queryClient.invalidateQueries({ queryKey: ['univs'] });
		},
	});
}
