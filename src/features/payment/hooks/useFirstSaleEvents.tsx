import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useEffect, useState } from "react";

export const useFirstSaleEvents = () => {
  const { event: event7, eventExpired: eventExpired7, eventOverParticipated: eventOverParticipated7, participate: participateFirstSale7 } = useEventControl({ type: EventType.FIRST_SALE_7 });
  const { event: event16, eventExpired: eventExpired16, eventOverParticipated: eventOverParticipated16, participate: participateFirstSale16 } = useEventControl({ type: EventType.FIRST_SALE_16 });
  const { event: event27, eventExpired: eventExpired27, eventOverParticipated: eventOverParticipated27, participate: participateFirstSale27 } = useEventControl({ type: EventType.FIRST_SALE_27 });

  const [event7Expired, event16Expired, event27Expired] = (() => {
    const event7Expired = eventOverParticipated7 || eventExpired7;
    const event16Expired = eventOverParticipated16 || eventExpired16;
    const event27Expired = eventOverParticipated27 || eventExpired27;
    return [event7Expired, event16Expired, event27Expired];
  })();

  const shouldShow = event7 && event16 && event27 ? (!event7Expired || !event16Expired || !event27Expired) : false;
  const [show, setShow] = useState(shouldShow);

  const totalExpiredAt = event7?.expiredAt;

  useEffect(() => {
    const newShow = event7 && event16 && event27 ? (!event7Expired || !event16Expired || !event27Expired) : false;
    setShow(newShow);
  }, [event7, event16, event27, event7Expired, event16Expired, event27Expired]);


  return {
    event7,
    event7Expired,
    eventOverParticipated7,
    participateFirstSale7,
    event16,
    event16Expired,
    eventOverParticipated16,
    participateFirstSale16,
    event27, 
    event27Expired,
    eventOverParticipated27,
    participateFirstSale27,
    show,
    setShow,
    totalExpiredAt,

    // 이전버전 호환 (deprecated)
    event6Expired: event7Expired,
    event20Expired: event16Expired,
    event40Expired: event27Expired,
  };
};
