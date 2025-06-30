import apis from '@/src/features/mypage/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMbti() {
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['mbti'],
		queryFn: apis.getMbti,
	});

	const mutation = useMutation({
		mutationFn: apis.updateMbti,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mbti'] });
			refetch();
		},
	});

	return {
		mbti: data?.mbti ?? null,
		isLoading,
		isError,
		updateMbti: mutation.mutate,
		isUpdating: mutation.isPending,
		updateError: mutation.isError,
	};
}
