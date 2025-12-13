import { dayUtils } from '@/src/shared/libs';
import type { Dayjs } from 'dayjs';

export interface TimeResult {
  delimeter: 'D' | 'H' | 'M' | 'S';
  value: number;
  shouldTriggerCallback?: boolean;
}

export function calculateTime(nextMatchingDate: Dayjs | string | null, now: Dayjs): TimeResult {

  if (!nextMatchingDate) {
    return {
      delimeter: 'D',
      value: 0,
      shouldTriggerCallback: false,
    }
  }

  const targetDate = typeof nextMatchingDate === 'string'
    ? dayUtils.create(nextMatchingDate)
    : nextMatchingDate;

  const hours = targetDate.diff(now, 'hour');
  const minutes = targetDate.diff(now, 'minute');
  const seconds = targetDate.diff(now, 'second');
  const dayDiff = targetDate.startOf('day').diff(now.startOf('day'), 'day');

  if (seconds <= 0) {
    return {
      delimeter: 'S',
      value: 0,
      shouldTriggerCallback: true,
    }
  }

  if (dayDiff > 0) {
    return {
      delimeter: 'D',
      value: Math.max(0, dayDiff), // 0보다 작을 경우 0으로 리턴
      shouldTriggerCallback: false,
    }
  }

  if (hours > 0) {
    return {
      delimeter: 'H',
      value: Math.max(0, hours), // 0보다 작을 경우 0으로 리턴
      shouldTriggerCallback: false,
    }
  }

  if (minutes > 0) {
    return {
      delimeter: 'M',
      value: Math.max(0, minutes), // 0보다 작을 경우 0으로 리턴
      shouldTriggerCallback: false,
    }
  }

  return {
    delimeter: 'S',
    value: Math.max(0, seconds), // 0보다 작을 경우 0으로 리턴
    shouldTriggerCallback: false,
  }
}
