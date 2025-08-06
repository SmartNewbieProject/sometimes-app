import {useMutation, useQuery} from "@tanstack/react-query";
import type { EventType } from '../types';
import {getEventByType, participateEvent} from "@features/event/api";

type UseEventOptions = {
  type: EventType;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEventControl = ({ type, onError, onSuccess }: UseEventOptions) => {
  const { data: event, refetch } = useQuery({
    queryKey: ['event', type],
    queryFn: () => getEventByType(type),
  });
  const { mutateAsync } = useMutation({
    mutationFn: () => participateEvent(type),
    onSuccess: () => {
      refetch();
      onSuccess?.();
    },
    onError,
  });

  return { event, participate: mutateAsync };
};
