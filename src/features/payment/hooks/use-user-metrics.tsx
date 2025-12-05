import { useQuery } from '@tanstack/react-query';
import paymentApis from '../api';

export const userMetricsKeys = {
	all: ['user-metrics'] as const,
	current: () => [...userMetricsKeys.all, 'current'] as const,
};

export const useUserMetrics = (enabled: boolean = true) => {
	return useQuery({
		queryKey: userMetricsKeys.current(),
		queryFn: paymentApis.getUserMetrics,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
};
