import { useSuspenseQuery } from "@tanstack/react-query";
import { getLatestMatchingV2 } from "../apis";
import { useRef } from "react";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";
import { devLogWithTag } from "@/src/shared/utils";

export const useLatestMatching = () => {
  const lastMatchIdRef = useRef<string | null>(null);

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

    // KPI 이벤트: 매칭 성공
    const timeToMatch = match.matchedAt
      ? Date.now() - new Date(match.matchedAt).getTime()
      : 0;

    mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_SUCCESS, {
      matched_profile_id: match.connectionId,
      time_to_match: timeToMatch,
      timestamp: Date.now(),
      env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'production',
    });

    // User Properties 자동 업데이트
    mixpanelAdapter.setUserProperties({
      $add: { total_matches: 1 },
      last_match_date: new Date().toISOString(),
    });
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
