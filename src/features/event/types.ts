export enum EventType {
  FIRST_SALE = 'FIRST_SALE',
}

export type EventDetails = {
  eventType: EventType;
  expiredAt: string;
  currentAttempt: number;
  maxAttempt: number;
}
