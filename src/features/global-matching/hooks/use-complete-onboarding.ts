import { queryClient } from '@/src/shared/config/query';
import { useMutation } from '@tanstack/react-query';
import { completeOnboarding } from '../apis';
import { globalMatchingKeys } from '../queries/keys';

export function useCompleteOnboarding() {
	return useMutation({
		mutationFn: (preferenceOptionIds?: string[]) =>
			completeOnboarding(preferenceOptionIds?.length ? { preferenceOptionIds } : undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: globalMatchingKeys.status() });
		},
	});
}
