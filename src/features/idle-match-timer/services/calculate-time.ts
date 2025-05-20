import { dayUtils } from '@/src/shared/libs';
import type { Dayjs } from 'dayjs';

export interface TimeResult {
  delimeter: 'D' | 'H' | 'M' | 'S';
  value: number;
  shouldTriggerCallback?: boolean;
}

export function calculateTime(nextMatchingDate: Dayjs | null, now: Dayjs): TimeResult {

  if (!nextMatchingDate) {
    return {
      delimeter: 'D',
      value: 0,
      shouldTriggerCallback: false,
    }
  }

  const hours = nextMatchingDate.diff(now, 'hour');
  const minutes = nextMatchingDate.diff(now, 'minute');
  const seconds = nextMatchingDate.diff(now, 'second');
  const dayDiff = nextMatchingDate.diff(now, 'day');

  if (dayDiff > 0) {
    return {
      delimeter: 'D',
      value: dayDiff,
      shouldTriggerCallback: false,
    }
  }

  if (hours > 0) {
    return {
      delimeter: 'H',
      value: hours,
      shouldTriggerCallback: false,
    }
  }

  if (minutes > 0) {
    return {
      delimeter: 'M',
      value: minutes,
      shouldTriggerCallback: false,
    }
  }

  const shouldTriggerCallback = seconds <= 0;
  console.table({ shouldTriggerCallback });

  return {
    delimeter: 'S',
    value: seconds,
    shouldTriggerCallback,
  }
}
