import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useEffect, useState } from "react";

export const useFirstSaleEvents = () => {
  const { event: event10, eventExpired: eventExpired10, eventOverParticipated: eventOverParticipated10, participate: participateFirstSale10 } = useEventControl({ type: EventType.FIRST_SALE_10 });

  const event10Expired = eventOverParticipated10 || eventExpired10;

  const shouldShow = event10 ? !event10Expired : false;
  const [show, setShow] = useState(shouldShow);

  const totalExpiredAt = event10?.expiredAt ?? null;

  useEffect(() => {
    if (!event10) {
      setShow(false);
      return;
    }
    const newShow = !event10Expired;
    setShow(newShow);
  }, [event10, event10Expired]);


  return {
    event10: event10 ?? null,
    event10Expired: event10Expired ?? true,
    eventOverParticipated10: eventOverParticipated10 ?? false,
    participateFirstSale10,
    show,
    setShow,
    totalExpiredAt,
  };
};
