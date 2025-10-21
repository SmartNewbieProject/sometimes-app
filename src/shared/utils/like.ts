export function getRemainingTimeFormatted(message: string, isExpired: boolean): string {
	if (!message) {
		return '';
	}
	const match = message.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);

	if (!match) {
		return '올바른 날짜 형식이 아닙니다.';
	}

	const expirationDate = new Date(match[1]);
	const now = new Date();

	const diffInMillis = expirationDate.getTime() - now.getTime();

	if (diffInMillis <= 0 && isExpired) {
		return '이미 편지가 사라졌어요.';
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
		remainingText = `${days}일 ${hours}시간`;
	} else if (hours > 0) {
		remainingText = `${hours}시간 ${minutes}분`;
	} else if (minutes > 0) {
		remainingText = `${minutes}분`;
	} else {
		remainingText = `${seconds}초`;
	}

	// 5. 최종 형식에 맞춰 문자열 반환
	return `${remainingText} 뒤에 편지가 사라져요!`;
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
