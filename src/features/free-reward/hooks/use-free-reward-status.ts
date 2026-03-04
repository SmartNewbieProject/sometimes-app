import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchFreeRewardStatus } from '../api';
import type { RewardKey } from '../types';

const FREE_REWARD_QUERY_KEY = ['free-reward', 'status'] as const;

export const useFreeRewardStatus = () => {
	const { isAuthorized } = useAuth();

	const query = useQuery({
		queryKey: FREE_REWARD_QUERY_KEY,
		queryFn: fetchFreeRewardStatus,
		enabled: isAuthorized,
		staleTime: Infinity,
	});

	const isRewardEligible = (key: RewardKey): boolean => {
		if (!query.data) return true; // API 실패 시 기존 동작 유지
		return query.data.rewards[key]?.eligible ?? true;
	};

	return {
		...query,
		isRewardEligible,
	};
};

export const useInvalidateFreeRewardStatus = () => {
	const queryClient = useQueryClient();

	return () => queryClient.invalidateQueries({ queryKey: FREE_REWARD_QUERY_KEY });
};
