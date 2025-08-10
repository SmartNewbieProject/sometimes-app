import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";

export const useFirstSaleEvents = () => {
  const { event: event6, eventExpired: eventExpired6, eventOverParticipated: eventOverParticipated6, participate: participateFirstSale6 } = useEventControl({ type: EventType.FIRST_SALE_6 });
  const { event: event20, eventExpired: eventExpired20, eventOverParticipated: eventOverParticipated20, participate: participateFirstSale20 } = useEventControl({ type: EventType.FIRST_SALE_20 });
  const { event: event40, eventExpired: eventExpired40, eventOverParticipated: eventOverParticipated40, participate: participateFirstSale40 } = useEventControl({ type: EventType.FIRST_SALE_40 });

  const [event6Expired, event20Expired, event40Expied] = (() => {
    const event6Expired = eventOverParticipated6 || eventExpired6;
    const event20Expired = eventOverParticipated20 || eventExpired20;
    const event40Expied = eventOverParticipated40 || eventExpired40;
    return [event6Expired, event20Expired, event40Expied];
  })();

  const show = !event6Expired || !event20Expired || !event40Expied;

  const totalExpiredAt = event6?.expiredAt;

  return {
    event6,
    event6Expired,
    eventOverParticipated6,
    participateFirstSale6,
    event20,
    event20Expired,
    eventOverParticipated20,
    participateFirstSale20,
    event40, 
    event40Expied,
    eventOverParticipated40,
    participateFirstSale40,
    show,
    totalExpiredAt,
  };
};
