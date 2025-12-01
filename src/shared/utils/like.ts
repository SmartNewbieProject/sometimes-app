import i18n from "@/src/shared/libs/i18n";

export function getRemainingTimeFormatted(message: string, isExpired: boolean): string {
	if (!message) {
		return '';
	}
	const match = message.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);

	if (!match) {
		return i18n.t('shareds.utils.like.wrong_date_format');
	}

	const expirationDate = new Date(match[1]);
	const now = new Date();

	const diffInMillis = expirationDate.getTime() - now.getTime();

	if (diffInMillis <= 0 && isExpired) {
		return i18n.t('shareds.utils.like.message_expired');
	}
	if (diffInMillis <= 0 && !isExpired) {
		return '';
	}

	const days = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diffInMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diffInMillis % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diffInMillis % (1000 * 60)) / 1000);

	let remainingText = '';

	if (days > 0) {
		remainingText = i18n.t('shareds.utils.like.remaining_text_1', { days:days, hours:hours });
	} else if (hours > 0) {
		remainingText = i18n.t('shareds.utils.like.remaining_text_2', { hours:hours, minutes:minutes });
	} else if (minutes > 0) {
		remainingText = i18n.t('shareds.utils.like.remaining_text_3', { minutes:minutes });
	} else {
		remainingText = i18n.t('shareds.utils.like.remaining_text_4', { seconds:seconds });
	}

	// 5. 최종 형식에 맞춰 문자열 반환
	return i18n.t('shareds.utils.like.remaining_time_formatted', { time: remainingText });
}

export function getRemainingTimeLimit(message: string): boolean {
	if (!message) {
		return false;
	}
	const match = message.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);

	if (!match) {
		return false;
	}

	const expirationDate = new Date(match[1]);
	const now = new Date();

	const diffInMillis = expirationDate.getTime() - now.getTime();

	if (diffInMillis <= 0) {
		return true;
	}

	const days = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diffInMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diffInMillis % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diffInMillis % (1000 * 60)) / 1000);

	if (days > 0) {
		return false;
	}
	if (hours > 0) {
		return false;
	}
	if (minutes > 0) {
		return true;
	}
	return true;
}
