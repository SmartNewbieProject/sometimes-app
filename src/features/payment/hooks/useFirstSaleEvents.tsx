import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useEffect, useState } from "react";

export const useFirstSaleEvents = () => {
  const { event: event16, eventExpired: eventExpired16, eventOverParticipated: eventOverParticipated16, participate: participateFirstSale16 } = useEventControl({ type: EventType.FIRST_SALE_16 });

  const event16Expired = eventOverParticipated16 || eventExpired16;

  const shouldShow = event16 ? !event16Expired : false;
  const [show, setShow] = useState(shouldShow);

  const totalExpiredAt = event16?.expiredAt ?? null;

  useEffect(() => {
    if (!event16) {
      setShow(false);
      return;
    }
    const newShow = !event16Expired;
    setShow(newShow);
  }, [event16, event16Expired]);


  return {
    event16: event16 ?? null,
    event16Expired: event16Expired ?? true,
    eventOverParticipated16: eventOverParticipated16 ?? false,
    participateFirstSale16,
    show,
    setShow,
    totalExpiredAt,
  };
};
