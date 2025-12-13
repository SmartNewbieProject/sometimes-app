import { useQuery } from "@tanstack/react-query";
import { getLatestMatchingV2 } from "../apis";
import { useRef } from "react";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { AMPLITUDE_KPI_EVENTS } from "@/src/shared/constants/amplitude-kpi-events";

export const useLatestMatching = () => {
  const lastMatchIdRef = useRef<string | null>(null);

  const { data: match, status, fetchStatus, ...queryProps } = useQuery({
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

    mixpanelAdapter.track(AMPLITUDE_KPI_EVENTS.MATCHING_SUCCESS, {
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

  const isPending = status === "pending";
  const isFetchingData = fetchStatus === "fetching";

  console.log('🔍 [Query] Match data updated:', {
    match,
    status,
    fetchStatus,
    isPending,
    isFetchingData,
    isError: queryProps.isError,
  });

  return { match, status, fetchStatus, isPending, isFetchingData, ...queryProps };
};
