export enum EventType {
  FIRST_SALE = 'FIRST_SALE',
  FIRST_SALE_6 = 'FIRST_SALE_6',
  FIRST_SALE_20 = 'FIRST_SALE_20',
  FIRST_SALE_40 = 'FIRST_SALE_40',
}

export type EventDetails = {
  eventType: EventType;
  expiredAt: string;
  currentAttempt: number;
  maxAttempt: number;
}
