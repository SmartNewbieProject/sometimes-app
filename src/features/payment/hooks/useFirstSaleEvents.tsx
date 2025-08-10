import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useEffect, useState } from "react";

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

  const shouldShow = event6 && event20 && event40 ? (!event6Expired || !event20Expired || !event40Expied) : false;
  const [show, setShow] = useState(shouldShow);

  const totalExpiredAt = event6?.expiredAt;

  useEffect(() => {
    console.log('useFirstSaleEvents', event6Expired, event20Expired, event40Expied);
    const newShow = event6 && event20 && event40 ? (!event6Expired || !event20Expired || !event40Expied) : false;
    setShow(newShow);
  }, [event6, event20, event40, event6Expired, event20Expired, event40Expied]);


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
    setShow,
    totalExpiredAt,
  };
};
