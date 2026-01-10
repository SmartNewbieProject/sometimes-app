import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateInstagramIdRequest, updateInstagramId } from '../apis';

export function useUpdateInstagramId() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: UpdateInstagramIdRequest) => updateInstagramId(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['gem-mission', 'instagram-registration'] });
		},
	});
}
