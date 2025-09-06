export enum EventType {
  FIRST_SALE = 'FIRST_SALE',
  FIRST_SALE_7 = 'FIRST_SALE_7',
  FIRST_SALE_16 = 'FIRST_SALE_16',
  FIRST_SALE_27 = 'FIRST_SALE_27',
}

export type EventDetails = {
  eventType: EventType;
  expiredAt: string;
  currentAttempt: number;
  maxAttempt: number;
}
