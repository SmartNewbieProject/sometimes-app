import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { getLIkedMe } from "../api";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";
import type { LikedMe } from "../type/like";

function useLikedMeQuery(hasLetter?: boolean) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<LikedMe[] | null>(null);

  const { data, ...props } = useQuery({
    queryKey: ["liked", "to-me", { hasLetter }],
    queryFn: () => getLIkedMe(hasLetter),
    refetchInterval: 1 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!data) return;

    const previousIds = new Set(
      previousDataRef.current?.map((item) => item.connectionId) || []
    );

    const newLikes = data.filter(
      (item) => !previousIds.has(item.connectionId)
    );

    if (newLikes.length > 0 && previousDataRef.current !== null) {

      newLikes.forEach((like) => {
        mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_RECEIVED, {
          source_profile_id: like.connectionId,
          timestamp: new Date().toISOString(),
          tracking_source: 'client_polling', // 클라이언트 polling 구분
        });
      });
    }

    previousDataRef.current = data;
  }, [data]);

  return { data, ...props };
}

const styles = StyleSheet.create({});

export default useLikedMeQuery;
