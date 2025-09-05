import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { useEffect, useState } from "react";

export const useFirstSaleEvents = () => {
  const {
    event: event7,
    eventExpired: eventExpired7,
    eventOverParticipated: eventOverParticipated7,
    participate: participateFirstSale7,
  } = useEventControl({ type: EventType.FIRST_SALE_7 });
  const {
    event: event16,
    eventExpired: eventExpired16,
    eventOverParticipated: eventOverParticipated16,
    participate: participateFirstSale16,
  } = useEventControl({ type: EventType.FIRST_SALE_16 });
  const {
    event: event27,
    eventExpired: eventExpired27,
    eventOverParticipated: eventOverParticipated27,
    participate: participateFirstSale27,
  } = useEventControl({ type: EventType.FIRST_SALE_27 });

  const [event7Expired, event16Expired, event27Expied] = (() => {
    const event7Expired = eventOverParticipated7 || eventExpired7;
    const event16Expired = eventOverParticipated16 || eventExpired16;
    const event27Expied = eventOverParticipated27 || eventExpired27;
    return [event7Expired, event16Expired, event27Expied];
  })();

  const shouldShow =
    event7 && event16 && event27
      ? !event7Expired || !event16Expired || !event27Expied
      : false;
  const [show, setShow] = useState(shouldShow);

  const totalExpiredAt = event7?.expiredAt;

  useEffect(() => {
    console.log(
      "useFirstSaleEvents",
      event7Expired,
      event16Expired,
      event27Expied
    );
    const newShow =
      event7 && event16 && event27
        ? !event7Expired || !event16Expired || !event27Expied
        : false;
    setShow(newShow);
  }, [event7, event16, event27, event7Expired, event16Expired, event27Expied]);

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
    event27Expied,
    eventOverParticipated27,
    participateFirstSale27,
    show,
    setShow,
    totalExpiredAt,
  };
};
