import { useSuspenseQuery } from "@tanstack/react-query";
import { getLatestMatchingV2 } from "../apis";
import { useRef } from "react";
import { devLogWithTag } from "@/src/shared/utils";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";

export const useLatestMatching = () => {
  const lastMatchIdRef = useRef<string | null>(null);
  const { matchingEvents } = useMixpanel();

  const { data: match, status, fetchStatus, ...queryProps } = useSuspenseQuery({
    queryKey: ["latest-matching-v2"],
    queryFn: getLatestMatchingV2,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 새로운 매칭 성공 감지 및 이벤트 발생
  if (match?.connectionId && match.connectionId !== lastMatchIdRef.current) {
    lastMatchIdRef.current = match.connectionId;

    const timeToMatch = match.matchedAt
      ? Date.now() - new Date(match.matchedAt).getTime()
      : 0;

    // useMixpanel 훅 사용 (User Properties 자동 업데이트 포함)
    matchingEvents.trackMatchingSuccess(match.connectionId, timeToMatch);
  }

  devLogWithTag('Query', 'Match status:', {
    matchId: match?.id,
    connectionId: match?.connectionId,
    type: match?.type,
    status,
    fetchStatus,
    isError: queryProps.isError,
  });

  return { match, status, fetchStatus, ...queryProps };
};
