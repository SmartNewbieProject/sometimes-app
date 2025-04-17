import { Dayjs } from 'dayjs';

interface TimeResult {
  delimeter: 'D' | 'H' | 'M' | 'S';
  value: number;
  shouldTriggerCallback?: boolean;
}

export function calculateTime(nextMatchingDate: Dayjs, now: Dayjs): TimeResult {
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

  // 시간이 0이 되었을 때 콜백 트리거
  const shouldTriggerCallback = seconds === 0;

  return {
    delimeter: 'S',
    value: seconds,
    shouldTriggerCallback,
  }
} 