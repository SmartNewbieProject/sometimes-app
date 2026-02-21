import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { devLogWithTag } from '@/src/shared/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { getGlobalMatching } from '../apis';
import { globalMatchingKeys } from './keys';

export const useGlobalMatching = () => {
	const lastMatchIdRef = useRef<string | null>(null);
	const { matchingEvents } = useMixpanel();

	const {
		data: match,
		status,
		fetchStatus,
		...queryProps
	} = useSuspenseQuery({
		queryKey: globalMatchingKeys.matching(),
		queryFn: getGlobalMatching,
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 60 * 1000,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	if (match?.connectionId && match.connectionId !== lastMatchIdRef.current) {
		lastMatchIdRef.current = match.connectionId;

		const timeToMatch = match.matchedAt ? Date.now() - new Date(match.matchedAt).getTime() : 0;

		matchingEvents.trackMatchingSuccess(match.connectionId, timeToMatch);
	}

	devLogWithTag('Query', 'Global Match status:', {
		matchId: match?.id,
		connectionId: match?.connectionId,
		type: match?.type,
		status,
		fetchStatus,
		isError: queryProps.isError,
	});

	return { match, status, fetchStatus, ...queryProps };
};
