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
		};
	}

	const hours = nextMatchingDate.diff(now, 'hour');
	const minutes = nextMatchingDate.diff(now, 'minute');
	const seconds = nextMatchingDate.diff(now, 'second');
	const dayDiff = nextMatchingDate.startOf('day').diff(now.startOf('day'), 'day');

	//console.group('calculateTime');
	//console.log('nextMatchingDate', nextMatchingDate?.format('YYYY-MM-DD HH:mm:ss'));
	//console.log('now', now?.format('YYYY-MM-DD HH:mm:ss'));
	//console.log('dayDiff', dayDiff);
	//console.log('hours', hours);
	//console.log('minutes', minutes);
	//console.log('seconds', seconds);
	//console.groupEnd();

	// 21시가 지나서 음수가 되는 경우 즉시 콜백 트리거
	if (seconds <= 0) {
		console.log('⏰ 매칭 공개 시간이 지났습니다. 콜백을 트리거합니다.');
		return {
			delimeter: 'S',
			value: 0, // 음수 대신 0으로 표시
			shouldTriggerCallback: true,
		};
	}

	if (dayDiff > 0) {
		return {
			delimeter: 'D',
			value: Math.max(0, dayDiff), // 0보다 작을 경우 0으로 리턴
			shouldTriggerCallback: false,
		};
	}

	if (hours > 0) {
		return {
			delimeter: 'H',
			value: Math.max(0, hours), // 0보다 작을 경우 0으로 리턴
			shouldTriggerCallback: false,
		};
	}

	if (minutes > 0) {
		return {
			delimeter: 'M',
			value: Math.max(0, minutes), // 0보다 작을 경우 0으로 리턴
			shouldTriggerCallback: false,
		};
	}

	return {
		delimeter: 'S',
		value: Math.max(0, seconds), // 0보다 작을 경우 0으로 리턴
		shouldTriggerCallback: false,
	};
}
