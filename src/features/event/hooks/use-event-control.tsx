import {useMutation, useQuery} from "@tanstack/react-query";
import type { EventType } from '../types';
import {getEventByType, participateEvent} from "@features/event/api";
import { useMemo } from "react";
import { getRemainingSeconds } from "@/src/shared/hooks";
import dayUtils from "@/src/shared/libs/day";

type UseEventOptions = {
  type: EventType;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEventControl = ({ type, onError, onSuccess }: UseEventOptions) => {
  const { data: event, refetch } = useQuery({
    queryKey: ['event', type],
    queryFn: () => getEventByType(type),
    gcTime: 0,
    staleTime: 0,
  });
  const { mutateAsync } = useMutation({
    mutationFn: () => participateEvent(type),
    onSuccess: () => {
      refetch();
      onSuccess?.();
    },
    onError,
  });

  const eventExpired = useMemo(() => { // 이벤트 만료
    if (!event) return false;
    return dayUtils.create(event.expiredAt).isBefore(dayUtils.create());
  }, [event]);

  const eventOverParticipated = (() => { // 이벤트 참여횟수 초과
    if (!event) return false;
    return event.currentAttempt >= event.maxAttempt;
  })();

  const remainingSeconds = useMemo(() => {
    if (!event) return 0;
    return getRemainingSeconds(event.expiredAt);
  }, [event]);

  return { event, participate: mutateAsync, eventExpired, eventOverParticipated, refetch, remainingSeconds };
};
