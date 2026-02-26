import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { devLogWithTag } from '@/src/shared/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useDevScenario } from '../__dev__/use-dev-scenario';
import { getLatestMatchingV2 } from '../apis';
import { getLatestMatchingV31 } from '../apis/get-matching-v31';
import type { MatchComposite } from '../types-v31';

export const useLatestMatchingV31 = () => {
	const lastMatchIdRef = useRef<string | null>(null);
	const { matchingEvents } = useMixpanel();
	const getMockData = useDevScenario((s) => s.getMockData);

	const { data, status, fetchStatus, ...queryProps } = useSuspenseQuery<MatchComposite>({
		queryKey: ['latest-matching-v31'],
		queryFn: async () => {
			// __DEV__ mock 시나리오 활성화 시 API 호출 스킵
			const mock = getMockData();
			if (mock) {
				devLogWithTag('Query', '[DEV] Using mock scenario');
				return mock;
			}

			try {
				return await getLatestMatchingV31();
			} catch (v3Error) {
				devLogWithTag('Query', 'V3.1 failed, falling back to V2', v3Error);
				try {
					const v2Result = await getLatestMatchingV2();
					return { primary: v2Result };
				} catch (v2Error) {
					devLogWithTag('Query', 'V2 also failed, both APIs unavailable', v2Error);
					throw v2Error;
				}
			}
		},
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 60 * 1000,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	const { primary, secondary } = data;

	if (primary?.connectionId && primary.connectionId !== lastMatchIdRef.current) {
		lastMatchIdRef.current = primary.connectionId;

		const timeToMatch = primary.matchedAt ? Date.now() - new Date(primary.matchedAt).getTime() : 0;

		matchingEvents.trackMatchingSuccess(primary.connectionId, timeToMatch);
	}

	devLogWithTag('Query', 'Match V3.1 status:', {
		primaryId: primary?.id,
		primaryType: primary?.type,
		primaryCategory: primary?.category,
		hasSecondary: !!secondary,
		status,
		fetchStatus,
	});

	return { primary, secondary, status, fetchStatus, ...queryProps };
};
