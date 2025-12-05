import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { getLIkedMe } from "../api";
import { AMPLITUDE_KPI_EVENTS } from "@/src/shared/constants/amplitude-kpi-events";
import type { LikedMe } from "../type/like";

function useLikedMeQuery() {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<LikedMe[] | null>(null);

  const { data, ...props } = useQuery({
    queryKey: ["liked", "to-me"],
    queryFn: getLIkedMe,
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
      const amplitude = (global as any).amplitude || {
        track: (event: string, properties: any) => {
          console.log("Amplitude Event:", event, properties);
        },
      };

      newLikes.forEach((like) => {
        amplitude.track(AMPLITUDE_KPI_EVENTS.LIKE_RECEIVED, {
          source_profile_id: like.connectionId,
          timestamp: new Date().toISOString(),
        });
      });
    }

    previousDataRef.current = data;
  }, [data]);

  return { data, ...props };
}

const styles = StyleSheet.create({});

export default useLikedMeQuery;
