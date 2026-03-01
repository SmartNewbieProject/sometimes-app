import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateDepartmentParams, createDepartment } from '../apis';

export function useCreateDepartmentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateDepartmentParams) => createDepartment(params),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['departments', variables.universityId],
			});
		},
	});
}
