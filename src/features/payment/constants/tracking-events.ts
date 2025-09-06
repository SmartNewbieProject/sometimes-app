export const TRACKING_EVENTS = {
  GEM_STORE_FIRST_SALE_7: 'GemStore_FirstSale_7',
  GEM_STORE_FIRST_SALE_16: 'GemStore_FirstSale_16',
  GEM_STORE_FIRST_SALE_27: 'GemStore_FirstSale_27',
} as const;

export type TrackingEventKeys = keyof typeof TRACKING_EVENTS;
export type TrackingEventValues = typeof TRACKING_EVENTS[TrackingEventKeys];